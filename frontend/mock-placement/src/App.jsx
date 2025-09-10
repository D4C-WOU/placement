import React, { useState } from 'react';
import Questions from './components/Questions'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Result from './components/Result'
import Homepage from './components/Homepage'

function App() {
  const [page, setPage] = useState('main');

  // Simple navigation handler
  const renderPage = () => {
    switch (page) {
      case 'main':
  return <Homepage onNavigate={setPage} />;
      case 'questions':
        return <Questions />;
      case 'dashboard':
        return <Dashboard />;
      case 'login':
        return <Login />;
      case 'result':
        return <Result />;
      default:
  return <Homepage onNavigate={setPage} />;
    }
  };

  // No nav bar, just render the selected page
  return (
    <div>
      <div style={{color:'red', fontWeight:'bold', textAlign:'center'}}></div>
      {renderPage()}
    </div>
  );
}

export default App;
