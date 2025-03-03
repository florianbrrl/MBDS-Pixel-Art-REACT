import app from './app';

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
	console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
	console.error(err.name, err.message, err.stack);
	process.exit(1);
});

// Port du serveur (sera configuré via les variables d'environnement dans l'issue 3)
const port = process.env.PORT || 3000;

// Démarrage du serveur
const server = app.listen(port, () => {
	console.log(`Server running on port ${port}`);
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