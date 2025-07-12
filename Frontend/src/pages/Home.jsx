import React, { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';

const Home = ({ questions, navigate, isLoggedIn }) => {
  const [filter, setFilter] = useState('newest');
  const [activeTags, setActiveTags] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  
  // Get all unique tags
  const tags = [...new Set(questions.flatMap(q => q.tags))];
  
  useEffect(() => {
    const filtered = questions
      .filter(question => {
        if (filter === 'unanswered') {
          return question.answers.length === 0;
        }
        if (activeTags.length > 0) {
          return activeTags.every(tag => question.tags.includes(tag));
        }
        return true;
      })
      .sort((a, b) => {
        if (filter === 'newest') {
          return new Date(b.timestamp) - new Date(a.timestamp);
        }
        if (filter === 'top-voted') {
          return b.votes - a.votes;
        }
        return 0;
      });
      
    setFilteredQuestions(filtered);
  }, [questions, filter, activeTags]);
  
  const toggleTag = (tag) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Questions</h1>
        <button 
          className={`px-4 py-2 rounded-md font-medium ${
            isLoggedIn 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => navigate('/ask')}
          disabled={!isLoggedIn}
        >
          Ask Question
        </button>
      </div>
      
      <div className="md:flex gap-6">
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">{filteredQuestions.length} questions</div>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 rounded-md ${
                  filter === 'newest' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setFilter('newest')}
              >
                Newest
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${
                  filter === 'unanswered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setFilter('unanswered')}
              >
                Unanswered
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${
                  filter === 'top-voted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setFilter('top-voted')}
              >
                Top Voted
              </button>
            </div>
          </div>
          
          {activeTags.length > 0 && (
            <div className="mb-4 flex items-center">
              <span className="mr-2 text-gray-600">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {activeTags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded flex items-center"
                  >
                    {tag}
                    <button 
                      onClick={() => toggleTag(tag)}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button 
                  onClick={() => setActiveTags([])}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
          
          <div>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(question => (
                <QuestionCard 
                  key={question.id} 
                  question={question} 
                  onClick={() => navigate(`/questions/${question.id}`)} 
                />
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-lg font-medium text-gray-800">No questions found</h3>
                <p className="text-gray-600 mt-2">
                  {activeTags.length > 0
                    ? "Try removing some filters"
                    : "Be the first to ask a question!"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:w-1/4 mt-6 md:mt-0">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <h2 className="text-lg font-semibold mb-3">About StackIt</h2>
            <p className="text-gray-600 text-sm">
              StackIt is a Q&A platform for developers to share knowledge and solve problems together.
              Ask questions, get answers, and help others in the community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;