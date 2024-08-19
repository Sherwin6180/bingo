import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LZString from 'lz-string';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode.react';
import { useTranslation } from 'react-i18next';
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
  const [defaultFontSize, setDefaultFontSize] = useState(0.8);
  const resultRef = useRef();
  const cellRefs = useRef([]);
  const previewCellRefs = useRef([]);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false); // 管理语言菜单状态
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // 检测屏幕宽度，设置默认字体大小
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setDefaultFontSize(0.5);
      } else {
        setDefaultFontSize(0.8);
      }
    };

    // 初始调用一次
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  useEffect(() => {
    cellRefs.current.forEach(cell => {
      if (cell) {
        adjustFontSize(cell, defaultFontSize);
      }
    });
  }, [grid, defaultFontSize]);

  const adjustFontSize = (cell, initialFontSize) => {
    let fontSize = initialFontSize;
    cell.style.fontSize = `${fontSize}em`;
    while (cell.scrollHeight > cell.clientHeight || cell.scrollWidth > cell.clientWidth) {
      fontSize -= 0.1;
      if (fontSize <= 0.1) break;
      cell.style.fontSize = `${fontSize}em`;
    }
  };

  const handleClick = (row, col) => {
    const newMarked = marked.map(row => row.slice());
    newMarked[row][col] = !newMarked[row][col];
    setMarked(newMarked);

    if (!gameOver && checkWin(newMarked)) {
      setGameOver(true);
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
      }, 3000);
    }
  };

  const checkWin = (newMarked) => {
    const checkLine = (line) => line.every(cell => cell);

    for (let i = 0; i < 5; i++) {
      if (checkLine(newMarked[i]) || checkLine(newMarked.map(row => row[i]))) {
        return true;
      }
    }

    if (checkLine(newMarked.map((row, i) => row[i])) || checkLine(newMarked.map((row, i) => row[4 - i]))) {
      return true;
    }

    return false;
  };

  const handleGenerateImage = async () => {
    if (resultRef.current) {
      const previewCells = previewCellRefs.current;
      previewCells.forEach(cell => {
        if (cell) {
          adjustFontSize(cell, 0.5);
        }
      });

      resultRef.current.style.display = 'block';
      const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      setImageSrc(dataUrl);
      resultRef.current.style.display = 'none';
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${domain}/#/open/${id}`)
      .then(() => {
        alert(t('URL已复制到剪切板！'));
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleCopyEncryptedString = () => {
    navigator.clipboard.writeText(id)
      .then(() => {
        alert(t('加密字符串已复制到剪切板！'));
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const toggleLanguageMenu = () => {
    setLanguageMenuOpen(!languageMenuOpen);
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageMenuOpen(false); // 选择语言后关闭菜单
  };

  const currentLanguage = i18n.language === 'zh' ? '中文' : 'English';

  return (
    <div className="App">
      {/* 语言切换菜单 */}
      <div className="language-switcher">
        <button onClick={toggleLanguageMenu} className="language-button">
          {currentLanguage} ▼
        </button>
        {languageMenuOpen && (
          <ul className="language-menu">
            <li onClick={() => handleLanguageChange('en')}>English</li>
            <li onClick={() => handleLanguageChange('zh')}>中文</li>
          </ul>
        )}
      </div>

      {showAnimation && <div className="animation">{t('恭喜！')}</div>}
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
          placeholder={t('输入你的名字')}
        />
      </div>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((word, colIndex) => (
              <div
                key={colIndex}
                ref={el => cellRefs.current[rowIndex * 5 + colIndex] = el}
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
        <button onClick={handleGenerateImage}>{t('分享结果')}</button>
        <button onClick={handleCopyUrl}>{t('分享链接')}</button>
        <button onClick={handleCopyEncryptedString}>{t('分享加密字符串')}</button>
      </div>
      <a href={`${domain}/#/create`} target="_blank">{t('创建你自己的宾果游戏！')}</a>
      <div ref={resultRef} style={{ display: 'none', padding: '10px', backgroundColor: 'white', width: 'fit-content', border: '1px solid #000' }}>
        <div className="header">
          <div className="title-description">
            <h1 style={{ fontSize: '1.3em', textAlign: 'center', margin: '5px 0' }}>{title}</h1>
            <p style={{ fontSize: '0.6em', textAlign: 'center', margin: '5px 0' }}>{description}</p>
            <p style={{ fontSize: '0.6em', textAlign: 'center', margin: '5px 0' }}>{t('填写者')}: {name}</p>
          </div>
          <div className="qr-code">
            <QRCode value={`${domain}/#/open/${id}`} size={128} />
            <p style={{ fontSize: '0.5em'}}>{t('扫码玩')}{title}</p>
          </div>
        </div>
        <div className="grid-container">
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 60px)', gridTemplateRows: 'repeat(5, 60px)', gap: '0', margin: '0 auto' }}>
            {grid.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((word, colIndex) => (
                  <div
                    key={colIndex}
                    ref={el => previewCellRefs.current[rowIndex * 5 + colIndex] = el}
                    className={`cell ${marked[rowIndex][colIndex] ? 'marked' : ''}`}
                    style={{
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #000',
                      boxSizing: 'border-box',
                      fontSize: `${defaultFontSize}em`,
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
          <h2>{t('分享你的结果：（长按保存图片）')}</h2>
          <img src={imageSrc} alt="Bingo Result" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default Open;
