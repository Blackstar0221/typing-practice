// ----- Language state -----
let currentLanguage = "en"; // default is English

// English word pool
const wordPoolEn = [
  "cat", "dog", "sun", "tree", "star", "blue", "book", "game", "code", "fish",
  "time", "rain", "note", "key", "zero", "planet", "window", "school",
  "puzzle", "galaxy", "object", "random", "yellow", "silent", "future",
  "typing", "memory", "middle", "master", "vector", "rhythm", "awkward",
  "psychology", "javascript", "parallel", "campaign", "mysterious",
  "symmetric", "algorithm", "synchronize", "lightweight", "dictionary",
  "conscious", "misleading", "enigmatic", "forest", "rocket", "signal",
  "matrix", "neuron", "orbit", "shadow", "spiral", "binary", "circuit",
  "portal", "crystal", "thunder", "static", "quantum", "fusion",
  "oboe", "galaxytaurus", "twinkle", "lego", "replit"
];

// Korean word pool
const wordPoolKo = [
  "고양이", "강아지", "바다", "하늘", "학교",
  "컴퓨터", "프로그래밍", "자바스크립트", "키보드", "연습",
  "음악", "게임", "레고", "트윈클", "행성",
  "나무", "별빛", "우주", "은하", "토러스",
  "연필", "공책", "시계", "버스", "지하철",
  "초콜릿", "사과", "바나나", "딸기", "라면",
  "책상", "의자", "창문", "문", "복도",
  "연습장", "시험", "숙제", "공부", "집중",
  "인터넷", "브라우저", "깃허브", "레플릿", "코딩",
  "알고리즘", "함수", "변수", "객체", "배열"
];

function getActiveWordPool() {
  return currentLanguage === "en" ? wordPoolEn : wordPoolKo;
}

// ----- DOM elements -----
const currentWordSpan = document.getElementById("currentWord");
const userInput = document.getElementById("userInput");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const wordCountSelect = document.getElementById("wordCountSelect");
const difficultySelect = document.getElementById("difficultySelect");

const wordsDoneSpan = document.getElementById("wordsDone");
const wordsTotalSpan = document.getElementById("wordsTotal");
const correctCountSpan = document.getElementById("correctCount");
const wrongCountSpan = document.getElementById("wrongCount");
const timeElapsedSpan = document.getElementById("timeElapsed");
const accuracySpan = document.getElementById("accuracy");
const avgTimeSpan = document.getElementById("avgTime");
const resultMessage = document.getElementById("resultMessage");

// lang toggle
const langToggleInput = document.getElementById("langToggle");
const langLabelEn = document.getElementById("langLabelEn");
const langLabelKo = document.getElementById("langLabelKo");

// labels
const titleText = document.getElementById("titleText");
const wordCountLabel = document.getElementById("wordCountLabel");
const difficultyLabel = document.getElementById("difficultyLabel");
const diffEasy = document.getElementById("diffEasy");
const diffMedium = document.getElementById("diffMedium");
const diffHard = document.getElementById("diffHard");
const progressLabel = document.getElementById("progressLabel");
const correctLabel = document.getElementById("correctLabel");
const wrongLabel = document.getElementById("wrongLabel");
const timeLabel = document.getElementById("timeLabel");
const accuracyLabel = document.getElementById("accuracyLabel");
const avgTimeLabel = document.getElementById("avgTimeLabel");

// ----- State -----
let wordList = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let isRunning = false;

let startTime = null;
let endTime = null;
let timerIntervalId = null;

// ----- Helpers -----

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getWordsForDifficulty(difficulty, count) {
  const pool = getActiveWordPool();
  let filtered;

  if (difficulty === "easy") {
    filtered = pool.filter(w => w.length <= 4);
  } else if (difficulty === "medium") {
    filtered = pool.filter(w => w.length >= 5 && w.length <= 7);
  } else {
    filtered = pool.filter(w => w.length >= 8);
  }

  if (filtered.length < count) {
    filtered = pool;
  }

  const arr = [...filtered];
  shuffle(arr);
  return arr.slice(0, count);
}

function updateStats() {
  const total = wordList.length;
  const done = currentIndex;
  wordsDoneSpan.textContent = done.toString();
  wordsTotalSpan.textContent = total.toString();
  correctCountSpan.textContent = correctCount.toString();
  wrongCountSpan.textContent = wrongCount.toString();

  const elapsed = isRunning
    ? (Date.now() - startTime) / 1000
    : startTime && endTime
    ? (endTime - startTime) / 1000
    : 0;

  timeElapsedSpan.textContent = elapsed.toFixed(1);

  const attempts = correctCount + wrongCount;
  const accuracy = attempts > 0 ? (correctCount / attempts) * 100 : 0;
  accuracySpan.textContent = accuracy.toFixed(0);

  const avgTime = done > 0 ? elapsed / done : 0;
  avgTimeSpan.textContent = avgTime.toFixed(1);
}

function setCurrentWordHighlight(status) {
  currentWordSpan.classList.remove("correct", "wrong");
  if (status === "correct") currentWordSpan.classList.add("correct");
  if (status === "wrong") currentWordSpan.classList.add("wrong");
}

function showNextWord() {
  if (currentIndex >= wordList.length) {
    finishGame();
    return;
  }

  currentWordSpan.textContent = wordList[currentIndex];
  setCurrentWordHighlight(null);
  userInput.value = "";
  userInput.focus();
}

