import {
  proxyActivities,
  defineSignal,
  setHandler,
  condition,
} from '@temporalio/workflow';

import type * as order_act from './activities/order.activity';
import type * as product_act from './activities/product.activity';
import type * as payment_act from './activities/payment.activity';
import type * as noti_act from './activities/notification.activity';
import { CreateOrderRequest } from '@shared/interface/OrderServiceClient.interface';

// Define signal
export const paymentSuccess = defineSignal('paymentSuccess');
export const paymentFailed = defineSignal('paymentFailed');

// Proxy activities
const {
  createOrder,
  cancelOrder,
  ReserveStock,
  RollbackStock,
  processPaymentActivity,
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
  let paymentRecorded = false;

  // Listen to signals
  setHandler(paymentSuccess, () => {
    paymentDone = true;
    paymentOk = true;
  });

  setHandler(paymentFailed, () => {
    paymentDone = true;
    paymentOk = false;
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

    // Step 3: Wait for payment to complete (user triggers webhook)
    await condition(() => paymentDone);

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

    // Step 4: Process payment record (record to DB)
    await processPaymentActivity(order.id, order.total, 'tay');
    paymentRecorded = true;

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

    if (!paymentRecorded && paymentDone && paymentOk) {
      console.error('Payment not recorded, rolling back payment');
    }

    // await refundPaymen();

    console.warn('Workflow ends after handling failure:', err.message);
    return; // Propagate to show failed state
  }
}
