import app from './app';
import config from './config';
import { PixelBoardModel } from './models/pixelboard.model';
import http from 'http';
import { SimpleWSService } from './services/simple-ws.service';

// Gestion des erreurs non capturées
process.on('uncaughtException', err => {
	console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
	console.error(err.name, err.message, err.stack);
	process.exit(1);
});

// Port pour le serveur HTTP
const httpPort = config.server.port;
const wsPort = 3001; // Port séparé pour WebSocket

// Création du serveur HTTP
const httpServer = http.createServer(app);

// Initialisation du service WebSocket simple basé sur ws au lieu de Socket.IO
SimpleWSService.initialize(undefined, wsPort);

// Exporter le service WebSocket pour l'utiliser ailleurs
export { SimpleWSService as io };

// Démarrage du serveur HTTP pour l'API REST
const server = httpServer.listen(httpPort, async () => {
	console.log(`API Server running in ${config.server.env} mode on port ${httpPort}`);
	await PixelBoardModel.updateActiveStatus();
	console.log(`API available at ${config.server.apiPrefix}`);
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