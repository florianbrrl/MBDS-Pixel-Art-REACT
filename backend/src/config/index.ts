import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement du fichier .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Interface pour la configuration typée
export interface Config {
	server: {
		env: string;
		port: number;
		apiPrefix: string;
	};
	logging: {
		level: string;
		format: string;
	};
	cors: {
		origin: string;
	};
}

// Configuration de base, à compléter avec la validation plus tard
const config: Config = {
	server: {
		env: process.env.NODE_ENV || 'development',
		port: parseInt(process.env.PORT || '3000', 10),
		apiPrefix: process.env.API_PREFIX || '/api',
	},
	logging: {
		level: process.env.LOG_LEVEL || 'info',
		format: process.env.LOG_FORMAT || 'dev',
	},
	cors: {
		origin: process.env.CORS_ORIGIN || '*',
	},
};

export default config;