import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import client from "./Database/config/PgClient.js";
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
app.use(express.json()); // For parsing JSON request bodies
app.use(cookieParser()); // For parsing cookies

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
      healthCheck: "/api/db/healthCheck",
      register: "/api/register (POST)",
      login: "/api/login (POST)",
      questions: "/api/questions (POST/GET)",
      answers: "/api/questions/:id/answers (POST)",
      voting: "/api/questions/:id/vote (POST)",
      search: "/api/search/questions (POST)"
    }
  });
});

// --- User Registration Endpoint ---
app.post('/api/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        // Validate input
        if (!email || !username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, username, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await client.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email or username already exists' 
            });
        }

        const role = 'user';
        const created_at = new Date().toISOString();
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Get next ID
        const lastIdQuery = 'SELECT MAX(id) AS last_id FROM users';
        const lastIdResult = await client.query(lastIdQuery);
        const lastId = lastIdResult.rows[0].last_id || 1999;
        const newId = lastId + 1;
        
        const query = `
        INSERT INTO users (id, email, username, password, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, username, role, created_at
        `;

        const values = [newId, email, username, passwordHash, role, created_at];
        const result = await client.query(query, values);
        
        console.log('✅ User registered:', result.rows[0]);
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                username: result.rows[0].username,
                role: result.rows[0].role
            }
        });
    } catch (err) {
        console.error('❌ Registration error:', err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during registration' 
        });
    }
});

// --- User Login Endpoint ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const userResult = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const user = userResult.rows[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set JWT as HTTP-only cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log('✅ User logged in:', user.email);
        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            token: token, // Also send token in response for frontend storage
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('❌ Login error:', err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during login' 
        });
    }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
};

// --- Logout Endpoint ---
app.post('/api/logout', (req, res) => {
    res.clearCookie('authToken');
    res.status(200).json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
});

