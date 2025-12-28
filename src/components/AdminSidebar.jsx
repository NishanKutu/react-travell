import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar" style={{ width: '250px', height: '100vh', background: '#2c3e50', color: 'white', padding: '20px' }}>
      <h2>Admin Panel</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
        <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/admin/packages" style={{ color: 'white', textDecoration: 'none' }}>Manage Packages</Link>
        <Link to="/admin/bookings" style={{ color: 'white', textDecoration: 'none' }}>Bookings</Link>
        <Link to="/" style={{ color: '#ecf0f1', fontSize: '0.8rem', marginTop: '20px' }}>← Back to Site</Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;