// Control and input handling for Squid Game
// This file handles all user input including keyboard, touch, and virtual joystick controls
// Dependencies: nipplejs (for virtual joystick), multiplayer.js (for position updates)

// Input state tracking
const keys = {
    w: false, a: false, s: false, d: false,
    up: false, down: false, left: false, right: false
};

// Virtual joystick variables
let virtualJoystick = null;

// Initialize all control systems
function initControls() {
    initKeyboardControls();
    initJoystick();
}

// Keyboard control initialization
function initKeyboardControls() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// Handle key press events
function handleKeyDown(event) {
    // Don't prevent default if user is typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    event.preventDefault();
    const key = event.key.toLowerCase();
    switch(key) {
        case 'w': keys.w = true; break;
        case 'a': keys.a = true; break;
        case 's': keys.s = true; break;
        case 'd': keys.d = true; break;
        case 'arrowup': keys.up = true; break;
        case 'arrowdown': keys.down = true; break;
        case 'arrowleft': keys.left = true; break;
        case 'arrowright': keys.right = true; break;
    }
}

// Handle key release events
function handleKeyUp(event) {
    // Don't prevent default if user is typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    event.preventDefault();
    const key = event.key.toLowerCase();
    switch(key) {
        case 'w': keys.w = false; break;
        case 'a': keys.a = false; break;
        case 's': keys.s = false; break;
        case 'd': keys.d = false; break;
        case 'arrowup': keys.up = false; break;
        case 'arrowdown': keys.down = false; break;
        case 'arrowleft': keys.left = false; break;
        case 'arrowright': keys.right = false; break;
    }
}

// Virtual joystick initialization
function initJoystick() {
    // Only initialize virtual joystick on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // Create joystick container
        const joystickZone = document.createElement('div');
        joystickZone.id = 'joystick-zone';
        joystickZone.style.position = 'fixed';
        joystickZone.style.bottom = '20px';
        joystickZone.style.left = '20px';
        joystickZone.style.width = '120px';
        joystickZone.style.height = '120px';
        joystickZone.style.zIndex = '1000';
        joystickZone.style.borderRadius = '50%';
        joystickZone.style.background = 'rgba(255,255,255,0.3)';
        joystickZone.style.border = '2px solid rgba(255,255,255,0.5)';
        document.body.appendChild(joystickZone);
        
        // Initialize nipplejs
        virtualJoystick = nipplejs.create({
            zone: joystickZone,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 100
        });
        
        // Handle joystick events
        virtualJoystick.on('move', (evt, data) => {
            if (gameStarted && data.direction) {
                updateKeysFromVirtualJoystick(data);
            }
        });
        
        virtualJoystick.on('end', () => {
            // Reset all movement keys when joystick is released
            keys.w = keys.a = keys.s = keys.d = false;
            keys.up = keys.down = keys.left = keys.right = false;
        });
    }
}

// Convert virtual joystick input to key states
function updateKeysFromVirtualJoystick(data) {
    // Reset keys
    keys.w = keys.a = keys.s = keys.d = false;
    keys.up = keys.down = keys.left = keys.right = false;
    
    if (data.direction) {
        const direction = data.direction.angle;
        
        // Convert angle to movement (nipplejs uses different angle system)
        if (direction === 'up') {
            keys.w = keys.up = true;
        } else if (direction === 'down') {
            keys.s = keys.down = true;
        } else if (direction === 'left') {
            keys.a = keys.left = true;
        } else if (direction === 'right') {
            keys.d = keys.right = true;
        }
        
        // Handle diagonal movements
        if (data.direction.x < -0.5 && data.direction.y < -0.5) {
            keys.w = keys.up = keys.a = keys.left = true;
        } else if (data.direction.x > 0.5 && data.direction.y < -0.5) {
            keys.w = keys.up = keys.d = keys.right = true;
        } else if (data.direction.x < -0.5 && data.direction.y > 0.5) {
            keys.s = keys.down = keys.a = keys.left = true;
        } else if (data.direction.x > 0.5 && data.direction.y > 0.5) {
            keys.s = keys.down = keys.d = keys.right = true;
        }
    }
}

