import React from 'react'
import './Questions.css'

const Questions = () => {
  return (
    <div className="mainContainer">
      <aside className="sidebar">
        <h2>Categories</h2>
        <button onClick={() => {}}>Mathematics</button>
        <button onClick={() => {}}>Reasoning</button>
        <button onClick={() => {}}>Technical</button>
        <button onClick={() => {}}>Database</button>
      </aside>
      <section className="contentArea">
        <div className="questionSection">
          <h2 id="question-title">Select a Category</h2>
          <p id="question-text">Choose a category from the left to start.</p>
        </div>
        <textarea id="answer-text" className="answerTextarea" style={{display: 'none'}} placeholder="Type your answer here..."></textarea>
        <div id="mcq-options" className="options" style={{display: 'none'}}>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="mcq" id="option1" />
            <label className="form-check-label" htmlFor="option1">Option A</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="mcq" id="option2" />
            <label className="form-check-label" htmlFor="option2">Option B</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="mcq" id="option3" />
            <label className="form-check-label" htmlFor="option3">Option C</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="mcq" id="option4" />
            <label className="form-check-label" htmlFor="option4">Option D</label>
          </div>
        </div>
        <div className="controls">
          <button className="submitBtn">Submit</button>
          <button className="nextBtn">Next</button>
        </div>
      </section>
    </div>
  )
}

export default Questions