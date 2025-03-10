import { registerUser, loginUser } from '../services/auth.service';
import * as security from '../utils/security';
import request from 'supertest';
import app from '../app';
import prisma from '../db/client';

// Mock the security module
jest.mock('../utils/security');
// Mock the Prisma client
jest.mock('../db/client', () => ({
	__esModule: true,
	default: {
		user: {
			findUnique: jest.fn(),
			create: jest.fn(),
		},
	},
}));

describe('Auth Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('registerUser', () => {
		it('should register a user successfully', async () => {
			// Mock implementations
			(security.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
			(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
			(prisma.user.create as jest.Mock).mockResolvedValue({
				id: 'test-user-id',
				email: 'test@example.com',
				password_hash: 'hashedPassword',
			});

			const userId = await registerUser('test@example.com', 'password');

			// Assertions
			expect(security.hashPassword).toHaveBeenCalledWith('password');
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: {
					email: 'test@example.com',
					password_hash: 'hashedPassword',
				},
			});
			expect(userId).toBe('test-user-id');
		});

		it('should throw an error if the user already exists', async () => {
			// Mock implementations
			(prisma.user.findUnique as jest.Mock).mockResolvedValue({
				id: 'existing-user-id',
				email: 'test@example.com',
			});

			// Assertions
			await expect(registerUser('test@example.com', 'password')).rejects.toThrow(
				'User with this email already exists'
			);
			expect(prisma.user.create).not.toHaveBeenCalled();
		});
	});

	describe('loginUser', () => {
		it('should login a user successfully', async () => {
			// Mock implementations
			(prisma.user.findUnique as jest.Mock).mockResolvedValue({
				id: 'test-user-id',
				email: 'test@example.com',
				password_hash: 'hashedPassword',
			});
			(security.comparePassword as jest.Mock).mockResolvedValue(true);
			(security.generateToken as jest.Mock).mockReturnValue('test-token');

			const token = await loginUser('test@example.com', 'password');

			// Assertions
			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
			});
			expect(security.comparePassword).toHaveBeenCalledWith('password', 'hashedPassword');
			expect(security.generateToken).toHaveBeenCalledWith('test-user-id');
			expect(token).toBe('test-token');
		});

		it('should throw an error if the user does not exist', async () => {
			// Mock implementations
			(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

			// Assertions
			await expect(loginUser('nonexistent@example.com', 'password')).rejects.toThrow(
				'Invalid credentials'
			);
			expect(security.comparePassword).not.toHaveBeenCalled();
			expect(security.generateToken).not.toHaveBeenCalled();
		});

		it('should throw an error if the password is incorrect', async () => {
			// Mock implementations
			(prisma.user.findUnique as jest.Mock).mockResolvedValue({
				id: 'test-user-id',
				email: 'test@example.com',
				password_hash: 'hashedPassword',
			});
			(security.comparePassword as jest.Mock).mockResolvedValue(false);

			// Assertions
			await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
				'Invalid credentials'
			);
			expect(security.generateToken).not.toHaveBeenCalled();
		});
	});
});

// These tests would need a test database setup to run properly
// For now, we'll just set up basic API testing structure
describe('Auth Endpoints', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('POST /api/auth/register', () => {
		it('should return 400 if email or password is missing', async () => {
			const response = await request(app)
				.post('/api/auth/register')
				.send({ email: 'test@example.com' });

			expect(response.status).toBe(400);
			expect(response.body.status).toBe('fail');
			expect(response.body.message).toBe('Email and password are required');
		});

		// Additional tests would need mocks for the actual service calls
	});

	describe('POST /api/auth/login', () => {
		it('should return 400 if email or password is missing', async () => {
			const response = await request(app)
				.post('/api/auth/login')
				.send({ password: 'password' });

			expect(response.status).toBe(400);
			expect(response.body.status).toBe('fail');
			expect(response.body.message).toBe('Email and password are required');
		});

		// Additional tests would need mocks for the actual service calls
	});
});
