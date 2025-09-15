import { createToken, verifyToken } from '../../src/auth/session';

test('token creation and verification', () => {
  const token = createToken('user123');
  const userId = verifyToken(token);
  expect(userId).toBe('user123');
});
