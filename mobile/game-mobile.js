const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Хитбокс для Change Name
let changeNameHitbox = {
    x1: canvas.width - 200,
    x2: canvas.width - 20,
    y1: canvas.height - 50,
    y2: canvas.height - 10
};

// Картинки
const ballImg = new Image();
ballImg.src = '/ball.png';

const brickImages = [
    Object.assign(new Image(), { src: '/brick1.png' }),
    Object.assign(new Image(), { src: '/brick2.png' }),
    Object.assign(new Image(), { src: '/brick3.png' }),
    Object.assign(new Image(), { src: '/brick4.png' }),
    Object.assign(new Image(), { src: '/brick5.png' }),
    Object.assign(new Image(), { src: '/brick6.png' }),
];

const backImg = new Image();
backImg.src = '/back.png';

// Звуки
const hitSound = new Audio('/hit.mp3');
const lostSound = new Audio('/lost.mp3');
const startSound = new Audio('/start.mp3');
const finishSound = new Audio('/finish.mp3');

hitSound.volume = 0.3;
lostSound.volume = 0.1;
startSound.volume = 0.4;
finishSound.volume = 0.4;

let soundOn = true;

function updateSoundVolume() {
    const v = soundOn ? 1 : 0;
    hitSound.volume = 0.3 * v;
    lostSound.volume = 0.1 * v;
    startSound.volume = 0.4 * v;
    finishSound.volume = 0.4 * v;

    if (!soundOn) {
        hitSound.pause();
        lostSound.pause();
        startSound.pause();
        finishSound.pause();
    }
}

updateSoundVolume();

// Игрок и лидерборд
let playerName = localStorage.getItem('playerName') || 'Игрок';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function addScoreToLeaderboard(score) {
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function startGame() {
    gameRunning = true;
    if (soundOn) {
        startSound.currentTime = 0;
        startSound.play();
    }
    gameLoop();
}

// Игровые объекты
let paddle = { x: 350, y: 550, width: 100, height: 15, speed: 8 };
let ball = { x: 400, y: 500, radius: 8, dx: 4, dy: -4 };
let bricks = [];
let score = 0;
let lives = 3;
let gameRunning = false;

// Генерация кирпичей
function initBricks() {
    bricks = [];
    const brickW = 40;
    const brickH = 40;
    const offsetX = 10;
    const offsetY = 40;

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 18; col++) {
            let hits;
            if (row === 0) {
                hits = 3;
            } else if (row === 1) {
                hits = 2;
            } else {
                hits = 1;
            }

            bricks.push({
                x: col * (brickW + 4) + offsetX,
                y: row * (brickH + 6) + offsetY,
                width: brickW,
                height: brickH,
                status: 1,
                type: row,
                hits
            });
        }
    }
}

initBricks();

// Клавиатура
let keys = {};
window.addEventListener('keydown', (e) => (keys[e.keyCode] = true));
window.addEventListener('keyup', (e) => (keys[e.keyCode] = false));

// Тач-управление
canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const x = (touch.clientX - rect.left) * scaleX;

    paddle.x = x - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > canvas.width - paddle.width) {
        paddle.x = canvas.width - paddle.width;
    }

    e.preventDefault();
}, { passive: false });

