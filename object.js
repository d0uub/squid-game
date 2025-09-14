// Object creation functions for Squid Game
// This file contains all the 3D object creation functions

// Arrays to store object positions for collision detection
let trees = [];
let holes = [];

// Create a tree with trunk and leaves
function createTree(x, y, z) {
    // Store tree position for collision detection
    trees.push({ x: x, z: z, radius: 2.5 });
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, y + 2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    // Tree leaves
    const leavesGeometry = new THREE.SphereGeometry(2.5);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(x, y + 5, z);
    leaves.castShadow = true;
    scene.add(leaves);
}

// Create a cloud formation
function createCloud(x, y, z) {
    const cloudGroup = new THREE.Group();
    
    for (let i = 0; i < 5; i++) {
        const cloudGeometry = new THREE.SphereGeometry(2 + Math.random() * 2);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 8
        );
        cloudGroup.add(cloudPart);
    }
    
    cloudGroup.position.set(x, y, z);
    scene.add(cloudGroup);
}

// Create a hole in the ground
function createHole(x, z) {
    // Store hole position for collision detection
    holes.push({ x: x, z: z, radius: 2 });
    
    // Create hole - dark circle on ground
    const holeGeometry = new THREE.CircleGeometry(2, 16);
    const holeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.9
    });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.rotation.x = -Math.PI / 2;
    hole.position.set(x, 0.02, z); // Slightly above ground to avoid z-fighting
    scene.add(hole);
    
    // Add some dirt around the hole edge
    const dirtRingGeometry = new THREE.RingGeometry(2, 2.5, 16);
    const dirtRingMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        transparent: true,
        opacity: 0.7
    });
    const dirtRing = new THREE.Mesh(dirtRingGeometry, dirtRingMaterial);
    dirtRing.rotation.x = -Math.PI / 2;
    dirtRing.position.set(x, 0.01, z);
    scene.add(dirtRing);
}

// Create the player character
function createPlayer() {
    const player = new THREE.Group();
    player.position.set(0, 0, 40);
    
    // Head - cube, skin color
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAE });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 2.4, 0);
    head.castShadow = true;
    player.add(head);
    
    // Body - thin cube, dark green color
    const bodyGeometry = new THREE.BoxGeometry(1, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.4, 0);
    body.castShadow = true;
    player.add(body);
    
    // Left arm - rectangle, dark green color
    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.65, 1.4, 0);
    leftArm.castShadow = true;
    player.add(leftArm);
    
    // Right arm - rectangle, dark green color
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.65, 1.4, 0);
    rightArm.castShadow = true;
    player.add(rightArm);
    
    // Left leg - rectangle, dark green color
    const legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25, 0.5, 0);
    leftLeg.castShadow = true;
    player.add(leftLeg);
    
    // Right leg - rectangle, dark green color
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.25, 0.5, 0);
    rightLeg.castShadow = true;
    player.add(rightLeg);
    
    return player;
}

// Create the Young-hee doll
function createDoll() {
    // Try to load Young-hee doll from glTF
    const LoaderClass = (typeof THREE !== 'undefined' && THREE.GLTFLoader) ? THREE.GLTFLoader : window.GLTFLoader;
    if (LoaderClass) {
        const gltfLoader = new LoaderClass();
        gltfLoader.load('young_hee/scene.gltf', function(gltf) {
            // Compute bounding box to center the model
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Create a group to handle rotation around the center
            const dollGroup = new THREE.Group();
            dollGroup.position.set(-0, 9.5, -93); // Set to visible location
            // dollGroup.position.set(0, 9.5, 40);
            gltf.scene.position.set(-center.x+0.9, -center.y, -center.z+3.1); // Offset to center the model
            gltf.scene.scale.set(1.3, 1.3, 1.3);
            dollGroup.add(gltf.scene);
            
            scene.add(dollGroup);
            doll = dollGroup;
        }, undefined, function(error) {
            console.error('Error loading glTF:', error);
        });
    }
    return doll;
}

