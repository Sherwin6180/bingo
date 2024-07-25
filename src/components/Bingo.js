import React, { useState } from 'react';
import '../CSS/Bingo.css';
import QRCode from 'qrcode.react';
import LZString from 'lz-string';

const domain = "https://sherwin6180.github.io/bingo";

const encrypt = (data) => {
  const plainText = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(plainText);
  return compressed; // 使用 LZString 进行压缩编码
};

const decrypt = (compressed) => {
  const plainText = LZString.decompressFromEncodedURIComponent(compressed);
  return JSON.parse(plainText); // 解析为对象
};

const generateEncryptedString = () => {
  const data = {
    title: "山东人",
    description: "山东人",
    words: [
      "能生吃大蒜或者大葱", "家里有个贤惠的好老婆", "会下厨", "梦想是公务员或者研究生", "过年过节跪长辈",
      "倒装句经常说", "跟河南比高中谁更累", "家里有亲戚是公务员", "认为南方人都是侏儒", "会看餐桌上人做的位置对不对",
      "喝酒找不着北愣说没醉", "家里有认识警察或者干部", "好客", "喜欢大众或者奥迪", "觉得别人家孩子去外地打工就是不孝顺",
      "熟练背诵蓝翔挖掘机红会福娃娃或新东方", "从小背三字经弟子规", "一直生直到男孩", "男超过175女超过165", "家里出再大事先问领导给不给假",
      "直到从哪里开始敬酒", "看到或者参加的婚礼有闹婚", "讨厌同性恋", "坐过小孩那桌", "在外说话嗓门大"
    ]
  };
  const encryptedString = encrypt(data);
  // console.log("Encrypted String:", encryptedString);
  return encryptedString;
};

const Bingo = () => {
  const emptyGrid = Array(5).fill().map(() => Array(5).fill(''));
  const [grid, setGrid] = useState(emptyGrid);
  const [marked, setMarked] = useState(emptyGrid.map(row => row.map(() => false)));
  const [gameOver, setGameOver] = useState(false);
  const [encryptedInput, setEncryptedInput] = useState('');
  const [encryptedString, setEncryptedString] = useState(generateEncryptedString());
  const [title, setTitle] = useState("XX宾果游戏");
  const [description, setDescription] = useState("五个连成一线你就是XX！");

  const handleInputChange = (e) => {
    setEncryptedInput(e.target.value);
  };

  const handleDecrypt = () => {
    const decryptedData = decrypt(encryptedInput);
    const { title, description, words } = decryptedData;
    const newGrid = Array.from({ length: 5 }, (_, rowIndex) => words.slice(rowIndex * 5, rowIndex * 5 + 5));
    setTitle(`${title}宾果游戏`);
    setDescription(`五个连成一线你就是${description}！`);
    setGrid(newGrid);
  };

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

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(encryptedString)
      .then(() => {
        alert('Encrypted string copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const qrCodeUrl = `${domain}/#/open/${encryptedString}`;

  return (
    <div className="App">
      <h1>{title}</h1>
      <p>{description}</p>
      <div>
        <input
          type="text"
          value={encryptedInput}
          onChange={handleInputChange}
          placeholder="Enter encrypted string"
        />
        <button onClick={handleDecrypt}>Decrypt and Load Grid</button>
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
      <div>
        <h2>Encrypted String:</h2>
        <button onClick={handleCopyToClipboard}>Copy Encrypted String</button>
      </div>
      <div>
        <QRCode value={qrCodeUrl} size={256} />
        <p>扫描二维码以打开宾果游戏</p>
      </div>
      {gameOver && <div className="celebration">🎉 Congratulations! 🎉</div>}
    </div>
  );
};

export default Bingo;