// Отрисовка
function draw() {
    // Фон
    if (backImg.complete) {
        ctx.drawImage(backImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Ракетка
    const gradient = ctx.createLinearGradient(
        paddle.x,
        paddle.y,
        paddle.x + paddle.width,
        paddle.y + paddle.height
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#cc3da4');
    gradient.addColorStop(1, '#990077');

    ctx.shadowColor = '#cc3da4';
    ctx.shadowBlur = 20;
    ctx.fillStyle = gradient;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.shadowColor = '#cc3da4';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#cc3da4';
    ctx.lineWidth = 1;
    ctx.strokeRect(paddle.x + 1, paddle.y + 1, paddle.width - 2, paddle.height - 2);

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Шарик
    if (ballImg.complete) {
        ctx.drawImage(
            ballImg,
            ball.x - ball.radius,
            ball.y - ball.radius,
            ball.radius * 5,
            ball.radius * 5
        );
    } else {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0';
        ctx.fill();
        ctx.closePath();
    }

    // Кирпичи
    bricks.forEach((brick) => {
        if (brick.status === 1) {
            const img = brickImages[brick.type];
            if (img.complete) {
                ctx.drawImage(img, brick.x, brick.y, brick.width, brick.height);
            } else {
                ctx.fillStyle = '#888';
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        }
    });

    // HUD: счёт / имя / жизни
    ctx.font = 'bold 24px Switzer, Arial';
    ctx.fillStyle = '#cc3da4';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = '#cc3da4';
    ctx.shadowBlur = 10;
    ctx.fillText('Score: ' + score, 10, 10);

    ctx.font = '24px Switzer, Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Player: ' + playerName, canvas.width / 2, 10);

    ctx.font = 'bold 24px Switzer, Arial';
    ctx.fillStyle = '#cc3da4';
    ctx.textAlign = 'left';
    ctx.fillText('Lives: ' + lives, 700, 10);

    ctx.shadowBlur = 0;

    // Стартовый экран
    if (!gameRunning && lives > 0 && score === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#cc3da4';
        ctx.font = 'bold 48px Switzer, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#cc3da4';
        ctx.shadowBlur = 20;
        ctx.fillText('Press Enter to start', canvas.width / 2, canvas.height / 2);

        ctx.shadowBlur = 0;
        ctx.font = 'bold 26px Switzer, Arial';
        ctx.fillText('Left + Right to move', canvas.width / 2, canvas.height / 2 + 50);
    }

    // Game Over
    if (!gameRunning && lives <= 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#cc3da4';
        ctx.font = 'bold 64px Switzer, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#cc3da4';
        ctx.shadowBlur = 30;
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Switzer, Arial';
        ctx.fillText('Your score: ' + score, canvas.width / 2, canvas.height / 2 + 20);

        ctx.fillStyle = '#cc3da4';
        ctx.font = '32px Switzer, Arial';
        ctx.fillText('Enter - New Game', canvas.width / 2, canvas.height / 2 + 70);

        ctx.font = '20px Switzer, Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Top players:', canvas.width / 2, canvas.height / 2 + 120);

        leaderboard.forEach((entry, i) => {
            const y = canvas.height / 2 + 150 + i * 25;
            ctx.fillStyle = i === 0 ? '#ffd700' : '#cc3da4';
            ctx.font = i === 0 ? 'bold 24px Switzer, Arial' : '20px Switzer, Arial';
            ctx.fillText(`${i + 1}. ${entry.name} — ${entry.score}`, canvas.width / 2, y);
        });

        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.font = '18px Switzer, Arial';
        ctx.fillStyle = '#cc3da4';
        ctx.shadowColor = '#cc3da4';
        ctx.shadowBlur = 10;
        ctx.fillText('Change Name', canvas.width - 20, canvas.height - 20);
        ctx.shadowBlur = 0;

        changeNameHitbox = {
            x1: canvas.width - 200,
            x2: canvas.width - 20,
            y1: canvas.height - 50,
            y2: canvas.height - 10
        };
    }

    // You Win
    if (!gameRunning && lives > 0 && bricks.every(brick => brick.status === 0)) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#cc3da4';
        ctx.font = 'bold 64px Switzer, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#cc3da4';
        ctx.shadowBlur = 30;
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 40);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Switzer, Arial';
        ctx.fillText('Your score: ' + score, canvas.width / 2, canvas.height / 2 + 20);

        ctx.fillStyle = '#cc3da4';
        ctx.font = '32px Switzer, Arial';
        ctx.fillText('Enter - New Game', canvas.width / 2, canvas.height / 2 + 70);

        ctx.font = '20px Switzer, Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Top players:', canvas.width / 2, canvas.height / 2 + 120);

        leaderboard.forEach((entry, i) => {
            const y = canvas.height / 2 + 150 + i * 25;
            ctx.fillStyle = i === 0 ? '#ffd700' : '#cc3da4';
            ctx.font = i === 0 ? 'bold 24px Switzer, Arial' : '20px Switzer, Arial';
            ctx.fillText(`${i + 1}. ${entry.name} — ${entry.score}`, canvas.width / 2, y);
        });

        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.font = '18px Switzer, Arial';
        ctx.fillStyle = '#cc3da4';
        ctx.shadowColor = '#cc3da4';
        ctx.shadowBlur = 10;
        ctx.fillText('Change Name', canvas.width - 20, canvas.height - 20);
        ctx.shadowBlur = 0;

        changeNameHitbox = {
            x1: canvas.width - 200,
            x2: canvas.width - 20,
            y1: canvas.height - 50,
            y2: canvas.height - 10
        };
    }

    // Иконка звука
    const iconX = 36;
    const iconY = canvas.height - 36;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '36px Switzer, Arial';
    ctx.fillStyle = soundOn ? '#cc3da4' : '#666666';
    ctx.shadowColor = soundOn ? '#cc3da4' : 'transparent';
    ctx.shadowBlur = soundOn ? 10 : 0;
    ctx.fillText(soundOn ? '♪' : '🔇', iconX, iconY);
    ctx.restore();
}

