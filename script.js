document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("gameContainer");
    const player = document.getElementById("player");
    const scoreDisplay = document.getElementById("score");
    const buy20Button = document.getElementById("buy20");
    const buy50Button = document.getElementById("buy50");
    const buy150Button = document.getElementById("buy150");

    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 600;
    const PLAYER_WIDTH = 40;
    const ENEMY_WIDTH = 40;
    const BULLET_SPEED = 5;
    const ENEMY_SPEED = 2;
    let playerX = 180;
    let bullets = [];
    let enemies = [];
    let score = 0;
    let gameOver = false;
    let totalBullets = 20;
    let gamepadIndex = null;
    let enemyFailCount = 0; // Track how many times any enemy has reached the bottom

    function movePlayer(direction) {
        playerX += direction * 10;
        playerX = Math.max(5, Math.min(GAME_WIDTH - PLAYER_WIDTH - 5, playerX));
        player.style.left = `${playerX}px`;
    }

    function shootBullet() {
        if (gameOver || totalBullets <= 0 || !canShoot) return;

        canShoot = false;
        setTimeout(() => canShoot = true, 300); // 300ms cooldown

        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        bullet.style.left = `${playerX + PLAYER_WIDTH / 2 - 2.5}px`;
        bullet.style.bottom = "50px";
        gameContainer.appendChild(bullet);
        bullets.push(bullet);
        totalBullets--;
        document.getElementById("bulletsLeft").innerText = `Bullets Left: ${totalBullets}`;
    }

    function spawnEnemy() {
        if (gameOver) return;
        const enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.style.left = `${Math.random() * (GAME_WIDTH - ENEMY_WIDTH)}px`;
        enemy.style.top = "0px";
        gameContainer.appendChild(enemy);
        enemies.push({ element: enemy, failCount: 0 }); // Initialize fail count for each enemy
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
            let enemyY = parseInt(enemy.element.style.top) + ENEMY_SPEED;
            if (enemyY > GAME_HEIGHT) {
                enemy.failCount++; // Increment fail count when enemy reaches the bottom
                if (enemy.failCount >= 3) {
                    gameOver = true;
                    alert("Game Over! An enemy reached the bottom 3 times.");
                    return;
                }
                enemy.element.remove();
                enemies.splice(index, 1);
                score -= 10;
                scoreDisplay.innerText = score;
            } else {
                enemy.element.style.top = `${enemyY}px`;
            }
        });

        bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                if (detectCollision(bullet, enemy.element)) {
                    bullet.remove();
                    enemy.element.remove();
                    bullets.splice(bulletIndex, 1);
                    enemies.splice(enemyIndex, 1);
                    score += 10;
                    scoreDisplay.innerText = score;
                }
            });
        });

        updatePurchaseButtons();
        requestAnimationFrame(updateGame);
    }

    function detectCollision(a, b) {
        let aRect = a.getBoundingClientRect();
        let bRect = b.getBoundingClientRect();
        return !(
            aRect.top > bRect.bottom ||
            aRect.bottom < bRect.top ||
            aRect.left > bRect.right ||
            aRect.right < bRect.left
        );
    }

    function updatePurchaseButtons() {
        buy20Button.style.display = score >= 100 ? "block" : "none";
        buy50Button.style.display = score >= 200 ? "block" : "none";
        buy150Button.style.display = score >= 500 ? "block" : "none";
    }

    function handleKeyboardInput(e) {
        if (e.key === "ArrowLeft" || e.key === "a") movePlayer(-1);  // A key for left
        if (e.key === "ArrowRight" || e.key === "d") movePlayer(1);   // D key for right
        if (e.key === " ") shootBullet();  // Space key to shoot
    }

    function updateGamepadControls() {
        if (gameOver) return;

        const gamepads = navigator.getGamepads();
        if (gamepadIndex !== null && gamepads[gamepadIndex]) {
            const gp = gamepads[gamepadIndex];

            let xMove = Math.abs(gp.axes[0]) > 0.2 ? Math.sign(gp.axes[0]) : 0;
            movePlayer(xMove);

            if (gp.buttons[0].pressed) shootBullet();
        }

        requestAnimationFrame(updateGamepadControls);
    }

    function buyBullets(amount) {
        if (amount === 20 && score >= 100) {
            totalBullets += 20;
            score -= 100;
        } else if (amount === 50 && score >= 200) {
            totalBullets += 50;
            score -= 200;
        } else if (amount === 150 && score >= 500) {
            totalBullets += 150;
            score -= 500;
        }
        scoreDisplay.innerText = score;
        updatePurchaseButtons();
    }

    let canShoot = true;

    window.addEventListener("keydown", handleKeyboardInput);

    window.addEventListener("gamepadconnected", (event) => {
        gamepadIndex = event.gamepad.index;
        console.log("Gamepad connected");
    });

    buy20Button.addEventListener("click", () => buyBullets(20));
    buy50Button.addEventListener("click", () => buyBullets(50));
    buy150Button.addEventListener("click", () => buyBullets(150));

    setInterval(spawnEnemy, 2000);
    updateGame();
    updateGamepadControls();
});