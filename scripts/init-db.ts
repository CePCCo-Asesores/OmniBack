import { db } from '../src/db/connection';
import { schema } from '../src/db/schema';

const init = async () => {
  await db.query(schema.users);
  await db.query(schema.sessions);
  console.log('Base de datos inicializada');
  process.exit(0);
};

init();
