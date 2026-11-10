/* ==========================================================================
   APP STATE & CONTROL LOGIC
   ========================================================================== */
let currentQuiz = {
    questions: [],
    userAnswers: {},
    flagged: new Set(),
    mode: 'test', // 'learn' or 'test'
    timeRemaining: 0,
    timerId: null,
    startTime: 0,
    endTime: 0,
    isFinished: false
};

// LocalStorage Highscore
function updateHighScoreDisplay() {
    const saved = localStorage.getItem('insurance_quiz_highscore') || "0/0";
    document.getElementById('highScoreVal').innerText = saved;
}

function saveHighScore(score, total) {
    const saved = localStorage.getItem('insurance_quiz_highscore_val') || 0;
    const pct = Math.round((score / total) * 100);
    if (pct >= saved) {
        localStorage.setItem('insurance_quiz_highscore_val', pct);
        localStorage.setItem('insurance_quiz_highscore', `${score}/${total} (${pct}%)`);
        updateHighScoreDisplay();
    }
}

// UI Handlers for Setup
function handleModeChange() {
    const mode = document.getElementById('selectMode').value;
    document.getElementById('groupSetDetail').classList.toggle('hidden', mode !== 'exam');
    document.getElementById('groupTopicDetail').classList.toggle('hidden', mode !== 'topic');
    document.getElementById('groupCountDetail').classList.toggle('hidden', mode !== 'random');
}

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Start Quiz Session
function startQuiz() {
    const modeType = document.getElementById('selectMode').value;
    const studyType = document.getElementById('selectStudyType').value;
    const shuffleQ = document.getElementById('chkShuffleQ').checked;
    const shuffleOpt = document.getElementById('chkShuffleOpt').checked;
    const minutes = parseInt(document.getElementById('selectTime').value);

    // Filter Question Pool
    let pool = [];
    if (modeType === 'exam') {
        const setVal = document.getElementById('selectSet').value;
        pool = masterQuestionBank.filter(q => q.sets && q.sets.includes(setVal));
    } else if (modeType === 'topic') {
        const topicVal = document.getElementById('selectTopic').value;
        pool = masterQuestionBank.filter(q => q.topic === topicVal);
    } else {
        const countVal = document.getElementById('selectCount').value;
        pool = [...masterQuestionBank];
        if (countVal !== 'all') {
            const limit = parseInt(countVal);
            pool = shuffleArray(pool).slice(0, limit);
        }
    }

    if (pool.length === 0) {
        alert("Không tìm thấy câu hỏi phù hợp cho lựa chọn này!");
        return;
    }

    if (shuffleQ && modeType !== 'random') {
        pool = shuffleArray(pool);
    }

    // Process Option Shuffling if enabled
    let finalQuestions = pool.map((q, idx) => {
        let opts = q.options.map((text, originalIndex) => ({ text, originalIndex }));
        if (shuffleOpt) {
            opts = shuffleArray(opts);
        }
        return {
            ...q,
            renderId: idx + 1,
            optionsList: opts
        };
    });

    // Reset State
    currentQuiz = {
        questions: finalQuestions,
        userAnswers: {},
        flagged: new Set(),
        mode: studyType,
        timeRemaining: minutes * 60,
        timerId: null,
        startTime: Date.now(),
        endTime: 0,
        isFinished: false
    };

    // UI Updates
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    document.getElementById('navSidebar').classList.remove('hidden');
    document.getElementById('bottomActions').classList.remove('hidden');
    document.getElementById('mainContainer').classList.add('quiz-active');
    document.getElementById('resultScreen').classList.add('hidden');

    document.getElementById('badgeMode').innerText = studyType === 'learn' ? '📖 Chế độ Học Tập' : '⏱️ Chế độ Thi Thử';
    
    // Timer Setup
    const timerBox = document.getElementById('timerBox');
    if (studyType === 'test' && minutes > 0) {
        timerBox.classList.remove('hidden');
        startTimer();
    } else {
        timerBox.classList.add('hidden');
    }

    renderQuizQuestions();
    renderNavigator();
    updateProgressUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Questions
function renderQuizQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    currentQuiz.questions.forEach((q) => {
        const card = document.createElement('div');
        card.className = `question-card ${currentQuiz.mode === 'learn' ? 'learning-mode' : ''}`;
        card.id = `q_card_${q.renderId}`;

        const isFlagged = currentQuiz.flagged.has(q.renderId);

        let optionsHTML = '';
        q.optionsList.forEach((optObj, idx) => {
            const char = String.fromCharCode(65 + idx);
            optionsHTML += `
                <li class="option-item">
                    <label class="option-label" id="label_q${q.renderId}_${optObj.originalIndex}">
                        <input type="radio" 
                               name="question_${q.renderId}" 
                               value="${optObj.originalIndex}" 
                               onchange="handleSelectOption(${q.renderId}, ${optObj.originalIndex})">
                        <span><strong>${char}.</strong> ${optObj.text}</span>
                    </label>
                </li>
            `;
        });

        card.innerHTML = `
            <div class="question-header">
                <div class="question-title">Câu ${q.renderId}: ${q.question}</div>
                <button type="button" class="btn-flag ${isFlagged ? 'active' : ''}" onclick="toggleFlag(${q.renderId})">
                    🚩 ${isFlagged ? 'Đã cắm cờ' : 'Theo dõi'}
                </button>
            </div>
            <ul class="options-list">${optionsHTML}</ul>
            <div class="explanation-box" id="exp_${q.renderId}">
                <strong>💡 Giải thích:</strong> ${q.explanation}
            </div>
        `;
        container.appendChild(card);
    });
}

