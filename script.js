// 获取页面元素
const flagImg = document.getElementById('flag-img');
const optionsDiv = document.getElementById('options');
const scoreSpan = document.getElementById('score');
const scoreLabel = document.getElementById('score-label');
const restartBtn = document.getElementById('restart-btn');
const langZhBtn = document.getElementById('lang-zh');
const langEnBtn = document.getElementById('lang-en');
const gameTitle = document.getElementById('game-title');
const nextBtn = document.getElementById('next-btn');
const learnBtn = document.getElementById('learn-btn');
const quizSection = document.getElementById('quiz-section');
const learnSection = document.getElementById('learn-section');
const flagsGrid = document.getElementById('flags-grid');
const learnTitle = document.getElementById('learn-title');
const backBtn = document.getElementById('back-btn');
const learnLangZhBtn = document.getElementById('learn-lang-zh');
const learnLangEnBtn = document.getElementById('learn-lang-en');
const flagSearch = document.getElementById('flag-search');
let learnSearchValue = '';
let learnLang = 'zh'; // 或根据需要初始化为 'en'



// 游戏状态
let currentLang = 'zh'; // 'zh' or 'en'
let score = 0;
let questionIndex = 0;
let questions = [];
let gameOver = false;

let answered = false;

// 语言包
const langPack = {
  zh: {
    title: '国旗识别游戏',
    score: '分数：',
    restart: '重新开始',
    correct: '答对了！',
    wrong: '答错了！',
    gameover: '游戏结束！总分：',
  },
  en: {
    title: 'Flag Quiz Game',
    score: 'Score: ',
    restart: 'Restart',
    correct: 'Correct!',
    wrong: 'Wrong!',
    gameover: 'Game Over! Total Score: ',
  }
};

// 随机洗牌
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 生成题目顺序
function generateQuestions() {
  return shuffle([...countries]);
}

// 生成选项（含正确答案和3个干扰项）
function generateOptions(answer, lang) {
  const options = [answer];
  const pool = countries.filter(c => c.code !== answer.code);
  shuffle(pool);
  for (let i = 0; i < 3; i++) {
    options.push(pool[i]);
  }
  return shuffle(options).map(c => ({
    code: c.code,
    text: lang === 'zh' ? c.zh : c.en
  }));
}

// 显示题目
function showQuestion() {
  if (questionIndex >= questions.length) {
    showGameOver();
    return;
  }
  answered = false;
  nextBtn.disabled = true;
  const q = questions[questionIndex];
  flagImg.src = q.flag;
  flagImg.alt = currentLang === 'zh' ? q.zh : q.en;
  // 生成选项
  const opts = generateOptions(q, currentLang);
  optionsDiv.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.onclick = () => handleAnswer(opt.code, btn, opts);
    optionsDiv.appendChild(btn);
  });
}

// 处理答案
function handleAnswer(selectedCode, btn, opts) {
  if (gameOver || answered) return;
  answered = true;
  nextBtn.disabled = false;
  const q = questions[questionIndex];
  const isCorrect = selectedCode === q.code;
  const btns = optionsDiv.querySelectorAll('.option-btn');
  btns.forEach(b => b.disabled = true);
  if (isCorrect) {
    btn.classList.add('correct');
    score++;
    scoreSpan.textContent = score;
  } else {
    btn.classList.add('wrong');
    // 高亮正确答案
    btns.forEach(b => {
      if (b.textContent === (currentLang === 'zh' ? q.zh : q.en)) {
        b.classList.add('correct');
      }
    });
  }
}

// 显示游戏结束
function showGameOver() {
  gameOver = true;
  optionsDiv.innerHTML = `<div style="text-align:center;font-size:1.2rem;margin:12px 0;">${langPack[currentLang].gameover}${score}</div>`;
  nextBtn.disabled = true;
}

// 重新开始
function restartGame() {
  score = 0;
  questionIndex = 0;
  gameOver = false;
  scoreSpan.textContent = score;
  questions = generateQuestions();
  showQuestion();
}

// 学习板块渲染
function renderFlags() {
  flagsGrid.innerHTML = '';
  let filtered = countries;
  if (learnSearchValue.trim()) {
    const kw = learnSearchValue.trim().toLowerCase();
    filtered = countries.filter(c =>
      (c.zh && c.zh.toLowerCase().includes(kw)) ||
      (c.en && c.en.toLowerCase().includes(kw))
    );
  }
  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.style.textAlign = 'center';
    empty.style.gridColumn = '1/-1';
    empty.style.color = '#888';
    empty.textContent = '未找到相关国家';
    flagsGrid.appendChild(empty);
    return;
  }
  filtered.forEach(c => {
    const card = document.createElement('div');
    card.className = 'flag-card';
    const img = document.createElement('img');
    img.src = c.flag;
    img.alt = learnLang === 'zh' ? c.zh : c.en;
    const name = document.createElement('div');
    name.className = 'country-name';
    name.textContent = learnLang === 'zh' ? c.zh : c.en;
    card.appendChild(img);
    card.appendChild(name);
    flagsGrid.appendChild(card);
  });
}

// 语言切换
function switchLang(lang) {
  currentLang = lang;
  gameTitle.textContent = langPack[lang].title;
  scoreLabel.textContent = langPack[lang].score;
  restartBtn.textContent = langPack[lang].restart;
  nextBtn.textContent = lang === 'zh' ? '下一题' : 'Next';
  langZhBtn.classList.toggle('active', lang === 'zh');
  langEnBtn.classList.toggle('active', lang === 'en');
  // 同步学习区
  learnLang = lang;
  learnTitle.textContent = lang === 'zh' ? '国旗学习板块' : 'Flag Learning';
  learnLangZhBtn.classList.toggle('active', lang === 'zh');
  learnLangEnBtn.classList.toggle('active', lang === 'en');
  renderFlags();
  showQuestion();
}

// 事件绑定
restartBtn.onclick = restartGame;
langZhBtn.onclick = () => switchLang('zh');
langEnBtn.onclick = () => switchLang('en');
nextBtn.onclick = function() {
  if (!answered) return;
  questionIndex++;
  showQuestion();
};
learnBtn.onclick = function() {
  quizSection.style.display = 'none';
  learnSection.style.display = '';
  renderFlags();
};
backBtn.onclick = function() {
  learnSection.style.display = 'none';
  quizSection.style.display = '';
};
learnLangZhBtn.onclick = function() {
  learnLang = 'zh';
  learnTitle.textContent = '国旗学习板块';
  learnLangZhBtn.classList.add('active');
  learnLangEnBtn.classList.remove('active');
  renderFlags();
};
learnLangEnBtn.onclick = function() {
  learnLang = 'en';
  learnTitle.textContent = 'Flag Learning';
  learnLangZhBtn.classList.remove('active');
  learnLangEnBtn.classList.add('active');
  renderFlags();
};

if (flagSearch) {
  flagSearch.addEventListener('input', function(e) {
    learnSearchValue = e.target.value;
    renderFlags();
  });
}

// 初始化
window.onload = () => {
  questions = generateQuestions();
  showQuestion();
}; 