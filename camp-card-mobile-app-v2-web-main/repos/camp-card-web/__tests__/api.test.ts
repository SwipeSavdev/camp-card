import { ApiError } from '../lib/api';

describe('ApiError', () => {
  it('creates an error with status and message', () => {
    const error = new ApiError(404, 'Not Found');

    expect(error.status).toBe(404);
    expect(error.message).toBe('Not Found');
    expect(error.name).toBe('ApiError');
    expect(error).toBeInstanceOf(Error);
  });

  it('can be caught as an Error', () => {
    const error = new ApiError(500, 'Internal Server Error');

    try {
      throw error;
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(500);
    }
  });

  it('preserves stack trace', () => {
    const error = new ApiError(401, 'Unauthorized');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ApiError');
  });
});
