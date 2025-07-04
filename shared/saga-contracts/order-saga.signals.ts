import { defineSignal } from '@temporalio/workflow';

export const paymentSuccess = defineSignal('paymentSuccess');
export const paymentFailed = defineSignal('paymentFailed');

export interface OrderSagaSignals {
  paymentSuccess: () => void;
  paymentFailed: () => void;
}
