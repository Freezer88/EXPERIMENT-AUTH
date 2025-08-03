import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UIComponentsTest from './pages/UIComponentsTest';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UIComponentsTest />} />
          <Route path="/ui-test" element={<UIComponentsTest />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 