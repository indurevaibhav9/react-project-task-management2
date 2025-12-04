import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  // const tokenItem = localStorage.getItem('token')
  const token = "dfnsdkfn "

  if (token) {
    return children
  }

  return <Navigate to="/login" replace />
}

export default ProtectedRoute