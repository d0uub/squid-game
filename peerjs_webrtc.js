// Generic PeerJS WebRTC connection module
// Usage: peerjsWebRTC.init({ containerId: 'peerjs-ui', onConnect: fn, onData: fn })

const peerjsWebRTC = (() => {
	let peer = null;
	let conn = null;
	let isHost = false;
	let peerReady = false;
	let myPeerId = '';
	let ui = {};
	let config = {};
	let activeConnections = []; // Store all connections for host

	function createUI(containerId) {
		const container = document.getElementById(containerId);
		if (!container) return;
		container.innerHTML = `
			<div id="peerjs-status" class="text-yellow-400 mb-2 text-sm"></div>
			<div id="peerjs-controls" class="flex gap-2 mb-2">
				<input id="peerjs-room-input" type="text" placeholder="Room ID" class="px-2 py-1 rounded text-black" style="width:120px;" />
				<button id="peerjs-create-btn" class="btn">Create Room</button>
				<button id="peerjs-join-btn" class="btn" disabled>Join Room</button>
			</div>
			<div id="peerjs-peer-id" class="text-blue-300 text-xs"></div>
		`;
		ui.status = container.querySelector('#peerjs-status');
		ui.roomInput = container.querySelector('#peerjs-room-input');
		ui.createBtn = container.querySelector('#peerjs-create-btn');
		ui.joinBtn = container.querySelector('#peerjs-join-btn');
		ui.peerIdDiv = container.querySelector('#peerjs-peer-id');
	}

	function setupPeer() {
		peerReady = false;
		peer = new Peer();
		ui.joinBtn.disabled = true;
		ui.createBtn.disabled = true;
		peer.on('open', (id) => {
			myPeerId = id;
			peerReady = true;
			ui.createBtn.disabled = false;
			ui.peerIdDiv.textContent = `Your Peer ID: ${id}`;
			if (config.onPeerOpen) config.onPeerOpen(id);
		});
		peer.on('connection', (connection) => {
			// Host: store all connections
			activeConnections.push(connection);
			conn = connection; // For backward compatibility
			isHost = true;
			ui.status.textContent = 'Connected! You are the host.';
			setupConnEvents(connection);
			if (config.onConnect) config.onConnect(connection, isHost);
			// Remove closed connections
			connection.on('close', () => {
				activeConnections = activeConnections.filter(c => c !== connection);
			});
		});
	}

	function setupConnEvents() {
		// Accepts a connection object
		let connection = arguments[0] || conn;
		if (!connection) return;
		connection.on('data', (data) => {
			if (config.onData) config.onData(data, connection, isHost);
		});
		connection.on('open', () => {
			ui.status.textContent = isHost ? 'Host: Connection established.' : 'Joined: Connection established.';
			if (config.onConnOpen) config.onConnOpen(connection, isHost);
		});
		connection.on('close', () => {
			ui.status.textContent = 'Connection closed.';
			if (config.onConnClose) config.onConnClose(connection, isHost);
		});
	}

	function bindUIEvents() {
		ui.createBtn.addEventListener('click', () => {
			const roomId = ui.roomInput.value.trim();
			if (!roomId) {
				ui.status.textContent = 'Please enter a Room ID.';
				return;
			}
			if (peer) peer.destroy();
			peerReady = false;
			ui.joinBtn.disabled = true;
			ui.createBtn.disabled = true;
			peer = new Peer(roomId);
			activeConnections = [];
			peer.on('open', (id) => {
				myPeerId = id;
				peerReady = true;
				ui.createBtn.disabled = false;
				ui.peerIdDiv.textContent = `Your Peer ID: ${id}`;
				ui.status.textContent = 'Share your Peer ID with your friend and wait for connection...';
				if (config.onPeerOpen) config.onPeerOpen(id);
			});
			peer.on('connection', (connection) => {
				activeConnections.push(connection);
				conn = connection;
				isHost = true;
				setupConnEvents(connection);
				if (config.onConnect) config.onConnect(connection, isHost);
				connection.on('close', () => {
					activeConnections = activeConnections.filter(c => c !== connection);
				});
			});
		});
		ui.roomInput.addEventListener('input', () => {
			ui.joinBtn.disabled = !peerReady || !ui.roomInput.value.trim();
		});
		ui.joinBtn.addEventListener('click', () => {
			const roomId = ui.roomInput.value.trim();
			if (!roomId) {
				ui.status.textContent = 'Please enter a Room ID.';
				return;
			}
			if (!peerReady) {
				ui.status.textContent = 'Peer not ready.';
				return;
			}
			conn = peer.connect(roomId);
			isHost = false;
			setupConnEvents();
			ui.status.textContent = 'Connecting...';
			if (config.onConnect) config.onConnect(conn, isHost);
		});
	}

	return {
		init: function(options) {
			config = options || {};
			createUI(config.containerId || 'peerjs-ui');
			setupPeer();
			bindUIEvents();
		},
		getPeer: () => peer,
		getConn: () => conn,
		isHost: () => isHost,
		send: (data) => { if (conn && conn.open) conn.send(data); },
		getPeerId: () => myPeerId,
		getConnections: () => activeConnections,
		broadcast: (data) => {
			activeConnections.forEach(connection => {
				if (connection.open) connection.send(data);
			});
		},
		broadcastExcept: (data, exceptConn) => {
			activeConnections.forEach(connection => {
				if (connection.open && connection !== exceptConn) {
					connection.send(data);
				}
			});
		},
	};
})();
