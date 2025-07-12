// src/components/QuestionCard.jsx
import React from 'react';
import { ChatBubbleLeftIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon } from '@heroicons/react/24/outline';

const QuestionCard = ({ question, onClick }) => {
  // Handle different data structures from backend vs frontend
  const title = question.title || question.questiontitle || 'Untitled Question';
  const body = question.body || question.questiondescription || '';
  const tags = question.tags || question.questiontags || [];
  const user = question.user || question.username || 'Anonymous';
  const timestamp = question.timestamp || question.questiontime || question.created_at || '';
  const votes = question.vote_score || question.votes || (question.questionupvotes || 0) - (question.questiondownvotes || 0);
  const answers = question.answers || [];
  const views = question.views || 0;

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 mb-4 cursor-pointer hover:shadow-md transition"
      onClick={() => onClick(question)}
    >
      <div className="flex">
        <div className="flex flex-col items-center mr-4">
          <button className="p-1 rounded hover:bg-gray-100">
            <ArrowUpIcon className="h-5 w-5 text-gray-500" />
          </button>
          <span className="my-1 font-medium text-gray-800">{votes}</span>
          <button className="p-1 rounded hover:bg-gray-100">
            <ArrowDownIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 transition">
            {title}
          </h3>
          <p className="mt-2 text-gray-600 line-clamp-2">
            {body}
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.isArray(tags) && tags.map(tag => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
              <span>{answers.length} answers</span>
            </div>
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{views} views</span>
            </div>
            <div>
              <span className="font-medium">{user}</span>
              <span className="ml-2">asked {timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;