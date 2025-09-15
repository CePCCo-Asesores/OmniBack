import { insert, query } from '../../src/db/client';

test('insert and query user', async () => {
  await insert('users', { id: 'test123', email: 'test@example.com', name: 'Test User' });
  const result = await query('SELECT * FROM users WHERE id = $1', ['test123']);
  expect(result[0].email).toBe('test@example.com');
});
