// Multiplayer functionality for Squid Game
// This file contains all functions that are only used in multiplayer mode
// Dependencies: peerjs_webrtc.js, object.js (for createOtherPlayer function)

// Multiplayer state variables
let isMultiplayer = false;
let isHost = false;
let peerConnection = null;
let otherPlayers = {};
let playerId = Math.random().toString(36).substr(2, 9);
let playerReady = false;
let readyPlayers = {}; // { id: true/false }
let lastPositionSent = 0;
let positionSendInterval = 50; // Send position every 50ms max

// Multiplayer UI functions
function showMultiplayerScreen() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('multiplayerScreen').style.display = 'flex';
    // Hide game canvas when multiplayer setup is shown
    document.getElementById('gameContainer').classList.add('hide-game-canvas');
    
    // Initialize PeerJS WebRTC using the existing peerjs_webrtc.js
    peerjsWebRTC.init({
        containerId: 'peerjs-ui',
        onConnect: (conn, isHostRole) => {
            isMultiplayer = true;
            isHost = isHostRole;
            peerConnection = conn;
            console.log('Connected as ' + (isHost ? 'host' : 'player'));
            
            // Go to ready screen after connection
            document.getElementById('multiplayerScreen').style.display = 'none';
            showReadyScreen();
        },
        onData: handleMultiplayerMessage,
        onPeerOpen: (id) => {
            console.log('Peer opened with ID: ' + id);
        }
    });
// ...existing code...
// Ensure file ends cleanly
// Expose to global scope for HTML event handler
window.showMultiplayerScreen = showMultiplayerScreen;

function backToStart() {
    isMultiplayer = false;
    isHost = false;
    peerConnection = null;
    document.getElementById('startScreen').style.display = 'flex';
    document.getElementById('multiplayerScreen').style.display = 'none';
    // Show game canvas again
    document.getElementById('gameContainer').classList.remove('hide-game-canvas');
}
// Expose to global scope for HTML event handler
window.backToStart = backToStart;


// Ready system functions
function showReadyScreen() {
    document.getElementById('readyScreen').style.display = 'flex';
    // Hide game canvas when ready screen is shown
    document.getElementById('gameContainer').classList.add('hide-game-canvas');
    document.getElementById('playerRole').textContent = isHost ? 'Host' : 'Player';
    let startBtn = document.getElementById('startGameButton');
    let readyBtn = document.getElementById('readyButton');
    let waitingMsg = document.getElementById('waitingMessage');
    // Host is always ready
    if (isHost) {
        playerReady = true;
        readyPlayers[playerId] = true;
        if (readyBtn) readyBtn.style.display = 'none';
        if (waitingMsg) waitingMsg.style.display = 'none';
        // Show 'Start Game' button for host
        if (!startBtn) {
            startBtn = document.createElement('button');
            startBtn.id = 'startGameButton';
            startBtn.className = 'btn';
            startBtn.textContent = 'Start Game';
            startBtn.style.marginTop = '10px';
            document.getElementById('readyScreen').appendChild(startBtn);
        }
        startBtn.style.display = 'block';
        startBtn.onclick = function() {
            console.log('[Start Game Button] Host clicked Start Game');
            document.getElementById('readyScreen').style.display = 'none';
            document.getElementById('gameContainer').classList.remove('hide-game-canvas');
            sendMultiplayerData({ type: 'startGame' });
            startGame();
        };
    } else {
        // Joiners see 'I'm Ready' button, not 'Start Game'
        if (startBtn) startBtn.style.display = 'none';
        if (readyBtn) readyBtn.style.display = 'block';
        if (waitingMsg) waitingMsg.style.display = 'none';
    }
    updateReadyCount();
}

function setPlayerReady() {
    playerReady = true;
    readyPlayers[playerId] = true;
    console.log('[setPlayerReady] Set playerReady true for', playerId);
    console.log('[setPlayerReady] readyPlayers:', JSON.stringify(readyPlayers));
    document.getElementById('readyButton').style.display = 'none';
    document.getElementById('waitingMessage').style.display = 'block';
    updateReadyCount();
    // Send ready status to host
    sendMultiplayerData({
        type: 'playerReady',
        playerId: playerId,
        ready: true
    });
}
// Expose to global scope for HTML event handler
window.setPlayerReady = setPlayerReady;

