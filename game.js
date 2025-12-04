const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

const ballImg = new Image();
ballImg.src = 'ball.png';   // файл ball.png лежит рядом с game.js

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
    bricks.forEach(brick => {
        if (brick.status === 1) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
    
    scoreEl.textContent = score;
    livesEl.textContent = lives;

    // Сообщение перед стартом
    if (!gameRunning && lives > 0 && score === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press Enter to start', canvas.width / 2, canvas.height / 2);
    }

    // Сообщение об окончании игры (проигрыш)
    if (!gameRunning && lives <= 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game over', canvas.width / 2, canvas.height / 2 - 20);

        ctx.font = '24px Arial';
        ctx.fillText('Счёт: ' + score + ' (Enter - new Game)', canvas.width / 2, canvas.height / 2 + 20);
    }

}

// Игровой цикл
function gameLoop() {
    if (!gameRunning) {
        // Рисуем финальный кадр (с оверлеем, если жизней нет)
        draw();
        return;
    }

    // Движение ракетки
    if (keys[37] && paddle.x > 0) paddle.x -= paddle.speed; // ←
    if (keys[39] && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed; // →
    
    // Движение шарика
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Отскок от вертикальных стен
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    // Отскок от верхней границы
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Выпадение вниз
    if (ball.y - ball.radius > canvas.height) {
        lives--;
        if (lives <= 0) {
            gameRunning = false; // draw покажет Game over
        } else {
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 60;
            ball.dx = 4;
            ball.dy = -4;
            paddle.x = (canvas.width - paddle.width) / 2;
        }
    }

    // Коллизия с ракеткой
    if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.dy = -Math.abs(ball.dy);
        const hitPos = ball.x - (paddle.x + paddle.width / 2);
        ball.dx = hitPos * 0.15;
    }

    // Коллизия с кирпичами
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (
            brick.status === 1 &&
            ball.x > brick.x &&
            ball.x < brick.x + brick.width &&
            ball.y - ball.radius < brick.y + brick.height &&
            ball.y + ball.radius > brick.y
        ) {
            brick.status = 0;
            score += 10;
            ball.dy = -ball.dy;
            break;
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Старт игры (Enter)
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) { // Enter
        if (!gameRunning && lives <= 0) {
            // рестарт после проигрыша
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
        gameLoop();
    }
});

// Первый кадр до старта
draw();
});
