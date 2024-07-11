import React from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom"; // 从 react-router-dom 导入 Routes 和 Route
import Bingo from "./components/Bingo";
import Create from './components/Create';

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Bingo />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </div>
  );
}

export default App;
