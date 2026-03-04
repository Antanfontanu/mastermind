// ===== KONFIGŪRACIJA =====

const secretCode = ["red", "blue", "green", "yellow"]; 
const scriptURL = "https://script.google.com/macros/s/AKfycby3e_nwKmtw9BoblSq5S1AXjn391SlI4zSvn2ppQ_2xlCoZenSU4PvTGbYJzzBfr3mO/exec";

const colors = ["red", "blue", "green", "yellow", "orange", "purple"];

let playerName = "";
let attempts = 0;
const maxAttempts = 5;

let selectedColor = null;
let currentGuess = [null, null, null, null];

// ===== PALETĖ =====
const palette = document.querySelector(".palette");

colors.forEach(color => {
    const div = document.createElement("div");
    div.classList.add("color-option");
    div.style.backgroundColor = color;

    div.addEventListener("click", () => {
        selectedColor = color;

        // highlight selected
        document.querySelectorAll(".color-option").forEach(el => {
            el.classList.remove("selected");
        });
        div.classList.add("selected");
    });

    palette.appendChild(div);
});

// ===== SLOT PASIRINKIMAS =====
document.querySelectorAll(".slot").forEach(slot => {
    slot.addEventListener("click", () => {
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
        alert(`LAIMĖJAI per ${attempts} spėjimus!`);
        saveResult(true);
        disableGame();
        return;
    }

    // check max attempts
    if (attempts === maxAttempts) {
        alert("Pralaimėjai!");
        saveResult(false);
        disableGame();
        showSecretCode();
        return;
    }

    resetSlots();
    updateAttemptInfo();
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
    document.querySelector("button").disabled = true;
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