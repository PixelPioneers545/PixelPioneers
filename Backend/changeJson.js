import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

await client.connect();
console.log('✅ Connected to PostgreSQL');

const raw = fs.readFileSync(path.resolve("C:/Users/Admin/Downloads/mock_data.json"), 'utf8');
const seed = JSON.parse(raw);

try {
  // 👥 Users
  for (const user of seed.users) {
    await client.query(
      `INSERT INTO users (id, username, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [user.id, user.username, user.email, user.password, user.role]
    );
  }

  // ❓ Questions
  for (const q of seed.questions) {
    await client.query(
      `INSERT INTO questions (id, user_id, title, description, upvotes, downvotes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [q.id, q.user_id, q.title, q.description, q.upvotes || 0, q.downvotes || 0]
    );
  }

  // 💬 Answers
  for (const a of seed.answers) {
    await client.query(
      `INSERT INTO answers (id, question_id, user_id, content, is_accepted, upvotes, downvotes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [a.id, a.question_id, a.user_id, a.content, a.is_accepted || false, a.upvotes || 0, a.downvotes || 0]
    );
  }

  // 🏷️ Tags
  for (const tag of seed.tags) {
    await client.query(
      `INSERT INTO tags (id, name)
       VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [tag.id, tag.name]
    );
  }

  // 🏷️📌 Question Tags
  for (const qt of seed.question_tags) {
    await client.query(
      `INSERT INTO question_tags (question_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [qt.question_id, qt.tag_id]
    );
  }

  // 👍 Votes
  for (const vote of seed.votes) {
    await client.query(
      `INSERT INTO votes (id, user_id, question_id, answer_id, value)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [vote.id, vote.user_id, vote.question_id, vote.answer_id, vote.value]
    );
  }

  // 🔔 Notifications
  for (const n of seed.notifications) {
    await client.query(
      `INSERT INTO notifications (id, recipient_id, type, content, is_read)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [n.id, n.recipient_id, n.type, n.content, n.is_read]
    );
  }

  console.log('✅ All seed data inserted successfully.');
} catch (err) {
  console.error('❌ Seeding failed:', err);
} finally {
  await client.end();
  console.log('🔌 DB connection closed.');
}
