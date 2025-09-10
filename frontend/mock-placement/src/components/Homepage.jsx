import React from 'react'
import './Homepage.css'

function Homepage({onNavigate}) {
  return (
      <div className="wrapper">
        <header className="header">
          <h1>Pre-Mock Placement – IT (5th Sem)</h1>
        </header>
        <h2 className="rulesHeading">Rules</h2>
        <main className="main">
          <section>
            <h2>🎯 Objective</h2>
            <p>Provide students with a <span className="highlight">real placement-style test experience</span> covering aptitude, reasoning, database, and technical concepts. Students get overall feedback at the end.</p>
          </section>
          <section>
            <h2>📌 Eligibility</h2>
            <ul>
              <li>Only IT 5th Semester students are allowed.</li>
              <li>Students must register before the test date.</li>
            </ul>
          </section>
          <section>
            <h2>👔 Dress Code</h2>
            <p>Formal attire is <span className="highlight">encouraged</span> for professionalism.</p>
          </section>
          <section>
            <h2>📝 Test Format</h2>
            <ul>
              <li><b>Duration:</b> 1 Hour (60 minutes)</li>
              <li><b>Sections:</b>
                <ul>
                  <li>Mathematical Aptitude</li>
                  <li>Reasoning</li>
                  <li>Database (DBMS)</li>
                  <li>Technical (Programming + Core IT)</li>
                </ul>
              </li>
              <li>Each question carries equal marks</li>
              <li>No negative marking</li>
              <li className="highlight">Once a question is attempted, you cannot go back. You must submit and move to the next.</li>
            </ul>
          </section>
          <section>
            <h2>📖 General Guidelines</h2>
            <ol>
              <li>Total duration is <b>60 minutes</b>. The test will auto-end when time is up.</li>
              <li>No phones, calculators, or unfair means allowed.</li>
              <li>Maintain discipline and follow instructions.</li>
              <li>Carry pen & paper for rough work and your resume.</li>
            </ol>
          </section>
          <section>
            <h2>💡 Feedback</h2>
            <p>Every student will receive <span className="highlight">overall feedback</span> at the end, focusing on accuracy, speed, time management, and improvement areas.</p>
          </section>
          <button className="loginBtn" id="goButton" onClick={() => onNavigate && onNavigate('login')}>Student Login</button>
        </main>
        <footer className="footer">
          © 2025 IT Placement Club • Pre–Mock Placement (Practice–Only)
        </footer>
      </div>
  )
}

export default Homepage