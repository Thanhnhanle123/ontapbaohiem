/* ==========================================================================
   APP STATE, STORAGE & CONTROL LOGIC
   ========================================================================== */
const STORAGE_KEYS = {
    HIGHSCORE_TEXT: 'insurance_quiz_highscore',
    HIGHSCORE_PCT: 'insurance_quiz_highscore_val',
    WRONG_LATER_IDS: 'insurance_quiz_wrong_later_ids'
};

let questionBankCache = null;

let currentQuiz = {
    questions: [],
    userAnswers: {},
    flagged: new Set(),
    mode: 'test',          // 'learn' | 'test'
    sourceMode: 'exam',    // 'exam' | 'topic' | 'random' | 'wrong_review'
    timeRemaining: 0,
    timerId: null,
    isPaused: false,
    startTime: 0,
    endTime: 0,
    isFinished: false
};

/* ---------- Data Loading ---------- */
async function loadQuestionBank(forceReload = false) {
    if (!forceReload && Array.isArray(questionBankCache) && questionBankCache.length > 0) {
        return questionBankCache;
    }

    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Lỗi kết nối HTTP! Trạng thái: ${response.status}`);
        }
        const data = await response.json();
        questionBankCache = Array.isArray(data) ? data : [];
        return questionBankCache;
    } catch (error) {
        console.error('Không thể đọc file data.json:', error);
        return questionBankCache || [];
    }
}

/* ---------- Wrong Questions Pool ("Những câu làm sau") ---------- */
const WrongLaterStore = {
    getIds() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.WRONG_LATER_IDS);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    },

    saveIds(ids) {
        const uniqueIds = [...new Set(ids.filter(id => id !== undefined && id !== null))];
        localStorage.setItem(STORAGE_KEYS.WRONG_LATER_IDS, JSON.stringify(uniqueIds));
        this.syncUI();
    },

    add(questionId) {
        if (questionId === undefined || questionId === null) return;
        const current = this.getIds();
        if (!current.includes(questionId)) {
            current.push(questionId);
            this.saveIds(current);
        }
    },

    remove(questionId) {
        const updated = this.getIds().filter(id => id !== questionId);
        this.saveIds(updated);
    },

    clear() {
        const count = this.getIds().length;
        if (count === 0) return;
        if (!confirm(`Xóa toàn bộ ${count} câu hỏi trong danh sách "Những câu làm sau"?`)) {
            return;
        }
        localStorage.removeItem(STORAGE_KEYS.WRONG_LATER_IDS);
        this.syncUI();
    },

    syncUI() {
        const count = this.getIds().length;
        const optEl = document.getElementById('optWrongReview');
        const countTxtEl = document.getElementById('wrongPoolCountText');
        const clearBtn = document.getElementById('btnClearWrongPool');
        const btnResultWrong = document.getElementById('btnPracticeWrongResult');

        if (optEl) {
            optEl.innerText = `📌 Luyện lại các câu làm sau (${count} câu)`;
        }
        if (countTxtEl) {
            countTxtEl.innerText = count > 0
                ? `Đang có ${count} câu hỏi cần luyện lại.`
                : 'Chưa có câu hỏi nào bị làm sai để luyện lại.';
        }
        if (clearBtn) {
            clearBtn.disabled = count === 0;
        }
        if (btnResultWrong) {
            btnResultWrong.innerText = `📌 Luyện lại câu làm sau (${count})`;
            btnResultWrong.classList.toggle('hidden', count === 0);
        }
    }
};

function clearWrongQuestionsPool() {
    WrongLaterStore.clear();
}

/* ---------- Highscore ---------- */
function updateHighScoreDisplay() {
    const saved = localStorage.getItem(STORAGE_KEYS.HIGHSCORE_TEXT) || '0/0';
    document.getElementById('highScoreVal').innerText = saved;
}

function saveHighScore(score, total) {
    if (total <= 0) return;
    const savedPct = Number(localStorage.getItem(STORAGE_KEYS.HIGHSCORE_PCT) || 0);
    const pct = Math.round((score / total) * 100);
    if (pct >= savedPct) {
        localStorage.setItem(STORAGE_KEYS.HIGHSCORE_PCT, String(pct));
        localStorage.setItem(STORAGE_KEYS.HIGHSCORE_TEXT, `${score}/${total} (${pct}%)`);
        updateHighScoreDisplay();
    }
}

/* ---------- Setup & Filtering ---------- */
function handleModeChange() {
    const mode = document.getElementById('selectMode').value;
    document.getElementById('groupSetDetail').classList.toggle('hidden', mode !== 'exam');
    document.getElementById('groupTopicDetail').classList.toggle('hidden', mode !== 'topic');
    document.getElementById('groupCountDetail').classList.toggle('hidden', mode !== 'random');
    document.getElementById('groupWrongDetail').classList.toggle('hidden', mode !== 'wrong_review');
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildQuestionPool(bank, modeType) {
    if (modeType === 'exam') {
        const setVal = document.getElementById('selectSet').value;
        return bank.filter(q => Array.isArray(q.sets) && q.sets.includes(setVal));
    }
    if (modeType === 'topic') {
        const topicVal = document.getElementById('selectTopic').value;
        return bank.filter(q => q.topic === topicVal);
    }
    if (modeType === 'wrong_review') {
        const wrongSet = new Set(WrongLaterStore.getIds());
        return bank.filter(q => wrongSet.has(q.id));
    }

    const countVal = document.getElementById('selectCount').value;
    const shuffled = shuffleArray(bank);
    if (countVal === 'all') return shuffled;
    return shuffled.slice(0, parseInt(countVal, 10));
}

/* ---------- Quiz Lifecycle ---------- */
async function startQuiz(overrideModeType = null) {
    const modeType = overrideModeType || document.getElementById('selectMode').value;
    const studyType = document.getElementById('selectStudyType').value;
    const shuffleQ = document.getElementById('chkShuffleQ').checked;
    const shuffleOpt = document.getElementById('chkShuffleOpt').checked;
    const minutes = parseInt(document.getElementById('selectTime').value, 10);

    if (modeType === 'wrong_review' && WrongLaterStore.getIds().length === 0) {
        alert("Hiện chưa có câu hỏi nào trong danh sách 'Những câu làm sau'!");
        return;
    }

    const bank = await loadQuestionBank();
    let pool = buildQuestionPool(bank, modeType);

    if (pool.length === 0) {
        alert('Không tìm thấy câu hỏi phù hợp cho lựa chọn này!');
        return;
    }

    if (shuffleQ && modeType !== 'random') {
        pool = shuffleArray(pool);
    }

    const finalQuestions = pool.map((q, idx) => {
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

    clearInterval(currentQuiz.timerId);
    currentQuiz = {
        questions: finalQuestions,
        userAnswers: {},
        flagged: new Set(),
        mode: studyType,
        sourceMode: modeType,
        timeRemaining: minutes * 60,
        timerId: null,
        isPaused: false,
        startTime: Date.now(),
        endTime: 0,
        isFinished: false
    };

    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    document.getElementById('navSidebar').classList.remove('hidden');
    document.getElementById('bottomActions').classList.remove('hidden');
    document.getElementById('mainContainer').classList.add('quiz-active');
    document.getElementById('resultScreen').classList.add('hidden');

    const modeLabel = studyType === 'learn' ? '📖 Chế độ Học Tập' : '⏱️ Chế độ Thi Thử';
    const sourceLabel = modeType === 'wrong_review' ? ' • 📌 Câu làm sau' : '';
    document.getElementById('badgeMode').innerText = `${modeLabel}${sourceLabel}`;

    const timerBox = document.getElementById('timerBox');
    const pauseBtn = document.getElementById('btnTogglePause');
    if (studyType === 'test' && minutes > 0) {
        timerBox.classList.remove('hidden');
        pauseBtn.classList.remove('hidden');
        pauseBtn.innerText = '⏸️ Tạm dừng';
        renderTimerDisplay();
        startTimer();
    } else {
        timerBox.classList.add('hidden');
        pauseBtn.classList.add('hidden');
    }

    renderQuizQuestions();
    renderNavigator();
    updateProgressUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startWrongQuestionsPractice() {
    document.getElementById('selectMode').value = 'wrong_review';
    handleModeChange();
    startQuiz('wrong_review');
}

/* ---------- Rendering ---------- */
function renderQuizQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    currentQuiz.questions.forEach((q) => {
        const card = document.createElement('div');
        card.className = `question-card ${currentQuiz.mode === 'learn' ? 'learning-mode' : ''}`;
        card.id = `q_card_${q.renderId}`;

        const isFlagged = currentQuiz.flagged.has(q.renderId);
        const optionsHTML = q.optionsList.map((optObj, idx) => {
            const char = String.fromCharCode(65 + idx);
            return `
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
        }).join('');

        card.innerHTML = `
            <div class="question-header">
                <div class="question-title">Câu ${q.renderId}: ${q.question}</div>
                <button type="button" class="btn-flag ${isFlagged ? 'active' : ''}" onclick="toggleFlag(${q.renderId})">
                    🚩 ${isFlagged ? 'Đã cắm cờ' : 'Theo dõi'}
                </button>
            </div>
            <ul class="options-list">${optionsHTML}</ul>
            <div class="explanation-box" id="exp_${q.renderId}">
                <strong>💡 Giải thích:</strong> ${q.explanation || 'Chưa có nội dung giải thích.'}
            </div>
        `;
        container.appendChild(card);
    });
}

