import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';
import AskQuestion from './pages/AskQuestion';
import UserSettings from './pages/UserSettings';
import { questions as initialQuestions } from './data';
import Register from './components/register';


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
    questionCount: 2,
    answerCount: 5,
    votes: {
      questions: {},
      answers: {}
    }
  });
  const navigate = useNavigate();
  
  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/Register');
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({
      ...user,
      votes: {
        questions: {},
        answers: {}
      }
    });
    navigate('/');
  };
  
  const postQuestion = (newQuestion) => {
    const question = {
      id: questions.length + 1,
      ...newQuestion,
      user: user.name,
      votes: 0,
      answers: [],
      views: 0,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    
    const updatedUser = {
      ...user,
      questionCount: user.questionCount + 1
    };
    
    setQuestions([question, ...questions]);
    setUser(updatedUser);
    navigate('/');
  };
  
  const postAnswer = (questionId, answer) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: [
            ...q.answers,
            {
              id: q.answers.length + 1,
              body: answer,
              user: user.name,
              votes: 0,
              isAccepted: false,
              timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
          ]
        };
      }
      return q;
    });
    
    const updatedUser = {
      ...user,
      answerCount: user.answerCount + 1
    };
    
    setQuestions(updatedQuestions);
    setUser(updatedUser);
  };
  
  const voteQuestion = (questionId, direction) => {
    if (!isLoggedIn) return;
    
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const currentVote = user.votes.questions[questionId];
        let voteChange = 0;
        
        if (currentVote === direction) {
          // User is removing their vote
          voteChange = direction === 'up' ? -1 : 1;
          delete user.votes.questions[questionId];
        } else {
          if (currentVote) {
            // User is changing their vote
            voteChange = direction === 'up' ? 2 : -2;
          } else {
            // User is adding a new vote
            voteChange = direction === 'up' ? 1 : -1;
          }
          
          user.votes.questions[questionId] = direction;
        }
        
        return {
          ...q,
          votes: q.votes + voteChange
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    setUser({...user});
  };
  
  const voteAnswer = (questionId, answerId, direction) => {
    if (!isLoggedIn) return;
    
    const voteKey = `${questionId}-${answerId}`;
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const updatedAnswers = q.answers.map(a => {
          if (a.id === answerId) {
            const currentVote = user.votes.answers[voteKey];
            let voteChange = 0;
            
            if (currentVote === direction) {
              // User is removing their vote
              voteChange = direction === 'up' ? -1 : 1;
              delete user.votes.answers[voteKey];
            } else {
              if (currentVote) {
                // User is changing their vote
                voteChange = direction === 'up' ? 2 : -2;
              } else {
                // User is adding a new vote
                voteChange = direction === 'up' ? 1 : -1;
              }
              
              user.votes.answers[voteKey] = direction;
            }
            
            return {
              ...a,
              votes: a.votes + voteChange
            };
          }
          return a;
        });
        
        return {
          ...q,
          answers: updatedAnswers
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    setUser({...user});
  };
  
  const acceptAnswer = (questionId, answerId) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId && user.name === q.user) {
        return {
          ...q,
          answers: q.answers.map(a => ({
            ...a,
            isAccepted: a.id === answerId
          }))
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    navigate('/');
  };

  const searchQuestions = (query) => {
    if (!query.trim()) return [];
    
    return questions.filter(q => {
      const searchLower = query.toLowerCase();
      if (q.title.toLowerCase().includes(searchLower)) return true;
      if (q.body.toLowerCase().includes(searchLower)) return true;
      return false;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={isLoggedIn} 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        searchQuestions={searchQuestions}
        navigate={navigate}
      />
      
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={
            <Home 
              questions={questions} 
              navigate={navigate}
              isLoggedIn={isLoggedIn}
            />
          } />
          
          <Route path="/questions/:id" element={
            <QuestionDetail 
              questions={questions} 
              onAnswerSubmit={postAnswer}
              onVoteQuestion={voteQuestion}
              onVoteAnswer={voteAnswer}
              onAcceptAnswer={acceptAnswer}
              isLoggedIn={isLoggedIn}
              currentUser={user}
              navigate={navigate}
            />
          } />
          
          <Route path="/ask" element={
            <AskQuestion 
              onSubmit={postQuestion}
              isLoggedIn={isLoggedIn}
              navigate={navigate}
            />
          } />
          
          <Route path="/settings" element={
            <UserSettings 
              user={user}
              onUpdateUser={updateUser}
              navigate={navigate}
            />
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;