import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, BookOpen, Key, Server, Check, ArrowRight, X, Mail, User, Info, FileText, Play, CheckSquare, Award, Clock, AlertTriangle, LogOut, Lock, Plus } from 'lucide-react';
import axios from 'axios';
import InterviewPrep from './components/InterviewPrep';

export const API_BASE = import.meta.env.VITE_API_BASE;
const LANDING_URL = import.meta.env.VITE_LANDING_URL;
const DASHBOARD_URL = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "");

// SSO Token Loader & Router Wrapper
function MainWrapper() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const adminToken = localStorage.getItem('gordon_admin_token');
    if (adminToken) return adminToken;
    return localStorage.getItem('gordon_student_token') || '';
  });

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    const urlMembership = searchParams.get('membership');

    if (urlToken && urlEmail && urlMembership) {
      if (urlEmail === 'admin@gordon.com') {
        localStorage.setItem('gordon_admin_token', urlToken);
        localStorage.setItem('gordon_admin_email', urlEmail);
        localStorage.setItem('gordon_admin_membership', urlMembership);
      } else {
        localStorage.setItem('gordon_student_token', urlToken);
        localStorage.setItem('gordon_student_email', urlEmail);
        localStorage.setItem('gordon_student_membership', urlMembership);
      }
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
          if (res.data.email === 'admin@gordon.com') {
            localStorage.setItem('gordon_admin_membership', res.data.membership_level);
          } else {
            localStorage.setItem('gordon_student_membership', res.data.membership_level);
          }
        })
        .catch(err => {
          console.error("Session expired:", err);
          handleSignOut();
        });
    }
  }, [token]);

  const handleSignOut = () => {
    if (user && user.email === 'admin@gordon.com') {
      localStorage.removeItem('gordon_admin_token');
      localStorage.removeItem('gordon_admin_email');
      localStorage.removeItem('gordon_admin_membership');
    } else {
      localStorage.removeItem('gordon_student_token');
      localStorage.removeItem('gordon_student_email');
      localStorage.removeItem('gordon_student_membership');
    }
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${user.membership_level === 'premium'
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
            <Link to="/interview-prep" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-900 hover:text-white transition">
              <CheckSquare className="h-4 w-4 text-blue-400" />
              <span>Interview Prep</span>
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
          <Route path="/interview-prep" element={<InterviewPrep token={token} user={user} />} />
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${attempt.passed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
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
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${selectedLesson.completed
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
                className={`w-full text-left p-3.5 rounded-2xl transition flex items-center justify-between text-sm ${selectedLesson?.id === lesson.id
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
      success_url: `${DASHBOARD_URL}/upgrade`,
      cancel_url: `${DASHBOARD_URL}/upgrade`
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
            window.location.href = DASHBOARD_URL + '/';
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

// 7. Admin Panel (Complete Courses & Lessons CRUD, Users, Dynamic Charts)
function AdminPanel({ token }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Time');

  // Course form state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseThumb, setCourseThumb] = useState('');
  const [courseDiff, setCourseDiff] = useState('Beginner');

  // Lesson form state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editLessonId, setEditLessonId] = useState(null);
  const [lessonCourseId, setLessonCourseId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [lessonOrder, setLessonOrder] = useState(1);

  // Question form state
  const [category, setCategory] = useState('CCNA');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [indexNumber, setIndexNumber] = useState(51);

  // Expanded courses in CRUD list
  const [expandedCourses, setExpandedCourses] = useState({});

  // Blog Posts Management state
  const [blogPostsList, setBlogPostsList] = useState([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editBlogPostId, setEditBlogPostId] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState('CCNA');
  const [blogCoverImage, setBlogCoverImage] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('5 min read');
  const [blogPublished, setBlogPublished] = useState(false);

  // About Section Management state
  const [aboutTitle, setAboutTitle] = useState('About Gordon IT Academy');
  const [aboutSubTitle, setAboutSubTitle] = useState('About');
  const [aboutParagraphs, setAboutParagraphs] = useState(['', '', '']);
  const [aboutStats, setAboutStats] = useState([
    { icon: 'Award', label: '', sub: '' },
    { icon: 'Users', label: '', sub: '' },
    { icon: 'Target', label: '', sub: '' },
    { icon: 'BookOpen', label: '', sub: '' }
  ]);

  // Subscription Plans Management state
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [editSubscriptionId, setEditSubscriptionId] = useState(null);
  const [subName, setSubName] = useState('');
  const [subPlanType, setSubPlanType] = useState('free'); // "free", "monthly", "yearly"
  const [subPrice, setSubPrice] = useState(0.0);
  const [subBillingPeriod, setSubBillingPeriod] = useState('forever'); // "forever", "month", "year"
  const [subDescription, setSubDescription] = useState('');
  const [subFeatures, setSubFeatures] = useState(['', '', '', '']);
  const [subBadge, setSubBadge] = useState('');
  const [subCta, setSubCta] = useState('Start Free');
  const [subFeatured, setSubFeatured] = useState(false);

  // Testimonials Management state
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editTestimonialId, setEditTestimonialId] = useState(null);
  const [testName, setTestName] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testCompany, setTestCompany] = useState('');
  const [testRating, setTestRating] = useState(5);
  const [testText, setTestText] = useState('');

  // Interview Questions state
  const [interviewsList, setInterviewsList] = useState([]);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editInterviewId, setEditInterviewId] = useState(null);
  const [interviewTopic, setInterviewTopic] = useState('');
  const [interviewQuestionText, setInterviewQuestionText] = useState('');
  const [interviewCorrectAnswer, setInterviewCorrectAnswer] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const loadData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      axios.get(`${API_BASE}/admin/stats`, { headers }),
      axios.get(`${API_BASE}/admin/users`, { headers }),
      axios.get(`${API_BASE}/courses`),
      axios.get(`${API_BASE}/blog/admin/all`, { headers }),
      axios.get(`${API_BASE}/about`),
      axios.get(`${API_BASE}/subscriptions`),
      axios.get(`${API_BASE}/testimonials`),
      axios.get(`${API_BASE}/interviews`)
    ])
      .then(([statsRes, usersRes, coursesRes, blogRes, aboutRes, subRes, testRes, intRes]) => {
        setStats(statsRes.data);
        setUsersList(usersRes.data);
        setCoursesList(coursesRes.data);
        setBlogPostsList(blogRes.data);
        setSubscriptionsList(subRes.data);
        setTestimonialsList(testRes.data);
        setInterviewsList(intRes.data);
        if (aboutRes.data) {
          setAboutTitle(aboutRes.data.title || 'About Gordon IT Academy');
          setAboutSubTitle(aboutRes.data.subTitle || 'About');
          setAboutParagraphs(aboutRes.data.paragraphs || ['', '', '']);
          setAboutStats(aboutRes.data.stats || [
            { icon: 'Award', label: '', sub: '' },
            { icon: 'Users', label: '', sub: '' },
            { icon: 'Target', label: '', sub: '' },
            { icon: 'BookOpen', label: '', sub: '' }
          ]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch administrative data');
        setLoading(false);
      });
  };

  const handleSaveTestimonial = (e) => {
    e.preventDefault();
    const payload = {
      name: testName,
      role: testRole,
      company: testCompany,
      rating: parseInt(testRating),
      text: testText
    };

    const request = editTestimonialId
      ? axios.put(`${API_BASE}/testimonials/${editTestimonialId}`, payload, { headers })
      : axios.post(`${API_BASE}/testimonials`, payload, { headers });

    request
      .then(() => {
        alert(editTestimonialId ? 'Testimonial updated successfully!' : 'Testimonial added successfully!');
        setIsTestimonialModalOpen(false);
        resetTestimonialForm();
        loadData();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error saving testimonial'));
  };

  const handleDeleteTestimonial = (reviewId) => {
    if (reviewId.startsWith('default-')) {
      alert('Cannot delete default system templates!');
      return;
    }
    if (window.confirm('Are you sure you want to delete this student review?')) {
      axios.delete(`${API_BASE}/testimonials/${reviewId}`, { headers })
        .then(() => {
          alert('Testimonial deleted successfully!');
          loadData();
        })
        .catch(err => alert('Failed to delete testimonial'));
    }
  };

  const openTestimonialModal = (review = null) => {
    if (review) {
      if (review.id && review.id.startsWith('default-')) {
        alert('Default reviews are system templates and cannot be edited. Please create a new custom review instead.');
        return;
      }
      setEditTestimonialId(review.id);
      setTestName(review.name);
      setTestRole(review.role);
      setTestCompany(review.company);
      setTestRating(review.rating);
      setTestText(review.text);
    } else {
      resetTestimonialForm();
    }
    setIsTestimonialModalOpen(true);
  };

  const resetTestimonialForm = () => {
    setEditTestimonialId(null);
    setTestName('');
    setTestRole('');
    setTestCompany('');
    setTestRating(5);
    setTestText('');
  };

  const handleSaveInterview = (e) => {
    e.preventDefault();
    const payload = {
      topic: interviewTopic,
      questionText: interviewQuestionText,
      correctAnswer: interviewCorrectAnswer
    };

    const request = editInterviewId
      ? axios.put(`${API_BASE}/interviews/${editInterviewId}`, payload, { headers })
      : axios.post(`${API_BASE}/interviews`, payload, { headers });

    request
      .then(() => {
        alert(editInterviewId ? 'Interview Question updated!' : 'Interview Question added!');
        setIsInterviewModalOpen(false);
        resetInterviewForm();
        loadData();
      })
      .catch(err => alert('Failed to save interview question'));
  };

  const handleDeleteInterview = (qId) => {
    if (window.confirm('Are you sure you want to delete this interview question?')) {
      axios.delete(`${API_BASE}/interviews/${qId}`, { headers })
        .then(() => {
          alert('Interview Question deleted successfully!');
          loadData();
        })
        .catch(err => alert('Failed to delete question'));
    }
  };

  const openInterviewModal = (q = null) => {
    if (q) {
      setEditInterviewId(q.id);
      setInterviewTopic(q.topic);
      setInterviewQuestionText(q.questionText);
      setInterviewCorrectAnswer(q.correctAnswer);
    } else {
      resetInterviewForm();
    }
    setIsInterviewModalOpen(true);
  };

  const resetInterviewForm = () => {
    setEditInterviewId(null);
    setInterviewTopic('');
    setInterviewQuestionText('');
    setInterviewCorrectAnswer('');
  };

  const handleSaveSubscriptionPlan = (e) => {
    e.preventDefault();
    const payload = {
      name: subName,
      planType: subPlanType,
      price: parseFloat(subPrice),
      billingPeriod: subBillingPeriod,
      description: subDescription,
      features: subFeatures.filter(f => f.trim() !== ''),
      badge: subBadge || null,
      cta: subCta,
      featured: subFeatured
    };

    const request = editSubscriptionId
      ? axios.put(`${API_BASE}/subscriptions/${editSubscriptionId}`, payload, { headers })
      : axios.post(`${API_BASE}/subscriptions`, payload, { headers });

    request
      .then(() => {
        alert(editSubscriptionId ? 'Subscription plan updated successfully!' : 'Subscription plan created successfully!');
        setIsSubscriptionModalOpen(false);
        resetSubscriptionForm();
        loadData();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error saving subscription plan'));
  };

  const handleDeleteSubscriptionPlan = (planId) => {
    if (planId.startsWith('default-')) {
      alert('Cannot delete default system templates!');
      return;
    }
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      axios.delete(`${API_BASE}/subscriptions/${planId}`, { headers })
        .then(() => {
          alert('Subscription plan deleted successfully!');
          loadData();
        })
        .catch(err => alert('Failed to delete subscription plan'));
    }
  };

  const openSubscriptionModal = (plan = null) => {
    if (plan) {
      if (plan.id && plan.id.startsWith('default-')) {
        alert('Default plans are system templates and cannot be edited. Please create a new custom plan instead.');
        return;
      }
      setEditSubscriptionId(plan.id);
      setSubName(plan.name);
      setSubPlanType(plan.planType);
      setSubPrice(plan.price);
      setSubBillingPeriod(plan.billingPeriod);
      setSubDescription(plan.description);
      setSubFeatures(plan.features || ['', '', '', '']);
      setSubBadge(plan.badge || '');
      setSubCta(plan.cta);
      setSubFeatured(plan.featured);
    } else {
      resetSubscriptionForm();
    }
    setIsSubscriptionModalOpen(true);
  };

  const resetSubscriptionForm = () => {
    setEditSubscriptionId(null);
    setSubName('');
    setSubPlanType('free');
    setSubPrice(0.0);
    setSubBillingPeriod('forever');
    setSubDescription('');
    setSubFeatures(['', '', '', '']);
    setSubBadge('');
    setSubCta('Start Free');
    setSubFeatured(false);
  };

  const handleSaveAboutContent = (e) => {
    e.preventDefault();
    const payload = {
      title: aboutTitle,
      subTitle: aboutSubTitle,
      paragraphs: aboutParagraphs.filter(p => p.trim() !== ''),
      stats: aboutStats
    };

    axios.post(`${API_BASE}/about`, payload, { headers })
      .then(() => {
        alert('About section updated successfully!');
        loadData();
      })
      .catch(err => alert(err.response?.data?.detail || 'Failed to update about section'));
  };

  const handleParagraphChange = (index, value) => {
    const updated = [...aboutParagraphs];
    updated[index] = value;
    setAboutParagraphs(updated);
  };

  const handleStatChange = (index, field, value) => {
    const updated = [...aboutStats];
    updated[index] = { ...updated[index], [field]: value };
    setAboutStats(updated);
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Blog Post CRUD Actions
  const handleSaveBlogPost = (e) => {
    e.preventDefault();
    const payload = {
      title: blogTitle,
      excerpt: blogExcerpt,
      content: blogContent,
      category: blogCategory,
      coverImage: blogCoverImage || null,
      readTime: blogReadTime || '5 min read',
      published: blogPublished
    };

    const request = editBlogPostId
      ? axios.put(`${API_BASE}/blog/${editBlogPostId}`, payload, { headers })
      : axios.post(`${API_BASE}/blog`, payload, { headers });

    request
      .then(() => {
        alert(editBlogPostId ? 'Blog post updated successfully!' : 'Blog post created successfully!');
        setIsBlogModalOpen(false);
        resetBlogForm();
        loadData();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error saving blog post'));
  };

  const handleDeleteBlogPost = (postId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      axios.delete(`${API_BASE}/blog/${postId}`, { headers })
        .then(() => {
          alert('Blog post deleted successfully!');
          loadData();
        })
        .catch(err => alert('Failed to delete blog post'));
    }
  };

  const handleTogglePublishBlogPost = (postId) => {
    axios.patch(`${API_BASE}/blog/${postId}/publish`, {}, { headers })
      .then((res) => {
        alert(`Blog post is now a ${res.data.status}!`);
        loadData();
      })
      .catch(err => alert('Failed to toggle publish status'));
  };

  const openBlogModal = (post = null) => {
    if (post) {
      setEditBlogPostId(post.id);
      setBlogTitle(post.title);
      setBlogExcerpt(post.excerpt);
      setBlogContent(post.content);
      setBlogCategory(post.category);
      setBlogCoverImage(post.coverImage || '');
      setBlogReadTime(post.readTime || '5 min read');
      setBlogPublished(post.published);
    } else {
      resetBlogForm();
    }
    setIsBlogModalOpen(true);
  };

  const resetBlogForm = () => {
    setEditBlogPostId(null);
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
    setBlogCategory('CCNA');
    setBlogCoverImage('');
    setBlogReadTime('5 min read');
    setBlogPublished(false);
  };

  // Course CRUD
  const handleSaveCourse = (e) => {
    e.preventDefault();
    const payload = {
      title: courseTitle,
      description: courseDesc,
      thumbnailUrl: courseThumb,
      difficulty: courseDiff
    };

    const request = editCourseId
      ? axios.put(`${API_BASE}/courses/${editCourseId}`, payload, { headers })
      : axios.post(`${API_BASE}/courses`, payload, { headers });

    request
      .then(() => {
        alert(editCourseId ? 'Course updated successfully!' : 'Course created successfully!');
        setIsCourseModalOpen(false);
        resetCourseForm();
        loadData();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error saving course'));
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course and all its lessons? This action is irreversible.')) {
      axios.delete(`${API_BASE}/courses/${courseId}`, { headers })
        .then(() => {
          alert('Course deleted successfully!');
          loadData();
        })
        .catch(err => alert('Failed to delete course'));
    }
  };

  const openCourseModal = (course = null) => {
    if (course) {
      setEditCourseId(course.id);
      setCourseTitle(course.title);
      setCourseDesc(course.description);
      setCourseThumb(course.thumbnailUrl);
      setCourseDiff(course.difficulty);
    } else {
      resetCourseForm();
    }
    setIsCourseModalOpen(true);
  };

  const resetCourseForm = () => {
    setEditCourseId(null);
    setCourseTitle('');
    setCourseDesc('');
    setCourseThumb('');
    setCourseDiff('Beginner');
  };

  // Lesson CRUD
  const handleSaveLesson = (e) => {
    e.preventDefault();
    const payload = {
      title: lessonTitle,
      videoUrl: lessonVideo,
      textContent: lessonText,
      orderIndex: parseInt(lessonOrder)
    };

    const request = editLessonId
      ? axios.put(`${API_BASE}/courses/lessons/${editLessonId}`, payload, { headers })
      : axios.post(`${API_BASE}/courses/${lessonCourseId}/lessons`, payload, { headers });

    request
      .then(() => {
        alert(editLessonId ? 'Lesson updated successfully!' : 'Lesson added successfully!');
        setIsLessonModalOpen(false);
        resetLessonForm();
        loadData();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error saving lesson'));
  };

  const handleDeleteLesson = (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      axios.delete(`${API_BASE}/courses/lessons/${lessonId}`, { headers })
        .then(() => {
          alert('Lesson deleted successfully!');
          loadData();
        })
        .catch(err => alert('Failed to delete lesson'));
    }
  };

  const openLessonModal = (courseId, lesson = null) => {
    setLessonCourseId(courseId);
    if (lesson) {
      setEditLessonId(lesson.id);
      setLessonTitle(lesson.title);
      setLessonVideo(lesson.videoUrl);
      setLessonText(lesson.textContent);
      setLessonOrder(lesson.orderIndex);
    } else {
      resetLessonForm();
    }
    setIsLessonModalOpen(true);
  };

  const resetLessonForm = () => {
    setEditLessonId(null);
    setLessonTitle('');
    setLessonVideo('');
    setLessonText('');
    setLessonOrder(1);
  };

  // Questions Add
  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    const payload = {
      category,
      questionText,
      options,
      correctOption,
      explanation,
      indexNumber: parseInt(indexNumber)
    };

    axios.post(`${API_BASE}/exams/questions`, payload, { headers })
      .then(() => {
        alert("New question added to database successfully!");
        setQuestionText('');
        setOptions(['', '', '', '']);
        setExplanation('');
        setIndexNumber(indexNumber + 1);
        loadData();
      })
      .catch(err => alert(err.response?.data?.detail || 'Failed to add question'));
  };

  const toggleCourseExpand = (courseId) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading administrative controls...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Admin Dashboard</h1>
          <p className="text-slate-400">Manage courses, monitor enrollments, and view analytical performance metrics.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs font-semibold text-slate-300">
          <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
          <span>Live Analytics Active</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-8 text-sm font-bold text-slate-400">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 transition relative ${activeTab === 'overview' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          Overview & Charts
          {activeTab === 'overview' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-4 transition relative ${activeTab === 'courses' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          Courses & Lessons CRUD
          {activeTab === 'courses' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 transition relative ${activeTab === 'users' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          Users & Enrollments
          {activeTab === 'users' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-4 transition relative ${activeTab === 'questions' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          Create Quiz Question
          {activeTab === 'questions' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`pb-4 transition relative ${activeTab === 'blog' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          Blog Posts
          {activeTab === 'blog' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-4 transition relative ${activeTab === 'about' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          About Settings
          {activeTab === 'about' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-4 transition relative ${activeTab === 'subscriptions' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          Subscription Plans
          {activeTab === 'subscriptions' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`pb-4 transition relative ${activeTab === 'testimonials' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          Testimonials
          {activeTab === 'testimonials' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`pb-4 transition relative ${activeTab === 'interviews' ? 'text-white font-extrabold' : 'hover:text-slate-200'}`}
        >
          Interview Prep
          {activeTab === 'interviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
        </button>
      </div>

      {/* 1. OVERVIEW & CHARTS TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl space-y-2">
              <p className="text-xs font-bold text-slate-500 tracking-wider">TOTAL REVENUE</p>
              <h3 className="text-3xl font-black text-emerald-400">${stats.total_revenue}</h3>
              <p className="text-[10px] text-slate-500">Includes monthly/yearly subs</p>
            </div>
            <div className="glass-panel p-6 rounded-3xl space-y-2">
              <p className="text-xs font-bold text-slate-500 tracking-wider">TOTAL USERS</p>
              <h3 className="text-3xl font-black text-white">{stats.total_users}</h3>
              <p className="text-[10px] text-slate-500">Standard & upgraded profiles</p>
            </div>
            <div className="glass-panel p-6 rounded-3xl space-y-2">
              <p className="text-xs font-bold text-slate-500 tracking-wider">COURSES HOSTED</p>
              <h3 className="text-3xl font-black text-blue-400">{stats.total_courses}</h3>
              <p className="text-[10px] text-slate-500">{stats.total_lessons} active video lessons</p>
            </div>
            <div className="glass-panel p-6 rounded-3xl space-y-2">
              <p className="text-xs font-bold text-slate-500 tracking-wider">EXAM QUESTIONS</p>
              <h3 className="text-3xl font-black text-purple-400">{stats.total_questions}</h3>
              <p className="text-[10px] text-slate-500">Practice questions loaded</p>
            </div>
          </div>

          {/* Filtering Header for charts */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <h2 className="text-lg font-bold">Trend Analytics</h2>
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs font-semibold rounded-xl px-3 py-2 text-slate-300 outline-none"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>

          {/* SVG Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Revenue Trend - SVG Line Chart */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Revenue Growth Trend</h4>
              <div className="h-64 flex items-end justify-center pt-4 relative">
                {Object.keys(stats.revenue_growth).length > 0 ? (
                  (() => {
                    const months = Object.keys(stats.revenue_growth);
                    const revenues = Object.values(stats.revenue_growth);
                    const maxRevenue = Math.max(...revenues, 100);
                    const xStep = 340 / (months.length - 1 || 1);

                    // Generate points
                    const points = revenues.map((r, i) => ({
                      x: 80 + i * xStep,
                      y: 180 - (r / maxRevenue) * 120
                    }));

                    const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
                    const areaD = pathD + ` L ${points[points.length - 1].x},180 L 80,180 Z`;

                    return (
                      <svg className="w-full h-full" viewBox="0 0 450 210">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid Lines */}
                        <line x1="80" y1="180" x2="420" y2="180" stroke="#1e293b" strokeWidth="1" />
                        <line x1="80" y1="120" x2="420" y2="120" stroke="#0f172a" strokeWidth="1" />
                        <line x1="80" y1="60" x2="420" y2="60" stroke="#0f172a" strokeWidth="1" />

                        {/* Area Fill */}
                        <path d={areaD} fill="url(#chartGradient)" />
                        {/* Line */}
                        <path d={pathD} fill="none" stroke="#10B981" strokeWidth="3" />

                        {/* Points */}
                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="5" fill="#10B981" stroke="#ffffff" strokeWidth="1.5" />
                            <text x={p.x} y={p.y - 12} fontSize="9" fontWeight="bold" fill="#cbd5e1" textAnchor="middle">${revenues[idx]}</text>
                            <text x={p.x} y="195" fontSize="8" fontWeight="bold" fill="#64748b" textAnchor="middle">{months[idx]}</text>
                          </g>
                        ))}
                      </svg>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-500">No payment data loaded</p>
                )}
              </div>
            </div>

            {/* User Growth - SVG Bar Chart */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cumulative User Growth</h4>
              <div className="h-64 flex items-end justify-center pt-4 relative">
                {Object.keys(stats.user_growth).length > 0 ? (
                  (() => {
                    const months = Object.keys(stats.user_growth);
                    const usersVal = Object.values(stats.user_growth);
                    const maxUsers = Math.max(...usersVal, 10);
                    const xStep = 340 / months.length;

                    return (
                      <svg className="w-full h-full" viewBox="0 0 450 210">
                        {/* Grid Lines */}
                        <line x1="80" y1="180" x2="420" y2="180" stroke="#1e293b" strokeWidth="1" />
                        <line x1="80" y1="120" x2="420" y2="120" stroke="#0f172a" strokeWidth="1" />
                        <line x1="80" y1="60" x2="420" y2="60" stroke="#0f172a" strokeWidth="1" />

                        {/* Bars */}
                        {usersVal.map((val, idx) => {
                          const barWidth = 24;
                          const x = 90 + idx * xStep;
                          const height = (val / maxUsers) * 120;
                          const y = 180 - height;

                          return (
                            <g key={idx}>
                              <rect
                                x={x - barWidth / 2}
                                y={y}
                                width={barWidth}
                                height={height}
                                fill="#3B82F6"
                                rx="3"
                                className="transition hover:fill-blue-400"
                              />
                              <text x={x} y={y - 8} fontSize="9" fontWeight="bold" fill="#cbd5e1" textAnchor="middle">{val}</text>
                              <text x={x} y="195" fontSize="8" fontWeight="bold" fill="#64748b" textAnchor="middle">{months[idx]}</text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-500">No user signup logs found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. COURSES & LESSONS CRUD TAB */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Course Library</h2>
            <button
              onClick={() => openCourseModal()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Course</span>
            </button>
          </div>

          {/* Courses CRUD Table */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800 text-xs font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Thumbnail & Course Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Lessons</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {coursesList.map((course) => (
                  <React.Fragment key={course.id}>
                    <tr className="hover:bg-slate-900/20 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img src={course.thumbnailUrl} alt="" className="h-10 w-16 object-cover rounded-lg border border-slate-800" />
                          <div>
                            <span className="font-bold text-slate-100 block">{course.title}</span>
                            <span className="text-xs text-slate-500 truncate max-w-sm block">{course.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${course.difficulty === 'Advanced'
                            ? 'bg-red-950/20 text-red-400 border-red-500/20'
                            : course.difficulty === 'Intermediate'
                              ? 'bg-amber-950/20 text-amber-400 border-amber-500/20'
                              : 'bg-green-950/20 text-green-400 border-green-500/20'
                          }`}>
                          {course.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleCourseExpand(course.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-bold transition flex items-center space-x-1"
                        >
                          <span>{course.lessons?.length || 0} Lessons</span>
                          <span className="text-[10px]">{expandedCourses[course.id] ? '▲' : '▼'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openCourseModal(course)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-800 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* Expanded lessons section */}
                    {expandedCourses[course.id] && (
                      <tr>
                        <td colSpan="4" className="bg-slate-900/30 px-8 py-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <h5 className="text-xs font-bold text-slate-400 tracking-wider">LESSON PLAYLIST FOR {course.title.toUpperCase()}</h5>
                              <button
                                onClick={() => openLessonModal(course.id)}
                                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold transition flex items-center space-x-1"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add Lesson</span>
                              </button>
                            </div>

                            {course.lessons && course.lessons.length > 0 ? (
                              <div className="space-y-2">
                                {course.lessons.map((lesson) => (
                                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-900 hover:border-slate-800 transition">
                                    <div className="space-y-0.5">
                                      <span className="text-xs font-bold text-slate-300">{lesson.orderIndex}. {lesson.title}</span>
                                      <span className="text-[10px] text-slate-500 block truncate max-w-lg">{lesson.videoUrl}</span>
                                    </div>
                                    <div className="space-x-2">
                                      <button
                                        onClick={() => openLessonModal(course.id, lesson)}
                                        className="text-[10px] text-slate-400 hover:text-white transition"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLesson(lesson.id)}
                                        className="text-[10px] text-red-400 hover:text-red-300 transition"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic py-2">No lessons added under this course yet.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2.1 COURSE MODAL / FORM */}
          {isCourseModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <form onSubmit={handleSaveCourse} className="glass-panel w-full max-w-lg rounded-3xl p-8 space-y-6 relative animate-fade-in">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-6 w-6" />
                </button>
                <h3 className="text-xl font-bold border-b border-slate-900 pb-3">{editCourseId ? 'Edit Course Details' : 'Create Course'}</h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Course Title</label>
                    <input
                      type="text"
                      required
                      value={courseTitle}
                      onChange={e => setCourseTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Description</label>
                    <textarea
                      rows="3"
                      required
                      value={courseDesc}
                      onChange={e => setCourseDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Thumbnail URL</label>
                    <input
                      type="text"
                      required
                      value={courseThumb}
                      onChange={e => setCourseThumb(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Difficulty Level</label>
                    <select
                      value={courseDiff}
                      onChange={e => setCourseDiff(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-2">
                  <button
                    type="submit"
                    className="flex-grow py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-sm"
                  >
                    Save Course
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl font-semibold transition text-sm border border-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2.2 LESSON MODAL / FORM */}
          {isLessonModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <form onSubmit={handleSaveLesson} className="glass-panel w-full max-w-lg rounded-3xl p-8 space-y-6 relative animate-fade-in">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-6 w-6" />
                </button>
                <h3 className="text-xl font-bold border-b border-slate-900 pb-3">{editLessonId ? 'Edit Lesson Parameters' : 'Add Lesson to Course'}</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Lesson Title</label>
                      <input
                        type="text"
                        required
                        value={lessonTitle}
                        onChange={e => setLessonTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Order Index</label>
                      <input
                        type="number"
                        required
                        value={lessonOrder}
                        onChange={e => setLessonOrder(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Cloudinary / Video Stream URL</label>
                    <input
                      type="text"
                      required
                      value={lessonVideo}
                      onChange={e => setLessonVideo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Lesson Text / Study Guide</label>
                    <textarea
                      rows="4"
                      required
                      value={lessonText}
                      onChange={e => setLessonText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex space-x-4 pt-2">
                  <button
                    type="submit"
                    className="flex-grow py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-sm"
                  >
                    Save Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLessonModalOpen(false)}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl font-semibold transition text-sm border border-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3. USERS & ENROLLMENTS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Enrollments Rates Summary */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active Course Enrollments</h4>
            <div className="grid sm:grid-cols-3 gap-6">
              {stats && stats.enrollments.map((course) => (
                <div key={course.id} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 block font-semibold truncate max-w-[150px]">{course.title}</span>
                    <span className="text-2xl font-black text-white">{course.enrollment_count}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Enrolled</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Progression list */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800 text-xs font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">User Profile Email</th>
                  <th className="px-6 py-4">Membership Level</th>
                  <th className="px-6 py-4">Lessons Completed</th>
                  <th className="px-6 py-4">Exams Taken</th>
                  <th className="px-6 py-4">Total Revenue ($)</th>
                  <th className="px-6 py-4 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {usersList.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-900/20 transition">
                    <td className="px-6 py-4 font-bold text-slate-100">{userItem.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${userItem.membership_level === 'premium'
                          ? 'bg-indigo-950/20 text-indigo-400 border-indigo-500/20'
                          : 'bg-slate-800/40 text-slate-400 border-slate-700/20'
                        }`}>
                        {userItem.membership_level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{userItem.completed_lessons_count}</td>
                    <td className="px-6 py-4 font-semibold">{userItem.exam_attempts_count}</td>
                    <td className="px-6 py-4 font-black text-emerald-400">${userItem.total_spent}</td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500">
                      {new Date(userItem.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CREATE QUIZ QUESTION TAB */}
      {activeTab === 'questions' && (
        <form onSubmit={handleAddQuestion} className="glass-panel p-8 rounded-3xl space-y-6 max-w-2xl mx-auto animate-fade-in">
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
                <option>Networking</option>
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
              placeholder="Input CCNA/CCNP certification practice question..."
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
              placeholder="Why is this option correct? Write explanation for CCNA candidates..."
            ></textarea>
          </div>

          <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition">
            Add Question to Bank
          </button>
        </form>
      )}

      {/* 5. BLOG POSTS MANAGEMENT TAB */}
      {activeTab === 'blog' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Blog Posts Management</h2>
            <button
              onClick={() => openBlogModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Blog Post</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800 text-xs font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Read Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {blogPostsList.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-900/20 transition">
                    <td className="px-6 py-4 font-bold text-slate-100">{post.title}</td>
                    <td className="px-6 py-4">
                      <span className="badge bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">{post.category}</span>
                    </td>
                    <td className="px-6 py-4 text-xs">{post.readTime}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${post.published
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-950/20 text-amber-400 border-amber-500/20'
                        }`}>
                        {post.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleTogglePublishBlogPost(post.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${post.published
                            ? 'bg-amber-950/20 text-amber-400 border-amber-500/20 hover:bg-amber-900/20'
                            : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/20'
                          }`}
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => openBlogModal(post)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition border border-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlogPost(post.id)}
                        className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/20 text-red-400 rounded-lg text-xs font-bold transition border border-red-500/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {blogPostsList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500">No blog posts found. Create your first post!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog Modal */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsBlogModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold border-b border-slate-900 pb-3">
              {editBlogPostId ? 'Edit Blog Post' : 'Create Blog Post'}
            </h2>

            <form onSubmit={handleSaveBlogPost} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Post Title</label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                  placeholder="e.g. How to subnet like a pro in CCNA exam"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    value={blogCategory}
                    onChange={e => setBlogCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                  >
                    <option>CCNA</option>
                    <option>CCNP</option>
                    <option>Cybersecurity</option>
                    <option>Automation</option>
                    <option>Career</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Read Time</label>
                  <input
                    type="text"
                    required
                    value={blogReadTime}
                    onChange={e => setBlogReadTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    placeholder="e.g. 5 min read"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Cover Image URL</label>
                <input
                  type="text"
                  value={blogCoverImage}
                  onChange={e => setBlogCoverImage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Short Excerpt (Summary)</label>
                <textarea
                  rows="2"
                  required
                  value={blogExcerpt}
                  onChange={e => setBlogExcerpt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
                  placeholder="Write a quick summary of the post for lists..."
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Post Content (Markdown supported)</label>
                <textarea
                  rows="8"
                  required
                  value={blogContent}
                  onChange={e => setBlogContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm font-mono"
                  placeholder="# Welcome to Cisco CCNA Subnetting guide..."
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="blogPublished"
                  checked={blogPublished}
                  onChange={e => setBlogPublished(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-blue-500 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="blogPublished" className="text-sm font-semibold text-slate-300">Publish immediately</label>
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-sm"
                >
                  Save Post
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl font-semibold transition text-sm border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ABOUT PAGE SETTINGS TAB */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveAboutContent} className="glass-panel p-8 rounded-3xl space-y-6 max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-xl font-bold border-b border-slate-900 pb-3">About Page Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Section Subtitle Badge</label>
              <input
                type="text"
                required
                value={aboutSubTitle}
                onChange={e => setAboutSubTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                placeholder="e.g. About"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Section Heading Title</label>
              <input
                type="text"
                required
                value={aboutTitle}
                onChange={e => setAboutTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                placeholder="e.g. About Gordon IT Academy"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-900 pb-2">Description Paragraphs</h3>
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Paragraph {idx + 1}</label>
                <textarea
                  rows="3"
                  value={aboutParagraphs[idx] || ''}
                  onChange={e => handleParagraphChange(idx, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
                  placeholder={`Write description paragraph {idx + 1}...`}
                ></textarea>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-900 pb-2">Statistics & Highlights</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {aboutStats.map((stat, idx) => (
                <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-blue-400">Card #{idx + 1}</span>
                    <select
                      value={stat.icon || 'Award'}
                      onChange={e => handleStatChange(idx, 'icon', e.target.value)}
                      className="bg-slate-900 border border-slate-850 focus:border-blue-500 text-xs font-semibold rounded-lg px-2 py-1 text-slate-300 outline-none"
                    >
                      <option>Award</option>
                      <option>Users</option>
                      <option>Target</option>
                      <option>BookOpen</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={stat.label || ''}
                      onChange={e => handleStatChange(idx, 'label', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white outline-none text-xs"
                      placeholder="Title (e.g. Cisco CCIE Certified)"
                    />
                    <input
                      type="text"
                      required
                      value={stat.sub || ''}
                      onChange={e => handleStatChange(idx, 'sub', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-300 outline-none text-xs"
                      placeholder="Subtitle (e.g. Enterprise Infrastructure)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-sm">
            Save About Settings
          </button>
        </form>
      )}

      {/* 7. SUBSCRIPTIONS MANAGEMENT TAB */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Subscription Plans</h2>
            <button
              onClick={() => openSubscriptionModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Pricing Plan</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800 text-xs font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Billing Period</th>
                  <th className="px-6 py-4">Badge</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {subscriptionsList.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-900/20 transition">
                    <td className="px-6 py-4 font-bold text-slate-100">
                      {plan.name}
                      {plan.id.startsWith('default-') && (
                        <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">SYSTEM</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-blue">{plan.planType}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-white">${plan.price}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{plan.billingPeriod}</td>
                    <td className="px-6 py-4 text-xs">
                      {plan.badge ? (
                        <span className="badge badge-green">{plan.badge}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${plan.featured
                          ? 'bg-blue-950/20 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800/40 text-slate-500 border border-slate-700/20'
                        }`}>
                        {plan.featured ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openSubscriptionModal(plan)}
                        disabled={plan.id.startsWith('default-')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${plan.id.startsWith('default-')
                            ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubscriptionPlan(plan.id)}
                        disabled={plan.id.startsWith('default-')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${plan.id.startsWith('default-')
                            ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-red-950/20 hover:bg-red-900/20 text-red-400 border-red-500/20'
                          }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscription Plan Modal */}
      {isSubscriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsSubscriptionModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold border-b border-slate-900 pb-3">
              {editSubscriptionId ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h2>

            <form onSubmit={handleSaveSubscriptionPlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={e => setSubName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    placeholder="e.g. Premium Pro Monthly"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Plan Type</label>
                  <select
                    value={subPlanType}
                    onChange={e => setSubPlanType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                  >
                    <option value="free">free</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={subPrice}
                    onChange={e => setSubPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Billing Period</label>
                  <select
                    value={subBillingPeriod}
                    onChange={e => setSubBillingPeriod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                  >
                    <option value="forever">forever</option>
                    <option value="month">month</option>
                    <option value="year">year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Badge Label (Optional)</label>
                  <input
                    type="text"
                    value={subBadge}
                    onChange={e => setSubBadge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    placeholder="e.g. Most Popular"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">CTA Button Text</label>
                  <input
                    type="text"
                    required
                    value={subCta}
                    onChange={e => setSubCta(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    placeholder="e.g. Upgrade Now"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Plan Description</label>
                <textarea
                  rows="2"
                  required
                  value={subDescription}
                  onChange={e => setSubDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
                  placeholder="Short description of this pricing plan..."
                ></textarea>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400">Features List (Up to 4)</label>
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={subFeatures[idx] || ''}
                    onChange={e => {
                      const updated = [...subFeatures];
                      updated[idx] = e.target.value;
                      setSubFeatures(updated);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-slate-100 outline-none text-sm"
                    placeholder={`Feature highlight #${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="subFeatured"
                  checked={subFeatured}
                  onChange={e => setSubFeatured(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-blue-500 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="subFeatured" className="text-sm font-semibold text-slate-300">Feature this plan (Glow border & primary CTA style)</label>
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-sm"
                >
                  Save Subscription Plan
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl font-semibold transition text-sm border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. TESTIMONIALS MANAGEMENT TAB */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Student Success Reviews</h2>
            <button
              onClick={() => openTestimonialModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Review</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800 text-xs font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Role / Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review Text</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {testimonialsList.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-900/20 transition">
                    <td className="px-6 py-4 font-bold text-slate-100">
                      {review.name}
                      {review.id.startsWith('default-') && (
                        <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">SYSTEM</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">{review.role}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{review.company}</td>
                    <td className="px-6 py-4 font-semibold text-yellow-400">{'★'.repeat(review.rating)}</td>
                    <td className="px-6 py-4 text-xs truncate max-w-[200px] text-slate-400">{review.text}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openTestimonialModal(review)}
                        disabled={review.id.startsWith('default-')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${review.id.startsWith('default-')
                            ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(review.id)}
                        disabled={review.id.startsWith('default-')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${review.id.startsWith('default-')
                            ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-red-950/20 hover:bg-red-900/20 text-red-400 border-red-500/20'
                          }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsTestimonialModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold border-b border-slate-900 pb-3">
              {editTestimonialId ? 'Edit Success Review' : 'Add Student Success Review'}
            </h2>

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Student Name</label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={e => setTestName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    placeholder="e.g. Alex van den Berg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Role / Designation</label>
                  <input
                    type="text"
                    required
                    value={testRole}
                    onChange={e => setTestRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    placeholder="e.g. Network Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Company</label>
                  <input
                    type="text"
                    required
                    value={testCompany}
                    onChange={e => setTestCompany(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                    placeholder="e.g. KPN Netherlands"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Rating (1 to 5 Stars)</label>
                  <select
                    value={testRating}
                    onChange={e => setTestRating(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★ (4 Stars)</option>
                    <option value="3">★★★ (3 Stars)</option>
                    <option value="2">★★ (2 Stars)</option>
                    <option value="1">★ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Review Text / Success Story</label>
                <textarea
                  rows="4"
                  required
                  value={testText}
                  onChange={e => setTestText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
                  placeholder="Passed my CCNA on the first attempt..."
                ></textarea>
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-sm"
                >
                  Save Testimonial
                </button>
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl font-semibold transition text-sm border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. INTERVIEWS TAB */}
      {activeTab === 'interviews' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Interview Prep Q&A</h2>
              <p className="text-slate-400 text-sm mt-1">Manage mock interview and exam questions for students.</p>
            </div>
            <button
              onClick={() => openInterviewModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800 text-xs font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4 w-1/3">Question</th>
                  <th className="px-6 py-4 w-1/3">Correct Answer</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {interviewsList.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-900/20 transition">
                    <td className="px-6 py-4 font-bold text-slate-100">{q.topic}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{q.questionText}</td>
                    <td className="px-6 py-4 text-xs text-green-400">{q.correctAnswer}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openInterviewModal(q)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInterview(q.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition border bg-red-950/20 hover:bg-red-900/20 text-red-400 border-red-500/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {interviewsList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No interview questions found. Click "Add Question" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interview Question Modal */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsInterviewModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold border-b border-slate-900 pb-3">
              {editInterviewId ? 'Edit Interview Question' : 'Add Interview Question'}
            </h2>

            <form onSubmit={handleSaveInterview} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Topic Category</label>
                <input
                  type="text"
                  required
                  value={interviewTopic}
                  onChange={e => setInterviewTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm"
                  placeholder="e.g. CCNA, CCNP, BGP"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Question Text</label>
                <textarea
                  rows="3"
                  required
                  value={interviewQuestionText}
                  onChange={e => setInterviewQuestionText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
                  placeholder="What is the purpose of OSPF?"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Correct Answer</label>
                <textarea
                  rows="4"
                  required
                  value={interviewCorrectAnswer}
                  onChange={e => setInterviewCorrectAnswer(e.target.value)}
                  className="w-full bg-green-950/30 border border-green-800 focus:border-green-500 rounded-xl px-4 py-3 text-slate-100 outline-none text-sm resize-none"
                  placeholder="OSPF is a routing protocol..."
                ></textarea>
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-sm"
                >
                  Save Question
                </button>
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl font-semibold transition text-sm border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
