import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import LZString from 'lz-string';
import html2canvas from 'html2canvas';
import '../CSS/Bingo.css'; // 使用相同的样式

const domain = "https://www.bingogamemaker.com";

const Create = () => {
  const emptyGrid = Array(5).fill().map(() => Array(5).fill(''));
  const [grid, setGrid] = useState(emptyGrid);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [compressedString, setCompressedString] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const resultRef = useRef();

  const handleGridChange = (rowIndex, colIndex, value) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setGrid(newGrid);
  };

  const handleSubmit = () => {
    // 验证标题、描述和网格是否已填写完整
    if (!title || !description || grid.flat().includes('')) {
      setErrorMessage('请填写所有格子！');
      return;
    }
    setErrorMessage('');

    const flatWords = grid.flat();
    const data = { title, description, words: flatWords };
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    setCompressedString(compressed);
  };

  const handleGenerateImage = async () => {
    if (resultRef.current) {
      const cells = resultRef.current.querySelectorAll('.cell');
      const originalStyles = [];
      cells.forEach(cell => {
        originalStyles.push({ width: cell.style.width, height: cell.style.height, fontSize: cell.style.fontSize });
        cell.style.width = '60px';
        cell.style.height = '60px';
        cell.style.fontSize = '0.4em';
      });
      resultRef.current.style.display = 'block';
      const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      setImageSrc(dataUrl);
      resultRef.current.style.display = 'none';
    }
  };

  const handleCopyUrl = () => {
    const url = `${domain}/#/open/${compressedString}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('URL copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleCopyEncryptedString = () => {
    navigator.clipboard.writeText(compressedString)
      .then(() => {
        alert('Encrypted string copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="App">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="在此输入游戏名称"
          style={{ width: '200px' }}
        />
        <span>宾果游戏</span>
      </div>
      <div>
        <span>五个连成一线你就是</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="在此输入称号"
          style={{ width: '100px' }}
        />
        <span>！</span>
      </div>
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
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <button onClick={handleSubmit}>提交</button>
      {compressedString && (
        <div>
          <div className="buttons">
            <button onClick={handleGenerateImage}>生成图片</button>
            <button onClick={handleCopyUrl}>分享链接</button>
            <button onClick={handleCopyEncryptedString}>分享加密字符串</button>
          </div>
          <div ref={resultRef} style={{ display: 'none', padding: '10px', backgroundColor: 'white', width: 'fit-content', border: '1px solid #000'}}>
            <div className="header">
              <div className="title-description">
                <h1 style={{ fontSize: '1.3em', textAlign: 'center', margin: '5px 0' }}>{title}宾果游戏</h1>
                <p style={{ fontSize: '0.6em', textAlign: 'center', margin: '5px 0' }}>五个连成一线你就是{description}！</p>
              </div>
              <div className="qr-code">
                <QRCode value={`${domain}/#/open/${compressedString}`} size={128} />
                <p style={{ fontSize: '0.5em'}}>扫码玩{title}宾果游戏</p>
              </div>
            </div>
            <div className="grid-container">
              <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 60px)', gridTemplateRows: 'repeat(5, 60px)', gap: '0', border: '1px solid #000', margin: '0 auto' }}>
                {grid.map((row, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    {row.map((word, colIndex) => (
                      <div
                        key={colIndex}
                        className="cell"
                        style={{
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          // border: '1px solid #000',
                          boxSizing: 'border-box',
                          fontSize: '1em',
                        }}
                      >
                        {word}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <p style={{ textAlign: 'center', margin: '10px 0' }}>{domain}</p>
          </div>
        </div>
      )}
      {imageSrc && (
        <div>
          <img src={imageSrc} alt="QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default Create;
