import express from "express";

const router = express.Router();

// GET /api/db/healthCheck - Health check endpoint
router.get("/healthCheck", (req, res) => {
  res.json({
    success: true,
    message: "Database API is running",
    timestamp: new Date().toISOString()
  });
});

export default router; 