// Option Selection Handling
function handleSelectOption(renderId, selectedOriginalIndex) {
    if (currentQuiz.isFinished) return;

    currentQuiz.userAnswers[renderId] = selectedOriginalIndex;
    const qObj = currentQuiz.questions.find(q => q.renderId === renderId);
    const card = document.getElementById(`q_card_${renderId}`);
    
    card.classList.add('answered');

    // If Learning mode, show feedback immediately
    if (currentQuiz.mode === 'learn') {
        qObj.optionsList.forEach(opt => {
            const label = document.getElementById(`label_q${renderId}_${opt.originalIndex}`);
            label.classList.remove('correct', 'incorrect', 'user-selected');
            
            if (opt.originalIndex === qObj.answer) {
                label.classList.add('correct');
            }
            if (opt.originalIndex === selectedOriginalIndex) {
                label.classList.add('user-selected');
                if (selectedOriginalIndex !== qObj.answer) {
                    label.classList.add('incorrect');
                }
            }
        });
    }

    updateProgressUI();
    updateNavGridItem(renderId);
}

// Toggle Flag
function toggleFlag(renderId) {
    if (currentQuiz.flagged.has(renderId)) {
        currentQuiz.flagged.delete(renderId);
    } else {
        currentQuiz.flagged.add(renderId);
    }
    
    const card = document.getElementById(`q_card_${renderId}`);
    const flagBtn = card.querySelector('.btn-flag');
    const isFlagged = currentQuiz.flagged.has(renderId);

    flagBtn.classList.toggle('active', isFlagged);
    flagBtn.innerHTML = `🚩 ${isFlagged ? 'Đã cắm cờ' : 'Theo dõi'}`;

    document.getElementById('flaggedCountTxt').innerText = `🚩 ${currentQuiz.flagged.size}`;
    updateNavGridItem(renderId);
}

