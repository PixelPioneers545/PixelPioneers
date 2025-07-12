import express from "express";
import client from "../../Database/config/PgClient.js";

const router = express.Router();

// GET /api/db/getAllTags - Get all tags
router.get("/getAllTags", async (req, res) => {
  try {
    const query = "SELECT id, name FROM tags ORDER BY name ASC";
    const result = await client.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to fetch tags from database"
    });
  }
});

export default router; 