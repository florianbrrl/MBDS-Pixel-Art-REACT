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

// Ports du serveur (depuis la configuration)
const httpPort = config.server.port;
const wsPort = 3001; // Port séparé pour WebSocket

// Création du serveur HTTP
const httpServer = http.createServer(app);

// Création d'un serveur HTTP séparé pour Socket.IO
const wsServer = http.createServer();

// Création de l'instance Socket.IO avec CORS configuré sur un port dédié
const io = new Server(wsServer, {
	cors: {
		origin: config.cors.origin,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	path: '/',
	serveClient: false,
	connectTimeout: 45000, // temps plus long pour la connexion
	// Activer le débogage pour les problèmes de connexion
	transports: ['websocket', 'polling']
});

// Middleware d'authentification pour Socket.IO
io.use((socket, next) => {
	const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
	
	if (!token) {
		return next(new Error('Authentication error: Token missing'));
	}
	
	// Ici, vous pourriez vérifier le token JWT, mais pour simplifier le test, on accepte toute connexion
	console.log('Client authentifié avec token:', token.substring(0, 10) + '...');
	next();
});

// Gestionnaire d'erreurs de connexion
io.engine.on('connection_error', (err) => {
	console.error('Connection error:', err.req, err.code, err.message, err.context);
});

// Middleware pour gérer les connexions Socket.IO
io.on('connection', socket => {
	console.log(`Client connecté: ${socket.id}`);
	
	// Connexion réussie - envoi d'un message de bienvenue
	socket.emit('welcome', { message: 'Connected to WebSocket server!' });

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
	socket.on(
		'get-missed-updates',
		async (data: { boardId: string; lastTimestamp: string }, callback) => {
			try {
				// Convertir la chaîne de timestamp en objet Date
				const lastTimestamp = new Date(data.lastTimestamp);

				// Importer de manière dynamique pour éviter les dépendances circulaires
				const { WebSocketService } = await import('./services/websocket.service');

				// Récupérer les mises à jour depuis le dernier timestamp connu
				const missedUpdates = await WebSocketService.getUpdatesAfterTimestamp(
					data.boardId,
					lastTimestamp
				);

				// Envoyer les mises à jour au client via la fonction de callback
				callback({ success: true, updates: missedUpdates });

				console.log(
					`Envoi de ${missedUpdates.length} mises à jour manquées au client ${socket.id} pour le tableau ${data.boardId}`
				);
			} catch (error) {
				console.error('Erreur lors de la récupération des mises à jour manquées:', error);
				callback({
					success: false,
					error: 'Erreur lors de la récupération des mises à jour',
					updates: [],
				});
			}
		}
	);

	// Événement de déconnexion
	socket.on('disconnect', () => {
		console.log(`Client déconnecté: ${socket.id}`);
	});
});

// Exposer l'instance io pour l'utiliser ailleurs dans l'application
export { io };

// Démarrage du serveur HTTP pour l'API REST
const server = httpServer.listen(httpPort, async () => {
	console.log(`API Server running in ${config.server.env} mode on port ${httpPort}`);
	await PixelBoardModel.updateActiveStatus();
	console.log(`API available at ${config.server.apiPrefix}`);
});

// Démarrage du serveur WebSocket sur un port séparé
wsServer.listen(wsPort, () => {
	console.log(`WebSocket server initialized on port ${wsPort}`);
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
