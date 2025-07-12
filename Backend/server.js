import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import getAllTags from "./api/db/getAllTags.js";
import getTagById from "./api/db/getTagById.js";
import getQuestions from "./api/db/getQuestions.js";
import healthCheck from "./api/db/healthCheck.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));


// === Middleware ===
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

// === Routes ===
app.use("/api/db", getAllTags);
app.use("/api/db", getTagById);
app.use("/api/db", getQuestions);
app.use("/api/db", healthCheck);

// === Root Route ===
app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
    endpoints: {
      getAllTags: "/api/db/getAllTags",
      getTagById: "/api/db/getTagById/:id",
      getQuestions: "/api/db/getQuestions (POST)",
      healthCheck: "/api/db/healthCheck"
    }
  });
});

// --- User Registration Endpoint ---
app.post('/api/register', async (req, res) => {
    
    const { email, username, password, } = req.body;
    const role = 'user';
    const created_at = new Date().toISOString()
    
    const salt = await bcrypt.genSalt(10); // Generate a salt (cost factor 10)
    const passwordHash = await bcrypt.hash(password, salt);
    
    try {

        const lastIdQuery = 'SELECT MAX(id) AS last_id FROM users';
        const lastIdResult = await client.query(lastIdQuery);
        const lastId = lastIdResult.rows[0].last_id || 1999; // Start from 2000 if table is empty
        const newId = lastId + 1;
        
        const query = `
        INSERT INTO users (id, email, username, password, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, username, role, created_at
        `;

        const values = [
          newId,
          email,
          username,
          passwordHash,
          role,
          created_at
        ];

        const result = await client.query(query, values);
        console.log('✅ User inserted:', result.rows[0]);
        res.status(201).json({ status: true, message: 'User registered successfully' });
      } catch (err) {
        console.error('❌ Error inserting user:', err.message);
      } 
});

app.post('/api/login', async (req, res) => {
    
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(10); // Generate a salt (cost factor 10)
    const passwordHash = await bcrypt.hash(password, salt);
    console.log(email)
  
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database API available at http://localhost:${PORT}/api/db`);
});
