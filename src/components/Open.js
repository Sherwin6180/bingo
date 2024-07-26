import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LZString from 'lz-string';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode.react';
import '../CSS/Bingo.css';

const domain = "https://www.bingogamemaker.com";

const Open = () => {
  const { id } = useParams();
  const [grid, setGrid] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [marked, setMarked] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [name, setName] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const resultRef = useRef();

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
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
      }, 3000); // 动画显示3秒
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

  const handleGenerateImage = async () => {
    if (resultRef.current) {
      // 临时调整样式
      const cells = resultRef.current.querySelectorAll('.cell');
      const originalStyles = [];
      cells.forEach(cell => {
        originalStyles.push({ width: cell.style.width, height: cell.style.height, fontSize: cell.style.fontSize });
        cell.style.width = '60px';
        cell.style.height = '60px';
        cell.style.fontSize = '0.6em';
      });

      resultRef.current.style.display = 'block';
      const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      setImageSrc(dataUrl);
      resultRef.current.style.display = 'none';

      // 恢复原始样式
      cells.forEach((cell, index) => {
        cell.style.width = originalStyles[index].width;
        cell.style.height = originalStyles[index].height;
        cell.style.fontSize = originalStyles[index].fontSize;
      });

      setShowQRCode(true);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${domain}/#/open/${id}`)
      .then(() => {
        alert('URL copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleCopyEncryptedString = () => {
    navigator.clipboard.writeText(id)
      .then(() => {
        alert('Encrypted string copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="App">
      {showAnimation && <div className="animation">恭喜！</div>}
      <div className="header">
        <div className="title-description">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入你的名字"
        />
      </div>
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
      <div className="buttons">
        <button onClick={handleGenerateImage}>分享结果</button>
        <button onClick={handleCopyUrl}>分享链接</button>
        <button onClick={handleCopyEncryptedString}>分享加密字符串</button>
      </div>
      <a href={`${domain}/#/create`}
        target="_blank"
        >创建你自己的宾果游戏！</a>
      <div ref={resultRef} style={{ display: 'none', padding: '10px', backgroundColor: 'white', width: 'fit-content', border: '1px solid #000' }}>
        <div className="header">
          <div className="title-description">
            <h1 style={{ fontSize: '1.3em', textAlign: 'center', margin: '5px 0' }}>{title}</h1>
            <p style={{ fontSize: '0.6em', textAlign: 'center', margin: '5px 0' }}>{description}</p>
            <p style={{ fontSize: '0.6em', textAlign: 'center', margin: '5px 0' }}>填写者: {name}</p>
          </div>
          <div className="qr-code">
            <QRCode value={`${domain}/#/open/${id}`} size={128} />
            <p style={{ fontSize: '0.5em'}}>扫码玩{title}</p>
          </div>
        </div>
        <div className="grid-container">
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 60px)', gridTemplateRows: 'repeat(5, 60px)', gap: '0', margin: '0 auto' }}>
            {grid.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((word, colIndex) => (
                  <div
                    key={colIndex}
                    className={`cell ${marked[rowIndex][colIndex] ? 'marked' : ''}`}
                    style={{
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #000',
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
      {imageSrc && (
        <div>
          <h2>分享你的结果：（长按保存图片）</h2>
          <img src={imageSrc} alt="Bingo Result" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default Open;
