const questions = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "What are your strengths and weaknesses?"
];

let current = 0;
const answers = [];
let recognition;
let silenceTimer;
let isRecognising = false;
let finalTranscript = ''; // global but reset per question

const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const submitBtn = document.getElementById('submitBtn');

function showQuestion() {
    if (current < questions.length) {
        questionEl.innerText = `Q${current + 1}: ${questions[current]}`;
        answerEl.value = '';
        submitBtn.style.display = 'inline-block';
        submitBtn.classList.remove('submit-green');
        finalTranscript = ''; // 🔑 reset per question
        resetSilenceTimer();
    } else {
        evaluateAnswers();
    }
}

function nextQuestion() {
    const ans = answerEl.value.trim();
    answers.push(ans === '' ? '[No Answer]' : ans);
    current++;
    clearTimeout(silenceTimer);
    if (recognition) recognition.stop(); // stop recognition before next
    showQuestion();
}

function evaluateAnswers() {
    let feedbackHTML = "<h2>Thank you for your answers!</h2>";
    feedbackHTML += "<h3>Your Answers:</h3><ol>";
    answers.forEach((ans, i) => {
        feedbackHTML += `<li><strong>Q${i + 1}:</strong> ${ans}</li>`;
    });
    feedbackHTML += "</ol>";

    const score = calculateMockScore(answers);
    feedbackHTML += `<h3>Your Feedback Score: ${score}/10</h3>`;
    feedbackHTML += "<p>This score is based on clarity, grammar, and professional tone (mock evaluation).</p>";

    document.body.innerHTML = feedbackHTML;
    console.log("User Answers:", answers);
}

function calculateMockScore(answersArray) {
    const totalWords = answersArray.reduce((acc, ans) => acc + ans.split(' ').length, 0);
    const avgWords = totalWords / answersArray.length;
    let score = Math.min(Math.round(avgWords / 10 + 5), 10); // simplistic scale
    return score;
}

function startListening() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support Speech Recognition. Use Chrome.");
        return;
    }

    if (recognition) recognition.stop();

    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
        console.log("Voice recognition started");
        isRecognising = true;
        resetSilenceTimer();
    };

    recognition.onresult = function (event) {
        resetSilenceTimer();
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        answerEl.value = finalTranscript + interimTranscript;
    };

    recognition.onerror = function (event) {
        console.error("Recognition error:", event.error);
    };

    recognition.onend = function () {
        console.log("Voice recognition ended.");
        isRecognising = false;
        if (current < questions.length && !isRecognising) {
            recognition.start();
        }
    };

    recognition.start();
}

function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        console.log("1 minute silence detected. Auto-submitting answer.");
        submitBtn.classList.add('submit-green');
        if (recognition) recognition.stop();
        nextQuestion(); // auto-submit
    }, 60000); // 1 minute
}

showQuestion();
