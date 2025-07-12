import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const { questions } = useQuestions();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = questions.filter(q => {
        const searchLower = searchQuery.toLowerCase();
        return q.title.toLowerCase().includes(searchLower) || 
               q.body.toLowerCase().includes(searchLower);
      });
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, questions]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchResultClick = (question) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/questions/${question.id}`);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };
  
  const notifications = [
    { id: 1, text: 'Jane Smith answered your question about SQL joins', read: false, timestamp: '2 hours ago' },
    { id: 2, text: 'You were mentioned in a comment by Alex Johnson', read: false, timestamp: '1 day ago' },
    { id: 3, text: 'Your question about React state got 5 upvotes', read: true, timestamp: '3 days ago' }
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-bold cursor-pointer"
              onClick={() => navigate('/')}
            >
              StackIt
            </h1>
            
            <div className="hidden md:flex items-center bg-white rounded-md px-3 py-1 w-72 relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                className="ml-2 w-full text-gray-800 focus:outline-none"
                value={searchQuery}
                onChange={handleSearch}
              />
              
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10 max-h-80 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(question => (
                      <div 
                        key={question.id}
                        className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSearchResultClick(question)}
                      >
                        <h4 className="font-medium text-blue-600">{question.title}</h4>
                        <div 
                          className="text-sm text-gray-600 mt-1 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: question.body }} 
                        />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No questions found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button 
                  className="hidden md:inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md transition"
                  onClick={() => navigate('/ask')}
                >
                  Ask Question
                </button>
                
                <div className="relative">
                  <button 
                    className="relative p-1 rounded-full hover:bg-blue-700"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                  >
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-md shadow-lg z-10">
                      <div className="p-3 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b hover:bg-gray-50 ${notification.read ? 'bg-gray-50' : 'bg-white'}`}
                          >
                            <p className="text-sm">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center text-sm text-blue-600 hover:bg-gray-50 cursor-pointer">
                        View all notifications
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 focus:outline-none"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm">
                        {user?.username?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="hidden md:inline">{user?.username}</span>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">Email: {user?.email}</div>
                        <div className="font-medium">Role: {user?.role}</div>
                      </div>
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          navigate('/settings');
                          setIsProfileOpen(false);
                        }}
                      >
                        Settings
                      </button>
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-md font-medium transition"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            )}
          </div>
        </div>
        
        <div className="md:hidden pb-3 relative">
          <div className="flex items-center bg-white rounded-md px-3 py-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              className="ml-2 w-full text-gray-800 focus:outline-none"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map(question => (
                  <div 
                    key={question.id}
                    className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSearchResultClick(question)}
                  >
                    <h4 className="font-medium text-blue-600">{question.title}</h4>
                    <div 
                      className="text-sm text-gray-600 mt-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: question.body }} 
                    />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No questions found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;