// --- Questions Endpoints ---
app.post('/api/questions', async (req, res) => {
    try {
        const { title, body, tags, userId } = req.body;
        
        if (!title || !body || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Title, body, and userId are required'
            });
        }

        const created_at = new Date().toISOString();
        
        // Get next question ID
        const lastIdQuery = 'SELECT MAX(id) AS last_id FROM questions';
        const lastIdResult = await client.query(lastIdQuery);
        const lastId = lastIdResult.rows[0].last_id || 0;
        const newId = lastId + 1;
        
        const query = `
        INSERT INTO questions (id, title, description, user_id, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `;

        const values = [newId, title, body, userId, created_at];
        const result = await client.query(query, values);
        
        // Handle tags if provided
        if (tags && Array.isArray(tags) && tags.length > 0) {
          for (const tagName of tags) {
            // Insert tag if it doesn't exist
            let tagResult = await client.query(
              'SELECT id FROM tags WHERE name = $1',
              [tagName]
            );
            
            let tagId;
            if (tagResult.rows.length === 0) {
              const newTagResult = await client.query(
                'INSERT INTO tags (name) VALUES ($1) RETURNING id',
                [tagName]
              );
              tagId = newTagResult.rows[0].id;
            } else {
              tagId = tagResult.rows[0].id;
            }
            
            // Link tag to question
            await client.query(
              'INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)',
              [newId, tagId]
            );
          }
        }
        
        console.log('✅ Question created:', result.rows[0]);
        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: {
                id: result.rows[0].id,
                title: result.rows[0].title,
                description: result.rows[0].description,
                user_id: result.rows[0].user_id,
                created_at: result.rows[0].created_at
            }
        });
    } catch (err) {
        console.error('❌ Create question error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// --- Answers Endpoints ---
app.post('/api/questions/:questionId/answers', async (req, res) => {
    try {
        const { questionId } = req.params;
        const { content, body, userId } = req.body;
        const answerContent = content || body;
        
        if (!answerContent || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Content and userId are required'
            });
        }

        const created_at = new Date().toISOString();
        
        // Get next answer ID
        const lastIdQuery = 'SELECT MAX(id) AS last_id FROM answers';
        const lastIdResult = await client.query(lastIdQuery);
        const lastId = lastIdResult.rows[0].last_id || 0;
        const newId = lastId + 1;
        
        const query = `
        INSERT INTO answers (id, question_id, content, user_id, created_at, is_accepted)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `;

        const values = [newId, questionId, answerContent, userId, created_at, false];
        const result = await client.query(query, values);
        
        console.log('✅ Answer created:', result.rows[0]);
        res.status(201).json({
            success: true,
            message: 'Answer created successfully',
            data: {
                id: result.rows[0].id,
                question_id: result.rows[0].question_id,
                content: result.rows[0].content,
                user_id: result.rows[0].user_id,
                created_at: result.rows[0].created_at,
                is_accepted: result.rows[0].is_accepted
            }
        });
    } catch (err) {
        console.error('❌ Create answer error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// --- Voting Endpoints ---
app.post('/api/questions/:questionId/vote', async (req, res) => {
    try {
        const { questionId } = req.params;
        const { direction, userId } = req.body; // direction: 'up' or 'down'
        
        if (!direction || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Direction and userId are required'
            });
        }

        // Check if user already voted
        const existingVote = await client.query(
            'SELECT * FROM votes WHERE question_id = $1 AND user_id = $2',
            [questionId, userId]
        );

        const voteValue = direction === 'up' ? 1 : -1;
        
        if (existingVote.rows.length > 0) {
            // Update existing vote
            const currentVote = existingVote.rows[0].value;
            if (currentVote === voteValue) {
                // Remove vote
                await client.query(
                    'DELETE FROM votes WHERE question_id = $1 AND user_id = $2',
                    [questionId, userId]
                );
            } else {
                // Change vote
                await client.query(
                    'UPDATE votes SET value = $1 WHERE question_id = $2 AND user_id = $3',
                    [voteValue, questionId, userId]
                );
            }
        } else {
            // Create new vote
            await client.query(
                'INSERT INTO votes (question_id, user_id, value) VALUES ($1, $2, $3)',
                [questionId, userId, voteValue]
            );
        }

        // Get updated vote count
        const voteCountResult = await client.query(
            'SELECT COALESCE(SUM(value), 0) as total_votes FROM votes WHERE question_id = $1',
            [questionId]
        );

        const totalVotes = parseInt(voteCountResult.rows[0].total_votes);

        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            data: { votes: totalVotes }
        });
    } catch (err) {
        console.error('❌ Vote error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.post('/api/questions/:questionId/answers/:answerId/vote', async (req, res) => {
    try {
        const { questionId, answerId } = req.params;
        const { direction, userId } = req.body;
        
        if (!direction || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Direction and userId are required'
            });
        }

        // Check if user already voted
        const existingVote = await client.query(
            'SELECT * FROM votes WHERE answer_id = $1 AND user_id = $2',
            [answerId, userId]
        );

        const voteValue = direction === 'up' ? 1 : -1;
        
        if (existingVote.rows.length > 0) {
            // Update existing vote
            const currentVote = existingVote.rows[0].value;
            if (currentVote === voteValue) {
                // Remove vote
                await client.query(
                    'DELETE FROM votes WHERE answer_id = $1 AND user_id = $2',
                    [answerId, userId]
                );
            } else {
                // Change vote
                await client.query(
                    'UPDATE votes SET value = $1 WHERE answer_id = $2 AND user_id = $3',
                    [voteValue, answerId, userId]
                );
            }
        } else {
            // Create new vote
            await client.query(
                'INSERT INTO votes (answer_id, user_id, value) VALUES ($1, $2, $3)',
                [answerId, userId, voteValue]
            );
        }

        // Get updated vote count
        const voteCountResult = await client.query(
            'SELECT COALESCE(SUM(value), 0) as total_votes FROM votes WHERE answer_id = $1',
            [answerId]
        );

        const totalVotes = parseInt(voteCountResult.rows[0].total_votes);
        
        console.log(`✅ Answer vote recorded: Answer ${answerId}, User ${userId}, Direction ${direction}, Total votes: ${totalVotes}`);

        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            data: { votes: totalVotes }
        });
    } catch (err) {
        console.error('❌ Answer vote error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// --- Accept Answer Endpoint ---
app.post('/api/questions/:questionId/answers/:answerId/accept', async (req, res) => {
    try {
        const { questionId, answerId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'UserId is required'
            });
        }

        // Check if user owns the question
        const questionResult = await client.query(
            'SELECT user_id FROM questions WHERE id = $1',
            [questionId]
        );

        if (questionResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        if (questionResult.rows[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only question owner can accept answers'
            });
        }

        // Reset all answers to not accepted, then accept the selected one
        await client.query(
            'UPDATE answers SET is_accepted = false WHERE question_id = $1',
            [questionId]
        );

        await client.query(
            'UPDATE answers SET is_accepted = true WHERE id = $1',
            [answerId]
        );

        res.status(200).json({
            success: true,
            message: 'Answer accepted successfully'
        });
    } catch (err) {
        console.error('❌ Accept answer error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// --- Search Endpoint ---
app.post('/api/search/questions', async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const offset = (page - 1) * limit;
        
        const searchQuery = `
        SELECT q.*, u.username as author_name,
               COUNT(a.id) as answer_count
        FROM questions q
        LEFT JOIN users u ON q.user_id = u.id
        LEFT JOIN answers a ON q.id = a.question_id
        WHERE q.title ILIKE $1 OR q.body ILIKE $1
        GROUP BY q.id, u.username
        ORDER BY q.created_at DESC
        LIMIT $2 OFFSET $3
        `;

        const result = await client.query(searchQuery, [`%${query}%`, limit, offset]);
        
        res.status(200).json({
            success: true,
            data: result.rows,
            page,
            limit,
            total: result.rows.length
        });
    } catch (err) {
        console.error('❌ Search error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database API available at http://localhost:${PORT}/api/db`);
});
