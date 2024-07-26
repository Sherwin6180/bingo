import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Bingo.css'; // 使用相同的样式

const Home = () => {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleOpen = () => {
    if (inputValue) {
      navigate(`/open/${inputValue}`);
    } else {
      alert('请输入一个加密字符串');
    }
  };

  const handleCreate = () => {
    navigate('/create');
  };

  return (
    <div className="App">
      <img src="logo.png" alt="logo" style={{ width: '30em', height: 'auto'}} draggable="false"/>
      <h1>来玩宾果游戏吧！</h1>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="输入加密字符串"
          style = {{margin: '1em'}}
        />
        <button onClick={handleOpen}>打开宾果游戏</button>
      </div>
      <div>
        <button onClick={handleCreate}>创建宾果游戏</button>
      </div>
    </div>
  );
};

export default Home;
