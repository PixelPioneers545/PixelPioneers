import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { questionsAPI, answersAPI } from '../services/api';

const QuestionsContext = createContext();

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error('useQuestions must be used within a QuestionsProvider');
  }
  return context;
};

export const QuestionsProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState('newest');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const loadQuestions = useCallback(async (reset = false, filter = currentFilter) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await questionsAPI.getAll(currentPage, 10, filter);
      
      if (response.success) {
        const newQuestions = response.data || [];
        
        if (reset) {
          setQuestions(newQuestions);
          setPage(1);
          setCurrentFilter(filter);
        } else {
          setQuestions(prev => [...prev, ...newQuestions]);
          setPage(currentPage + 1);
        }
        
        setHasMore(response.pagination?.hasMore || newQuestions.length === 10);
      } else {
        setError(response.message || 'Failed to load questions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [page, currentFilter]);

  const loadQuestionById = useCallback(async (id) => {
    try {
      setLoadingQuestion(true);
      setError(null);
      
      const response = await questionsAPI.getById(id);
      
      if (response.success) {
        setCurrentQuestion(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to load question');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to load question');
      return null;
    } finally {
      setLoadingQuestion(false);
    }
  }, []);

  const createQuestion = useCallback(async (questionData) => {
    try {
      setError(null);
      const response = await questionsAPI.create(questionData);
      
      if (response.success) {
        const newQuestion = response.data;
        setQuestions(prev => [newQuestion, ...prev]);
        return { success: true, question: newQuestion };
      } else {
        setError(response.message || 'Failed to create question');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create question';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  const voteQuestion = useCallback(async (questionId, direction, userId) => {
    try {
      const response = await questionsAPI.vote(questionId, direction, userId);
      
      if (response.success) {
        setQuestions(prev => 
          prev.map(q => 
            q.id === questionId 
              ? { ...q, votes: response.data.votes }
              : q
          )
        );
        
        if (currentQuestion?.id === questionId) {
          setCurrentQuestion(prev => ({ ...prev, votes: response.data.votes }));
        }
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [currentQuestion]);

  const createAnswer = useCallback(async (questionId, answerData) => {
    try {
      const response = await answersAPI.create(questionId, answerData);
      
      if (response.success) {
        const newAnswer = response.data;
        
        // Update current question if it's the one being answered
        if (currentQuestion?.id === questionId) {
          setCurrentQuestion(prev => ({
            ...prev,
            answers: [...(prev.answers || []), newAnswer]
          }));
        }
        
        // Update questions list
        setQuestions(prev => 
          prev.map(q => 
            q.id === questionId 
              ? { ...q, answers: [...(q.answers || []), newAnswer] }
              : q
          )
        );
        
        return { success: true, answer: newAnswer };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [currentQuestion]);

  const voteAnswer = useCallback(async (questionId, answerId, direction, userId) => {
    try {
      const response = await answersAPI.vote(questionId, answerId, direction, userId);
      
      if (response.success) {
        const updateAnswer = (answers) => 
          answers.map(a => 
            a.id === answerId 
              ? { ...a, votes: response.data.votes }
              : a
          );
        
        // Update current question
        if (currentQuestion?.id === questionId) {
          setCurrentQuestion(prev => ({
            ...prev,
            answers: updateAnswer(prev.answers || [])
          }));
        }
        
        // Update questions list
        setQuestions(prev => 
          prev.map(q => 
            q.id === questionId 
              ? { ...q, answers: updateAnswer(q.answers || []) }
              : q
          )
        );
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [currentQuestion]);

  const acceptAnswer = useCallback(async (questionId, answerId, userId) => {
    try {
      const response = await answersAPI.accept(questionId, answerId, userId);
      
      if (response.success) {
        const updateAnswer = (answers) => 
          answers.map(a => ({
            ...a,
            isAccepted: a.id === answerId
          }));
        
        // Update current question
        if (currentQuestion?.id === questionId) {
          setCurrentQuestion(prev => ({
            ...prev,
            answers: updateAnswer(prev.answers || [])
          }));
        }
        
        // Update questions list
        setQuestions(prev => 
          prev.map(q => 
            q.id === questionId 
              ? { ...q, answers: updateAnswer(q.answers || []) }
              : q
          )
        );
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [currentQuestion]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetQuestions = useCallback(() => {
    setQuestions([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // Load initial questions
  useEffect(() => {
    loadQuestions(true);
  }, []);

  const value = {
    questions,
    currentQuestion,
    loading,
    loadingQuestion,
    error,
    hasMore,
    currentFilter,
    loadQuestions,
    loadQuestionById,
    createQuestion,
    voteQuestion,
    createAnswer,
    voteAnswer,
    acceptAnswer,
    clearError,
    resetQuestions
  };

  return (
    <QuestionsContext.Provider value={value}>
      {children}
    </QuestionsContext.Provider>
  );
}; 