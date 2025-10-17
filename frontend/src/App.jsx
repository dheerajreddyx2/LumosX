import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Assignments from './pages/Assignments';
import Submissions from './pages/Submissions';
import Grades from './pages/Grades';
import Notifications from './pages/Notifications';
import Quiz from './pages/Quiz';
import CreateQuiz from './pages/CreateQuiz';
import Forum from './pages/Forum';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/quiz/create/:courseId" element={<PrivateRoute><CreateQuiz /></PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      
      <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
      <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
      <Route path="/my-courses" element={<PrivateRoute><MyCourses /></PrivateRoute>} />
      <Route path="/assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
      <Route path="/submissions" element={<PrivateRoute><Submissions /></PrivateRoute>} />
      <Route path="/grades" element={<PrivateRoute><Grades /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/quiz/:id" element={<PrivateRoute><Quiz /></PrivateRoute>} />
      <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />
      <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Landing />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


