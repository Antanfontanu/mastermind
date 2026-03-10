// ===== KONFIGŪRACIJA =====

const secretCode = ["#C6B7F9", "#FFB1ED", "#FFBD9F", "#F9F871"]; 
const scriptURL = "https://script.google.com/macros/s/AKfycby3e_nwKmtw9BoblSq5S1AXjn391SlI4zSvn2ppQ_2xlCoZenSU4PvTGbYJzzBfr3mO/exec";

const colors = ["#6DD2B8", "#83ADF1","#C6B7F9", "#FFB1ED", "#FFBD9F", "#F9F871"];

const winGif = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExajRmZzRuc29yYXQ2eHB3bWsxNDMycTllcTlyeXJvenJpajh4NDI4ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/a0h7sAqON67nO/giphy.gif";

const loseGif = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2NidTZ0czA4eGIxMDY0cGkwaTdyZmFsNWp4cW1md2dxbXVydTIxcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10h8CdMQUWoZ8Y/giphy.gif";

let playerName = "";
let attempts = 0;
const maxAttempts = 5;

let selectedColor = null;
let currentGuess = [null, null, null, null];

let gameLocked = false;

// ===== PALETĖ =====
const palette = document.querySelector(".palette");

colors.forEach(color => {
    const div = document.createElement("div");
    div.classList.add("color-option");
    div.style.backgroundColor = color;

    div.addEventListener("click", () => {
        if (gameLocked) return;
        // surandam pirma laisvą slot
        const index = currentGuess.indexOf(null);

        if (index === -1) return; // jei visi užpildyti

        currentGuess[index] = color;

        const slot = document.querySelector(`.slot[data-index="${index}"]`);
        slot.style.backgroundColor = color;
});

    palette.appendChild(div);
});

// ===== SLOT PASIRINKIMAS =====
document.querySelectorAll(".slot").forEach(slot => {
    slot.addEventListener("click", () => {
        if (gameLocked) return;
        if (!selectedColor) return;

        const index = slot.getAttribute("data-index");
        slot.style.backgroundColor = selectedColor;
        currentGuess[index] = selectedColor;
    });
});

// ===== START ŽAIDIMO =====
function startGame() {
    playerName = document.getElementById("playerName").value;
    if (!playerName) {
        alert("Įvesk vardą!");
        return;
    }

    document.getElementById("login").style.display = "none";
    document.getElementById("game").style.display = "block";

    updateAttemptInfo();
}

function updateAttemptInfo() {
    document.getElementById("attemptInfo").innerText =
        `Spėjimas ${attempts + 1} iš ${maxAttempts}`;
}

// ===== SPĖJIMAS =====
function makeGuess() {
    if (gameLocked) return;
    if (attempts >= maxAttempts) return;

    if (currentGuess.includes(null)) {
        alert("Užpildyk visas 4 spalvas!");
        return;
    }

    const guess = [...currentGuess];
    const result = evaluateGuess(guess);
    attempts++;

    // rodom spėjimą su rutuliukais ir peg’ais
    addGuessToHistory(guess, result);

    // check win
    if (result.black === 4) {
        saveResult(true);
        showResult(true);
        disableGame();
        return;
    }

    // check max attempts
    if (attempts === maxAttempts) {
        saveResult(false);
        showResult(false);
        disableGame();
        showSecretCode();
        return;
    }

    resetSlots();
    updateAttemptInfo();
}

function removeLast() {

    // surandam paskutinį užpildytą slot
    const index = currentGuess.lastIndexOf(
        currentGuess.slice().reverse().find(c => c !== null)
    );

    if (index === -1) return;

    currentGuess[index] = null;

    const slot = document.querySelector(`.slot[data-index="${index}"]`);
    slot.style.backgroundColor = "lightgray";
}