function startTimer() {
  startTime = Date.now();
  endTime = null;
  timerIntervalId = setInterval(updateStats, 100);
}

function stopTimer() {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  endTime = Date.now();
  updateStats();
}

function resetState() {
  isRunning = false;
  wordList = [];
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  startTime = null;
  endTime = null;
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  wordsDoneSpan.textContent = "0";
  wordsTotalSpan.textContent = "0";
  correctCountSpan.textContent = "0";
  wrongCountSpan.textContent = "0";
  timeElapsedSpan.textContent = "0.0";
  accuracySpan.textContent = "0";
  avgTimeSpan.textContent = "0.0";

  if (currentLanguage === "en") {
    currentWordSpan.textContent = 'Press "Start"';
  } else {
    currentWordSpan.textContent = "시작 버튼을 눌러 주세요";
  }
  setCurrentWordHighlight(null);
  resultMessage.textContent = "";

  userInput.value = "";
  userInput.disabled = true;

  startBtn.disabled = false;
  resetBtn.disabled = true;
}

// ----- Language UI text -----

function applyLanguageTexts() {
  if (currentLanguage === "en") {
    document.documentElement.lang = "en";
    titleText.textContent = "Typing Trainer";

    wordCountLabel.textContent = "Number of words:";
    difficultyLabel.textContent = "Difficulty:";
    diffEasy.textContent = "Easy";
    diffMedium.textContent = "Medium";
    diffHard.textContent = "Hard";

    progressLabel.textContent = "Words done:";
    correctLabel.textContent = "Correct:";
    wrongLabel.textContent = "Wrong:";
    timeLabel.textContent = "Time:";
    accuracyLabel.textContent = "Accuracy:";
    avgTimeLabel.textContent = "Average time per word:";
    userInput.placeholder = "Type the word here and press Enter";
    startBtn.textContent = "Start";
    resetBtn.textContent = "Reset";

    if (!isRunning && currentIndex === 0) {
      currentWordSpan.textContent = 'Press "Start"';
    }

    langLabelEn.classList.add("active");
    langLabelKo.classList.remove("active");
  } else {
    document.documentElement.lang = "ko";
    titleText.textContent = "타자 연습기";

    wordCountLabel.textContent = "단어 개수:";
    difficultyLabel.textContent = "난이도:";
    diffEasy.textContent = "쉬움";
    diffMedium.textContent = "보통";
    diffHard.textContent = "어려움";

    progressLabel.textContent = "진행:";
    correctLabel.textContent = "정답 수:";
    wrongLabel.textContent = "오답 수:";
    timeLabel.textContent = "시간:";
    accuracyLabel.textContent = "정확도:";
    avgTimeLabel.textContent = "단어당 평균 시간:";
    userInput.placeholder = "여기에 단어를 입력하고 Enter를 누르세요";
    startBtn.textContent = "시작";
    resetBtn.textContent = "리셋";

    if (!isRunning && currentIndex === 0) {
      currentWordSpan.textContent = "시작 버튼을 눌러 주세요";
    }

    langLabelEn.classList.remove("active");
    langLabelKo.classList.add("active");
  }
}

function getResultMessage(accuracy, correct, wrong) {
  if (currentLanguage === "en") {
    return `Done! Accuracy: ${accuracy.toFixed(0)}% (${correct} correct, ${wrong} wrong)`;
  } else {
    return `완료! 정확도: ${accuracy.toFixed(0)}% (${correct}개 정답, ${wrong}개 오답)`;
  }
}

// ----- Game flow -----

function startGame() {
  const count = parseInt(wordCountSelect.value, 10);
  const difficulty = difficultySelect.value;

  wordList = getWordsForDifficulty(difficulty, count);
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  isRunning = true;

  wordsTotalSpan.textContent = wordList.length.toString();
  resultMessage.textContent = "";

  userInput.disabled = false;
  userInput.value = "";
  userInput.focus();

  startBtn.disabled = true;
  resetBtn.disabled = false;

  startTimer();
  showNextWord();
}

function finishGame() {
  isRunning = false;
  stopTimer();
  userInput.disabled = true;
  setCurrentWordHighlight(null);

  const attempts = correctCount + wrongCount;
  const accuracy = attempts > 0 ? (correctCount / attempts) * 100 : 0;
  resultMessage.textContent = getResultMessage(accuracy, correctCount, wrongCount);
}

// ----- Event listeners -----

startBtn.addEventListener("click", () => {
  if (!isRunning) {
    startGame();
  }
});

resetBtn.addEventListener("click", () => {
  resetState();
});

langToggleInput.addEventListener("change", () => {
  currentLanguage = langToggleInput.checked ? "ko" : "en";
  resetState();
  applyLanguageTexts();
});

userInput.addEventListener("keydown", (e) => {
  if (!isRunning) return;

  if (e.key === "Enter") {
    const typed = userInput.value.trim();
    const target = wordList[currentIndex];

    if (typed === target) {
      correctCount++;
      setCurrentWordHighlight("correct");
    } else {
      wrongCount++;
      setCurrentWordHighlight("wrong");
    }

    currentIndex++;
    updateStats();

    setTimeout(() => {
      showNextWord();
    }, 120);
  }
});

// Initial state
resetState();
applyLanguageTexts();
