# StackIt - Q&A Platform for Developers

A modern, full-stack Q&A platform built with React, Node.js, and PostgreSQL, designed for developers to share knowledge and solve problems together.

## 🚀 Features

### Authentication

- User registration and login with email/password
- Secure password hashing with bcrypt
- JWT-based authentication (ready for implementation)
- Protected routes for authenticated users

### Questions & Answers

- Create, view, and manage questions
- Post answers to questions
- Rich text editor for questions and answers
- Tag-based categorization
- Search functionality

### Voting System

- Upvote/downvote questions and answers
- Real-time vote count updates
- Prevent duplicate voting from same user

### User Experience

- Infinite scroll for questions list
- Lazy loading for better performance
- Responsive design with Tailwind CSS
- Modern UI with smooth animations

### Additional Features

- Accept answers (question owner only)
- User profiles and settings
- Search questions by title and content
- Filter questions by tags, status, and votes

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Context API** - State management

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd SEM_4_ODOO_HACKATHON
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:

```env
PORT=3000
PG_HOST=localhost
PG_PORT=5432
PG_USER=your_username
PG_PASSWORD=your_password
PG_DATABASE=stackit_db
```

### 3. Database Setup

Create a PostgreSQL database named `stackit_db` and run the table creation queries from `Backend/Database/createTableQueries.js`.

### 4. Frontend Setup

```bash
cd Frontend
npm install
```

### 5. Install Additional Dependencies

```bash
# In Frontend directory
npm install axios framer-motion
```

### 6. Start the Application

```bash
# Start backend (from Backend directory)
npm run dev

# Start frontend (from Frontend directory)
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📚 API Endpoints

### Authentication

- `POST /api/register` - User registration
- `POST /api/login` - User login

### Questions

- `POST /api/questions` - Create a new question
- `GET /api/db/getQuestions` - Get questions (with pagination)
- `POST /api/questions/:id/vote` - Vote on a question

### Answers

- `POST /api/questions/:id/answers` - Post an answer
- `POST /api/questions/:id/answers/:answerId/vote` - Vote on an answer
- `POST /api/questions/:id/answers/:answerId/accept` - Accept an answer

### Search

- `POST /api/search/questions` - Search questions

### Tags

- `GET /api/db/getAllTags` - Get all tags
- `GET /api/db/getTagById/:id` - Get tag by ID

## 🏗️ Project Structure

```
SEM_4_ODOO_HACKATHON/
├── Backend/
│   ├── api/db/           # Database API routes
│   ├── Database/         # Database configuration
│   ├── server.js         # Main server file
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.jsx       # Main app component
│   └── package.json
└── README.md
```

## 🔧 Key Components

### Contexts

- **AuthContext** - Manages user authentication state
- **QuestionsContext** - Manages questions data and operations

### Custom Hooks

- **useInfiniteScroll** - Implements infinite scrolling for questions

### Services

- **api.js** - Centralized API service with interceptors

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode Ready** - Easy to implement theme switching
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time validation feedback

## 🔒 Security Features

- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Protected API endpoints
- User authentication checks

## 🚀 Performance Optimizations

- Lazy loading with infinite scroll
- Context-based state management
- Optimized re-renders
- Efficient API calls with axios interceptors

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions, please open an issue in the repository.

---

**StackIt** - Empowering developers to share knowledge and solve problems together! 🚀