// Navigator Panel
function renderNavigator() {
    const grid = document.getElementById('gridNavigator');
    grid.innerHTML = '';

    currentQuiz.questions.forEach(q => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'grid-btn';
        btn.id = `nav_btn_${q.renderId}`;
        btn.innerText = q.renderId;
        btn.onclick = () => {
            document.getElementById(`q_card_${q.renderId}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        grid.appendChild(btn);
    });
}

function updateNavGridItem(renderId) {
    const btn = document.getElementById(`nav_btn_${renderId}`);
    if (!btn) return;

    const isAnswered = currentQuiz.userAnswers.hasOwnProperty(renderId);
    const isFlagged = currentQuiz.flagged.has(renderId);

    btn.classList.toggle('answered', isAnswered);
    btn.classList.toggle('flagged', isFlagged);
}

function updateProgressUI() {
    const total = currentQuiz.questions.length;
    const answeredCount = Object.keys(currentQuiz.userAnswers).length;
    
    document.getElementById('txtProgress').innerText = `Tiến độ: ${answeredCount}/${total}`;
    const pct = total > 0 ? (answeredCount / total) * 100 : 0;
    document.getElementById('progressBar').style.width = `${pct}%`;
}

// Timer Logic
function startTimer() {
    clearInterval(currentQuiz.timerId);
    const display = document.getElementById('timeDisplay');

    currentQuiz.timerId = setInterval(() => {
        currentQuiz.timeRemaining--;

        if (currentQuiz.timeRemaining <= 0) {
            clearInterval(currentQuiz.timerId);
            alert("⏰ Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài.");
            submitQuiz();
            return;
        }

        const mins = Math.floor(currentQuiz.timeRemaining / 60);
        const secs = currentQuiz.timeRemaining % 60;
        display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (currentQuiz.timeRemaining < 300) {
            display.parentElement.className = 'timer-box timer-danger';
        } else if (currentQuiz.timeRemaining < 600) {
            display.parentElement.className = 'timer-box timer-warning';
        }
    }, 1000);
}

// Submit Quiz
function submitQuiz() {
    if (currentQuiz.isFinished) return;

    if (currentQuiz.mode === 'test') {
        const total = currentQuiz.questions.length;
        const answered = Object.keys(currentQuiz.userAnswers).length;
        if (answered < total) {
            if (!confirm(`Bạn mới làm ${answered}/${total} câu hỏi. Bạn có chắc chắn muốn nộp bài ngay?`)) {
                return;
            }
        }
    }

    clearInterval(currentQuiz.timerId);
    currentQuiz.isFinished = true;
    currentQuiz.endTime = Date.now();

    // Grade Questions
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    currentQuiz.questions.forEach(q => {
        const userAns = currentQuiz.userAnswers[q.renderId];
        const card = document.getElementById(`q_card_${q.renderId}`);
        const navBtn = document.getElementById(`nav_btn_${q.renderId}`);

        card.classList.add('quiz-finished');

        q.optionsList.forEach(opt => {
            const label = document.getElementById(`label_q${q.renderId}_${opt.originalIndex}`);
            label.classList.remove('correct', 'incorrect', 'user-selected');

            if (opt.originalIndex === q.answer) {
                label.classList.add('correct');
            }
            if (userAns !== undefined && opt.originalIndex === userAns) {
                label.classList.add('user-selected');
                if (userAns !== q.answer) {
                    label.classList.add('incorrect');
                }
            }
        });

        if (userAns === undefined) {
            skippedCount++;
            if (navBtn) navBtn.classList.add('skipped-res');
        } else if (userAns === q.answer) {
            correctCount++;
            if (navBtn) navBtn.classList.add('correct-res');
        } else {
            incorrectCount++;
            if (navBtn) navBtn.classList.add('incorrect-res');
        }
    });

    // Score Calculations
    const totalQ = currentQuiz.questions.length;
    const scorePct = Math.round((correctCount / totalQ) * 100);

    document.getElementById('finalScorePct').innerText = `${scorePct}%`;
    document.getElementById('finalScoreText').innerText = `${correctCount} / ${totalQ} Câu đúng`;
    document.getElementById('statCorrect').innerText = correctCount;
    document.getElementById('statIncorrect').innerText = incorrectCount;
    document.getElementById('statSkipped').innerText = skippedCount;

    // Time elapsed
    const elapsedSecs = Math.floor((currentQuiz.endTime - currentQuiz.startTime) / 1000);
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    document.getElementById('statTime').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    saveHighScore(correctCount, totalQ);

    // View Switching
    document.getElementById('resultScreen').classList.remove('hidden');
    document.getElementById('bottomActions').classList.add('hidden');
    window.scrollTo({ top: document.getElementById('resultScreen').offsetTop - 20, behavior: 'smooth' });
}

// Filter Wrong Answers View
function filterWrongAnswers() {
    currentQuiz.questions.forEach(q => {
        const userAns = currentQuiz.userAnswers[q.renderId];
        const card = document.getElementById(`q_card_${q.renderId}`);
        if (userAns === q.answer) {
            card.classList.add('hidden');
        } else {
            card.classList.remove('hidden');
        }
    });
    window.scrollTo({ top: document.getElementById('quizScreen').offsetTop, behavior: 'smooth' });
}

function showAllAnswers() {
    currentQuiz.questions.forEach(q => {
        document.getElementById(`q_card_${q.renderId}`).classList.remove('hidden');
    });
    window.scrollTo({ top: document.getElementById('quizScreen').offsetTop, behavior: 'smooth' });
}

// Reset To Setup
function restartSetup() {
    clearInterval(currentQuiz.timerId);
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('navSidebar').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('bottomActions').classList.add('hidden');
    document.getElementById('setupScreen').classList.remove('hidden');
    document.getElementById('mainContainer').classList.remove('quiz-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Init
window.onload = function() {
    updateHighScoreDisplay();
};