function applyOptionFeedback(qObj, selectedOriginalIndex) {
    const isCorrect = selectedOriginalIndex === qObj.answer;
    qObj.optionsList.forEach(opt => {
        const label = document.getElementById(`label_q${qObj.renderId}_${opt.originalIndex}`);
        if (!label) return;
        label.classList.remove('correct', 'incorrect', 'user-selected');

        if (opt.originalIndex === qObj.answer) {
            label.classList.add('correct');
        }
        if (selectedOriginalIndex !== undefined && opt.originalIndex === selectedOriginalIndex) {
            label.classList.add('user-selected');
            if (!isCorrect) {
                label.classList.add('incorrect');
            }
        }
    });
}

function handleSelectOption(renderId, selectedOriginalIndex) {
    if (currentQuiz.isFinished) return;

    currentQuiz.userAnswers[renderId] = selectedOriginalIndex;
    const qObj = currentQuiz.questions.find(q => q.renderId === renderId);
    const card = document.getElementById(`q_card_${renderId}`);
    if (card) card.classList.add('answered');

    if (currentQuiz.mode === 'learn' && qObj) {
        const isCorrect = selectedOriginalIndex === qObj.answer;
        if (!isCorrect) {
            WrongLaterStore.add(qObj.id);
        } else if (currentQuiz.sourceMode === 'wrong_review') {
            WrongLaterStore.remove(qObj.id);
        }
        applyOptionFeedback(qObj, selectedOriginalIndex);
    }

    updateProgressUI();
    updateNavGridItem(renderId);
}

