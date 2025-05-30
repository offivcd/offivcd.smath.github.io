const questionEl = document.getElementById('question');
const board = document.getElementById('bingo-board');
const gallery = document.getElementById('monster-gallery');

let collected = new Set(JSON.parse(localStorage.getItem('monsters') || '[]'));
let unlocked = new Set(JSON.parse(localStorage.getItem('unlockedMonsters') || '[]'));
let currentProblem;

// Generate a multiplication problem (1–10 x 1–10)
function generateProblem() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { expression: `${a} × ${b}`, answer: a * b };
}

// Create a board that always includes the correct answer
function generateBoard(correctAnswer) {
  board.innerHTML = '';
  const answers = new Set();
  answers.add(correctAnswer);

  while (answers.size < 25) {
    answers.add(Math.floor(Math.random() * 100));
  }

  const shuffled = Array.from(answers).sort(() => Math.random() - 0.5);

  for (let i = 0; i < 25; i++) {
    const btn = document.createElement('button');
    const value = shuffled[i];
    btn.textContent = value;

    if (collected.has(value)) {
      btn.style.background = 'lightgreen';
      btn.disabled = true;
    }

    btn.addEventListener('click', () => handleAnswerClick(btn, value));
    board.appendChild(btn);
  }
}

// When user clicks an answer
function handleAnswerClick(btn, value) {
  if (value === currentProblem.answer && !collected.has(value)) {
    btn.style.background = 'lightgreen';
    btn.disabled = true;
    collected.add(value);
    checkBingo();
    localStorage.setItem('monsters', JSON.stringify(Array.from(collected)));
    nextProblem(); // <-- key fix: generate new question + board
  }
}

// Check for a BINGO line
function checkBingo() {
  const buttons = Array.from(board.children);
  const getIdx = (r, c) => r * 5 + c;
  const isSelected = i => buttons[i].style.background === 'lightgreen';

  let win = false;
  for (let i = 0; i < 5; i++) {
    if ([0, 1, 2, 3, 4].every(j => isSelected(getIdx(i, j)))) win = true;
    if ([0, 1, 2, 3, 4].every(j => isSelected(getIdx(j, i)))) win = true;
  }

  if ([0, 1, 2, 3, 4].every(i => isSelected(getIdx(i, i)))) win = true;
  if ([0, 1, 2, 3, 4].every(i => isSelected(getIdx(i, 4 - i)))) win = true;

  if (win) {
    alert('BINGO! You earned a monster!');
    addMonster();
    collected.clear();
    localStorage.setItem('monsters', JSON.stringify([]));
    nextProblem();
  }
}

// Add a new collectible monster
function addMonster() {
  if (unlocked.size >= 10) return;

  let newId;
  do {
    newId = Math.floor(Math.random() * 10) + 1;
  } while (unlocked.has(newId));

  unlocked.add(newId);
  localStorage.setItem('unlockedMonsters', JSON.stringify(Array.from(unlocked)));
  renderMonsters();
}

// Show unlocked monsters
function renderMonsters() {
  gallery.innerHTML = '';
  unlocked.forEach(id => {
    const img = document.createElement('img');
    img.src = `assets/monsters/monster${id}.png`;
    img.alt = `Monster ${id}`;
    gallery.appendChild(img);
  });
}

// Setup a new problem and update the board
function nextProblem() {
  currentProblem = generateProblem();
  questionEl.textContent = currentProblem.expression;
  generateBoard(currentProblem.answer); // <-- board gets updated every time
}

// Start the game
nextProblem();
renderMonsters();