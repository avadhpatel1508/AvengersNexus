import { Navigate, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PostsPage from "./pages/PostPage";
import MissionsPage from "./pages/MissionPage";
import Homepage from "./pages/Homepage";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
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
import { initializeSocket, resetSocket } from './socket/socket';

// ✅ Protected route
const ProtectedRoute = ({ element, role }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) return <Navigate to="/signup" />;
  if (role && user?.role !== role) return <Navigate to="/signup" />;

  return element;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Check auth status on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Initialize socket after login
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      initializeSocket(user.token);
    }
    return () => resetSocket(); // Cleanup
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
    : '/signup';

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated
            ? user?.role === 'admin'
              ? <Navigate to="/admin" />
              : <Homepage />
            : <Navigate to="/signup" />
        }
      />

      <Route path="/login" element={isAuthenticated ? <Navigate to={redirectPath} /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={redirectPath} /> : <Signup />} />

      {/* ✅ Protected Routes */}
      <Route path="/missions" element={<ProtectedRoute element={<MissionsPage />} />} />
      <Route path="/posts" element={<ProtectedRoute element={<PostsPage />} />} />
      <Route path="/your-missions" element={<ProtectedRoute element={<UserMission />} />} />
      <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} role="admin" />} />
      <Route path="/missionupdations" element={<ProtectedRoute element={<MissionUpdations />} />} />
      <Route path="/postupdations" element={<ProtectedRoute element={<PostUpdations />} />} />
      <Route path="/avengers" element={<ProtectedRoute element={<Avengers />} />} />
      <Route path="/your-reward" element={<ProtectedRoute element={<UserReward />} />} />
      
      <Route
        path="/attendaceupdations"
        element={
          <ProtectedRoute
            element={<AttendanceStart adminId={user?._id} token={user?.token} />}
            role="admin"
          />
        }
      />

      <Route
        path="/attendance-summary"
        element={
          <ProtectedRoute
            element={<AttendanceSubmit userId={user?._id} token={user?.token} />}
            role="user"
          />
        }
      />

      <Route path="/attendance" element={<ProtectedRoute element={<Attendance />} />} />
      <Route path="/feedbacks" element={<ProtectedRoute element={<AdminFeedbackPage />} />} />
      <Route path="/chats" element={<ProtectedRoute element={<ChatPage />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={redirectPath} />} />
    </Routes>
  );
}

export default App;
