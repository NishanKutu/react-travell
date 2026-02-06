import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {

    const getLinkStyle = ({ isActive }) => ({
        display: 'block',
        padding: '12px 20px',
        textDecoration: 'none',
        borderRadius: '8px',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s',
        backgroundColor: isActive ? '#334155' : 'transparent', 
        color: isActive ? '#f8fafc' : '#94a3b8', 
    });

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            backgroundColor: '#1e293b',
            color: 'white',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #334155'
        }}>
            <div style={{ padding: '24px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>
                HikeHub Admin
            </div>

            <nav style={{ padding: '20px', flexGrow: 1 }}>
                <NavLink to="/admin/dashboard" style={getLinkStyle}>
                    📊 Dashboard
                </NavLink>

                <NavLink to="/admin/destinations" style={getLinkStyle}>
                    🌍 Manage Packages
                </NavLink>

                <NavLink to="/admin/users" style={getLinkStyle}>
                    👥 Users List
                </NavLink>

                <NavLink to="/admin/booking-list" style={getLinkStyle}>
                    📒 Booking List
                </NavLink>
                
                <NavLink to="/admin/add-destination" style={getLinkStyle}>
                    ➕ Add New Trip
                </NavLink>

                
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
                <NavLink to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>
                    ← Back to Site
                </NavLink>
            </div>
        </aside>
    );
};

export default AdminSidebar;