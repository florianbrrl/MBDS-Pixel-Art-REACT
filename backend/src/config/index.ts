import dotenv from 'dotenv';
import * as envalid from 'envalid';
import path from 'path';

// Charger les variables d'environnement du fichier .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Définir les validateurs et les valeurs par défaut
const env = envalid.cleanEnv(process.env, {
	// Serveur
	NODE_ENV: envalid.str({
		choices: ['development', 'test', 'production'],
		default: 'development',
	}),
	PORT: envalid.port({ default: 3000 }),
	API_PREFIX: envalid.str({ default: '/api' }),

	// Logging
	LOG_LEVEL: envalid.str({
		choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
		default: 'info',
	}),
	LOG_FORMAT: envalid.str({ default: 'dev' }),

	// CORS
	CORS_ORIGIN: envalid.str({ default: '*' }),

	// Base de données (préparation pour futures issues)
	DB_HOST: envalid.host({ default: 'localhost' }),
	DB_PORT: envalid.port({ default: 5432 }),
	DB_NAME: envalid.str({ default: 'pixelboard' }),
	DB_USER: envalid.str({ default: 'postgres' }),
	DB_PASSWORD: envalid.str({ default: 'postgres' }),

	// JWT (préparation pour futures issues)
	JWT_SECRET: envalid.str({ default: 'your-secret-key-change-in-production' }),
	JWT_EXPIRES_IN: envalid.str({ default: '90d' }),
});

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
	db: {
		host: string;
		port: number;
		name: string;
		user: string;
		password: string;
		url: string;
	};
	jwt: {
		secret: string;
		expiresIn: string;
	};
}

// Configuration exportée, accessible partout dans l'application
const config: Config = {
	server: {
		env: env.NODE_ENV,
		port: env.PORT,
		apiPrefix: env.API_PREFIX,
	},
	logging: {
		level: env.LOG_LEVEL,
		format: env.LOG_FORMAT,
	},
	cors: {
		origin: env.CORS_ORIGIN,
	},
	db: {
		host: env.DB_HOST,
		port: env.DB_PORT,
		name: env.DB_NAME,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		url: `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
	},
	jwt: {
		secret: env.JWT_SECRET,
		expiresIn: env.JWT_EXPIRES_IN,
	},
};

export default config;
