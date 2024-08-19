import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../CSS/Bingo.css'; // 使用相同的样式

const Home = () => {
  const [inputValue, setInputValue] = useState('');
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false); // 管理语言菜单状态
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleOpen = () => {
    if (inputValue) {
      navigate(`/open/${inputValue}`);
    } else {
      alert(t('请输入一个加密字符串'));
    }
  };

  const handleCreate = () => {
    navigate('/create');
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

      <img src="logo.png" alt="logo" style={{ width: '30em', height: 'auto' }} draggable="false" />
      <h1>{t('来玩宾果游戏吧！')}</h1>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={t('输入加密字符串')}
          style={{ margin: '1em' }}
        />
        <button onClick={handleOpen}>{t('打开宾果游戏')}</button>
      </div>
      <div>
        <button onClick={handleCreate}>{t('创建宾果游戏')}</button>
      </div>
    </div>
  );
};

export default Home;
