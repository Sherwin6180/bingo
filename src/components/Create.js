import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode.react';
import LZString from 'lz-string';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
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
  const [defaultFontSize, setDefaultFontSize] = useState(0.8);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false); // 管理语言菜单状态
  const resultRef = useRef();
  const previewCellRefs = useRef([]);
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

  const handleGridChange = (rowIndex, colIndex, value) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setGrid(newGrid);
  };

  const handleSubmit = () => {
    if (!title || !description || grid.flat().includes('')) {
      setErrorMessage(t('请填写所有格子！'));
      return;
    }
    setErrorMessage('');

    const flatWords = grid.flat();
    const data = { title, description, words: flatWords };
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    setCompressedString(compressed);
  };

  const adjustFontSize = (cell, initialFontSize) => {
    let fontSize = initialFontSize;
    cell.style.fontSize = `${fontSize}em`;
    while (cell.scrollHeight > cell.clientHeight || cell.scrollWidth > cell.clientWidth) {
      fontSize -= 0.1;
      if (fontSize <= 0.1) break;
      cell.style.fontSize = `${fontSize}em`;
    }
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
    const url = `${domain}/#/open/${compressedString}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert(t('URL已复制到剪切板！'));
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleCopyEncryptedString = () => {
    navigator.clipboard.writeText(compressedString)
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

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('在此输入游戏名称')}
          style={{ width: '200px' }}
        />
        <span>{t('宾果游戏')}</span>
      </div>
      <div>
        <span>{t('五个连成一线你就是')}</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('在此输入称号')}
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
      <button onClick={handleSubmit}>{t('提交')}</button>
      {compressedString && (
        <div>
          <div className="buttons">
            <button onClick={handleGenerateImage}>{t('生成图片')}</button>
            <button onClick={handleCopyUrl}>{t('分享链接')}</button>
            <button onClick={handleCopyEncryptedString}>{t('分享加密字符串')}</button>
          </div>
          <div ref={resultRef} style={{ display: 'none', padding: '10px', backgroundColor: 'white', width: 'fit-content', border: '1px solid #000'}}>
            <div className="header">
              <div className="title-description">
                <h1 style={{ fontSize: '1.3em', textAlign: 'center', margin: '5px 0' }}>{title}{t('宾果游戏')}</h1>
                <p style={{ fontSize: '0.6em', textAlign: 'center', margin: '5px 0' }}>{t('五个连成一线你就是')}{description}！</p>
              </div>
              <div className="qr-code">
                <QRCode value={`${domain}/#/open/${compressedString}`} size={128} />
                <p style={{ fontSize: '0.5em'}}>{t('扫码玩')}{title}{t('宾果游戏')}</p>
              </div>
            </div>
            <div className="grid-container">
              <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 60px)', gridTemplateRows: 'repeat(5, 60px)', gap: '0', border: '1px solid #000', margin: '0 auto' }}>
                {grid.map((row, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    {row.map((word, colIndex) => (
                      <div
                        key={colIndex}
                        ref={el => previewCellRefs.current[rowIndex * 5 + colIndex] = el}
                        className="cell"
                        style={{
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
        </div>
      )}
      {imageSrc && (
        <div>
          <img src={imageSrc} alt="Bingo Result" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default Create;
