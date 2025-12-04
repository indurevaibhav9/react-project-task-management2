import React from 'react'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react';
import {useSelector} from 'react-redux';
// import logo from '../assets/';

const Navbar = () => {
  const {token} = useSelector((state)=>state.auth );
  return (
    <div className=' w-full h-20 bg-white border-b-2 border-[#988686] flex items-center justify-between px-10 m-0'>
      <Link to="/" className='text-4xl font-bold flex items-center justify-center gap-1 pt-2 cursor-pointer'><img src='../src/assets/logo.png' width ="240px"></img>
      </Link>
      <div>
        <Link to="/" className='mx-4 text-lg font-medium'>Home</Link>
        <Link to="/about" className='mx-4 text-lg font-medium'>About</Link>
        <Link to="/contact-us" className='mx-4 text-lg font-medium'>Contact Us</Link>
        {
          token==null && (
            <>
            <Link to="/login" className={`mx-4 text-lg font-medium p-2 border rounded-lg hover:bg-black hover:border-gray-400 hover:text-white`}>Log In</Link>
        <Link to="/register" className='mx-4 text-lg font-medium p-2 border rounded-lg hover:bg-black hover:border-gray-400 hover:text-white'>Register</Link>
            </>
            
          )
        }
        {
          token && (
            <>
            <Link to="/dashboard/my-profile" className={`mx-4 text-lg font-medium p-2 border rounded-lg hover:bg-black hover:border-gray-400 hover:text-white`}>Dashboard</Link>
            </>
          )
        }
      </div>
    </div>
  )
}

export default Navbar