function updateReadyCount() {
    // Count all ready players
    const readyCount = Object.values(readyPlayers).filter(Boolean).length;
    console.log('[updateReadyCount] readyPlayers:', JSON.stringify(readyPlayers), 'readyCount:', readyCount);
    document.getElementById('readyCount').textContent = readyCount;
}

function checkBothPlayersReady() {
    // Host checks if all joiners are ready
    if (isHost) {
        // Host can start game when all joiners are ready (or at any time)
        // Optionally, you can enable a "Start Game" button for host when at least one joiner is ready
        // For now, just update ready count
    } else {
        // Joiners wait for host to start game
    }
}

// Data transmission functions
function handleMultiplayerMessage(data) {
    switch (data.type) {
        case 'playerPosition':
            updateOtherPlayerPosition(data.playerId, data.position, data.rotation);
            // Host: forward movement to all except sender
            if (isHost && typeof peerjsWebRTC.broadcastExcept === 'function') {
                // 'this' conn is passed as 2nd arg to onData in peerjsWebRTC
                if (arguments.length > 1) {
                    const senderConn = arguments[1];
                    peerjsWebRTC.broadcastExcept(data, senderConn);
                }
            }
            break;
        case 'playerEliminated':
            eliminateOtherPlayer(data.playerId);
            // Host: forward elimination to all except sender
            if (isHost && typeof peerjsWebRTC.broadcastExcept === 'function') {
                if (arguments.length > 1) {
                    const senderConn = arguments[1];
                    peerjsWebRTC.broadcastExcept(data, senderConn);
                }
            }
            break;
        case 'gameState':
            // Sync game state
            isGreenLight = data.isGreenLight;
            dollRotation = data.dollRotation;
            break;
        case 'playerReady':
            console.log('[handleMultiplayerMessage] Received playerReady for', data.playerId, 'ready:', data.ready);
            // Host receives ready status from joiners
            if (isHost) {
                readyPlayers[data.playerId] = data.ready;
                console.log('[handleMultiplayerMessage] Host updated readyPlayers:', JSON.stringify(readyPlayers));
                updateReadyCount();
                // Forward ready status to all joiners INCLUDING sender
                forwardToJoinersIncluding(data);
            } else {
                // Joiners receive ready status from host
                readyPlayers[data.playerId] = data.ready;
                console.log('[handleMultiplayerMessage] Joiner updated readyPlayers:', JSON.stringify(readyPlayers));
                updateReadyCount();
            }
            break;
        case 'syncObjects':
            syncObjectsFromHost(data.trees, data.holes);
            break;
        case 'startGame':
            console.log('[handleMultiplayerMessage] Received startGame message, isHost:', isHost);
            // Only joiners respond to startGame from host
            if (!isHost) {
                document.getElementById('readyScreen').style.display = 'none';
                document.getElementById('gameContainer').classList.remove('hide-game-canvas');
                let startBtn = document.getElementById('startGameButton');
                let readyBtn = document.getElementById('readyButton');
                let waitingMsg = document.getElementById('waitingMessage');
                if (startBtn) startBtn.style.display = 'none';
                if (readyBtn) readyBtn.style.display = 'none';
                if (waitingMsg) waitingMsg.style.display = 'none';
                console.log('[handleMultiplayerMessage] Joiner starting game');
                startGame();
            }
            break;
    }
}
}

// Send message to host (if joiner) or broadcast to all joiners (if host)
function sendMultiplayerData(data) {
    if (isHost) {
        // Host: broadcast to all joiners including sender
        console.log('[sendMultiplayerData] Host broadcasting', data.type);
        forwardToJoinersIncluding(data);
    } else {
        // Joiner: send only to host
        if (peerConnection && peerConnection.open) {
            if (data.type !== 'playerPosition') {
                console.log('Sending message type: ' + data.type);
            }
            peerjsWebRTC.send(data);
        } else {
            if (data.type !== 'playerPosition') {
                console.log('Cannot send message - peer connection not ready');
            }
        }
    }
}

