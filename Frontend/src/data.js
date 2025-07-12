// src/data.js
export const questions = [
  {
    id: 1,
    title: "How to join 2 columns in a data set to make a separate column in SQL",
    body: "<p>I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name, and column 2 consists of last name I want a column to combine them.</p><p>I've tried using the + operator but it doesn't seem to work:</p><pre><code>SELECT first_name + last_name AS full_name FROM users;</code></pre><p>This just returns numbers instead of the concatenated string. What am I doing wrong?</p>",
    user: "SQL Beginner",
    tags: ["sql", "database", "beginners"],
    votes: 15,
    answers: [
      {
        id: 1,
        body: "<p>In SQL, you can use the <code>CONCAT()</code> function to combine columns:</p><pre><code>SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;</code></pre><p>This will combine the first name and last name with a space in between.</p><p>For SQL Server, you can also use the + operator with proper conversion:</p><pre><code>SELECT first_name + ' ' + last_name AS full_name FROM users;</code></pre>",
        user: "Database Expert",
        votes: 8,
        isAccepted: true,
        timestamp: "2 days ago"
      },
      {
        id: 2,
        body: "<p>Another option is to use the <code>||</code> operator in some SQL dialects like PostgreSQL:</p><pre><code>SELECT first_name || ' ' || last_name AS full_name FROM users;</code></pre><p>Make sure to check the documentation for your specific SQL database as concatenation methods can vary.</p>",
        user: "Backend Developer",
        votes: 5,
        isAccepted: false,
        timestamp: "1 day ago"
      }
    ],
    views: 142,
    timestamp: "3 days ago"
  },
  {
    id: 2,
    title: "How to center a div vertically and horizontally in CSS?",
    body: "<p>I'm having trouble centering a div both vertically and horizontally on the page. I've tried several methods but none seem to work consistently across browsers.</p><p>Here's what I have so far:</p><pre><code>.center-div {\n  margin: 0 auto;\n}</code></pre><p>This centers it horizontally but not vertically. What's the best modern approach?</p>",
    user: "CSS Newbie",
    tags: ["css", "html", "frontend"],
    votes: 23,
    answers: [
      {
        id: 1,
        body: "<p>The modern way to center elements is using flexbox:</p><pre><code>.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}</code></pre><p>This will center the child elements both vertically and horizontally.</p>",
        user: "Frontend Wizard",
        votes: 15,
        isAccepted: false,
        timestamp: "1 day ago"
      },
      {
        id: 2,
        body: "<p>You can also use CSS Grid:</p><pre><code>.container {\n  display: grid;\n  place-items: center;\n  height: 100vh;\n}</code></pre><p>This is even simpler and achieves the same result with less code.</p>",
        user: "UI Specialist",
        votes: 12,
        isAccepted: false,
        timestamp: "20 hours ago"
      }
    ],
    views: 98,
    timestamp: "2 days ago"
  },
  {
    id: 3,
    title: "What is the difference between useState and useReducer in React?",
    body: "<p>I'm learning React hooks and I'm confused about when to use <code>useState</code> vs <code>useReducer</code>. They both seem to manage state, but I'm not sure when to choose one over the other.</p><p>Can someone explain the key differences and use cases?</p>",
    user: "React Learner",
    tags: ["react", "javascript", "hooks"],
    votes: 8,
    answers: [],
    views: 56,
    timestamp: "1 day ago"
  }
];