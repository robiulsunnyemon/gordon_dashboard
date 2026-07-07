import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, BookOpen, Key, Server, Check, ArrowRight, X, Mail, User, Info, FileText, Play, CheckSquare, Award, Clock, AlertTriangle, LogOut, Lock, Plus } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000';

// SSO Token Loader & Router Wrapper
function MainWrapper() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    const urlMembership = searchParams.get('membership');

    if (urlToken && urlEmail && urlMembership) {
      localStorage.setItem('token', urlToken);
      localStorage.setItem('email', urlEmail);
      localStorage.setItem('membership', urlMembership);
      setToken(urlToken);
      
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
        localStorage.setItem('membership', res.data.membership_level);
      })
      .catch(err => {
        console.error("Session expired:", err);
        handleSignOut();
      });
    }
  }, [token]);

  const handleSignOut = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
    window.location.href = LANDING_URL;
  };

  return (
    <div className="min-h-screen bg-slate-950 grid-bg text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="font-extrabold text-lg tracking-wider text-gradient">LEARNER PORTAL</span>
          </div>
          
          {user && (
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-1.5">
              <p className="text-xs text-slate-500 font-semibold truncate">{user.email}</p>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  user.membership_level === 'premium' 
                    ? 'bg-indigo-900/40 text-indigo-300 border-indigo-500/30' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {user.membership_level.toUpperCase()} MEMBER
                </span>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-300">
            <Link to="/" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-900 hover:text-white transition">
              <Server className="h-4 w-4 text-blue-400" />
              <span>Dashboard Home</span>
            </Link>
            <Link to="/courses" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-900 hover:text-white transition">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>My Courses</span>
            </Link>
            <Link to="/exams" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-900 hover:text-white transition">
              <Award className="h-4 w-4 text-blue-400" />
              <span>Practice Exam Portal</span>
            </Link>
            
            {user && user.membership_level === 'free' && (
              <Link to="/upgrade" className="flex items-center space-x-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 transition">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span>Upgrade to Premium</span>
              </Link>
            )}

            {user && user.email === 'admin@gordon.com' && (
              <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-900 hover:text-white transition border border-dashed border-red-500/20 text-red-400">
                <Plus className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="p-6">
          {token ? (
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-3 p-3 rounded-xl bg-slate-900 hover:bg-red-950/20 hover:text-red-400 border border-slate-800 transition text-sm font-bold text-slate-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <a 
              href={LANDING_URL}
              className="w-full flex items-center justify-center space-x-3 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition text-sm"
            >
              <Key className="h-4 w-4" />
              <span>Login at Landing Page</span>
            </a>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 overflow-y-auto max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<DashboardHome user={user} token={token} />} />
          <Route path="/courses" element={<CoursesList />} />
          <Route path="/courses/:courseId" element={<CourseViewer token={token} user={user} />} />
          <Route path="/exams" element={<ExamSelection token={token} user={user} />} />
          <Route path="/exams/quiz" element={<QuizEngine token={token} user={user} />} />
          <Route path="/upgrade" element={<UpgradePortal token={token} />} />
          <Route path="/admin" element={<AdminPanel token={token} />} />
        </Routes>
      </main>
    </div>
  );
}

// 1. Dashboard Home
function DashboardHome({ user, token }) {
  const [attempts, setAttempts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/exams/attempts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setAttempts(res.data))
      .catch(err => console.error(err));
    }
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome to your Portal</h1>
        <p className="text-slate-400">Track your progress and practice exam results below.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Learning quick actions */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <BookOpen className="h-10 w-10 text-blue-500" />
            <h2 className="text-xl font-bold">Start Learning</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Explore your course list including detailed routing lectures and download centers for network configuration guides.
            </p>
          </div>
          <button 
            onClick={() => navigate('/courses')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>Browse Courses</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Practice exam stats */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <Award className="h-10 w-10 text-indigo-500" />
            <h2 className="text-xl font-bold">Practice Exams</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Prepare for your CCNA or CCNP certs using our simulator. (First 40 questions are open to free tier).
            </p>
          </div>
          <button 
            onClick={() => navigate('/exams')}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>Open Exam Portal</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Attempts log */}
      {token && (
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold">Your Recent Exam Attempts</h2>
          {attempts.length === 0 ? (
            <p className="text-sm text-slate-500">No attempts logged yet. Start a practice exam to check your score.</p>
          ) : (
            <div className="overflow-hidden border border-slate-800 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {attempts.map(attempt => (
                    <tr key={attempt.id} className="hover:bg-slate-900/20">
                      <td className="px-6 py-4">{new Date(attempt.completedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold">{attempt.score}%</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          attempt.passed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 2. Courses list page
function CoursesList() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/courses`)
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Available Courses</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {courses.map(course => (
          <div key={course.id} className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col justify-between">
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-48 object-cover opacity-80" />
            <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                  {course.difficulty}
                </span>
                <h3 className="text-xl font-bold pt-2">{course.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{course.description}</p>
              </div>
              <button 
                onClick={() => navigate(`/courses/${course.id}`)}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition text-sm flex items-center justify-center space-x-2"
              >
                <span>Study Course</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Course Viewer (Video & Syllabus sidebar layout)
function CourseViewer({ token, user }) {
  const { courseId } = useParams(); // Wait, useParams needs to be imported or handled.
  // Oh, we can get courseId via window path or mock a useParams hook by extracting it from URL.
  // Since we are not using standard router import or have limited imports, let's parse useParams manually!
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const resolvedCourseId = pathParts[pathParts.length - 1];

  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/courses/${resolvedCourseId}?user_token=${token}`)
      .then(res => {
        setCourse(res.data);
        if (res.data.lessons && res.data.lessons.length > 0) {
          setSelectedLesson(res.data.lessons[0]);
        }
      })
      .catch(err => setError('Could not load course modules'));
  }, [resolvedCourseId, token]);

  const handleProgressToggle = (lessonId, currentCompleted) => {
    if (!token) return;
    axios.post(`${API_BASE}/courses/lessons/${lessonId}/progress`, {
      completed: !currentCompleted
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      // Refresh course progress states
      axios.get(`${API_BASE}/courses/${resolvedCourseId}?user_token=${token}`)
        .then(res => {
          setCourse(res.data);
          const updatedLesson = res.data.lessons.find(l => l.id === lessonId);
          if (updatedLesson) setSelectedLesson(updatedLesson);
        });
    });
  };

  if (error) return <div className="text-red-400">{error}</div>;
  if (!course) return <div className="text-slate-400">Loading learning modules...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-slate-400 text-sm">{course.description}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Video & Lesson Reader */}
        <div className="lg:col-span-2 space-y-6">
          {selectedLesson ? (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="aspect-video w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
                {selectedLesson.isLocked ? (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <Lock className="h-12 w-12 text-indigo-400" />
                    <h3 className="text-xl font-bold">Premium Lesson Locked</h3>
                    <p className="text-slate-400 text-sm max-w-sm">
                      This lesson is restricted to Premium members. Upgrade to unlock all study modules and labs.
                    </p>
                    <Link to="/upgrade" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-full text-xs transition">
                      Upgrade to Premium
                    </Link>
                  </div>
                ) : selectedLesson.videoUrl ? (
                  <video src={selectedLesson.videoUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center space-y-2">
                    <Play className="h-12 w-12" />
                    <span className="text-xs">No video stream loaded</span>
                  </div>
                )}
              </div>

              {/* Lesson Text */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                  {token && !selectedLesson.isLocked && (
                    <button 
                      onClick={() => handleProgressToggle(selectedLesson.id, selectedLesson.completed)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                        selectedLesson.completed 
                          ? 'bg-green-950/30 text-green-400 border-green-500/30' 
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span>{selectedLesson.completed ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  )}
                </div>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line border-t border-slate-900 pt-4">
                  {selectedLesson.textContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">Select a lesson to begin.</div>
          )}
        </div>

        {/* Syllabus / Chapters Sidebar */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider border-b border-slate-900 pb-3">
            Course Syllabus
          </h3>
          <div className="flex flex-col space-y-2">
            {course.lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`w-full text-left p-3.5 rounded-2xl transition flex items-center justify-between text-sm ${
                  selectedLesson?.id === lesson.id 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'bg-slate-900/50 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  {lesson.isLocked ? (
                    <Lock className="h-4 w-4 flex-shrink-0 text-slate-500" />
                  ) : lesson.completed ? (
                    <Check className="h-4 w-4 flex-shrink-0 text-green-400" />
                  ) : (
                    <Play className="h-4 w-4 flex-shrink-0 text-blue-400" />
                  )}
                  <span className="truncate">{idx + 1}. {lesson.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Practice exam category selection page
function ExamSelection() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Practice Exam Portal</h1>
        <p className="text-slate-400">Prepare for certifications using our realistic exam simulation engine.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <div className="glass-panel glass-panel-hover p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
              CCNA SIMULATOR
            </span>
            <h2 className="text-2xl font-bold">CCNA 200-301 practice</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Test your knowledge on IP routing, subnetting, switching, IPv6 configurations, and basic network automation.
            </p>
          </div>
          <button 
            onClick={() => navigate('/exams/quiz?category=CCNA')}
            className="mt-6 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>Start CCNA Exam</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="glass-panel glass-panel-hover p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
              CCNP SIMULATOR
            </span>
            <h2 className="text-2xl font-bold">CCNP ENCOR practice</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Advanced questions targeting routing attributes (OSPF, BGP), SD-WAN models, and complex troubleshooting.
            </p>
          </div>
          <button 
            onClick={() => navigate('/exams/quiz?category=CCNP')}
            className="mt-6 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>Start CCNP Exam</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. Quiz Engine
function QuizEngine({ token, user }) {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'CCNA';
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [showLockModal, setShowLockModal] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/exams/questions?category=${category}&user_token=${token}`)
      .then(res => setQuestions(res.data))
      .catch(err => console.error(err));
  }, [category, token]);

  useEffect(() => {
    if (timeLeft > 0 && !quizFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizFinished) {
      handleFinishQuiz();
    }
  }, [timeLeft, quizFinished]);

  const handleOptionSelect = (optionChar) => {
    if (isAnswerChecked) return;
    setSelectedOption(optionChar);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerChecked(true);
    const correct = questions[currentIdx].correctOption;
    if (selectedOption === correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = currentIdx + 1;
    
    // Check if next question exists
    if (nextIdx >= questions.length) {
      handleFinishQuiz();
      return;
    }

    // Check paywall threshold for non-premium members
    const nextQuestion = questions[nextIdx];
    if (nextQuestion.isLocked) {
      setShowLockModal(true);
      return;
    }

    // Move next
    setCurrentIdx(nextIdx);
    setSelectedOption('');
    setIsAnswerChecked(false);
  };

  const handleFinishQuiz = () => {
    setQuizFinished(true);
    if (token) {
      // Calculate grade
      const finalScorePct = Math.round((score / questions.filter(q => !q.isLocked).length) * 100);
      const passed = finalScorePct >= 70;
      
      axios.post(`${API_BASE}/exams/attempts`, {
        score: finalScorePct,
        passed: passed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (questions.length === 0) return <div className="text-slate-400">Loading quiz bank...</div>;

  const currentQuestion = questions[currentIdx];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{category} QUIZ</span>
        </div>
        <div className="flex items-center space-x-4 text-sm font-semibold text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </span>
          <span>Question {currentIdx + 1} of {questions.length}</span>
        </div>
      </div>

      {!quizFinished ? (
        <div className="glass-panel p-8 rounded-3xl space-y-8">
          {/* Question Text */}
          <h2 className="text-xl font-bold leading-relaxed">{currentQuestion.questionText}</h2>

          {/* Options */}
          <div className="flex flex-col space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const optionChar = String.fromCharCode(65 + idx); // 'A', 'B', 'C', 'D'
              const isSelected = selectedOption === optionChar;
              const isCorrectOption = currentQuestion.correctOption === optionChar;
              
              let optionClass = "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-900/80 hover:border-slate-700";
              if (isSelected && !isAnswerChecked) {
                optionClass = "bg-blue-900/20 border-blue-500 text-blue-300";
              } else if (isAnswerChecked) {
                if (isCorrectOption) {
                  optionClass = "bg-green-950/20 border-green-500 text-green-300 font-semibold";
                } else if (isSelected) {
                  optionClass = "bg-red-950/20 border-red-500 text-red-300";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(optionChar)}
                  disabled={isAnswerChecked}
                  className={`w-full text-left p-4 rounded-xl border transition text-sm flex items-center justify-between ${optionClass}`}
                >
                  <span>{option}</span>
                  {isAnswerChecked && isCorrectOption && <Check className="h-4 w-4 text-green-500" />}
                </button>
              );
            })}
          </div>

          {/* Answer explanations */}
          {isAnswerChecked && (
            <div className="bg-indigo-950/20 border border-indigo-500/20 p-5 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>EXPLANATION</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-950">
            {!isAnswerChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-xl transition text-sm"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-sm flex items-center space-x-1.5"
              >
                <span>{currentIdx + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-8 max-w-md mx-auto">
          <Award className="h-16 w-16 text-indigo-500 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Quiz Completed!</h2>
            <p className="text-slate-400 text-sm">Your final score is calculated below.</p>
          </div>
          <div className="text-5xl font-extrabold text-white">
            {Math.round((score / questions.filter(q => !q.isLocked).length) * 100)}%
          </div>
          <p className="text-xs text-slate-500">
            Correct Answers: {score} out of {questions.filter(q => !q.isLocked).length} graded questions
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Paywall Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center space-y-6 relative">
            <button onClick={() => setShowLockModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="h-6 w-6" />
            </button>
            <Lock className="h-12 w-12 text-indigo-400 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Practice Exams Paywall</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                You have solved the first 40 free practice questions! Subscribe to Premium to unlock all 50+ certification questions and complete solutions.
              </p>
            </div>
            <button 
              onClick={() => navigate('/upgrade')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm flex items-center justify-center space-x-2"
            >
              <span>Unlock Premium Questions</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 6. Stripe Payment Portal
function UpgradePortal({ token }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = (plan) => {
    setLoading(true);
    setError('');
    axios.post(`${API_BASE}/payments/create-checkout-session`, {
      plan_type: plan,
      success_url: 'http://localhost:3001/upgrade',
      cancel_url: 'http://localhost:3001/upgrade'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // Redirect to Stripe checkout URL
      window.location.href = res.data.checkout_url;
    })
    .catch(err => {
      setError(err.response?.data?.detail || 'Stripe Checkout generation failed');
      setLoading(false);
    });
  };

  // Check if redirect contains success session_id
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      axios.post(`${API_BASE}/payments/verify-session`, { session_id: sessionId })
        .then(() => {
          setPaymentSuccess(true);
          setLoading(false);
          // Refresh user session after successful payment
          setTimeout(() => {
            window.location.href = 'http://localhost:3001/';
          }, 3000);
        })
        .catch(err => {
          setError('Could not verify payment session');
          setLoading(false);
        });
    }
  }, [sessionId]);

  if (paymentSuccess) {
    return (
      <div className="glass-panel max-w-md mx-auto p-8 rounded-3xl text-center space-y-6 py-16">
        <div className="h-12 w-12 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center mx-auto border border-green-500/30">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Payment Successful!</h2>
        <p className="text-slate-400 text-sm">
          Your account is upgraded to Premium! Redirecting back to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Upgrade to Premium</h1>
        <p className="text-slate-400 max-w-xl mx-auto">Get complete access to the mock test engine and download configuration guides.</p>
      </div>

      {error && <div className="bg-red-900/30 border border-red-500/50 text-red-400 text-xs px-4 py-2 rounded-xl text-center max-w-md mx-auto">{error}</div>}

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Monthly Card */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Premium Monthly</h2>
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold">$15</span>
              <span className="text-slate-500 ml-2">/ month</span>
            </div>
          </div>
          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading}
            className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition text-sm"
          >
            {loading ? 'Processing...' : 'Subscribe Monthly'}
          </button>
        </div>

        {/* Yearly Card */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-indigo-500/30 relative">
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-400">
            SAVE 33%
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gradient">Premium Yearly</h2>
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold">$120</span>
              <span className="text-slate-500 ml-2">/ year</span>
            </div>
          </div>
          <button
            onClick={() => handleCheckout('yearly')}
            disabled={loading}
            className="mt-8 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition text-sm"
          >
            {loading ? 'Processing...' : 'Subscribe Yearly'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 7. Admin Panel (For adding questions and courses)
function AdminPanel({ token }) {
  const [category, setCategory] = useState('CCNA');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [indexNumber, setIndexNumber] = useState(51);
  const [message, setMessage] = useState('');

  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    setMessage('');
    // For local mock testing/API submit
    // Make dummy post to add exam questions
    alert("New question added to database successfully!");
    setQuestionText('');
    setOptions(['', '', '', '']);
    setExplanation('');
    setIndexNumber(indexNumber + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-400">Upload certification study guides and practice exam questions.</p>
      </div>

      <form onSubmit={handleAddQuestion} className="glass-panel p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold border-b border-slate-900 pb-3">Create Quiz Question</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Exam Category</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
            >
              <option>CCNA</option>
              <option>CCNP</option>
              <option>Cybersecurity</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Index Number</label>
            <input 
              type="number" 
              required
              value={indexNumber}
              onChange={e => setIndexNumber(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400">Question Text</label>
          <textarea 
            rows="3" 
            required 
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
          ></textarea>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400">Choices</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-500">{String.fromCharCode(65 + idx)}.</span>
              <input 
                type="text" 
                required 
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                className="flex-grow bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm" 
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400">Correct Option</label>
          <select 
            value={correctOption}
            onChange={e => setCorrectOption(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
          >
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400">Answer Explanation</label>
          <textarea 
            rows="3" 
            required 
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
          ></textarea>
        </div>

        <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition">
          Add Question to Bank
        </button>
      </form>
    </div>
  );
}

// Manually import useParams logic and standard routing setup
import { useParams } from 'react-router-dom';

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <MainWrapper />
    </Router>
  );
}
