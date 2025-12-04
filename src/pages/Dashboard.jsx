import React from 'react'
import Sidebar from '../components/core/dashboard/Sidebar'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Dashboard = () => {
  const location = useLocation();
  const [currentActive, setcurrentActive] = useState("my-profile");

  useEffect(() => {
    // Extract the current route from URL
    const pathSegments = location.pathname.split('/').filter(Boolean);
    // pathSegments will be ['dashboard', 'my-profile'] or ['dashboard', 'projects'], etc.
    // We want the second segment (index 1)
    if (pathSegments.length >= 2) {
      setcurrentActive(pathSegments[1]);
    } else if (pathSegments.length === 1 && pathSegments[0] === 'dashboard') {
      // If only 'dashboard' is in path, default to my-profile
      setcurrentActive('my-profile');
    }
  }, [location.pathname]);
  return (
    <div className='w-screen min-h-[calc(100vh-80px)] bg-linear-to-br from-slate-50 to-slate-100 flex'>
      <Sidebar currentActive={currentActive} setcurrentActive={setcurrentActive} />
      <div className='w-[calc(100vw-300px)] min-h-[calc(100vh-80px)]'>
        <Outlet/>
      </div>
    </div>
  )
}

export default Dashboard