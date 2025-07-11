import {
  proxyActivities,
  defineSignal,
  setHandler,
  condition,
  sleep,
} from '@temporalio/workflow';

import type * as order_act from './activities/order.activity';
import type * as product_act from './activities/product.activity';
import type * as payment_act from './activities/payment.activity';
import type * as noti_act from './activities/notification.activity';
import { CreateOrderRequest } from '@shared/interface/OrderServiceClient.interface';

// Define signal
export const paymentSuccess = defineSignal('paymentSuccess');
export const paymentFailed = defineSignal('paymentFailed');
export const setPaymentIntent = defineSignal<[string]>('setPaymentIntent');

// Proxy activities
const {
  createOrder,
  updateOrder,
  cancelOrder,
  ReserveStock,
  RollbackStock,
  createCheckoutSession,
  refundPayment,
  sendEmail,
} = proxyActivities<
  typeof order_act & typeof product_act & typeof payment_act & typeof noti_act
>({
  startToCloseTimeout: '10 seconds',
  retry: {
    maximumAttempts: 3,
    initialInterval: '2s',
    backoffCoefficient: 2,
  },
});

export async function OrderSagaWorkflow(orderData: CreateOrderRequest) {
  let paymentDone = false;
  let paymentOk = true;
  let stockReserved = false;
  let paymentIntent: string | null = null;

  // Listen to signals
  setHandler(paymentSuccess, () => {
    paymentDone = true;
    paymentOk = true;
  });

  setHandler(paymentFailed, () => {
    paymentDone = true;
    paymentOk = false;
  });

  setHandler(setPaymentIntent, (intentId: string) => {
    paymentIntent = intentId;
  });

  try {
    console.log('Starting Order Saga Workflow with orderData:', orderData);
    // Step 1: Create Order
    const order = await createOrder(orderData);

    console.log('Order created:', order);

    // Step 2: Reserve stock
    await ReserveStock({
      orderId: order.id,
      items: order.orderItems,
    });

    stockReserved = true;

    await createCheckoutSession(order.id, order.total);

    // Step 3: Wait for payment to complete (user triggers webhook)
    await Promise.race([
      condition(() => paymentDone),
      sleep('2m').then(() => {
        throw new Error('⚠️ Payment not received in time');
      }),
    ]);

    // Simulate payment server never responded
    // await Promise.race([
    //   condition(() => paymentDone),
    //   sleep(10000).then(() => {
    //     throw new Error('🛑 Payment server internal error (simulated)');
    //   }),
    // ]);

    if (!paymentOk) {
      throw new Error('❌ Payment failed');
    }

    await updateOrder(order.id, 'PAID');

    // Step 5: Send email to user and admin

    await sendEmail(
      orderData.id,
      orderData.user.username,
      orderData.user.email,
    );

    // ✅ Done
  } catch (err) {
    if (!paymentDone) {
      // Case: payment failed
      await cancelOrder(orderData.id, 'FAILED');
    } else {
      // Case: user cancel (if triggered by signal or timeout logic, for example)
      await cancelOrder(orderData.id, 'CANCELLED');
    }

    if (stockReserved) {
      await RollbackStock({
        orderId: orderData.id,
        items: orderData.orderItems,
      });
    }

    if (paymentDone && paymentOk) {
      console.warn('⚠️ Refund may be required');
      console.warn('Payment Intent ID:', paymentIntent);
      try {
        console.error('⚠️ Payment not recorded — refunding');
        await refundPayment(paymentIntent!);
      } catch (err) {
        console.error('❌ Refund failed:', err.message);
      }
    }

    console.warn('Workflow ends after handling failure:', err.message);
    return; // Propagate to show failed state
  }
}
