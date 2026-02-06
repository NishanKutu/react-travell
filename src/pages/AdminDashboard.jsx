import React, { useEffect, useState } from 'react';
import { getAllBookings } from '../api/bookingApi';
import { getAllDestinations } from '../api/destinationApi'; 

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activePackages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetches both bookings and destinations at a same time
        const [bookingRes, destinationRes] = await Promise.all([
          getAllBookings(),
          getAllDestinations()
        ]);

        setStats({
          totalBookings: bookingRes.count || 0, 
          activePackages: destinationRes.count || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardStyle = {
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  };

  if (loading) return <div style={{ padding: '20px' }}>Updating statistics...</div>;

  return (
    <div>
      <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        
        {/* Total Bookings */}
        <div style={cardStyle}>
          <h3 style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>Total Bookings</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>
            {stats.totalBookings}
          </p>
        </div>

        {/* Active Packages */}
        <div style={cardStyle}>
          <h3 style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>Active Packages</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>
            {stats.activePackages}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;