// Игровой цикл
function gameLoop() {
    if (!gameRunning) return;

    if (bricks.every(brick => brick.status === 0)) {
        gameRunning = false;
        if (soundOn) {
            finishSound.currentTime = 0;
            finishSound.play();
        }
        addScoreToLeaderboard(score);
        return;
    }

    if (keys[37] && paddle.x > 0) paddle.x -= paddle.speed;
    if (keys[39] && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    if (ball.y - ball.radius > canvas.height) {
        lives--;
        if (soundOn) {
            lostSound.currentTime = 0;
            lostSound.play();
        }

        if (lives <= 0) {
            gameRunning = false;
            if (soundOn) {
                finishSound.currentTime = 0;
                finishSound.play();
            }
            addScoreToLeaderboard(score);
        } else {
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 60;
            ball.dx = 4;
            ball.dy = -4;
            paddle.x = (canvas.width - paddle.width) / 2;
        }
    }

    if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.dy = -Math.abs(ball.dy);
        const hitPos = ball.x - (paddle.x + paddle.width / 2);
        ball.dx = hitPos * 0.15;
        if (soundOn) {
            hitSound.currentTime = 0;
            hitSound.play();
        }
    }

    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (
            brick.status === 1 &&
            ball.x > brick.x &&
            ball.x < brick.x + brick.width &&
            ball.y - ball.radius < brick.y + brick.height &&
            ball.y + ball.radius > brick.y
        ) {
            brick.hits -= 1;
            if (brick.hits <= 0) {
                brick.status = 0;
                score += 10;
            }
            ball.dy = -ball.dy;
            if (soundOn) {
                hitSound.currentTime = 0;
                hitSound.play();
            }
            break;
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Старт игры (Enter)
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        if (
            !gameRunning &&
            (lives <= 0 || bricks.every(brick => brick.status === 0))
        ) {
            score = 0;
            lives = 3;
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 60;
            ball.dx = 4;
            ball.dy = -4;
            paddle.x = (canvas.width - paddle.width) / 2;
            initBricks();
        }

        gameRunning = true;
        if (soundOn) {
            startSound.currentTime = 0;
            startSound.play();
        }
        gameLoop();
    }
});

// Старт игры по тапу
canvas.addEventListener('touchstart', (e) => {
    if (!gameRunning) {
        if (lives <= 0 || bricks.every(brick => brick.status === 0)) {
            score = 0;
            lives = 3;
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 60;
            ball.dx = 4;
            ball.dy = -4;
            paddle.x = (canvas.width - paddle.width) / 2;
            initBricks();
        }

        gameRunning = true;
        if (soundOn) {
            startSound.currentTime = 0;
            startSound.play();
        }
        gameLoop();
    }

    e.preventDefault();
}, { passive: false });

// Имя игрока
let showNameInput = !localStorage.getItem('playerName');

if (showNameInput) {
    document.getElementById('nameInput').style.display = 'block';
}

function saveName() {
    const input = document.getElementById('playerName');
    const name = input.value.trim() || 'Player Name';
    localStorage.setItem('playerName', name);
    document.getElementById('nameInput').style.display = 'none';
    playerName = name;
}

function handleNameInputKey(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        saveName();
    }
}

// Клики по canvas
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hb = changeNameHitbox;

    if (
        !gameRunning &&
        x >= hb.x1 && x <= hb.x2 &&
        y >= hb.y1 && y <= hb.y2
    ) {
        document.getElementById('nameInput').style.display = 'block';
        return;
    }

    const iconX1 = 10;
    const iconX2 = 50;
    const iconY1 = canvas.height - 50;
    const iconY2 = canvas.height - 10;

    if (x >= iconX1 && x <= iconX2 && y >= iconY1 && y <= iconY2) {
        soundOn = !soundOn;
        updateSoundVolume();
    }
});

// Тапы по Change Name и ноте
canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    const hb = changeNameHitbox;

    if (
        !gameRunning &&
        x >= hb.x1 && x <= hb.x2 &&
        y >= hb.y1 && y <= hb.y2
    ) {
        document.getElementById('nameInput').style.display = 'block';
        e.preventDefault();
        return;
    }

    const iconX1 = 10;
    const iconX2 = 50;
    const iconY1 = canvas.height - 50;
    const iconY2 = canvas.height - 10;

    if (x >= iconX1 && x <= iconX2 && y >= iconY1 && y <= iconY2) {
        soundOn = !soundOn;
        updateSoundVolume();
        e.preventDefault();
    }
}, { passive: false });

// Рендер-цикл
function renderLoop() {
    draw();
    requestAnimationFrame(renderLoop);
}

renderLoop();
