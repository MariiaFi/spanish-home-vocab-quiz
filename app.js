/**
 * Aprende español — Objetos de la casa
 * Vocabulario + Quiz con 3 modos, tema claro/oscuro, Web Speech API
 * JavaScript puro, funciona sin conexión.
 */

// ========== VOCABULARIO — 36 PALABRAS ==========
const VOCAB = [
    { es: "silla", ipa: "[ˈsiʎa]", ru: "стул" },
    { es: "mesa", ipa: "[ˈmesa]", ru: "стол" },
    { es: "cama", ipa: "[ˈkama]", ru: "кровать" },
    { es: "armario", ipa: "[arˈmaɾjo]", ru: "шкаф" },
    { es: "sofá", ipa: "[soˈfa]", ru: "диван" },
    { es: "lámpara", ipa: "[ˈlampaɾa]", ru: "лампа" },
    { es: "alfombra", ipa: "[alˈfombɾa]", ru: "ковер" },
    { es: "cortina", ipa: "[koɾˈtina]", ru: "штора" },
    { es: "cojín", ipa: "[koˈxin]", ru: "подушка" },
    { es: "espejo", ipa: "[esˈpexo]", ru: "зеркало" },
    { es: "estante", ipa: "[esˈtante]", ru: "полка" },
    { es: "escritorio", ipa: "[eskɾiˈtoɾjo]", ru: "письменный стол" },
    { es: "sillón", ipa: "[siˈʎon]", ru: "кресло" },
    { es: "planta", ipa: "[ˈplanta]", ru: "растение" },
    { es: "reloj", ipa: "[reˈlox]", ru: "часы" },
    { es: "televisor", ipa: "[teleβiˈsoɾ]", ru: "телевизор" },
    { es: "nevera", ipa: "[neˈβeɾa]", ru: "холодильник" },
    { es: "horno", ipa: "[ˈoɾno]", ru: "духовка" },
    { es: "fregadero", ipa: "[fɾeɣaˈðeɾo]", ru: "раковина" },
    { es: "cuenco", ipa: "[ˈkweŋko]", ru: "миска" },
    { es: "plato", ipa: "[ˈplato]", ru: "тарелка" },
    { es: "vaso", ipa: "[ˈbaso]", ru: "стакан" },
    { es: "tenedor", ipa: "[teneˈðoɾ]", ru: "вилка" },
    { es: "cuchillo", ipa: "[kuˈtʃiʎo]", ru: "нож" },
    { es: "cuchara", ipa: "[kuˈtʃaɾa]", ru: "ложка" },
    { es: "sartén", ipa: "[saɾˈten]", ru: "сковорода" },
    { es: "olla", ipa: "[ˈoʎa]", ru: "кастрюля" },
    { es: "lavadora", ipa: "[laβaˈðoɾa]", ru: "стиральная машина" },
    { es: "aspiradora", ipa: "[aspiɾaˈðoɾa]", ru: "пылесос" },
    { es: "plancha", ipa: "[ˈplantʃa]", ru: "утюг" },
    { es: "mesita de noche", ipa: "[meˈsita ðe ˈnotʃe]", ru: "тумбочка" },
    { es: "manta", ipa: "[ˈmanta]", ru: "одеяло" },
    { es: "percha", ipa: "[ˈpeɾtʃa]", ru: "вешалка" },
    { es: "puerta", ipa: "[ˈpweɾta]", ru: "дверь" },
    { es: "ventana", ipa: "[benˈtana]", ru: "окно" },
    { es: "cómoda", ipa: "[ˈkomoða]", ru: "комод" }
];

// ========== ESTADO GLOBAL ==========
let currentScreen = 'dict';
let quizMode = 'ru2es';
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let mistakesIds = [];
let totalQuestions = 0;

const appContent = document.getElementById('appContent');
const themeToggle = document.getElementById('themeToggle');
const backToDictBtn = document.getElementById('backToDictBtn');

const dictTemplate = document.getElementById('dict-screen-template');
const quizTemplate = document.getElementById('quiz-screen-template');

// ========== INICIALIZACIÓN ==========
function initApp() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }

    renderDictScreen();

    themeToggle.addEventListener('click', toggleTheme);
    backToDictBtn.addEventListener('click', () => {
        if (currentScreen !== 'dict') renderDictScreen();
    });
}

