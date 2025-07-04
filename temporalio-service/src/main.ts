import { Worker } from '@temporalio/worker';
import * as OrderActivities from './workflows/order/activities/order.activity';
import * as ProductActivities from './workflows/order/activities/product.activity';
import * as PaymentActivities from './workflows/order/activities/payment.activity';

// Start a Temporal worker
async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'), // Compiled workflows
    activities: {
      ...OrderActivities,
      ...ProductActivities,
      ...PaymentActivities,
    },
    taskQueue: 'order-saga',
  });

  console.log('🌀 Temporal Worker started...');
  await worker.run();
}

run().catch((err) => {
  console.error('❌ Worker failed:', err);
  process.exit(1);
});
