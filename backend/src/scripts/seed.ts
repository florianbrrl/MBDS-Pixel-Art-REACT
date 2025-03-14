import prisma from '../db/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

async function seed() {
    let adminId1: string | null = null;
    let adminId2: string | null = null;

    const users = [
        { email: 'guest@example.com', password: 'password123', role: 'guest' },
        { email: 'user@example.com', password: 'password123', role: 'user' },
        { email: 'premium@example.com', password: 'password123', role: 'premium' },
        { email: 'admin@example.com', password: 'password123', role: 'admin' },
    ];

    try {
        // Création des utilisateurs
        console.log('Seeding users...');
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

                // Stocker les IDs des administrateurs
                if (user.role === 'admin') {
                    if (!adminId1) {
                        adminId1 = existingUser.id;
                    } else if (!adminId2) {
                        adminId2 = existingUser.id;
                    }
                }
            } else {
                // Créer un nouvel utilisateur
                const newUser = await prisma.user.create({
                    data: {
                        id: randomUUID(),
                        email: user.email,
                        password_hash: passwordHash,
                        role: user.role,
                        theme_preference: 'sys', // Valeur par défaut conforme à la contrainte VARCHAR(5)
                    },
                });
                console.log(`Created ${user.role} user: ${user.email}`);

                // Stocker les IDs des administrateurs
                if (user.role === 'admin') {
                    if (!adminId1) {
                        adminId1 = newUser.id;
                    } else if (!adminId2) {
                        adminId2 = newUser.id;
                    }
                }
            }
        }

        // Si nous n'avons qu'un seul admin, utiliser le même ID pour les deux références
        if (!adminId2) adminId2 = adminId1;

        // Vérification si nous avons un administrateur
        if (!adminId1) {
            throw new Error('Aucun compte administrateur n\'a été créé');
        }

        // Supprimer les anciens PixelBoards (optionnel - à commenter si vous voulez conserver les boards existants)
        console.log('Cleaning old pixel boards...');
        await prisma.pixelHistory.deleteMany({});
        await prisma.pixelBoard.deleteMany({});

        // Création des PixelBoards
        console.log('Seeding pixel boards...');

        // PixelBoard 1: Art Rétro (petit)
        await prisma.pixelBoard.create({
            data: {
                id: randomUUID(),
                title: 'Art Rétro 16x16',
                width: 16,
                height: 16,
                grid: {},
                cooldown: 30,
                allow_overwrite: false,
                start_time: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Hier
                end_time: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
                admin_id: adminId1,
                created_at: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Hier
            },
        });
        console.log('Created PixelBoard: Art Rétro 16x16');

        // PixelBoard 2: Paysage de Montagne (moyen)
        await prisma.pixelBoard.create({
            data: {
                id: randomUUID(),
                title: 'Paysage de Montagne',
                width: 32,
                height: 32,
                grid: {},
                cooldown: 60,
                allow_overwrite: false,
                start_time: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
                end_time: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
                admin_id: adminId1,
                created_at: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
            },
        });
        console.log('Created PixelBoard: Paysage de Montagne');

        // PixelBoard 3: Cosmos (grand)
        await prisma.pixelBoard.create({
            data: {
                id: randomUUID(),
                title: 'Exploration Cosmique',
                width: 64,
                height: 48,
                grid: {},
                cooldown: 90,
                allow_overwrite: true,
                start_time: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
                end_time: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
                admin_id: adminId2,
                created_at: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
            },
        });
        console.log('Created PixelBoard: Exploration Cosmique');

        // PixelBoard 4: Pixel Art Libre (très grand, permet l'écrasement)
        await prisma.pixelBoard.create({
            data: {
                id: randomUUID(),
                title: 'Pixel Art Libre',
                width: 100,
                height: 100,
                grid: {},
                cooldown: 15,
                allow_overwrite: true,
                start_time: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Hier
                end_time: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000), // Dans 60 jours
                admin_id: adminId2,
                created_at: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Hier
            },
        });
        console.log('Created PixelBoard: Pixel Art Libre');

        // PixelBoard 5: Ville Futuriste (projet terminé)
        const sampleGrid1: Record<string, string> = {};
        for (let i = 0; i < 10; i++) {
            sampleGrid1[`${i},${i}`] = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        }

        await prisma.pixelBoard.create({
            data: {
                id: randomUUID(),
                title: 'Ville Futuriste',
                width: 48,
                height: 32,
                grid: sampleGrid1,
                cooldown: 45,
                allow_overwrite: false,
                start_time: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000), // Il y a 60 jours
                end_time: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
                admin_id: adminId1,
                created_at: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000), // Il y a 60 jours
            },
        });
        console.log('Created PixelBoard: Ville Futuriste (terminé)');

        // PixelBoard 6: Créatures Imaginaires (projet terminé)
        const sampleGrid2: Record<string, string> = {};
        for (let i = 5; i < 15; i++) {
            sampleGrid2[`${i},${i+2}`] = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        }

        await prisma.pixelBoard.create({
            data: {
                id: randomUUID(),
                title: 'Créatures Imaginaires',
                width: 24,
                height: 24,
                grid: sampleGrid2,
                cooldown: 60,
                allow_overwrite: true,
                start_time: new Date(new Date().getTime() - 45 * 24 * 60 * 60 * 1000), // Il y a 45 jours
                end_time: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000), // Il y a 15 jours
                admin_id: adminId2,
                created_at: new Date(new Date().getTime() - 45 * 24 * 60 * 60 * 1000), // Il y a 45 jours
            },
        });
        console.log('Created PixelBoard: Créatures Imaginaires (terminé)');

        // PixelBoard 7: Événement Spécial (à venir)
        await prisma.pixelBoard.create({
            data: {
                id: randomUUID(),
                title: "Événement Spécial: Festival d'Art Pixel",
                width: 50,
                height: 50,
                grid: {},
                cooldown: 30,
                allow_overwrite: false,
                start_time: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
                end_time: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000), // Dans 45 jours
                admin_id: adminId1,
                created_at: new Date(),
            },
        });
        console.log("Created PixelBoard: Événement Spécial (à venir)");

        // Afficher un résumé
        const boardCount = await prisma.pixelBoard.count();
        console.log(`Seeding completed successfully! Created ${boardCount} PixelBoards.`);
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
