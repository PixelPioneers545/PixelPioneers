import express from "express";
import client from "../../Database/config/PgClient.js";

const router = express.Router();

// POST /api/db/getQuestions - Get questions with filters
router.post("/getQuestions", async (req, res) => {
  try {
    const { filter, tags, limit = 10, skip = 0 } = req.body;
    
    // Validate filter parameter
    const validFilters = ["topvoted", "newest", "unanswered"];
    if (!validFilters.includes(filter)) {
      return res.status(400).json({
        success: false,
        error: "Invalid filter",
        message: "Filter must be one of: topvoted, newest, unanswered"
      });
    }

    // Validate pagination parameters
    const limitNum = parseInt(limit);
    const skipNum = parseInt(skip);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid limit",
        message: "Limit must be a number between 1 and 100"
      });
    }
    
    if (isNaN(skipNum) || skipNum < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid skip",
        message: "Skip must be a non-negative number"
      });
    }

    // Build the base query
    let baseQuery = `
      SELECT DISTINCT
        q.id,
        q.title as questiontitle,
        q.description as questiondescription,
        q.upvotes as questionupvotes,
        q.downvotes as questiondownvotes,
        q.created_at as questiontime,
        u.username,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as questiontags,
        (q.upvotes - q.downvotes) as vote_score
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
    `;

    // Add tag filter if tags array is provided and not empty
    if (tags && Array.isArray(tags) && tags.length > 0) {
      baseQuery += ` WHERE EXISTS (
        SELECT 1 FROM question_tags qt2 
        JOIN tags t2 ON qt2.tag_id = t2.id 
        WHERE qt2.question_id = q.id AND t2.name = ANY($1)
      )`;
    }

    baseQuery += ` GROUP BY q.id, q.title, q.description, q.upvotes, q.downvotes, q.created_at, u.username`;

    // Prepare query parameters
    const queryParams = tags && tags.length > 0 ? [tags, limitNum, skipNum] : [limitNum, skipNum];

    // Add ordering based on filter
    switch (filter) {
      case "topvoted":
        baseQuery += ` ORDER BY vote_score DESC, q.created_at DESC`;
        break;
      case "newest":
        baseQuery += ` ORDER BY q.created_at DESC`;
        break;
      case "unanswered":
        baseQuery += ` ORDER BY q.created_at DESC`;
        break;
    }

    // Add pagination
    baseQuery += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    // Execute the main query
    const questionsResult = await client.query(baseQuery, queryParams);
    
    // For unanswered filter, we need to filter out questions that have answers
    let questions = questionsResult.rows;
    if (filter === "unanswered") {
      const unansweredQuery = `
        SELECT q.id FROM questions q
        WHERE NOT EXISTS (SELECT 1 FROM answers a WHERE a.question_id = q.id)
      `;
      const unansweredResult = await client.query(unansweredQuery);
      const unansweredIds = unansweredResult.rows.map(row => row.id);
      questions = questions.filter(q => unansweredIds.includes(q.id));
    }

    // Get answers for each question
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        const answersQuery = `
          SELECT 
            a.id as answerid,
            a.content as answercontent,
            a.upvotes as answerupvotes,
            a.downvotes as answerdownvotes,
            a.is_accepted as answerisAccepted,
            a.created_at as answertime,
            u.username as usernamewhogaveanswer
          FROM answers a
          LEFT JOIN users u ON a.user_id = u.id
          WHERE a.question_id = $1
          ORDER BY a.is_accepted DESC, (a.upvotes - a.downvotes) DESC, a.created_at ASC
        `;
        
        const answersResult = await client.query(answersQuery, [question.id]);
        
        // Format time for answers
        const answers = answersResult.rows.map(answer => ({
          ...answer,
          time: formatTimeAgo(answer.answertime)
        }));

        return {
          id: question.id,
          questiontitle: question.questiontitle,
          questiondescription: question.questiondescription,
          username: question.username,
          questiontags: question.questiontags || [],
          questionupvotes: question.questionupvotes,
          questiondownvotes: question.questiondownvotes,
          questiontime: formatTimeAgo(question.questiontime),
          answers: answers
        };
      })
    );

    res.json({
      success: true,
      data: questionsWithAnswers,
      count: questionsWithAnswers.length,
      filter: filter,
      tags: tags || [],
      pagination: {
        limit: limitNum,
        skip: skipNum,
        hasMore: questionsWithAnswers.length === limitNum
      }
    });

  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to fetch questions from database"
    });
  }
});

// Helper function to format time as "X days ago", "X hours ago", etc.
function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return "Just now";
  }
}

export default router; 