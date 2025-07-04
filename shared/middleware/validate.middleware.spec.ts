import { ValidateMiddleware } from './validate.middleware';

describe('ValidateMiddleware', () => {
  it('should be defined', () => {
    expect(new ValidateMiddleware()).toBeDefined();
  });
});