// Create the ground with finish line
function createGround() {
    // Create ground - extended to cover entire playing field
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create finish line with zebra stripes extending to edges
    const finishLineGroup = new THREE.Group();
    const stripeWidth = 5;
    const numStripes = 40; // More stripes to cover full width
    
    for (let i = 0; i < numStripes; i++) {
        const stripeGeometry = new THREE.PlaneGeometry(stripeWidth, 2);
        const isBlack = i % 2 === 0;
        const stripeMaterial = new THREE.MeshLambertMaterial({ 
            color: isBlack ? 0x000000 : 0xFFFFFF 
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(-97.5 + (i * stripeWidth), 0.01, -90);
        finishLineGroup.add(stripe);
    }
    
    scene.add(finishLineGroup);
}

// Create lighting setup
function createLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
}

// Check if position is near a tree (for hole placement)
function isNearTree(x, z) {
    for (let tree of trees) {
        const distance = Math.sqrt((x - tree.x) ** 2 + (z - tree.z) ** 2);
        if (distance < 8) { // Don't place holes too close to trees
            return true;
        }
    }
    return false;
}

// Check if position is near tree positions (for validation)
function isNearTreePosition(x, z, treePositions) {
    for (let tree of treePositions) {
        const distance = Math.sqrt((x - tree.x) ** 2 + (z - tree.z) ** 2);
        if (distance < 8) {
            return true;
        }
    }
    return false;
}

// Generate all random objects (trees, holes, clouds)
function generateAllObjects() {
    // Clear existing arrays
    trees = [];
    holes = [];
    
    // Create trees
    for (let i = 0; i < 105; i++) {
        let x, z;
        do {
            x = (Math.random() - 0.5) * 160;
            z = (Math.random() - 0.5) * 160;
            // Don't place trees too close to start position or finish line
        } while ((Math.abs(x) < 5 && z > 35) || (Math.abs(x) < 15 && z < -85));
        
        createTree(x, 0, z);
    }
    
    // Create dangerous holes
    for (let i = 0; i < 15; i++) {
        let x, z;
        do {
            x = (Math.random() - 0.5) * 140;
            z = (Math.random() - 0.5) * 120;
            // Don't place holes too close to start position, finish line, or trees
        } while ((Math.abs(x) < 8 && z > 30) || (Math.abs(x) < 20 && z < -80) || isNearTree(x, z));
        
        createHole(x, z);
    }
    
    // Create clouds
    for (let i = 0; i < 8; i++) {
        createCloud(
            (Math.random() - 0.5) * 200,
            20 + Math.random() * 20,
            (Math.random() - 0.5) * 200
        );
    }
}

// Create another player for multiplayer
function createOtherPlayer(id) {
    const otherPlayer = new THREE.Group();
    
    // Create similar player model but same color
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAE });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 2.4, 0);
    head.castShadow = true;
    otherPlayer.add(head);
    
    const bodyGeometry = new THREE.BoxGeometry(1, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F }); // Same green color as main player
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.4, 0);
    body.castShadow = true;
    otherPlayer.add(body);
    
    // Add arms and legs (simplified)
    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.65, 1.4, 0);
    leftArm.castShadow = true;
    otherPlayer.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.65, 1.4, 0);
    rightArm.castShadow = true;
    otherPlayer.add(rightArm);
    
    const legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25, 0.5, 0);
    leftLeg.castShadow = true;
    otherPlayer.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.25, 0.5, 0);
    rightLeg.castShadow = true;
    otherPlayer.add(rightLeg);
    
    otherPlayer.position.set(5, 0, 40); // Start position offset
    return otherPlayer;
}

// Animation functions

// Regenerate all random objects (trees, holes, clouds)
function regenerateRandomObjects() {
    // Clear existing trees and holes
    trees.forEach(tree => {
        // Remove tree objects from scene
        const treeObjects = scene.children.filter(child => 
            child.position.x === tree.x && child.position.z === tree.z
        );
        treeObjects.forEach(obj => scene.remove(obj));
    });
    
    holes.forEach(hole => {
        // Remove hole objects from scene
        const holeObjects = scene.children.filter(child => 
            child.position.x === hole.x && child.position.z === hole.z
        );
        holeObjects.forEach(obj => scene.remove(obj));
    });
    
    // Generate new objects
    generateAllObjects();
    
    // Sync with other player if host
    if (isMultiplayer && isHost) {
        console.log('Syncing new random object positions');
        sendMultiplayerData({
            type: 'syncObjects',
            trees: trees.map(t => ({ x: t.x, z: t.z })),
            holes: holes.map(h => ({ x: h.x, z: h.z }))
        });
    }
}

