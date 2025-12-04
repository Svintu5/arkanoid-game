const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

const ballImg = new Image();
ballImg.src = 'ball.png';

const brickImages = [
    Object.assign(new Image(), { src: 'brick1.png' }),
    Object.assign(new Image(), { src: 'brick2.png' }),
    Object.assign(new Image(), { src: 'brick3.png' }),
    Object.assign(new Image(), { src: 'brick4.png' }),
    Object.assign(new Image(), { src: 'brick5.png' }),
    Object.assign(new Image(), { src: 'brick6.png' })
];

const backImg = new Image();
backImg.src = 'back.png';

const hitSound = new Audio('hit.mp3');
const lostSound = new Audio('lost.mp3');
const startSound = new Audio('start.mp3');
const finishSound = new Audio('finish.mp3');

hitSound.volume = 0.3;
lostSound.volume = 0.1;
startSound.volume = 0.4;
finishSound.volume = 0.4;

// Игровые объекты
let paddle = { x: 350, y: 550, width: 100, height: 15, speed: 8 };
let ball = { x: 400, y: 500, radius: 8, dx: 4, dy: -4 };
let bricks = [];
let score = 0;
let lives = 3;
let gameRunning = false;

function initBricks() {
    bricks = [];
    const brickW = 40;
    const brickH = 40;
    const offsetX = 10;
    const offsetY = 40;

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 18; col++) {
            const type = row;
            bricks.push({
                x: col * (brickW + 4) + offsetX,
                y: row * (brickH + 6) + offsetY,
                width: brickW,
                height: brickH,
                status: 1,
                type: type
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
    // Фон
    if (backImg.complete) {
        ctx.drawImage(backImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
   // Ракетка с градиентом и свечением
const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y + paddle.height);
gradient.addColorStop(0, '#ffffff');
gradient.addColorStop(0.5, '#cc3da4');
gradient.addColorStop(1, '#990077');

ctx.shadowColor = '#cc3da4';
ctx.shadowBlur = 20;
ctx.fillStyle = gradient;
ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

// Контур
ctx.shadowBlur = 0;
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 3;
ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

// Свечение края
ctx.shadowColor = '#cc3da4';
ctx.shadowBlur = 8;
ctx.strokeStyle = '#cc3da4';
ctx.lineWidth = 1;
ctx.strokeRect(paddle.x + 1, paddle.y + 1, paddle.width - 2, paddle.height - 2);

// Сброс свечения
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
    
    // Кирпичи как картинки
    bricks.forEach(brick => {
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
    
// Счёт в левый верхний угол
ctx.font = '20px Switzer, Arial';
ctx.fillStyle = '#cc3da4'; // основной цвет
ctx.textAlign = 'left';
ctx.textBaseline = 'top';
ctx.shadowColor = '#cc3da4';
ctx.shadowBlur = 10;

ctx.fillText('Score: ' + score, 10, 10);


// жизни в правый верхний угол
ctx.font = '20px Switzer, Arial';
ctx.fillStyle = '#cc3da4'; // основной цвет
ctx.textAlign = 'right';
ctx.textBaseline = 'top';
ctx.shadowColor = '#cc3da4';
ctx.shadowBlur = 10;

ctx.fillText('Lives: ' + lives, 10, 40);

ctx.shadowBlur = 0; // убрать свечения дальше

    
    // Сообщение перед стартом
if (!gameRunning && lives > 0 && score === 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#cc3da4'; // основной цвет
    ctx.font = 'bold 48px Switzer, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#cc3da4'; // свечение
    ctx.shadowBlur = 20;
    ctx.fillText('Press Enter to start', canvas.width / 2, canvas.height / 2);
    
    ctx.shadowBlur = 0;
}
    // Сообщение Game Over
if (!gameRunning && lives <= 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#cc3da4'; // Game Over тоже #cc3da4
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
    
    ctx.fillStyle = '#cc3da4'; // кнопка тоже #cc3da4
    ctx.font = '32px Switzer, Arial';
    ctx.fillText('Enter - New Game', canvas.width / 2, canvas.height / 2 + 70);
}

}

// Игровой цикл
function gameLoop() {
    if (!gameRunning) {
        return;
    }

    // Движение ракетки
    if (keys[37] && paddle.x > 0) paddle.x -= paddle.speed;
    if (keys[39] && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;
    
    // Движение шарика
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Отскок от стен
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Выпадение вниз
    if (ball.y - ball.radius > canvas.height) {
        lives--;
        lostSound.currentTime = 0;
        lostSound.play();

        if (lives <= 0) {
            gameRunning = false;
            finishSound.currentTime = 0;
            finishSound.play();
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
        hitSound.currentTime = 0;
        hitSound.play();
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
            hitSound.currentTime = 0;
            hitSound.play();
            break;
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Старт игры (Enter)
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        if (!gameRunning && lives <= 0) {
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
        startSound.currentTime = 0;
        startSound.play();
        gameLoop();
    }
});

// Постоянный цикл отрисовки
function renderLoop() {
    draw();
    requestAnimationFrame(renderLoop);
}

renderLoop();
