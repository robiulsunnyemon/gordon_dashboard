import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, CheckCircle, Search, HelpCircle, ArrowRight, Shield } from 'lucide-react';
import { API_BASE } from '../App';
import { Link } from 'react-router-dom';

export default function InterviewPrep({ user, token }) {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Interactive Q&A State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = () => {
    setLoading(true);
    axios.get(`${API_BASE}/interviews`)
      .then(res => {
        const data = res.data;
        setQuestions(data);
        // Extract unique topics
        const uniqueTopics = ['All', ...new Set(data.map(q => q.topic))];
        setTopics(uniqueTopics);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const filteredQuestions = selectedTopic === 'All' 
    ? questions 
    : questions.filter(q => q.topic === selectedTopic);

  const currentQuestion = filteredQuestions[currentIndex];

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentIndex(0);
    resetQnState();
  };

  const resetQnState = () => {
    setUserAnswer('');
    setShowAnswer(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userAnswer.trim() === '') return;
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetQnState();
    }
  };

  if (!user || user.membership_level === 'free') {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto text-center py-12">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 text-indigo-400 rounded-full mb-4">
          <Shield className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Premium Feature</h2>
        <p className="text-slate-400 text-lg">
          The interactive Interview & Exam Preparation module is exclusively available to Premium members. 
          Upgrade your account to unlock real-world mock questions and expert answers.
        </p>
        <div className="pt-6">
          <Link to="/upgrade" className="inline-flex items-center space-x-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-indigo-500/20">
            <span>Upgrade to Premium</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 text-blue-400 rounded-full mb-4">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Interview & Exam Prep</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Test your knowledge with real-world interview and exam questions. Write down your thoughts, then check the correct answer.
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse flex justify-center py-20">
            <div className="h-8 w-8 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Topic Filter */}
            {topics.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center mb-10">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleTopicSelect(topic)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                      selectedTopic === topic 
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}

            {filteredQuestions.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800/50">
                <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Questions Found</h3>
                <p className="text-slate-400">There are no interview questions available for this topic yet.</p>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-900 absolute top-0 left-0">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
                  ></div>
                </div>

                <div className="p-8 md:p-12">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-blue-400 font-bold text-sm tracking-wider uppercase">
                      Topic: {currentQuestion.topic}
                    </span>
                    <span className="text-slate-500 text-sm font-semibold">
                      Question {currentIndex + 1} of {filteredQuestions.length}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-snug">
                    {currentQuestion.questionText}
                  </h3>

                  <div className="space-y-6">
                    {/* User Answer Textarea */}
                    <div>
                      <form onSubmit={handleSubmit}>
                        <textarea
                          rows="4"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          disabled={showAnswer}
                          placeholder="Type your answer or thoughts here..."
                          className={`w-full p-5 rounded-2xl border text-slate-100 outline-none text-base resize-none transition ${
                            showAnswer 
                              ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed' 
                              : 'bg-slate-900 border-slate-700 focus:border-blue-500 focus:bg-slate-800'
                          }`}
                        ></textarea>
                        
                        {!showAnswer && (
                          <div className="flex justify-end mt-4">
                            <button
                              type="submit"
                              disabled={userAnswer.trim() === ''}
                              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition flex items-center gap-2"
                            >
                              Check Answer
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Right Answer Reveal */}
                    {showAnswer && (
                      <div className="mt-8 animate-fade-in">
                        <div className="p-6 md:p-8 bg-green-950/20 border border-green-500/20 rounded-2xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                          
                          <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <h4 className="text-lg font-bold text-white">Correct Answer</h4>
                          </div>
                          
                          <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                            {currentQuestion.correctAnswer}
                          </p>
                        </div>

                        <div className="flex justify-end mt-8">
                          {currentIndex < filteredQuestions.length - 1 ? (
                            <button
                              onClick={handleNext}
                              className="px-8 py-3 bg-slate-100 hover:bg-white text-slate-900 rounded-xl font-bold transition flex items-center gap-2 shadow-lg"
                            >
                              Next Question
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          ) : (
                            <div className="text-center w-full p-4 bg-slate-900 rounded-xl border border-slate-800">
                              <p className="text-blue-400 font-bold mb-2">🎉 Great job!</p>
                              <p className="text-slate-400 text-sm">You have completed all questions in this topic.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
