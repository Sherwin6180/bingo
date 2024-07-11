import React, { useState } from 'react';
import '../CSS/Bingo.css'; // 使用相同的样式

const encrypt = (data) => {
  const plainText = JSON.stringify(data);
  const encoded = encodeURIComponent(plainText);
  return btoa(encoded); // Base64 编码
};

const Create = () => {
  const emptyGrid = Array(5).fill().map(() => Array(5).fill(''));
  const [grid, setGrid] = useState(emptyGrid);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [encryptedString, setEncryptedString] = useState('');

  const handleGridChange = (rowIndex, colIndex, value) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setGrid(newGrid);
  };

  const handleSubmit = () => {
    const flatWords = grid.flat();
    const data = { title, description, words: flatWords };
    const encrypted = encrypt(data);
    setEncryptedString(encrypted);
  };

  return (
    <div className="Create">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="___宾果游戏"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="五个连成一线你就是____！"
      />
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <textarea
                key={colIndex}
                className="cell"
                value={cell}
                onChange={(e) => handleGridChange(rowIndex, colIndex, e.target.value)}
                placeholder=""
              />
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>提交</button>
      <a href={"#/"}>Bingo</a>
      {encryptedString && (
        <div>
          <h2>生成的加密字符串：</h2>
          <p>{encryptedString}</p>
        </div>
      )}
    </div>
  );
};

export default Create;
