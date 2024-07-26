import React from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom"; // 从 react-router-dom 导入 Routes 和 Route
import Create from './components/Create';
import Open from './components/Open';
import Home from './components/Home';

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/open/:id" element={<Open />} />
      </Routes>
    </div>
  );
}

export default App;
