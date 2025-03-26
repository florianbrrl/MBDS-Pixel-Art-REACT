import app from './app';
import config from './config';
import { PixelBoardModel } from './models/pixelboard.model';
import { Server } from 'socket.io';
import http from 'http';

// Gestion des erreurs non capturées
process.on('uncaughtException', err => {
	console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
	console.error(err.name, err.message, err.stack);
	process.exit(1);
});

// Port du serveur (depuis la configuration)
const port = config.server.port;

// Création du serveur HTTP pour pouvoir y attacher Socket.IO
const httpServer = http.createServer(app);

// Création de l'instance Socket.IO avec CORS configuré
const io = new Server(httpServer, {
	cors: {
		origin: config.cors.origin,
		methods: ["GET", "POST"],
		credentials: true
	}
});

// Middleware pour gérer les connexions Socket.IO
io.on('connection', (socket) => {
	console.log(`Client connecté: ${socket.id}`);

	// Événement lorsqu'un client rejoint un tableau spécifique
	socket.on('join-board', (boardId: string) => {
		socket.join(boardId);
		console.log(`Client ${socket.id} a rejoint le tableau ${boardId}`);
	});

	// Événement lorsqu'un client quitte un tableau
	socket.on('leave-board', (boardId: string) => {
		socket.leave(boardId);
		console.log(`Client ${socket.id} a quitté le tableau ${boardId}`);
	});

	// Événement pour récupérer les mises à jour manquées (système anti-perte de données)
	socket.on('get-missed-updates', async (data: { boardId: string, lastTimestamp: string }, callback) => {
		try {
			// Convertir la chaîne de timestamp en objet Date
			const lastTimestamp = new Date(data.lastTimestamp);
			
			// Importer de manière dynamique pour éviter les dépendances circulaires
			const { WebSocketService } = await import('./services/websocket.service');
			
			// Récupérer les mises à jour depuis le dernier timestamp connu
			const missedUpdates = await WebSocketService.getUpdatesAfterTimestamp(data.boardId, lastTimestamp);
			
			// Envoyer les mises à jour au client via la fonction de callback
			callback({ success: true, updates: missedUpdates });
			
			console.log(`Envoi de ${missedUpdates.length} mises à jour manquées au client ${socket.id} pour le tableau ${data.boardId}`);
		} catch (error) {
			console.error('Erreur lors de la récupération des mises à jour manquées:', error);
			callback({ success: false, error: 'Erreur lors de la récupération des mises à jour', updates: [] });
		}
	});

	// Événement de déconnexion
	socket.on('disconnect', () => {
		console.log(`Client déconnecté: ${socket.id}`);
	});
});

// Exposer l'instance io pour l'utiliser ailleurs dans l'application
export { io };

// Démarrage du serveur HTTP avec Socket.IO
const server = httpServer.listen(port, async() => {
	console.log(`Server running in ${config.server.env} mode on port ${port}`);
	await PixelBoardModel.updateActiveStatus();
	console.log(`API available at ${config.server.apiPrefix}`);
	console.log('WebSocket server initialized');
});

// Gestion des rejets de promesses non gérées
process.on('unhandledRejection', (err: Error) => {
	console.error('UNHANDLED REJECTION! 💥 Shutting down...');
	console.error(err.name, err.message, err.stack);
	server.close(() => {
		process.exit(1);
	});
});

// Gestion de SIGTERM pour l'arrêt gracieux du serveur
process.on('SIGTERM', () => {
	console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
	server.close(() => {
		console.log('💥 Process terminated!');
	});
});

export default server;
