import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import QuestionCard from '../components/QuestionCard';

const Home = () => {
  const [filter, setFilter] = useState('newest');
  const [activeTags, setActiveTags] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  
  const { isAuthenticated } = useAuth();
  const { questions, loading, hasMore, loadQuestions } = useQuestions();
  const navigate = useNavigate();
  
  // Get all unique tags from the questions
  const tags = [...new Set(questions.flatMap(q => {
    const questionTags = q.tags || q.questiontags || [];
    return Array.isArray(questionTags) ? questionTags : [];
  }))];
  
  // Infinite scroll hook
  const lastElementRef = useInfiniteScroll(loading, hasMore, () => {
    loadQuestions(false, filter);
  });
  
  // Filter and sort questions
  useEffect(() => {
    const filtered = questions
      .filter(question => {
        if (filter === 'unanswered') {
          const answers = question.answers || [];
          return answers.length === 0;
        }
        if (activeTags.length > 0) {
          const questionTags = question.tags || question.questiontags || [];
          return activeTags.every(tag => 
            Array.isArray(questionTags) && questionTags.includes(tag)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (filter === 'newest') {
          const timeA = a.created_at || a.questiontime || a.timestamp || '';
          const timeB = b.created_at || b.questiontime || b.timestamp || '';
          return new Date(timeB) - new Date(timeA);
        }
        // For 'topvoted', trust backend order, so no sort here
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

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    // Reset questions when filter changes
    loadQuestions(true, newFilter);
  }, [loadQuestions]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Questions</h1>
        <button 
          className={`px-4 py-2 rounded-md font-medium ${
            isAuthenticated 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => navigate('/ask')}
          disabled={!isAuthenticated}
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
                onClick={() => handleFilterChange('newest')}
              >
                Newest
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${
                  filter === 'unanswered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => handleFilterChange('unanswered')}
              >
                Unanswered
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${
                  filter === 'topvoted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => handleFilterChange('topvoted')}
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
              filteredQuestions.map((question, index) => {
                // Add ref to last element for infinite scroll
                if (index === filteredQuestions.length - 1) {
                  return (
                    <div key={question.id} ref={lastElementRef}>
                      <QuestionCard 
                        question={question} 
                        onClick={() => navigate(`/questions/${question.id}`)} 
                      />
                    </div>
                  );
                }
                return (
                  <QuestionCard 
                    key={question.id} 
                    question={question} 
                    onClick={() => navigate(`/questions/${question.id}`)} 
                  />
                );
              })
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
            
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {!hasMore && filteredQuestions.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                No more questions to load
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