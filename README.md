# Squid Game - Red Light Green Light

A 3D web-based implementation of the famous "Red Light Green Light" game from Squid Game using Three.js.

## Game Features

- **Single Player Mode**: Play against the AI-controlled Young-hee doll
- **Multiplayer Mode**: Play with a friend using WebRTC (temporarily disabled due to CSP restrictions)
- **3D Environment**: Trees, holes, clouds, and other obstacles
- **Mobile Support**: Virtual joystick for touch devices
- **Audio Effects**: Authentic sound effects from the show
- **Realistic Physics**: Collision detection and fall animations

## File Structure

### Core Game Files

- **`index.html`** - Main game file containing the core game logic, scene setup, lighting, and game loop
- **`styles.css`** - All visual styling for the game interface and UI elements

### Modular JavaScript Files

- **`object.js`** - Object creation and animation functions
  - All 3D object creation (player, doll, trees, holes, clouds)
  - Object animation functions (bullet shooting, player falling, doll rotation)
  - Object regeneration and management
  - Contains functions: `createPlayer()`, `createDoll()`, `createTree()`, `shootBullet()`, `makePlayerGetShot()`, `makePlayerFallIntoHole()`, `regenerateRandomObjects()`, etc.

- **`control.js`** - Input handling and player movement
  - Keyboard input detection (WASD, arrow keys)
  - Virtual joystick for mobile devices
  - Player movement logic with collision detection
  - Contains functions: `initControls()`, `handleMovement()`, `checkCollision()`, `checkHoleFall()`

- **`multiplayer.js`** - Multiplayer functionality (only used in multiplayer mode)
  - WebRTC connection management
  - Player synchronization and ready system
  - Data transmission between players
  - Object synchronization between host and clients
  - Contains functions: `showMultiplayerScreen()`, `handleMultiplayerMessage()`, `sendMultiplayerData()`, `setPlayerReady()`, etc.

- **`peerjs_webrtc.js`** - Generic WebRTC connection module
  - PeerJS wrapper for easy WebRTC connections
  - Room creation and joining functionality
  - Connection event handling
  - Reusable across different projects

## Controls

### Keyboard Controls
- **WASD** or **Arrow Keys** - Move player
- Only move during GREEN LIGHT phases
- Stop immediately when RED LIGHT appears

### Mobile Controls
- **Virtual Joystick** - Appears automatically on touch devices
- Drag the joystick to move in any direction

## Game Rules

1. **GREEN LIGHT** - You can move freely toward the finish line
2. **RED LIGHT** - Stop moving immediately or get eliminated
3. **Obstacles** - Avoid trees (collision) and holes (falling)
4. **Goal** - Reach the finish line without getting caught or falling

## Technical Features

- **Three.js** - 3D graphics rendering
- **WebRTC** - Real-time multiplayer communication
- **Nipple.js** - Virtual joystick for mobile devices
- **Collision Detection** - Tree and hole collision systems
- **Audio Integration** - Authentic Squid Game sound effects

## Browser Compatibility

- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

- The game is modularized for easy maintenance and extension
- Each file has a specific responsibility to keep code organized
- Functions are separated by their usage context (single-player vs multiplayer)
- Animation functions are grouped with their respective objects

## Future Enhancements

- Additional Squid Game mini-games
- Improved graphics and particle effects
- Tournament mode for multiple players
- Leaderboard system
- Custom obstacle editor
