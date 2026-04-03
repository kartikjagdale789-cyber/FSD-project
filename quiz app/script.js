const questions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: 1
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: 1
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        answer: 2
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        answer: 3
    }
];

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 30;
let shuffledQuestions = [];

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const progressEl = document.getElementById('progress');
const timerEl = document.getElementById('timer');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz() {
    shuffledQuestions = shuffleArray([...questions]);
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 30;
    scoreEl.style.display = 'none';
    nextBtn.disabled = true;
    displayQuestion();
    updateProgress();
}

function displayQuestion() {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    questionEl.textContent = currentQuestion.question;
    optionsEl.innerHTML = '';
    
    currentQuestion.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.classList.add('option');
        optionEl.textContent = option;
        optionEl.addEventListener('click', () => selectOption(index));
        optionsEl.appendChild(optionEl);
    });
    
    startTimer();
}

function selectOption(selectedIndex) {
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        option.classList.remove('selected');
        if (index === selectedIndex) {
            option.classList.add('selected');
        }
    });
    nextBtn.disabled = false;
}

function checkAnswer() {
    const selectedOption = document.querySelector('.option.selected');
    const selectedIndex = Array.from(selectedOption.parentNode.children).indexOf(selectedOption);
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    
    if (selectedIndex === currentQuestion.answer) {
        selectedOption.classList.add('correct');
        score++;
        correctSound.play();
    } else {
        selectedOption.classList.add('incorrect');
        document.querySelectorAll('.option')[currentQuestion.answer].classList.add('correct');
        incorrectSound.play();
    }
    
    clearInterval(timer);
    nextBtn.disabled = false;
}

function nextQuestion() {
    checkAnswer();
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < shuffledQuestions.length) {
            timeLeft = 30;
            displayQuestion();
            updateProgress();
            nextBtn.disabled = true;
        } else {
            showScore();
        }
    }, 2000);
}

function showScore() {
    questionEl.style.display = 'none';
    optionsEl.style.display = 'none';
    nextBtn.style.display = 'none';
    scoreEl.style.display = 'block';
    finalScoreEl.textContent = `${score}/${shuffledQuestions.length}`;
    document.querySelector('.progress-bar').style.display = 'none';
    timerEl.style.display = 'none';
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 30;
    questionEl.style.display = 'block';
    optionsEl.style.display = 'grid';
    nextBtn.style.display = 'block';
    scoreEl.style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'block';
    timerEl.style.display = 'block';
    startQuiz();
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    progressEl.style.width = `${progress}%`;
}

nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartQuiz);

// Start the quiz
startQuiz();