// ========== TEMA ==========
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ========== WEB SPEECH API (ESPAÑOL) ==========
function speakSpanish(text) {
    if (!window.speechSynthesis) {
        alert('Web Speech API no es compatible.');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// ========== RENDER DICCIONARIO ==========
function renderDictScreen() {
    currentScreen = 'dict';
    const clone = dictTemplate.content.cloneNode(true);
    appContent.innerHTML = '';
    appContent.appendChild(clone);

    const vocabGrid = document.getElementById('vocabGrid');
    const searchInput = document.getElementById('searchInput');
    const sortAz = document.getElementById('sortAzBtn');
    const sortRandom = document.getElementById('sortRandomBtn');
    const startQuizBtn = document.getElementById('startQuizFromDict');

    let currentVocab = [...VOCAB];

    function displayVocab(array) {
        vocabGrid.innerHTML = '';
        array.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'vocab-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="es-word">${item.es}</div>
                <div class="ipa">${item.ipa}</div>
                <div class="ru-word">${item.ru}</div>
                <button class="speak-btn" data-es="${item.es}">🔊 Hablar</button>
            `;
            vocabGrid.appendChild(card);
        });

        document.querySelectorAll('.speak-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                speakSpanish(btn.dataset.es);
            });
        });
    }

    displayVocab(currentVocab);

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = VOCAB.filter(item => 
            item.es.toLowerCase().includes(query) || 
            item.ru.toLowerCase().includes(query)
        );
        displayVocab(filtered);
    });

    sortAz.addEventListener('click', () => {
        const sorted = [...currentVocab].sort((a, b) => a.es.localeCompare(b.es));
        displayVocab(sorted);
    });

    sortRandom.addEventListener('click', () => {
        const shuffled = [...currentVocab].sort(() => Math.random() - 0.5);
        displayVocab(shuffled);
    });

    startQuizBtn.addEventListener('click', () => {
        renderQuizScreen('ru2es');
    });
}

// ========== GENERAR PREGUNTAS DEL QUIZ ==========
function generateQuizQuestions(mode) {
    const questions = [];
    const usedIndices = new Set();
    const questionCount = Math.min(10, VOCAB.length);
    
    while (questions.length < questionCount) {
        let randomIndex = Math.floor(Math.random() * VOCAB.length);
        if (usedIndices.has(randomIndex)) continue;
        usedIndices.add(randomIndex);

        const word = VOCAB[randomIndex];
        let questionType = mode;
        if (mode === 'mixed') {
            questionType = Math.random() < 0.5 ? 'ru2es' : 'es2ru';
        }

        const isRu2Es = (questionType === 'ru2es');
        
        let correctAnswer, questionText, options;
        
        if (isRu2Es) {
            questionText = word.ru;
            correctAnswer = word.es;
            let otherOptions = [];
            while (otherOptions.length < 3) {
                let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
                if (rand.es !== correctAnswer && !otherOptions.includes(rand.es)) {
                    otherOptions.push(rand.es);
                }
            }
            options = [correctAnswer, ...otherOptions];
        } else {
            questionText = word.es;
            correctAnswer = word.ru;
            let otherOptions = [];
            while (otherOptions.length < 3) {
                let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
                if (rand.ru !== correctAnswer && !otherOptions.includes(rand.ru)) {
                    otherOptions.push(rand.ru);
                }
            }
            options = [correctAnswer, ...otherOptions];
        }

        options = shuffleArray(options);

        questions.push({
            vocabIndex: randomIndex,
            questionText,
            correctAnswer,
            options,
            type: isRu2Es ? 'ru2es' : 'es2ru'
        });
    }
    return questions;
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ========== RENDER QUIZ ==========
function renderQuizScreen(mode = 'ru2es') {
    currentScreen = 'quiz';
    quizMode = mode;
    currentQuestions = generateQuizQuestions(quizMode);
    currentQuestionIndex = 0;
    score = 0;
    mistakesIds = [];
    totalQuestions = currentQuestions.length;

    const clone = quizTemplate.content.cloneNode(true);
    appContent.innerHTML = '';
    appContent.appendChild(clone);

    const modeTitle = document.getElementById('quizModeTitle');
    const modeNames = {
        'ru2es': 'Ruso → Español',
        'es2ru': 'Español → Ruso',
        'mixed': 'Mixto'
    };
    modeTitle.textContent = `Quiz: ${modeNames[quizMode]}`;

    document.getElementById('backToDictFromQuiz').addEventListener('click', renderDictScreen);
    document.getElementById('backToDictFromResult').addEventListener('click', renderDictScreen);
    
    updateProgressAndScore();
    renderQuestion(currentQuestionIndex);

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion(currentQuestionIndex);
        } else {
            showQuizResult();
        }
        updateProgressAndScore();
    });

    document.getElementById('retryMistakesBtn')?.addEventListener('click', retryMistakes);
    document.getElementById('playAgainBtn')?.addEventListener('click', () => renderQuizScreen(quizMode));
}

function updateProgressAndScore() {
    const progressBar = document.getElementById('progressBar');
    const scoreCounter = document.getElementById('scoreCounter');
    if (progressBar) {
        const percent = (currentQuestionIndex / totalQuestions) * 100;
        progressBar.style.width = `${percent}%`;
    }
    if (scoreCounter) {
        scoreCounter.textContent = `Correctas: ${score} / ${totalQuestions}`;
    }
}

function renderQuestion(index) {
    const q = currentQuestions[index];
    if (!q) return;

    const questionWordEl = document.getElementById('questionWord');
    const optionsContainer = document.getElementById('optionsContainer');
    const nextBtn = document.getElementById('nextBtn');

    questionWordEl.textContent = q.questionText;
    
    if (q.type === 'es2ru') {
        const wordData = VOCAB[q.vocabIndex];
        if (wordData) {
            questionWordEl.innerHTML = `${wordData.es} <span style="font-size: 1rem; color: var(--text-secondary);">${wordData.ipa}</span>`;
        }
    }

    optionsContainer.innerHTML = '';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', (e) => handleAnswer(e, q.correctAnswer, q.vocabIndex));
        optionsContainer.appendChild(btn);
    });

    nextBtn.disabled = true;
}

function handleAnswer(event, correctAnswer, vocabIndex) {
    const selectedBtn = event.target;
    const allOptions = document.querySelectorAll('.option-btn');
    const nextBtn = document.getElementById('nextBtn');

    allOptions.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedBtn.textContent === correctAnswer);
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('wrong');
        allOptions.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
        if (!mistakesIds.includes(vocabIndex)) {
            mistakesIds.push(vocabIndex);
        }
    }

    updateProgressAndScore();
    nextBtn.disabled = false;
}

function showQuizResult() {
    document.querySelector('.quiz-card').classList.add('hidden');
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.classList.remove('hidden');
    
    const resultStats = document.getElementById('resultStats');
    const percent = Math.round((score / totalQuestions) * 100);
    resultStats.innerHTML = `✅ ${score} / ${totalQuestions} (${percent}%)`;
}

function retryMistakes() {
    if (mistakesIds.length === 0) {
        alert('¡Sin errores! ¡Excelente trabajo!');
        renderQuizScreen(quizMode);
        return;
    }
    
    const mistakeWords = mistakesIds.map(id => VOCAB[id]);
    const mistakeQuestions = [];
    
    mistakeWords.forEach((word, idx) => {
        let otherOptions = [];
        while (otherOptions.length < 3) {
            let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
            if (rand.es !== word.es && !otherOptions.includes(rand.es)) {
                otherOptions.push(rand.es);
            }
        }
        let options = [word.es, ...otherOptions];
        options = shuffleArray(options);
        mistakeQuestions.push({
            vocabIndex: mistakesIds[idx],
            questionText: word.ru,
            correctAnswer: word.es,
            options,
            type: 'ru2es'
        });
    });

    currentQuestions = mistakeQuestions;
    currentQuestionIndex = 0;
    score = 0;
    mistakesIds = [];
    totalQuestions = currentQuestions.length;

    document.querySelector('.quiz-card').classList.remove('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    renderQuestion(0);
    updateProgressAndScore();
    document.getElementById('quizModeTitle').textContent = 'Quiz: Corregir errores';
}

// ========== INICIO ==========
document.addEventListener('DOMContentLoaded', initApp);
