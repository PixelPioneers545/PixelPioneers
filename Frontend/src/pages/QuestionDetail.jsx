import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftIcon, 
  CheckCircleIcon, ClockIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import Editor from '../components/Editor';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answerContent, setAnswerContent] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { 
    currentQuestion, 
    loadingQuestion, 
    loadQuestionById, 
    createAnswer, 
    voteQuestion, 
    voteAnswer, 
    acceptAnswer
  } = useQuestions();
  
  useEffect(() => {
    if (id) {
      loadQuestionById(parseInt(id));
    }
  }, [id, loadQuestionById]);
  
  const handleAnswerSubmit = async () => {
    if (answerContent.trim() && isAuthenticated && currentQuestion) {
      const result = await createAnswer(currentQuestion.id, {
        content: answerContent,
        userId: user.id
      });
      
      if (result.success) {
        setAnswerContent('');
        setShowAnswerForm(false);
      }
    }
  };

  const handleVoteQuestion = async (direction) => {
    if (isAuthenticated && currentQuestion && user) {
      await voteQuestion(currentQuestion.id, direction, user.id);
    }
  };

  const handleVoteAnswer = async (answerId, direction) => {
    if (isAuthenticated && currentQuestion && user) {
      await voteAnswer(currentQuestion.id, answerId, direction, user.id);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (isAuthenticated && currentQuestion && user) {
      await acceptAnswer(currentQuestion.id, answerId, user.id);
    }
  };
  
  if (loadingQuestion) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Question not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to questions
        </button>
      </div>
    );
  }

  // Handle different data structures from backend vs frontend
  const title = currentQuestion.title || currentQuestion.questiontitle || 'Untitled Question';
  const body = currentQuestion.body || currentQuestion.questiondescription || '';
  const tags = currentQuestion.tags || currentQuestion.questiontags || [];
  const votes = currentQuestion.vote_score || currentQuestion.votes || (currentQuestion.questionupvotes || 0) - (currentQuestion.questiondownvotes || 0);
  const answers = currentQuestion.answers || [];
  const user_id = currentQuestion.user_id || currentQuestion.userId;
  const author = currentQuestion.author_name || currentQuestion.user || currentQuestion.username || 'Anonymous';
  const timestamp = currentQuestion.created_at || currentQuestion.questiontime || currentQuestion.timestamp || '';

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div>


      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to questions
      </button>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex">
          <div className="flex flex-col items-center mr-4">
            <button 
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => handleVoteQuestion('up')}
              disabled={!isAuthenticated}
            >
              <ArrowUpIcon className={`h-6 w-6 ${
                isAuthenticated ? 'text-gray-400 hover:text-green-500' : 'text-gray-300'
              }`} />
            </button>
            <span className="my-1 text-xl font-medium text-gray-800">{votes}</span>
            <button 
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => handleVoteQuestion('down')}
              disabled={!isAuthenticated}
            >
              <ArrowDownIcon className={`h-6 w-6 ${
                isAuthenticated ? 'text-gray-400 hover:text-red-500' : 'text-gray-300'
              }`} />
            </button>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.isArray(tags) && tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div 
              className="mt-6 text-gray-700 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: body }}
            />
            
            <div className="mt-8 flex justify-between items-center">
              <div className="flex space-x-4">
                <button className="text-gray-500 hover:text-gray-700 flex items-center">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                  <span>Comment</span>
                </button>
                <button className="text-gray-500 hover:text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
              
              <div className="bg-gray-100 rounded p-2 text-sm">
                <div className="text-gray-600">
                  asked {formatDate(timestamp)}
                </div>
                <div className="flex items-center mt-1">
                  <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs mr-2">
                    {author.charAt(0)}
                  </div>
                  <span className="font-medium">{author}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {answers.length} Answers
        </h2>
        <button 
          className="text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => setShowAnswerForm(!showAnswerForm)}
        >
          {showAnswerForm ? 'Cancel' : 'Post Your Answer'}
        </button>
      </div>
      
      {showAnswerForm && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Your Answer</h3>
          <Editor 
            value={answerContent}
            onChange={setAnswerContent}
            placeholder="Write your answer here..."
          />
          <button
            className={`mt-4 px-4 py-2 rounded-md font-medium ${
              isAuthenticated 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleAnswerSubmit}
            disabled={!isAuthenticated}
          >
            Post Answer
          </button>
        </div>
      )}
      
      <div className="space-y-6">
        {answers.map(answer => (
          <div 
            key={answer.id || answer.answerid}
            className={`bg-white rounded-lg shadow p-6 relative ${
              answer.is_accepted || answer.isAccepted ? 'border-l-4 border-green-500' : ''
            }`}
          >
            {(answer.is_accepted || answer.isAccepted) && (
              <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 rounded-br-md text-sm flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Accepted
              </div>
            )}
            
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <button 
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => handleVoteAnswer(answer.id || answer.answerid, 'up')}
                  disabled={!isAuthenticated}
                >
                  <ArrowUpIcon className={`h-5 w-5 ${
                    isAuthenticated ? 'text-gray-400 hover:text-green-500' : 'text-gray-300'
                  }`} />
                </button>
                <span className="my-1 font-medium text-gray-800">{answer.vote_score || answer.votes || 0}</span>
                <button 
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => handleVoteAnswer(answer.id || answer.answerid, 'down')}
                  disabled={!isAuthenticated}
                >
                  <ArrowDownIcon className={`h-5 w-5 ${
                    isAuthenticated ? 'text-gray-400 hover:text-red-500' : 'text-gray-300'
                  }`} />
                </button>
              </div>
              
              <div className="flex-1">
                <div 
                  className="text-gray-700 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: answer.body || answer.answercontent || answer.content }}
                />
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button className="text-gray-500 hover:text-gray-700 flex items-center">
                      <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                      <span>Comment</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>answered {formatDate(answer.created_at || answer.answertime || answer.timestamp || answer.time)}</span>
                    </div>
                    
                    <div className="bg-gray-100 rounded p-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs mr-2">
                          {(answer.author_name || answer.user || answer.usernamewhogaveanswer || 'U').charAt(0)}
                        </div>
                        <span className="font-medium">{answer.author_name || answer.user || answer.usernamewhogaveanswer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {isAuthenticated && user && user.id === user_id && !(answer.is_accepted || answer.isAccepted) && (
              <div className="mt-4 flex justify-end">
                <button
                  className="flex items-center text-green-600 hover:text-green-800"
                  onClick={() => handleAcceptAnswer(answer.id || answer.answerid)}
                >
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  Mark as accepted
                </button>
              </div>
            )}
          </div>
        ))}
        
        {answers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800">No answers yet</h3>
            <p className="text-gray-600 mt-2">
              Be the first to answer this question!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;