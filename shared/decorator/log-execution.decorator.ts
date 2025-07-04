import { Logger } from '@nestjs/common';

export function LogExecution(): MethodDecorator {
  const logger = new Logger('LogExecution');
  return function (target, propertyKey, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const methodName = propertyKey.toString();
      const start = Date.now();

      logger.log(
        `Method "${methodName}" called with args: ${JSON.stringify(args)}`,
      );

      const result = await originalMethod.apply(this, args);

      const end = Date.now();
      logger.log(`Method "${methodName}" executed in ${end - start}ms`);

      return result;
    };

    return descriptor;
  };
}
