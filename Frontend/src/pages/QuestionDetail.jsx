import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftIcon, 
  CheckCircleIcon, ClockIcon 
} from '@heroicons/react/24/outline';
import Editor from '../components/Editor';

const QuestionDetail = ({ 
  questions, 
  onAnswerSubmit, 
  onVoteQuestion,
  onVoteAnswer,
  onAcceptAnswer,
  isLoggedIn,
  currentUser,
  navigate
}) => {
  const { id } = useParams();
  const [answerContent, setAnswerContent] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  
  // Find the question by ID
  const question = questions.find(q => q.id === parseInt(id));
  
  if (!question) {
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
  
  const handleAnswerSubmit = () => {
    if (answerContent.trim() && isLoggedIn) {
      onAnswerSubmit(question.id, answerContent);
      setAnswerContent('');
      setShowAnswerForm(false);
    }
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
              onClick={() => onVoteQuestion(question.id, 'up')}
            >
              <ArrowUpIcon className={`h-6 w-6 ${
                currentUser?.votes?.questions[question.id] === 'up' 
                  ? 'text-green-500' 
                  : 'text-gray-400'
              }`} />
            </button>
            <span className="my-1 text-xl font-medium text-gray-800">{question.votes}</span>
            <button 
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => onVoteQuestion(question.id, 'down')}
            >
              <ArrowDownIcon className={`h-6 w-6 ${
                currentUser?.votes?.questions[question.id] === 'down' 
                  ? 'text-red-500' 
                  : 'text-gray-400'
              }`} />
            </button>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{question.title}</h1>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {question.tags.map(tag => (
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
              dangerouslySetInnerHTML={{ __html: question.body }}
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
                <div className="text-gray-600">asked {question.timestamp}</div>
                <div className="flex items-center mt-1">
                  <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs mr-2">
                    {question.user.charAt(0)}
                  </div>
                  <span className="font-medium">{question.user}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{question.answers.length} Answers</h2>
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
              isLoggedIn 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleAnswerSubmit}
            disabled={!isLoggedIn}
          >
            Post Answer
          </button>
        </div>
      )}
      
      <div className="space-y-6">
        {question.answers.map(answer => (
          <div 
            key={answer.id}
            className={`bg-white rounded-lg shadow p-6 relative ${
              answer.isAccepted ? 'border-l-4 border-green-500' : ''
            }`}
          >
            {answer.isAccepted && (
              <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 rounded-br-md text-sm flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Accepted
              </div>
            )}
            
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <button 
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => onVoteAnswer(question.id, answer.id, 'up')}
                >
                  <ArrowUpIcon className={`h-5 w-5 ${
                    currentUser?.votes?.answers[`${question.id}-${answer.id}`] === 'up' 
                      ? 'text-green-500' 
                      : 'text-gray-400'
                  }`} />
                </button>
                <span className="my-1 font-medium text-gray-800">{answer.votes}</span>
                <button 
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => onVoteAnswer(question.id, answer.id, 'down')}
                >
                  <ArrowDownIcon className={`h-5 w-5 ${
                    currentUser?.votes?.answers[`${question.id}-${answer.id}`] === 'down' 
                      ? 'text-red-500' 
                      : 'text-gray-400'
                  }`} />
                </button>
              </div>
              
              <div className="flex-1">
                <div 
                  className="text-gray-700 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: answer.body }}
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
                      <span>answered {answer.timestamp}</span>
                    </div>
                    
                    <div className="bg-gray-100 rounded p-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs mr-2">
                          {answer.user.charAt(0)}
                        </div>
                        <span className="font-medium">{answer.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {currentUser && currentUser.name === question.user && !answer.isAccepted && (
              <div className="mt-4 flex justify-end">
                <button
                  className="flex items-center text-green-600 hover:text-green-800"
                  onClick={() => onAcceptAnswer(question.id, answer.id)}
                >
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  Mark as accepted
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionDetail;