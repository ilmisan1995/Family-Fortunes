let currentRoundIndex = 0;
let teamScores = { 1: 0, 2: 0 };
let currentRoundTotal = 0;
let multiplier = 1;
let isFastMoney = false;
let strikes = { left: 0, right: 0 };

// Database Awal
let database = [{
    q: ["SEBUTKAN BENDA DI DALAM TAS?", ""],
    multiplier: 1,
    a: [
        { text: "BUKU", points: 40 },
        { text: "PULPEN", points: 25 },
        { text: "DOMPET", points: 15 }
    ]
}];

// --- INISIALISASI ---
function startGame() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    initRound();
}

function initRound() {
    isFastMoney = false;
    strikes = { left: 0, right: 0 };
    currentRoundTotal = 0;
    const data = database[currentRoundIndex];
    
    document.getElementById('q-line-1').innerText = data.q[0];
    document.getElementById('q-line-2').innerText = data.q[1];
    document.getElementById('round-val').innerText = "000";
    
    renderNormalGrid(data.a);
}

function renderNormalGrid(answers) {
    const grid = document.getElementById('main-grid');
    grid.className = "main-grid";
    grid.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        // X Kiri
        grid.innerHTML += `<div class="strike-zone left">${'<span class="x-mark">X</span>'.repeat(3)}</div>`;
        
        // Jawaban
        if (i < answers.length) {
            grid.innerHTML += `
                <div class="answer-container" id="ans-${i}" data-text="${answers[i].text}" data-pts="${answers[i].points}">
                    <span>${i+1}. __________________</span>
                    <span>--</span>
                </div>`;
        } else {
            grid.innerHTML += `<div class="answer-container" style="visibility:hidden"></div>`;
        }
        
        // X Kanan
        grid.innerHTML += `<div class="strike-zone right">${'<span class="x-mark">X</span>'.repeat(3)}</div>`;
    }
    
    // Baris 10: Total
    grid.innerHTML += `<div class="empty"></div><div class="answer-container revealed" style="border:none; border-top:2px double var(--led-yellow)"><span>TOTAL</span><span id="grand-total">000</span></div><div class="empty"></div>`;
}

// --- KONTROL GAME ---
function revealAnswer(idx) {
    const el = document.getElementById(`ans-${idx}`);
    if (el && !el.classList.contains('revealed')) {
        const txt = el.dataset.text;
        const pts = parseInt(el.dataset.pts);
        el.classList.add('revealed');
        el.innerHTML = `<span>${idx+1}. ${txt}</span><span>${pts}</span>`;
        currentRoundTotal += (pts * multiplier);
        document.getElementById('grand-total').innerText = currentRoundTotal;
        document.getElementById('round-val').innerText = currentRoundTotal;
        document.getElementById('snd-ding').play();
    }
}

function triggerStrike(side) {
    if (strikes[side] < 3) {
        const marks = document.querySelectorAll(`.strike-zone.${side} .x-mark`);
        marks[strikes[side]].classList.add('active');
        strikes[side]++;
        document.getElementById('snd-buzzer').play();
    }
}

// --- KEYBOARD LISTENER ---
document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;
    const key = e.key.toUpperCase();

    if (key >= '1' && key <= '8') revealAnswer(parseInt(key)-1);
    if (key === 'Z') triggerStrike('left');
    if (key === 'X') triggerStrike('right');
    if (key === 'N') { currentRoundIndex++; initRound(); }
    if (key === 'P') { if(currentRoundIndex > 0) currentRoundIndex--; initRound(); }
    if (key === 'M') backToMenu();
    if (key === 'E') toggleEditMode();
    if (key === '9') addTeamScore(1);
    if (key === '0') addTeamScore(2);
});

function addTeamScore(team) {
    teamScores[team] += currentRoundTotal;
    document.getElementById(`score-team-${team}`).innerText = teamScores[team].toString().padStart(3, '0');
    currentRoundTotal = 0;
    document.getElementById('round-val').innerText = "000";
}

function backToMenu() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
}

// --- EDITOR LOGIC ---
function toggleEditMode() {
    const p = document.getElementById('edit-panel');
    p.style.display = p.style.display === 'none' ? 'flex' : 'none';
    if(p.style.display === 'flex') initEditFields();
}

function initEditFields() {
    const container = document.getElementById('edit-answers-container');
    container.innerHTML = '';
    for(let i=1; i<=8; i++) {
        container.innerHTML += `
            <div style="display:flex; gap:10px; margin-bottom:5px;">
                <input type="text" id="ed-t-${i}" placeholder="Jawaban ${i}" maxlength="35">
                <input type="number" id="ed-p-${i}" placeholder="Poin" style="width:60px">
            </div>`;
    }
}

function saveEdit() {
    let newA = [];
    for(let i=1; i<=8; i++) {
        const t = document.getElementById(`ed-t-${i}`).value;
        const p = document.getElementById(`ed-p-${i}`).value;
        if(t) newA.push({text: t.toUpperCase(), points: parseInt(p) || 0});
    }
    database[currentRoundIndex] = {
        q: [document.getElementById('edit-question').value.toUpperCase(), ""],
        multiplier: parseInt(document.getElementById('edit-multiplier').value),
        a: newA
    };
    initRound();
    toggleEditMode();
}
