
import client from './config/PgClient.js';

const result = await client.query('SELECT NOW()');
console.log('⏱ Connected at:', result.rows[0].now);