// Doll animation functions
function shootBullet() {
    // Create bullet
    const bulletGeometry = new THREE.SphereGeometry(0.15);
    const bulletMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFFF00,
        emissive: 0xFFFF00,
        emissiveIntensity: 0.3
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(doll.position);
    bullet.position.y += 10; // Start from doll's chest area
    scene.add(bullet);
    
    // Create bullet trail
    const trailPositions = [];
    const maxTrailLength = 15;
    
    // Animate bullet towards player - bullets pass through everything
    const bulletSpeed = 4; // Faster bullet
    const targetPosition = player.position.clone();
    const direction = new THREE.Vector3();
    direction.subVectors(targetPosition, bullet.position).normalize();
    
    function animateBullet() {
        if (!bullet.parent) return; // Bullet removed
        
        // Store previous position for trail
        trailPositions.push(bullet.position.clone());
        if (trailPositions.length > maxTrailLength) {
            trailPositions.shift();
        }
        
        bullet.position.add(direction.clone().multiplyScalar(bulletSpeed));
        
        // Create/update trail
        if (trailPositions.length > 1) {
            // Remove old trail
            const oldTrail = scene.getObjectByName('bulletTrail');
            if (oldTrail) scene.remove(oldTrail);
            
            // Create new trail
            const trailGeometry = new THREE.BufferGeometry();
            const positions = [];
            const colors = [];
            
            for (let i = 0; i < trailPositions.length - 1; i++) {
                const pos1 = trailPositions[i];
                const pos2 = trailPositions[i + 1];
                
                positions.push(pos1.x, pos1.y, pos1.z);
                positions.push(pos2.x, pos2.y, pos2.z);
                
                // Fade from bright yellow to transparent
                const alpha = i / (trailPositions.length - 1);
                colors.push(1, 1, 0, alpha * 0.8);
                colors.push(1, 1, 0, (alpha + 0.1) * 0.8);
            }
            
            trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
            
            const trailMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                linewidth: 3
            });
            
            const trail = new THREE.LineSegments(trailGeometry, trailMaterial);
            trail.name = 'bulletTrail';
            scene.add(trail);
        }
        
        // Check if bullet reached target area (passes through all objects)
        const distanceToTarget = bullet.position.distanceTo(targetPosition);
        if (distanceToTarget < 1.5) {
            scene.remove(bullet);
            // Remove trail
            const trail = scene.getObjectByName('bulletTrail');
            if (trail) scene.remove(trail);
            makePlayerGetShot();
            return;
        }
        
        // Remove bullet if it goes too far past target
        if (bullet.position.distanceTo(doll.position) > 150) {
            scene.remove(bullet);
            // Remove trail
            const trail = scene.getObjectByName('bulletTrail');
            if (trail) scene.remove(trail);
            return;
        }
        
        requestAnimationFrame(animateBullet);
    }
    
    animateBullet();
}

// Smooth doll head rotation animation
function animateDoll() {
    if (doll) {
        doll.rotation.y += (dollRotation -1.4 - doll.rotation.y) * 0.1;
    }
}

// Player animation functions
function makePlayerGetShot() {
    // Rotate player to fall down from gunshot
    const fallAnimation = () => {
        if (player.rotation.z > -Math.PI/2) {
            player.rotation.z -= 0.1;
            player.position.y = Math.max(0, player.position.y - 0.05);
            requestAnimationFrame(fallAnimation);
        }
    };
    fallAnimation();
}

function makePlayerFallIntoHole(hole) {
    // Animate player falling into the hole
    const fallAnimation = () => {
        if (player.position.y > -3) {
            // Move player towards hole center
            const deltaX = hole.x - player.position.x;
            const deltaZ = hole.z - player.position.z;
            player.position.x += deltaX * 0.1;
            player.position.z += deltaZ * 0.1;
            
            // Make player fall down
            player.position.y -= 0.08;
            
            // Add some rotation for dramatic effect
            player.rotation.x += 0.05;
            player.rotation.z += 0.03;
            
            requestAnimationFrame(fallAnimation);
        }
    };
    fallAnimation();
}