// Main movement handling function
function handleMovement() {
    if (gameOver || won || !gameStarted) return;
    
    isMoving = false;
    let moveX = 0, moveZ = 0;
    
    if (keys.w || keys.up) { moveZ -= playerSpeed; isMoving = true; }
    if (keys.s || keys.down) { moveZ += playerSpeed; isMoving = true; }
    if (keys.a || keys.left) { moveX -= playerSpeed; isMoving = true; }
    if (keys.d || keys.right) { moveX += playerSpeed; isMoving = true; }
    
    // Only move during green light
    if (isGreenLight && isMoving) {
        // Calculate new position
        let newX = player.position.x + moveX;
        let newZ = player.position.z + moveZ;
        
        // Keep player in bounds
        newX = Math.max(-40, Math.min(40, newX));
        newZ = Math.max(-90, Math.min(40, newZ));
        
        // Check for collisions before moving
        if (!checkCollision(newX, newZ)) {
            player.position.x = newX;
            player.position.z = newZ;
            
            // Send position update to other player (throttled)
            if (isMultiplayer) {
                throttledSendPosition();
            }
            
            // Check if player fell into a hole after moving
            const holeCollision = checkHoleFall(newX, newZ);
            if (holeCollision && !gameOver && !won) {
                gameOver = true;
                makePlayerFallIntoHole(holeCollision);
                document.getElementById('statusText').textContent = 'FELL INTO HOLE!';
                document.getElementById('gameStatus').style.color = '#8B4513';
                document.getElementById('gameStatus').style.display = 'block';
                document.getElementById('restartButton').style.display = 'block';
                
                // Notify other player
                if (isMultiplayer) {
                    sendMultiplayerData({
                        type: 'playerEliminated',
                        playerId: playerId,
                        reason: 'hole'
                    });
                }
            }
        }
        
        // Check win condition
        if (player.position.z <= -88) {
            won = true;
            // Play win sound
            const winSound = new Audio('https://www.myinstants.com/media/sounds/squid-games-success.mp3');
            winSound.volume = 0.8;
            winSound.play().catch(e => console.log('Win audio play failed:', e));
            
            document.getElementById('statusText').textContent = 'YOU WIN!';
            document.getElementById('gameStatus').style.color = '#00ff00';
            document.getElementById('gameStatus').style.display = 'block';
            document.getElementById('restartButton').style.display = 'block';
        }
    }
    
    // Check if moving during red light
    if (!isGreenLight && isMoving && !gameOver && !won) {
        gameOver = true;
        // Play gunshot sound immediately when caught
        const gunshotSound = new Audio('https://www.myinstants.com/media/sounds/squid-game-gunshot.mp3');
        gunshotSound.volume = 0.7;
        gunshotSound.play().catch(e => console.log('Audio play failed:', e));
        
        shootBullet();
        document.getElementById('statusText').textContent = 'ELIMINATED!';
        document.getElementById('gameStatus').style.display = 'block';
        document.getElementById('restartButton').style.display = 'block';
        
        // Notify other player
        if (isMultiplayer) {
            sendMultiplayerData({
                type: 'playerEliminated',
                playerId: playerId,
                reason: 'shot'
            });
        }
    }
}

// Collision detection helper functions
function checkCollision(newX, newZ) {
    // Check collision with trees
    for (let tree of trees) {
        const distance = Math.sqrt((newX - tree.x) ** 2 + (newZ - tree.z) ** 2);
        if (distance < tree.radius + 0.5) { // 0.5 is player radius
            return true; // Collision detected
        }
    }
    return false; // No collision
}

function checkHoleFall(newX, newZ) {
    // Check if player falls into a hole
    for (let hole of holes) {
        const distance = Math.sqrt((newX - hole.x) ** 2 + (newZ - hole.z) ** 2);
        if (distance < hole.radius) {
            return hole; // Player fell into this hole
        }
    }
    return null; // No hole collision
}

// Get current input state (for debugging)
function getInputState() {
    return {
        keys: { ...keys },
        isMoving,
        hasVirtualJoystick: virtualJoystick !== null
    };
}
