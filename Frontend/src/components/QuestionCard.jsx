// src/components/QuestionCard.jsx
import React from 'react';
import { ChatBubbleLeftIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon } from '@heroicons/react/24/outline';

const QuestionCard = ({ question, onClick }) => {
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
          <span className="my-1 font-medium text-gray-800">{question.votes}</span>
          <button className="p-1 rounded hover:bg-gray-100">
            <ArrowDownIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 transition">
            {question.title}
          </h3>
          <p className="mt-2 text-gray-600 line-clamp-2">
            {question.body}
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {question.tags.map(tag => (
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
              <span>{question.answers.length} answers</span>
            </div>
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{question.views} views</span>
            </div>
            <div>
              <span className="font-medium">{question.user}</span>
              <span className="ml-2">asked {question.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;