// ===== VERTINIMAS =====
function evaluateGuess(guess) {
    let black = 0;
    let white = 0;

    const secretCopy = [...secretCode];
    const guessCopy = [...guess];

    for (let i = 0; i < 4; i++) {
        if (guessCopy[i] === secretCopy[i]) {
            black++;
            secretCopy[i] = null;
            guessCopy[i] = null;
        }
    }

    for (let i = 0; i < 4; i++) {
        if (guessCopy[i]) {
            const index = secretCopy.indexOf(guessCopy[i]);
            if (index !== -1) {
                white++;
                secretCopy[index] = null;
            }
        }
    }

    return { black, white };
}

function showResult(win) {

    const box = document.getElementById("resultBox");
    const text = document.getElementById("resultText");
    const attemptsText = document.getElementById("resultAttempts");
    const gif = document.getElementById("resultGif");

    box.style.display = "block";

    if (win) {
        text.innerText = "Laimėjai!";
        attemptsText.innerText = `Atspėjai per ${attempts} bandymus`;
        gif.src = winGif;
    } else {
        text.innerText = "Pralaimėjai";
        attemptsText.innerText = `Nepavyko atspėti per ${maxAttempts} bandymus`;
        gif.src = loseGif;
    }
}

// ===== RODOM SPĖJIMUS SU PEG =====
function addGuessToHistory(guess, result) {

    const history = document.getElementById("history");

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "center";
    row.style.alignItems = "center";
    row.style.margin = "10px 0";

    // Spalvoti rutuliukai
    guess.forEach(color => {
        const ball = document.createElement("div");
        ball.style.width = "22px";
        ball.style.height = "22px";
        ball.style.borderRadius = "50%";
        ball.style.margin = "4px";
        ball.style.backgroundColor = color;
        ball.style.border = "1px solid black";
        row.appendChild(ball);
    });

    // Feedback (black/white peg’ai)
    const feedback = document.createElement("div");
    feedback.style.display = "grid";
    feedback.style.gridTemplateColumns = "repeat(2, 10px)";
    feedback.style.gap = "4px";
    feedback.style.marginLeft = "12px";

    for (let i = 0; i < result.black; i++) {
        const peg = document.createElement("div");
        peg.style.width = "10px";
        peg.style.height = "10px";
        peg.style.borderRadius = "50%";
        peg.style.backgroundColor = "black";
        feedback.appendChild(peg);
    }

    for (let i = 0; i < result.white; i++) {
        const peg = document.createElement("div");
        peg.style.width = "10px";
        peg.style.height = "10px";
        peg.style.borderRadius = "50%";
        peg.style.backgroundColor = "white";
        peg.style.border = "1px solid black";
        feedback.appendChild(peg);
    }

    row.appendChild(feedback);
    history.appendChild(row);
}

// ===== RODOM SLAPTĄ KODĄ =====
function showSecretCode() {
    const history = document.getElementById("history");

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "center";
    row.style.alignItems = "center";
    row.style.marginTop = "10px";

    const text = document.createElement("p");
    text.innerText = "Kodas buvo:";
    text.style.marginRight = "10px";
    row.appendChild(text);

    secretCode.forEach(color => {
        const ball = document.createElement("div");
        ball.style.width = "25px";
        ball.style.height = "25px";
        ball.style.borderRadius = "50%";
        ball.style.margin = "3px";
        ball.style.backgroundColor = color;
        ball.style.border = "1px solid black";
        row.appendChild(ball);
    });

    history.appendChild(row);
}

// ===== PAGALBINĖS =====
function resetSlots() {
    currentGuess = [null, null, null, null];
    document.querySelectorAll(".slot").forEach(slot => {
        slot.style.backgroundColor = "lightgray";
    });
}

function disableGame() {
    gameLocked = true;

    document.querySelectorAll("button").forEach(btn => {
        btn.disabled = true;
    });
}

// ===== SAUGOJAM REZULTATUS =====
function saveResult(win) {
    fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify({
            name: playerName,
            attempts: attempts,
            win: win,
            date: new Date().toISOString()
        })
    });
}
