import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LZString from 'lz-string';
import '../CSS/Bingo.css'; // 使用相同的样式

const Open = () => {
  const { id } = useParams();
  const [grid, setGrid] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [marked, setMarked] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (id) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(id);
        if (decompressed) {
          const data = JSON.parse(decompressed);
          const { title, description, words } = data;
          const newGrid = Array.from({ length: 5 }, (_, rowIndex) => words.slice(rowIndex * 5, rowIndex * 5 + 5));
          setTitle(`${title}宾果游戏`);
          setDescription(`五个连成一线你就是${description}！`);
          setGrid(newGrid);
          setMarked(Array(5).fill().map(() => Array(5).fill(false)));
        } else {
          console.error('Failed to decompress data');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }, [id]);

  const handleClick = (row, col) => {
    if (gameOver) return;

    const newMarked = marked.map(row => row.slice());
    newMarked[row][col] = !newMarked[row][col]; // 切换标记状态
    setMarked(newMarked);

    if (checkWin(newMarked)) {
      setGameOver(true);
      alert('Bingo! You win!');
    }
  };

  const checkWin = (newMarked) => {
    const checkLine = (line) => line.every(cell => cell);

    // 检查行和列
    for (let i = 0; i < 5; i++) {
      if (checkLine(newMarked[i]) || checkLine(newMarked.map(row => row[i]))) {
        return true;
      }
    }

    // 检查对角线
    if (checkLine(newMarked.map((row, i) => row[i])) || checkLine(newMarked.map((row, i) => row[4 - i]))) {
      return true;
    }

    return false;
  };

  return (
    <div className="App">
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((word, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${marked[rowIndex][colIndex] ? 'marked' : ''}`}
                onClick={() => handleClick(rowIndex, colIndex)}
              >
                {word}
              </div>
            ))}
          </div>
        ))}
      </div>
      {gameOver && <div className="celebration">🎉 Congratulations! 🎉</div>}
    </div>
  );
};

export default Open;