function toggleFlag(renderId) {
    if (currentQuiz.flagged.has(renderId)) {
        currentQuiz.flagged.delete(renderId);
    } else {
        currentQuiz.flagged.add(renderId);
    }

    const card = document.getElementById(`q_card_${renderId}`);
    const flagBtn = card ? card.querySelector('.btn-flag') : null;
    const isFlagged = currentQuiz.flagged.has(renderId);

    if (flagBtn) {
        flagBtn.classList.toggle('active', isFlagged);
        flagBtn.innerHTML = `🚩 ${isFlagged ? 'Đã cắm cờ' : 'Theo dõi'}`;
    }

    document.getElementById('flaggedCountTxt').innerText = `🚩 ${currentQuiz.flagged.size}`;
    updateNavGridItem(renderId);
}

function renderNavigator() {
    const grid = document.getElementById('gridNavigator');
    grid.innerHTML = '';

    currentQuiz.questions.forEach(q => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'grid-btn';
        btn.id = `nav_btn_${q.renderId}`;
        btn.innerText = String(q.renderId);
        btn.onclick = () => {
            const target = document.getElementById(`q_card_${q.renderId}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };
        grid.appendChild(btn);
    });
}

function updateNavGridItem(renderId) {
    const btn = document.getElementById(`nav_btn_${renderId}`);
    if (!btn) return;

    const isAnswered = Object.prototype.hasOwnProperty.call(currentQuiz.userAnswers, renderId);
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

/* ---------- Timer ---------- */
function renderTimerDisplay() {
    const display = document.getElementById('timeDisplay');
    const safeSecs = Math.max(0, currentQuiz.timeRemaining);
    const mins = Math.floor(safeSecs / 60);
    const secs = safeSecs % 60;
    display.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const box = display.parentElement;
    box.classList.remove('timer-warning', 'timer-danger');
    if (safeSecs < 300) {
        box.classList.add('timer-danger');
    } else if (safeSecs < 600) {
        box.classList.add('timer-warning');
    }
}

function startTimer() {
    clearInterval(currentQuiz.timerId);
    currentQuiz.isPaused = false;

    currentQuiz.timerId = setInterval(() => {
        if (currentQuiz.isPaused || currentQuiz.isFinished) return;

        currentQuiz.timeRemaining--;
        renderTimerDisplay();

        if (currentQuiz.timeRemaining <= 0) {
            clearInterval(currentQuiz.timerId);
            alert('⏰ Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài.');
            submitQuiz(true);
        }
    }, 1000);
}

function toggleTimerPause() {
    if (currentQuiz.isFinished) return;
    currentQuiz.isPaused = !currentQuiz.isPaused;
    const btn = document.getElementById('btnTogglePause');
    btn.innerText = currentQuiz.isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng';
}

/* ---------- Submit & Grading ---------- */
function submitQuiz(forceSubmit = false) {
    if (currentQuiz.isFinished) return;

    if (!forceSubmit && currentQuiz.mode === 'test') {
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
    document.getElementById('btnTogglePause').classList.add('hidden');

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    const wrongPoolIds = new Set(WrongLaterStore.getIds());

    currentQuiz.questions.forEach(q => {
        const userAns = currentQuiz.userAnswers[q.renderId];
        const card = document.getElementById(`q_card_${q.renderId}`);
        const navBtn = document.getElementById(`nav_btn_${q.renderId}`);

        if (card) card.classList.add('quiz-finished');
        applyOptionFeedback(q, userAns);

        if (userAns === undefined) {
            skippedCount++;
            if (navBtn) navBtn.classList.add('skipped-res');
        } else if (userAns === q.answer) {
            correctCount++;
            if (navBtn) navBtn.classList.add('correct-res');
            if (currentQuiz.sourceMode === 'wrong_review') {
                wrongPoolIds.delete(q.id);
            }
        } else {
            incorrectCount++;
            if (navBtn) navBtn.classList.add('incorrect-res');
            if (q.id !== undefined && q.id !== null) {
                wrongPoolIds.add(q.id);
            }
        }
    });

    WrongLaterStore.saveIds([...wrongPoolIds]);

    const totalQ = currentQuiz.questions.length;
    const scorePct = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    document.getElementById('finalScorePct').innerText = `${scorePct}%`;
    document.getElementById('finalScoreText').innerText = `${correctCount} / ${totalQ} Câu đúng`;
    document.getElementById('statCorrect').innerText = String(correctCount);
    document.getElementById('statIncorrect').innerText = String(incorrectCount);
    document.getElementById('statSkipped').innerText = String(skippedCount);

    const elapsedSecs = Math.max(0, Math.floor((currentQuiz.endTime - currentQuiz.startTime) / 1000));
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    document.getElementById('statTime').innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    saveHighScore(correctCount, totalQ);

    const resultEl = document.getElementById('resultScreen');
    resultEl.classList.remove('hidden');
    document.getElementById('bottomActions').classList.add('hidden');
    window.scrollTo({ top: resultEl.offsetTop - 20, behavior: 'smooth' });
}

/* ---------- Review Filters & Reset ---------- */
function filterWrongAnswers() {
    currentQuiz.questions.forEach(q => {
        const userAns = currentQuiz.userAnswers[q.renderId];
        const card = document.getElementById(`q_card_${q.renderId}`);
        if (!card) return;
        card.classList.toggle('hidden', userAns === q.answer);
    });
    window.scrollTo({ top: document.getElementById('quizScreen').offsetTop, behavior: 'smooth' });
}

function showAllAnswers() {
    currentQuiz.questions.forEach(q => {
        const card = document.getElementById(`q_card_${q.renderId}`);
        if (card) card.classList.remove('hidden');
    });
    window.scrollTo({ top: document.getElementById('quizScreen').offsetTop, behavior: 'smooth' });
}

function restartSetup() {
    clearInterval(currentQuiz.timerId);
    WrongLaterStore.syncUI();
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('navSidebar').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('bottomActions').classList.add('hidden');
    document.getElementById('setupScreen').classList.remove('hidden');
    document.getElementById('mainContainer').classList.remove('quiz-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Init ---------- */
window.addEventListener('DOMContentLoaded', () => {
    updateHighScoreDisplay();
    WrongLaterStore.syncUI();
    handleModeChange();
    loadQuestionBank();
});