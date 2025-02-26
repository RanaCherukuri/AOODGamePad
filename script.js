document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("gameContainer");
    const player = document.getElementById("player");
    const scoreDisplay = document.getElementById("score");
    const gameOverDisplay = document.getElementById("gameOver");

    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 600;
    const PLAYER_WIDTH = 40;
    const ENEMY_WIDTH = 40;
    const ENEMY_SPEED = 1;  // Slower enemy movement speed
    const BULLET_SPEED = 3; // Slower bullet speed
    const ENEMY_ROWS = 3;
    const ENEMY_COLS = 5;
    let playerX = 180;
    let score = 0;
    let gameOver = false;
    let enemies = [];
    let bullets = [];
    let gamepadIndex = null;
    let canShoot = true;
    let spawnInterval = 3000;  // Initial spawn interval in ms (3 seconds)
    let spawnDelayIncrement = 10000;  // Add 2 seconds to spawn delay after each batch

    // Adjust player movement speed (slower horizontal movement)
    function movePlayer(direction) {
        playerX += direction * 15;  // Reduced movement per step
        playerX = Math.max(5, Math.min(GAME_WIDTH - PLAYER_WIDTH - 5, playerX));
        player.style.left = `${playerX}px`;
    }

    function shootBullet() {
        if (gameOver || !canShoot) return;

        canShoot = false;
        setTimeout(() => (canShoot = true), 100); // Decreased cooldown to 150ms

        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        bullet.style.left = `${playerX + PLAYER_WIDTH / 2 - 2.5}px`;
        bullet.style.bottom = "50px";
        gameContainer.appendChild(bullet);
        bullets.push(bullet);
        playRandomAudio();
    }

    function spawnEnemies() {
        if (gameOver) return;

        // Randomly select the layout type
        const layoutTypes = ['rectangle', 'triangle', 'line'];
        const randomLayout = layoutTypes[Math.floor(Math.random() * layoutTypes.length)];

        const startX = Math.floor(GAME_WIDTH / 2 - (ENEMY_WIDTH * ENEMY_COLS) / 2);
        const startY = 50; // Start just below the player area

        for (let row = 0; row < ENEMY_ROWS; row++) {
            for (let col = 0; col < ENEMY_COLS; col++) {
                let x, y;

                // Layout logic
                if (randomLayout === 'rectangle') {
                    x = startX + col * (ENEMY_WIDTH + 10);
                    y = startY + row * (ENEMY_WIDTH + 10);
                } else if (randomLayout === 'triangle') {
                    x = startX + (col - row) * (ENEMY_WIDTH + 10);
                    y = startY + row * (ENEMY_WIDTH + 10);
                } else if (randomLayout === 'line') {
                    x = startX + col * (ENEMY_WIDTH + 10);
                    y = startY + row * 10; // Line style, just a small vertical gap
                }

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
            let enemyY = parseInt(enemy.style.top) + ENEMY_SPEED; // Slower enemy speed
            if (enemyY > GAME_HEIGHT) {
                gameOver = true;
                gameOverDisplay.innerText = `Game Over! Final Score: ${score}\nPress "R" to Restart`;
                playRandomAudio();  // Play random audio when game ends
                alert("Game Over! Your score is: " + score);
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
                    checkGameOver();
                }
            });
        });

        requestAnimationFrame(updateGame);
    }

    function detectCollision(a, b) {
        let aRect = a.getBoundingClientRect();
        let bRect = b.getBoundingClientRect();
        return !(aRect.top > bRect.bottom || aRect.bottom < bRect.top || aRect.left > bRect.right || aRect.right < bRect.left);
    }

    function checkGameOver() {
        if (enemies.length === 0) {
            gameOver = true;
            gameOverDisplay.innerText = `You Win! Final Score: ${score}\nPress "R" to Restart`;
            playRandomAudio();  // Play random audio when the player wins
            alert("You Win! Final Score: " + score);
        }
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

    function handleKeyboardInput(e) {
        if (e.key === "ArrowLeft" || e.key === "a") movePlayer(-1);
        if (e.key === "ArrowRight" || e.key === "d") movePlayer(1);
        if (e.key === " " && !gameOver) shootBullet();
        if (e.key === "r" || e.key === "R") restartGame();
    }

    // Function to play a random sound from the "audio" directory
    function playRandomAudio() {
        const audioFiles = [
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/vine-boom-sound-effect_KT89XIq.mp3",
            "audio/rizz-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
            "audio/pew-pew-lame-sound-effect.mp3",
        ];

        const randomIndex = Math.floor(Math.random() * audioFiles.length);
        const audio = new Audio(audioFiles[randomIndex]);
        audio.play();
    }

    function restartGame() {
        if (!gameOver) return;

        // Reset the game state
        gameOver = false;
        score = 0;
        scoreDisplay.innerText = score;
        gameOverDisplay.innerText = "";

        // Clear enemies and bullets
        enemies.forEach(enemy => enemy.remove());
        bullets.forEach(bullet => bullet.remove());
        enemies = [];
        bullets = [];

        // Spawn new enemies
        spawnEnemies();

        // Restart the game loop
        updateGame();
    }

    window.addEventListener("keydown", handleKeyboardInput);
    window.addEventListener("gamepadconnected", (event) => {
        gamepadIndex = event.gamepad.index;
        console.log("Gamepad connected");
    });

    spawnEnemies(); // Initial enemy spawn
    function spawnEnemiesWithIncreasingDelay() {
        if (gameOver) return;
        spawnEnemies(); // Spawn enemies
        // Increase spawn interval by 2000 ms (2 seconds)
        spawnInterval += 2000; 
        // Schedule the next enemy wave
        setTimeout(spawnEnemiesWithIncreasingDelay, spawnInterval);
    }
    // Start the enemy spawning cycle
    spawnEnemiesWithIncreasingDelay();    
    updateGame();
    updateGamepadControls();
});
