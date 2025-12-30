import React from 'react'
import { isLoggedIn } from '../api/authAPI'
import { Navigate, Outlet } from 'react-router-dom'

const AdminRoutes = () => {
  return (
    isLoggedIn() && isLoggedIn().user.role == 1 ? <Outlet/> : <Navigate to={'/'} />
  )
}

export default AdminRoutes