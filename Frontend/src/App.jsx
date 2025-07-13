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
function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Define the redirect path based on user role
  const redirectPath = isAuthenticated 
    ? user?.role === 'admin' ? '/admin' : user?.role === 'user' ? '/' : '/signup'
    : '/signup';

  return (
    <>
      <Routes>
        <Route path="/" element={isAuthenticated ? user?.role === 'admin' ? <Navigate to="/admin" /> : <Homepage />: <Navigate to="/signup" />}/>
        <Route path="/login" element={isAuthenticated ? <Navigate to={redirectPath} /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to={redirectPath} /> : <Signup />}/>
        <Route path="/missions" element={isAuthenticated ? <MissionsPage /> : <Navigate to="/signup" />}/>
        <Route path="/posts" element={isAuthenticated ? <PostsPage /> : <Navigate to="/signup" />} />
        <Route path="/your-missions" element={ isAuthenticated ? <UserMission /> : <Navigate to="/signup" />}/>
        <Route path="/admin" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/signup" />}/>
        <Route path="/missionupdations" element={isAuthenticated ? <MissionUpdations /> : <Navigate to="/signup" />}/>
        <Route path="/postupdations" element={isAuthenticated ? <PostUpdations /> : <Navigate to="/signup" /> }/>
        <Route path="/avengers" element={isAuthenticated ? <Avengers /> : <Navigate to="/signup" /> }/>

        
        {/*<Route path="/attendaceupdations" element={isAuthenticated ? <AttendanceUpdations /> : <Navigate to="/signup" />} /> */}
      </Routes>
    </>
  );
}

export default App;