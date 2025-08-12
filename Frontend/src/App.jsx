import { Navigate, Route, Routes } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";
import { initializeSocket, resetSocket } from './socket/socket';

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PostsPage from "./pages/PostPage";
import MissionsPage from "./pages/MissionPage";
import Homepage from "./pages/Homepage";
import UserMission from "./pages/userMission";
import AdminPanel from "./pages/AdminPanel";
import MissionUpdations from "./pages/MissionUpdations";
import PostUpdations from "./pages/PostUpdations";
import Avengers from "./pages/Avengers";
import AttendanceStart from './components/Attendance/AttendanceStart';
import AttendanceSubmit from './components/Attendance/AttendanceSubmit';
import Attendance from "./pages/Attendance";
import UserReward from './pages/UserReward';
import AdminFeedbackPage from "./pages/Feedbackupdations";
import ChatPage from "./pages/chatPage";
import ProfilePage from "./pages/profilePage";
import Features from "./pages/FirstPage";
import UserProfile from './pages/userProfile';
import AdminReward from "./pages/AdminReward";
import Leaderboard from "./pages/Leaderboard";

// Protected Route Component
const ProtectedRoute = ({ element, role }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) return <Navigate to="/Dashboard" />;
  if (role && user?.role !== role) return <Navigate to="/Dashboard" />;

  return element;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Check authentication on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Initialize socket after login
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      initializeSocket(user.token);
    }
    return () => resetSocket();
  }, [isAuthenticated, user?.token]);

  // Loading state
  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading...
      </div>
    );
  }

  const redirectPath = isAuthenticated
    ? user?.role === 'admin'
      ? '/admin'
      : '/'
    : '/Dashboard';

  return (
    <Routes>
      {/* Default Route */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? user?.role === 'admin'
              ? <Navigate to="/admin" />
              : <Homepage />
            : <Navigate to="/Dashboard" />
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={redirectPath} /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={redirectPath} /> : <Signup />} />
      <Route path="/Dashboard" element={isAuthenticated ? <Navigate to={redirectPath} /> : <Features />} />

      {/* Public Routes */}
      <Route path="/missions" element={<MissionsPage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/avengers" element={<Avengers />} />
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* Protected Routes (User) */}
      <Route path="/your-missions" element={<ProtectedRoute element={<UserMission />} />} />
      <Route path="/your-reward" element={<ProtectedRoute element={<UserReward />} />} />
      <Route path="/attendance-summary" element={<ProtectedRoute element={<AttendanceSubmit userId={user?._id} token={user?.token} />} role="user" />} />
      <Route path="/chats" element={<ProtectedRoute element={<ChatPage />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/userProfile" element={<ProtectedRoute element={<UserProfile />} />} />

      {/* Protected Routes (Admin) */}
      <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} role="admin" />} />
      <Route path="/missionupdations" element={<ProtectedRoute element={<MissionUpdations />} role="admin" />} />
      <Route path="/postupdations" element={<ProtectedRoute element={<PostUpdations />} role="admin" />} />
      <Route path="/attendaceupdations" element={<ProtectedRoute element={<AttendanceStart adminId={user?._id} token={user?.token} />} role="admin" />} />
      <Route path="/feedbacks" element={<ProtectedRoute element={<AdminFeedbackPage />} role="admin" />} />
      <Route path="/admin-reward" element={<ProtectedRoute element={<AdminReward />} role="admin" />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={redirectPath} />} />
    </Routes>
  );
}

export default App;
