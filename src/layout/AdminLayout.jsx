import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      
      {/* Dynamic Content Area */}
      <main style={{ flexGrow: 1, padding: '40px', background: '#f4f7f6', minHeight: '100vh' }}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;