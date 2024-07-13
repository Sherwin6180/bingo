import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import LZString from 'lz-string';
import html2canvas from 'html2canvas';
import '../CSS/Bingo.css'; // 使用相同的样式

const Create = () => {
  const emptyGrid = Array(5).fill().map(() => Array(5).fill(''));
  const [grid, setGrid] = useState(emptyGrid);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [compressedString, setCompressedString] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const qrCodeRef = useRef();

  const handleGridChange = (rowIndex, colIndex, value) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setGrid(newGrid);
  };

  const handleSubmit = () => {
    const flatWords = grid.flat();
    const data = { title, description, words: flatWords };
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    setCompressedString(compressed);
  };

  const handleGenerateImage = async () => {
    if (qrCodeRef.current) {
      const canvas = await html2canvas(qrCodeRef.current);
      const dataUrl = canvas.toDataURL('image/png');
      setImageSrc(dataUrl);
    }
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
                placeholder="单词"
              />
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>提交</button>
      {compressedString && (
        <div>
          <h2>生成的二维码：</h2>
          <div ref={qrCodeRef} style={{ textAlign: 'center' }}>
            <p>来玩{title}宾果游戏吧！</p>
            <QRCode value={`sherwin6180.github.io/bingo/#/open/${compressedString}`} size={256} />
          </div>
          <button onClick={handleGenerateImage}>生成图片</button>
        </div>
      )}
      {imageSrc && (
        <div>
          <h2>保存二维码图片：</h2>
          <img src={imageSrc} alt="QR Code" />
        </div>
      )}
    </div>
  );
};

export default Create;
