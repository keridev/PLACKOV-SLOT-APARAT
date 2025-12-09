const symbols = ['kafe', 'zalizak', 'menche', 'rs6', 'honda', 'kameri'];
const symbolIcons = {
    kafe: '<img src="images/kafe.jpg" alt="kafe">',
    zalizak: '<img src="images/zalizak.jpg" alt="zalizak">',
    menche: '<img src="images/menche.jpg" alt="menche">',
    rs6: '<img src="images/rs6.jpg" alt="rs6">',
    honda: '<img src="images/honda.jpg" alt="honda">',
    kameri: '<img src="images/kameri.png" alt="kameri">'
};
const payouts = {
    honda: 1,
    zalizak: 2,
    menche: 5,
    kafe: 10,
    rs6: 25,
    kameri: 100
};

let balance = 100;
let bet = 1;
let isSpinning = false;

const reels = document.querySelectorAll('.reel');
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('betAmount');
const spinBtn = document.getElementById('spinBtn');
const messageEl = document.getElementById('message');
const decreaseBetBtn = document.getElementById('decreaseBet');
const increaseBetBtn = document.getElementById('increaseBet');

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateDisplay() {
    balanceEl.textContent = balance;
    betAmountEl.textContent = bet;
}

function showMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    if (text === '') {
        messageEl.style.minHeight = '50px';
    }
}

decreaseBetBtn.addEventListener('click', () => {
    if (bet > 1 && !isSpinning) {
        bet--;
        updateDisplay();
        showMessage('');
    } else if (bet === 1) {
        showMessage('MINIMUM BET LIMIT', 'limit');
        setTimeout(() => showMessage(''), 2000);
    }
});

increaseBetBtn.addEventListener('click', () => {
    if (bet < 100 && bet < balance && !isSpinning) {
        bet++;
        updateDisplay();
        showMessage('');
    } else if (bet >= 100) {
        showMessage('MAX BET LIMIT', 'limit');
        setTimeout(() => showMessage(''), 2000);
    } else if (bet >= balance) {
        showMessage('INSUFFICIENT BALANCE', 'limit');
        setTimeout(() => showMessage(''), 2000);
    }
});

// NOTE: The original code had a syntax error in the event listener:
// spinBtn.addEventListener('click','space_bar_press' () => { ...
// It has been corrected to the standard format below.

spinBtn.addEventListener('click', () => {
    if (isSpinning || balance < bet) {
        if (balance < bet) {
            showMessage('INSUFFICIENT BALANCE', 'limit');
            setTimeout(() => showMessage(''), 2000);
        }
        return;
    }

    spin();
});

async function spin() {
    isSpinning = true;
    spinBtn.disabled = true;
    balance -= bet;
    updateDisplay();
    showMessage('');

    document.querySelectorAll('.payline').forEach(line => line.classList.remove('active'));

    reels.forEach(reel => reel.classList.add('spinning'));

    const results = [];
    for (let i = 0; i < 9; i++) {
        results.push(getRandomSymbol());
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    reels.forEach((reel, i) => {
        reel.classList.remove('spinning');
        const symbol = reel.querySelector('.symbol');
        symbol.className = 'symbol ' + results[i];
        symbol.innerHTML = symbolIcons[results[i]];
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    checkWin(results);

    isSpinning = false;
    spinBtn.disabled = false;
}

function checkWin(results) {
    // Defines the winning rows and diagonals (0-indexed positions on the 3x3 grid)
    const paylines = [
        [0, 1, 2], // Top Row
        [3, 4, 5], // Middle Row
        [6, 7, 8], // Bottom Row
        [0, 4, 8], // Diagonal top-left to bottom-right
        [2, 4, 6]  // Diagonal top-right to bottom-left
    ];

    let totalWin = 0;
    let winningLines = [];
    let jackpotWon = false;

    paylines.forEach((line, index) => {
        const [a, b, c] = line;
        const symbol = results[a];

        if (results[a] === results[b] && results[b] === results[c]) {
            // Special handling for the 'kameri' jackpot symbol
            if (symbol === 'kameri') {
                // Check if jackpot has already been applied in this spin (to avoid double-counting on multiple lines)
                if (!jackpotWon) {
                    totalWin += payouts[symbol] * bet;
                    winningLines.push(index);
                    jackpotWon = true;
                }
            } else {
                totalWin += payouts[symbol] * bet;
                winningLines.push(index);
            }
        }
    });

    if (totalWin > 0) {
        balance += totalWin;
        updateDisplay();

        winningLines.forEach(lineIndex => {
            // Note: The index in paylines corresponds directly to the CSS class numbers (line-0, line-1, etc.)
            document.querySelectorAll('.payline')[lineIndex].classList.add('active');
        });

        if (jackpotWon) {
            showMessage(`🎉 JACKPOT! WON ${totalWin} VLAKNA! 🎉`, 'jackpot');
        } else {
            showMessage(`YOU WIN ${totalWin} VLAKNA!`, 'win');
        }
    } else {
        showMessage('TRY AGAIN');
        setTimeout(() => showMessage(''), 2000);
    }
}

// Initial setup
updateDisplay();