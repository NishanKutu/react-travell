import React from 'react';

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3>Total Bookings</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>128</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3>Active Packages</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>15</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3>New Inquiries</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>4</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;