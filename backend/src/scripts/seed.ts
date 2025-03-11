import prisma from '../db/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

async function seed() {
    const users = [
        { email: 'guest@example.com', password: 'password123', role: 'guest' },
        { email: 'user@example.com', password: 'password123', role: 'user' },
        { email: 'premium@example.com', password: 'password123', role: 'premium' },
        { email: 'admin@example.com', password: 'password123', role: 'admin' },
    ];

    // Vérifier si la table existe avant d'effectuer des opérations
    try {
        // Pour chaque utilisateur dans le tableau
        for (const user of users) {
            const passwordHash = await hashPassword(user.password);
            
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });
            
            if (existingUser) {
                // Mettre à jour le rôle et le mot de passe
                await prisma.user.update({
                    where: { email: user.email },
                    data: { 
                        role: user.role,
                        password_hash: passwordHash 
                    },
                });
                console.log(`Updated ${user.role} user: ${user.email}`);
            } else {
                // Créer un nouvel utilisateur
                await prisma.user.create({
                    data: {
                        id: randomUUID(),
                        email: user.email,
                        password_hash: passwordHash,
                        role: user.role,
                        theme_preference: 'sys', // Valeur par défaut conforme à la contrainte VARCHAR(5)
                    },
                });
                console.log(`Created ${user.role} user: ${user.email}`);
            }
        }
        
        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();