import React from 'react'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div>
      <nav className="nav">
        <button>Home</button>
        <button>User Dashboard</button>
        <button className="btnLogout">Logout</button>
      </nav>
      <header className="dashboardHeader">
        <div className="userInfoHeader">
          <div className="userAvatar">JD</div>
          <h1>Welcome, John Doe!</h1>
        </div>
      </header>
      <div className="mainContent">
        <div className="cardCustom">
          <h2>Your Profile</h2>
          <ul className="listGroup">
            <li><strong>Name:</strong> John Doe</li>
            <li><strong>Email:</strong> user@example.com</li>
            <li><strong>User ID:</strong> U1234567890</li>
            <li><strong>Contact No:</strong> 1234567890</li>
          </ul>
        </div>
        <div className="cardCustom mockTestCard">
          <h2>Ready for a Challenge?</h2>
          <p className="lead">Test your skills with a comprehensive mock placement test.</p>
          <a href="#test" className="btnStartTest">Start Mock Test Now!</a>
        </div>
      </div>
      <footer className="footer">
        © 2025 CodeChallenge Hub. All rights reserved.
      </footer>
    </div>
  )
}

export default Dashboard