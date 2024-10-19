let currentPlayer = 'X';
let isActive = true;
let userStep = true;
let sound = true;

let field = ['', '', '', '', '', '', '', '', ''];
const winField = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const coord = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, -1, 90], [1, 0, 90], [1, 1, 90], [1, 0, 45], [1,0, -45]];

function cellClick(ev) {
    const num = parseInt(ev.target.id);
    if (field[num] !== '' || !isActive || !userStep) return;
    field[num] = currentPlayer;
    resetButton.classList.toggle('active', true);
    drawXO(num);
    findWinner();
    changePlayer();
}

function changePlayer() {
    if (!isActive) return;
    currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
    announceStep();
    if (currentPlayer == 'O') computerStep();
}

function computerStep () {
    let num;
    let arr;
    userStep = false;
    for (let i of winField) {
        //ищем приоритетный вариант для победы gобота
        arr = i.filter((i) => field[i] != 'O');
        if  (arr.length == 1 && field[arr[0]] !== 'X') {
            num =  arr[0];
            break;
        }
        //ищем приоритетный вариант против победы пользователя
        arr = i.filter((i) => field[i] != 'X');
        if  (arr.length == 1 && field[arr[0]] !== 'O') {
            num =  arr[0];
            break;
        }
    }
    // иначе рандомим
    if (num == undefined) {
        while (true) {
            num = Math.floor(Math.floor(Math.random() * (8 + 1)));
            if (field[num] == '') break;
        }
    }
    field[num] = currentPlayer;
    setTimeout(() => {
        drawXO(num);
        findWinner();
        changePlayer();
        userStep = true;
    }, 1000);

}


function drawXO(num) {
    if (currentPlayer == 'X' && sound) writeX.play();
    if (currentPlayer == 'O' && sound) writeO.play();
    document.getElementById(num).innerText = currentPlayer;
}

function announceWinner(player) {
    const messageElement = document.getElementById('gameMessage');
    messageElement.innerText = `Player ${player} Wins!`;
}

function announceDraw() {
    const messageElement = document.getElementById('gameMessage');
    messageElement.innerText = 'Game Draw! Try again!';
}

function announceStep() {
    const messageElement = document.getElementById('gameMessage');
    messageElement.innerText = (currentPlayer == 'X') ? 'Your move!' : 'Computer thinking...';
}

function findWinner() {
    let isWin = false;
    let newLs = Date.now();

    for (let i = 0; i < winField.length; i++) {
        const [a, b, c] = winField[i];
        let k = i;
        if (field[a] && field[a] === field[b] && field[a] === field[c]) {
            isWin = true;
            drawLine(...coord[k]);
            break;
        }
    }

    if (isWin) {
        announceWinner(currentPlayer);
        const prev = localStorage.getItem('results_tictactoe');
        newLs = prev != null ? `${prev};${newLs}` :  newLs;
        if (sound) win.play();
        localStorage.setItem( 'results_tictactoe', `${newLs} - Player ${currentPlayer} win!`);
        isActive = false;
        return;
    }

    let draw = !field.includes('');
    if (draw) {
        announceDraw();
        const prev = localStorage.getItem( `results_tictactoe`);
        newLs = prev != null ? `${prev};${newLs}` :  newLs;
        localStorage.setItem('results_tictactoe', `${newLs} was Draw`);
        if (sound) winDraw.play();
        isActive = false;
        return;
    }
}

function resetGame() {
    if (!userStep) return;
    field = ['', '', '', '', '', '', '', '', ''];
    isActive = true;
    currentPlayer = 'X';
    cells.forEach(cell => {
        cell.innerText = '';
    });
    document.getElementById('gameMessage').innerText = "Let's start! Your move!";
    resetButton.classList.toggle('active');

    line.style.top = '';
    line.style.left = '';
    line.style.transform = '';
    line.style.display = 'none';
}

function showStat () {
    const ul = document.querySelector('.results');
    let text = '';
    let res = localStorage.getItem('results_tictactoe')?.split(';');
    arr = res ? res.sort((a,b) => a-b):[];
    statDashboard.classList.toggle('view');
    if (arr.length == 0) {
        text = '<li>No statistics data available. </li> <li>Play the game to add your results.</li>';
        ul.innerHTML = text;
        return
    };

    let count = 1;
    arr = arr.reverse();
    for (let x of arr) {
        if (count > 10) break
        let pInt = parseInt(x);
        let dt = new Date(pInt);
        text += `<li>${dt.getDate(pInt)}.${dt.getMonth(pInt)}.${dt.getFullYear(pInt)} ${dt.getHours(pInt)}:${dt.getMinutes(pInt)} ${x.replace(pInt, '')}</li>`
        count++;
    }
    ul.innerHTML = text;
}

function drawLine (top, left , deg) {
    line.style.display = 'block';
    line.style.top = `${top*120 + 60}px`;
    line.style.left = `${left*120}px`;
    line.style.transform = `rotate(${deg}deg)`;
};

let line = document.querySelector('.redline');

const cells = document.querySelectorAll('.cell');
cells.forEach(cell => cell.addEventListener('click', cellClick, false));

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetGame, false);

const statButton = document.getElementById('statButton');
statButton.addEventListener('click', showStat, false);

const statDashboard = document.querySelector('.statDashboard');

const closeDashboard = document.querySelector('.close');
closeDashboard.addEventListener('click', showStat, false);

const soundOn = document.querySelector('.sound');
soundOn.addEventListener('click', () => {
    soundOn.classList.toggle('off');
    sound = sound ? false : true;
}, false);



const writeX = new Audio('./audio/write_x.wav');
const writeO = new Audio('./audio/write_o.wav');
const win = new Audio('./audio/win.wav');
const winDraw = new Audio('./audio/draw.wav');
