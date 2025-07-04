// src/temporal/temporal.provider.ts
import { Connection, WorkflowClient } from '@temporalio/client';

export const temporalClient = {
  provide: 'TEMPORAL_CLIENT',
  useFactory: async () => {
    const connection = await Connection.connect({
      address: 'localhost:7233',
    });

    return new WorkflowClient({
      connection,
      namespace: 'default',
    });
  },
};