// Host forwards message to all joiners INCLUDING the original sender
function forwardToJoinersIncluding(data) {
    if (isHost && typeof peerjsWebRTC.broadcast === 'function') {
        console.log('[forwardToJoinersIncluding] Host broadcasting', data.type, 'to all connections');
        peerjsWebRTC.broadcast(data);
    } else {
        console.log('[forwardToJoinersIncluding] broadcast not available or not host');
    }
}

function throttledSendPosition() {
    const now = Date.now();
    if (now - lastPositionSent > positionSendInterval) {
        lastPositionSent = now;
        sendMultiplayerData({
            type: 'playerPosition',
            playerId: playerId,
            position: { x: player.position.x, y: player.position.y, z: player.position.z },
            rotation: { x: player.rotation.x, y: player.rotation.y, z: player.rotation.z }
        });
    }
}

// Player management functions
function updateOtherPlayerPosition(id, position, rotation) {
    if (!otherPlayers[id]) {
        // Create other player using function from object.js
        otherPlayers[id] = createOtherPlayer(id);
        scene.add(otherPlayers[id]);
    }
    
    if (otherPlayers[id]) {
        otherPlayers[id].position.copy(position);
        otherPlayers[id].rotation.copy(rotation);
    }
}

function eliminateOtherPlayer(id) {
    if (otherPlayers[id]) {
        scene.remove(otherPlayers[id]);
        delete otherPlayers[id];
    }
}

// Object synchronization functions
function syncObjectsFromHost(treePositions, holePositions) {
    // Clear existing objects
    trees.forEach(tree => {
        const treeObjects = scene.children.filter(child => 
            child.position.x === tree.x && child.position.z === tree.z
        );
        treeObjects.forEach(obj => scene.remove(obj));
    });
    
    holes.forEach(hole => {
        const holeObjects = scene.children.filter(child => 
            child.position.x === hole.x && child.position.z === hole.z
        );
        holeObjects.forEach(obj => scene.remove(obj));
    });
    
    // Clear arrays
    trees = [];
    holes = [];
    
    // Create objects from host data
    treePositions.forEach(pos => {
        createTree(pos.x, 0, pos.z);
    });
    
    holePositions.forEach(pos => {
        createHole(pos.x, pos.z);
    });
}

// Utility functions for checking multiplayer state
function getMultiplayerState() {
    return {
        isMultiplayer,
        isHost,
        playerId,
        playerReady,
        readyPlayers,
        otherPlayers
    };
}

function resetMultiplayerState() {
    playerReady = false;
    readyPlayers = {};
    // Reset other players positions
    Object.keys(otherPlayers).forEach(id => {
        if (otherPlayers[id]) {
            otherPlayers[id].position.set(5, 0, 40);
            otherPlayers[id].rotation.set(0, 0, 0);
        }
    });
}

// Initialize multiplayer event listeners
function initMultiplayerEventListeners() {
    // Only set up listeners if elements exist
    const backButton = document.getElementById('backFromMultiplayer');
    const readyButton = document.getElementById('readyButton');
    console.log('[initMultiplayerEventListeners] backButton:', !!backButton, 'readyButton:', !!readyButton);
    if (backButton) {
        backButton.addEventListener('click', window.backToStart);
        console.log('[initMultiplayerEventListeners] backButton event attached');
    }
    if (readyButton) {
        readyButton.addEventListener('click', function() {
            console.log('[readyButton] Clicked');
            window.setPlayerReady();
        });
        console.log('[initMultiplayerEventListeners] readyButton event attached');
    }
}

// Auto-initialize event listeners when this script loads
console.log('[multiplayer.js] Script loaded, initializing event listeners');
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[multiplayer.js] DOMContentLoaded');
        initMultiplayerEventListeners();
    });
} else {
    initMultiplayerEventListeners();
}
