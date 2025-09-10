import React from 'react'
import './Result.css'

const Result = () => {
  return (
    <div>
      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#dashboard">User Dashboard</a>
        <a href="#results">My Results</a>
      </nav>
      <header className="dashboardHeader">
        <h1>Mock Test Results</h1>
      </header>
      <div className="mainContent">
        <div className="card">
          <h2>Overall Performance</h2>
          <p className="summaryText">Here's a summary of your latest mock test performance.</p>
        </div>
        <div className="card">
          <h3>Accuracy</h3>
          <p className="resultMetric accuracy" id="accuracy">0%</p>
          <p className="summaryText">Your percentage of correct answers.</p>
        </div>
        <div className="card">
          <h3>Time Concluded</h3>
          <p className="resultMetric timeTaken">45:30 <small>min</small></p>
          <p className="summaryText">Total time taken to complete the test.</p>
        </div>
        <div className="card">
          <h3>Correct Answers</h3>
          <p className="resultMetric trueAnswers" id="correct">0</p>
          <p className="summaryText">Number of questions you answered correctly.</p>
        </div>
        <div className="card">
          <h3>Incorrect Answers</h3>
          <p className="resultMetric falseAnswers" id="incorrect">0</p>
          <p className="summaryText">Number of questions you answered incorrectly.</p>
        </div>
        <div className="chartContainer">
          <canvas id="resultChart" width="300" height="300"></canvas>
        </div>
      </div>
      <footer className="footer">
        © 2025 CodeChallenge Hub. All rights reserved.
      </footer>
    </div>
  )
}

export default Result