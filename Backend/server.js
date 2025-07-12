import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import getAllTags from "./api/db/getAllTags.js";
import getTagById from "./api/db/getTagById.js";
import healthCheck from "./api/db/healthCheck.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

// === Routes ===
app.use("/api/db", getAllTags);
app.use("/api/db", getTagById);
app.use("/api/db", healthCheck);

// === Root Route ===
app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
    endpoints: {
      getAllTags: "/api/db/getAllTags",
      getTagById: "/api/db/getTagById/:id",
      healthCheck: "/api/db/healthCheck"
    }
  });
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database API available at http://localhost:${PORT}/api/db`);
});
