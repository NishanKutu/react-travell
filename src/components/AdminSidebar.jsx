import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const getLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    textDecoration: "none",
    borderRadius: "8px",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    backgroundColor: isActive ? "#334155" : "transparent",
    color: isActive ? "#f8fafc" : "#94a3b8",
  });

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        backgroundColor: "#1e293b",
        color: "white",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #334155",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          padding: "24px",
          fontSize: "20px",
          fontWeight: "bold",
          borderBottom: "1px solid #334155",
          letterSpacing: "1px",
        }}
      >
        HikeHub Admin
      </div>

      {/* CLEANED NAV TAG: 
          Removed overflowY: "auto" from inline and moved it to CSS 
          to let the pseudo-elements work correctly.
      */}
      <nav
        className="admin-nav-scrollbar"
        style={{ padding: "20px", flexGrow: 1 }}
      >
        <NavLink to="/admin/dashboard" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>📊</span> Dashboard
        </NavLink>
        <NavLink to="/admin/destinations" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>🌍</span> Manage Packages
        </NavLink>
        <NavLink to="/admin/users" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>👥</span> Users List
        </NavLink>
        <NavLink to="/admin/guide-info" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>🙋🏻‍♂️</span> Guide Info
        </NavLink>
        <NavLink to="/admin/porter-info" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>🧳</span> Porter Info
        </NavLink>
        <NavLink to="/admin/booking-list" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>📒</span> Booking List
        </NavLink>
        <NavLink to="/admin/manage-activity" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>✍️</span> Manage Activity
        </NavLink>
        <NavLink to="/admin/activities" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>🚣🏻</span> Activities
        </NavLink>
        <NavLink to="/admin/custom-tour-list" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>📗</span> Custom Tour List
        </NavLink>
        <NavLink to="/admin/admin-review" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>📖</span> Reviews
        </NavLink>
        <NavLink to="/admin/admin-faq" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>🙋🏻</span> FAQ
        </NavLink>
        <NavLink to="/admin/add-booking" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>➕</span> Add Booking
        </NavLink>
        <NavLink to="/admin/add-destination" style={getLinkStyle}>
          <span style={{ marginRight: "12px" }}>➕</span> Add New Trip
        </NavLink>
      </nav>

      <div
        style={{
          padding: "20px",
          borderTop: "1px solid #334155",
          backgroundColor: "#1e293b",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "auto",
        }}
      >
        <NavLink
          to="/"
          style={{
            color: isBackHovered ? "#f8fafc" : "#94a3b8",
            textDecoration: "none",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
        >
          <span style={{ marginRight: "8px" }}>←</span> Back to Site
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
