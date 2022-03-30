const express = require('express');
const { Server } = require('socket.io');
const app = express();
const http = require('http');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};
function getAllConnectedClients(roomId) {
	//Map converted to Array
	return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
		return {
			socketId,
			username: userSocketMap[socketId]
		};
	});
}

io.on('connection', (socket) => {
	console.log('Socket Connected!', socket.id);

	socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
		userSocketMap[socket.id] = username;
		socket.join(roomId);
		const clients = getAllConnectedClients(roomId);
		clients.forEach(({ socketId }) => {
			io.to(socketId).emit(ACTIONS.JOINED, {
				clients,
				username,
				socketId: socket.id
			});
		});
	});
});

const PORT = process.env.REACT_APP_PORT || 5001;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
