// ----- Word lists for different difficulties -----
const easyWords = [
  "cat", "dog", "sun", "tree", "star",
  "blue", "book", "game", "code", "fish",
  "time", "rain", "note", "key", "zero"
];

const mediumWords = [
  "planet", "window", "school", "puzzle", "galaxy",
  "object", "random", "yellow", "silent", "future",
  "typing", "memory", "middle", "master", "vector"
];

const hardWords = [
  "rhythm", "awkward", "psychology", "javascript", "parallel",
  "campaign", "mysterious", "symmetric", "algorithm", "synchronize",
  "lightweight", "dictionary", "conscious", "misleading", "enigmatic"
];

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
  // Fisher–Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getWordsForDifficulty(difficulty, count) {
  let base;
  if (difficulty === "easy") base = easyWords;
  else if (difficulty === "medium") base = mediumWords;
  else base = hardWords;

  const arr = [...base]; // copy
  shuffle(arr);

  const result = [];
  while (result.length < count) {
    for (let w of arr) {
      result.push(w);
      if (result.length === count) break;
    }
  }
  return result;
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

  currentWordSpan.textContent = 'Press "Start"';
  setCurrentWordHighlight(null);
  resultMessage.textContent = "";

  userInput.value = "";
  userInput.disabled = true;

  startBtn.disabled = false;
  resetBtn.disabled = true;
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
  resultMessage.textContent = `Done! Accuracy: ${accuracy.toFixed(
    0
  )}% (${correctCount} correct, ${wrongCount} wrong)`;
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
