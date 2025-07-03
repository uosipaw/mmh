document.addEventListener("DOMContentLoaded", () => {
  const questionDisplay = document.getElementById("question");
  const answerInput = document.getElementById("answer");
  const submitButton = document.getElementById("submit-answer");
  const timerDisplay = document.getElementById("time-left");
  const scoreDisplay = document.getElementById("current-score");
  const feedbackDisplay = document.getElementById("feedback"); // Added feedback display

  let questions = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is 2 + 2?", answer: "4" },
    { question: "What is the chemical symbol for water?", answer: "H2O" },
    { question: "Who wrote Hamlet?", answer: "Shakespeare" },
    { question: "What year did World War II end?", answer: "1945" },
  ];
  let currentQuestionIndex = 0;
  let score = 0;
  let timeLeft = 10;
  let timerInterval;

  function startGame() {
    loadQuestion();
  }

  function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
      endGame(); // End the game if all questions are answered
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionDisplay.textContent = currentQuestion.question;
    answerInput.value = ""; // Clear the input
    feedbackDisplay.textContent = ""; // Clear feedback

    timeLeft = 10;
    timerDisplay.textContent = timeLeft;
    clearInterval(timerInterval); // Clear any existing timer
    timerInterval = setInterval(updateTimer, 1000); // Start a new timer
  }

  function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      checkAnswer(true); // Times up!
    }
  }

  submitButton.addEventListener("click", () => {
    checkAnswer();
  });

  // Allow submitting answer with Enter key
  answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission if inside a form
      checkAnswer();
    }
  });

  function checkAnswer(timeOut = false) {
    clearInterval(timerInterval); // Stop the timer

    const userAnswer = answerInput.value.trim();
    const correctAnswer = questions[currentQuestionIndex].answer;
    const isCorrect = timeOut
      ? false
      : checkAnswerFuzzy(userAnswer, correctAnswer);

    if (isCorrect) {
      score++;
      scoreDisplay.textContent = score;
      feedbackDisplay.textContent = "Correct!"; // Display feedback
    } else {
      feedbackDisplay.textContent =
        "Incorrect. The answer was: " + correctAnswer; // Display feedback
    }

    currentQuestionIndex++;
    // Delay the loading of the next question to show feedback
    setTimeout(loadQuestion, 2000); // Load next question after 2 seconds
  }

  function checkAnswerFuzzy(userAnswer, correctAnswer) {
    const distanceThreshold = 2;
    const distance = levenshteinDistance(
      userAnswer.toLowerCase(),
      correctAnswer.toLowerCase()
    );
    return distance <= distanceThreshold;
  }

  function levenshteinDistance(a, b) {
    // Same Levenshtein function from previous example
    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[j][0] = j;
    }
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        if (b[j - 1] === a[i - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function endGame() {
    questionDisplay.textContent = "Game Over! Your score is: " + score;
    answerInput.style.display = "none";
    submitButton.style.display = "none";
    clearInterval(timerInterval);
  }

  startGame();
});
