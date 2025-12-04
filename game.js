const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const ballImg = new Image();
ballImg.src = 'ball.png';

// Игровые объекты
let paddle = { x: 350, y: 550, width: 100, height: 15, speed: 8 };
let ball = { x: 400, y: 500, radius: 8, dx: 4, dy: -4 };
let bricks = [];
let score = 0;
let lives = 3;
let gameRunning = false;

// Создаём кирпичи (5 рядов по 10)
function initBricks() {
    bricks = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
            bricks.push({
                x: col * 78 + 5,
                y: row * 25 + 50,
                width: 75,
                height: 20,
                status: 1,
                color: `hsl(${row * 30}, 70%, 50%)`
            });
        }
    }
}

initBricks();

// Управление клавишами
let keys = {};
window.addEventListener('keydown', (e) => keys[e.keyCode] = true);
window.addEventListener('keyup', (e) => keys[e.keyCode] = false);

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ракетка
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Шарик (картинка + запасной круг)
    if (ballImg.complete) {
        ctx.drawImage(
            ballImg,
            ball.x - ball.radius,
            ball.y - ball.radius,
            ball.radius * 2,
            ball.radius * 2
        );
    } else {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0';
        ctx.fill();
        ctx.closePath();
    }
    
    // Кирпичи
    bricks.forEach(brick => {
        if (brick.status === 1) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
    
    scoreEl.textContent = score;
    livesEl.textContent = lives;

    // Сообщение об окончании игры
    if (!gameRunning && lives <= 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Игра окончена', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '24px Arial';
        ctx.fillText('Счёт: ' + score + ' (Enter — ещё раз)', canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Игровой цикл
function gameLoop() {
    if (!gameRunning) return;
    
    draw();
      
    // Движение ракетки
    if (keys[37] && paddle.x > 0) paddle.x -= paddle.speed; // ←
    if (keys[39] && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed; // →
    
    // Движение шарика
    ball.x
