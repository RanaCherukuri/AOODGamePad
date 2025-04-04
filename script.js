document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("gameContainer");
    const player = document.getElementById("player");
    const scoreDisplay = document.getElementById("score");
    const gameOverDisplay = document.getElementById("gameOver");

    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 600;
    const PLAYER_WIDTH = 40;
    const ENEMY_WIDTH = 40;
    const ENEMY_SPEED = 2;
    const BULLET_SPEED = 3;
    const ENEMY_ROWS = 3;
    const ENEMY_COLS = 5;
    let playerX = 180;
    let score = 0;
    let gameOver = false;
    let enemies = [];
    let bullets = [];
    let canShoot = true;

    // Chart functionality
    const toggleChartButton = document.getElementById("toggleChartButton");
    const closeChartButton = document.getElementById("closeChartButton");
    const chartPopup = document.getElementById("chartPopup");

    const chartCanvas = document.getElementById("scoreChart");
    let chartInstance = null;

    toggleChartButton.addEventListener("click", () => {
        chartPopup.style.display = "block";
        drawScoreChart();
    });

    closeChartButton.addEventListener("click", () => {
        chartPopup.style.display = "none";
    });

    function drawScoreChart() {
        const names = JSON.parse(localStorage.getItem("nameHistory")) || [];
        const scores = JSON.parse(localStorage.getItem("scoreHistory")) || [];

        const combined = names.map((name, i) => ({
            name,
            score: scores[i] || 0
        }));

        const top7 = combined
            .sort((a, b) => b.score - a.score)
            .slice(0, 7);

        const topNames = top7.map(entry => entry.name);
        const topScores = top7.map(entry => entry.score);

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(chartCanvas, {
            type: "bar",
            data: {
                labels: topNames,
                datasets: [{
                    label: "Score",
                    data: topScores,
                    backgroundColor: "rgba(255, 99, 132, 0.6)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: "Top 7 Player Scores"
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Player Name"
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Score"
                        }
                    }
                }
            }
        });
    }

    function saveScore(finalScore) {
        let storedScores = JSON.parse(localStorage.getItem("scoreHistory")) || [];
        let storedNames = JSON.parse(localStorage.getItem("nameHistory")) || [];

        let playerName = prompt("Enter your name:");
        if (!playerName) playerName = "Anonymous";

        storedScores.push(finalScore);
        storedNames.push(playerName);

        if (storedScores.length > 20) {
            storedScores.shift();
            storedNames.shift();
        }

        localStorage.setItem("scoreHistory", JSON.stringify(storedScores));
        localStorage.setItem("nameHistory", JSON.stringify(storedNames));
    }

    function movePlayer(direction) {
        playerX += direction * 15;
        playerX = Math.max(5, Math.min(GAME_WIDTH - PLAYER_WIDTH - 5, playerX));
        player.style.left = `${playerX}px`;
    }

    function shootBullet() {
        if (gameOver || !canShoot) return;

        canShoot = false;
        setTimeout(() => (canShoot = true), 150);

        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        bullet.style.left = `${playerX + PLAYER_WIDTH / 2 - 2.5}px`;
        bullet.style.bottom = "50px";
        gameContainer.appendChild(bullet);
        bullets.push(bullet);
    }

    function spawnEnemies() {
        if (gameOver) return;

        const startX = Math.floor(GAME_WIDTH / 2 - (ENEMY_WIDTH * ENEMY_COLS) / 2);
        const startY = 50;

        for (let row = 0; row < ENEMY_ROWS; row++) {
            for (let col = 0; col < ENEMY_COLS; col++) {
                const x = startX + col * (ENEMY_WIDTH + 10);
                const y = startY + row * (ENEMY_WIDTH + 10);

                const enemy = document.createElement("div");
                enemy.classList.add("enemy");
                enemy.style.width = `${ENEMY_WIDTH}px`;
                enemy.style.height = `${ENEMY_WIDTH}px`;
                enemy.style.position = "absolute";
                enemy.style.left = `${x}px`;
                enemy.style.top = `${y}px`;

                gameContainer.appendChild(enemy);
                enemies.push(enemy);
            }
        }
    }

    function updateGame() {
        if (gameOver) return;

        bullets.forEach((bullet, index) => {
            let bulletY = parseInt(bullet.style.bottom) + BULLET_SPEED;
            if (bulletY > GAME_HEIGHT) {
                bullet.remove();
                bullets.splice(index, 1);
            } else {
                bullet.style.bottom = `${bulletY}px`;
            }
        });

        enemies.forEach((enemy, index) => {
            let enemyY = parseInt(enemy.style.top) + ENEMY_SPEED;
            if (enemyY > GAME_HEIGHT) {
                if (!gameOver) {
                    gameOver = true;
                    gameOverDisplay.innerText = `Game Over! Final Score: ${score}\nPress "R" to Restart`;
                    saveScore(score);
                    alert("Game Over! Your score is: " + score);
                }
            } else {
                enemy.style.top = `${enemyY}px`;
            }
        });

        bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                if (detectCollision(bullet, enemy)) {
                    bullet.remove();
                    enemy.remove();
                    bullets.splice(bulletIndex, 1);
                    enemies.splice(enemyIndex, 1);

                    score += 10;
                    scoreDisplay.innerText = score;
                }
            });
        });

        if (enemies.length === 0 && !gameOver) {
            spawnEnemies(); // Spawn a new wave of enemies
        }

        requestAnimationFrame(updateGame);
    }

    function detectCollision(a, b) {
        let aRect = a.getBoundingClientRect();
        let bRect = b.getBoundingClientRect();
        return !(aRect.top > bRect.bottom || aRect.bottom < bRect.top || aRect.left > bRect.right || aRect.right < bRect.left);
    }

    function restartGame() {
        if (!gameOver) return;

        gameOver = false;
        score = 0;
        scoreDisplay.innerText = score;
        gameOverDisplay.innerText = "";

        enemies.forEach(enemy => enemy.remove());
        bullets.forEach(bullet => bullet.remove());
        enemies = [];
        bullets = [];

        spawnEnemies();
        updateGame();
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" || e.key === "a") movePlayer(-1);
        if (e.key === "ArrowRight" || e.key === "d") movePlayer(1);
        if (e.key === " " && !gameOver) shootBullet();
        if (e.key === "r" || e.key === "R") restartGame();
    });

    spawnEnemies();
    updateGame();
});