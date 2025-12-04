import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, Navigate } from 'react-router-dom'

import { useNavigate } from 'react-router-dom'
import LogIn from './pages/LogIn'
import Register from './pages/Register'
import Home from './pages/Home'
import About from './pages/About'
import ContactUs from './pages/ContactUs'
import ProtectedRoute from './components/core/auth/ProtectedRoute'
import Dashboard from './pages/Dashboard'
// import Loading from './components/Loading'
import ForgotPassword from './pages/ForgotPassword'
import MyProfile from './components/core/dashboard/MyProfile'
import ProjectsView from './pages/ProjectsView'
import Tasks from './components/core/dashboard/Tasks'
import ActiveLogs from './components/core/dashboard/ActiveLogs'
import LogOut from './pages/LogOut'

function App() {
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      const token = JSON.parse(localStorage.getItem("token"))
    }
  }, [])

  return (
    <div className='h-screen w-screen bg-[#d1d0d0] text-black'> 
      <Navbar/>
      {/* <Loading/> */}
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LogIn/>}></Route>
          <Route path="/register" element={<Register/>}></Route>
          <Route path="/forgot-password" element={<ForgotPassword/>}></Route>
          <Route path="/about" element={<About />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="my-profile" replace />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="all-projects" element={<ProjectsView />} />
            <Route path="projects" element={<ProjectsView />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="active-logs" element={<ActiveLogs />} />
            <Route path="log-out" element={<LogOut />} />
            {/* <Route path="my-projects" element={<MyProjects/>} /> */}
          </Route>
      </Routes>
    </div>
  )
}

export default App
