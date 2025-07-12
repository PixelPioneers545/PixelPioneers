import express from "express";
import client from "../../Database/config/PgClient.js";

const router = express.Router();

// GET /api/db/getTagById/:id - Get a specific tag by ID
router.get("/getTagById/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT id, name FROM tags WHERE id = $1";
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tag not found",
        message: `No tag found with ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to fetch tag from database"
    });
  }
});

export default router; 