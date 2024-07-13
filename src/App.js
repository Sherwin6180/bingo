import React from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom"; // 从 react-router-dom 导入 Routes 和 Route
import Bingo from "./components/Bingo";
import Create from './components/Create';
import Open from './components/Open';

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Bingo />} />
        <Route path="/create" element={<Create />} />
        <Route path="/open/:id" element={<Open />} />
      </Routes>
    </div>
  );
}

export default App;
