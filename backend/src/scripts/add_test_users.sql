-- Vérifier que la colonne role existe dans la table users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        -- Ajouter la colonne role si elle n'existe pas
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user' 
        CHECK (role IN ('guest', 'user', 'premium', 'admin'));
    END IF;
END $$;

-- Supprimer les utilisateurs de test s'ils existent déjà
DELETE FROM users WHERE email IN (
    'guest@example.com', 
    'user@example.com', 
    'premium@example.com', 
    'admin@example.com'
);

-- Insérer les utilisateurs de test avec leurs rôles
-- Note: les mots de passe sont 'password123' hashés avec bcrypt
INSERT INTO users (id, email, password_hash, role, created_at)
VALUES 
    (gen_random_uuid(), 'guest@example.com', '$2b$10$BfX4iU5j0YuWx/DpJLJrZuLLsLcH0BXxZ.XrQcHDG6xKXpvwqUIeW', 'guest', NOW()),
    (gen_random_uuid(), 'user@example.com', '$2b$10$BfX4iU5j0YuWx/DpJLJrZuLLsLcH0BXxZ.XrQcHDG6xKXpvwqUIeW', 'user', NOW()),
    (gen_random_uuid(), 'premium@example.com', '$2b$10$BfX4iU5j0YuWx/DpJLJrZuLLsLcH0BXxZ.XrQcHDG6xKXpvwqUIeW', 'premium', NOW()),
    (gen_random_uuid(), 'admin@example.com', '$2b$10$BfX4iU5j0YuWx/DpJLJrZuLLsLcH0BXxZ.XrQcHDG6xKXpvwqUIeW', 'admin', NOW());

-- Afficher les utilisateurs créés
SELECT id, email, role FROM users WHERE email IN (
    'guest@example.com', 
    'user@example.com', 
    'premium@example.com', 
    'admin@example.com'
);