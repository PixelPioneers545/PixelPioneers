// src/pages/AskQuestion.jsx
import React, { useState } from 'react';
import Editor from '../components/Editor';

const AskQuestion = ({ onSubmit, isLoggedIn, navigate }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setError('You need to be logged in to ask a question');
      return;
    }
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!body.trim()) {
      setError('Question body is required');
      return;
    }
    
    const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    onSubmit({
      title,
      body,
      tags: tagList
    });
  };
  
  return (
    <div>
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <button 
          className="text-blue-600 hover:underline"
          onClick={() => navigate('home')}
        >
          &larr; Back to questions
        </button>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ask a Question</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's your programming question? Be specific."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Imagine you're asking a question to another person.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="body">
              Body
            </label>
            <Editor 
              value={body}
              onChange={setBody}
              placeholder="Describe your question in detail..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Include all the information someone would need to answer your question.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="tags">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tags (javascript, react, sql, etc.) separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Add up to 5 tags to describe what your question is about.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-6 py-2 rounded-md font-medium ${
                isLoggedIn 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isLoggedIn}
            >
              Post Your Question
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AskQuestion;