import {  useNavigate } from 'react-router-dom'
import React from 'react'
import { useState } from 'react';
import {  
  Home, 
  FolderKanban, 
  CheckSquare,  
  Users,
  LogOut 
} from 'lucide-react';

const Sidebar = ({currentActive, setcurrentActive}) => {
  const navigate = useNavigate();
  const handleNavigation = (route) => {
    setcurrentActive(route);
    navigate(`/dashboard/${route}`);
  };

  return (
    <div className='w-[300px] min-h-[calc(100vh-80px)] h-full bg-white border-r-2 border-[#988686]'>
      <div className={`p-4 flex gap-2 text-md font-semibold   py-4 border-b cursor-pointer ${currentActive==="my-profile"? "bg-linear-to-br from-slate-50 to-slate-100 border-b-4 ":"hover:bg-gray-300"}  `} onClick={()=>handleNavigation("my-profile")}><Home className='text-gray-700'/>Profile</div>
      <div className={`p-4 flex gap-2 text-md font-semibold   py-4 border-b cursor-pointer ${currentActive==="projects"? "bg-linear-to-br from-slate-50 to-slate-100 border-b-4":"hover:bg-gray-300"}  `} onClick={()=>handleNavigation("projects")}> <FolderKanban className='text-gray-700'/>Projects</div>
      <div className={`p-4 flex gap-2 text-md font-semibold   py-4 border-b cursor-pointer ${currentActive==="tasks"? "bg-linear-to-br from-slate-50 to-slate-100 border-b-4":"hover:bg-gray-300"}  `} onClick={()=>handleNavigation("tasks")}><CheckSquare className='text-gray-700'/>Tasks</div>
      <div className={`p-4 flex gap-2 text-md font-semibold   py-4 border-b cursor-pointer ${currentActive==="active-logs"? "bg-linear-to-br from-slate-50 to-slate-100 border-b-4":"hover:bg-gray-300"}  `} onClick={()=>handleNavigation("active-logs")}><Users className='text-gray-700'/>Active Logs</div>
      <div className={`p-4 flex gap-2 text-md font-semibold   py-4 border-b cursor-pointer ${currentActive==="log-out"? "bg-linear-to-br from-slate-50 to-slate-100 border-b-4":"hover:bg-gray-300"}  `} onClick={()=>handleNavigation("log-out")}><LogOut className='text-gray-700'/>Log Out</div>
    </div>
  )
}

export default Sidebar