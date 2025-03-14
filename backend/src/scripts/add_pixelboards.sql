-- Script pour ajouter des PixelBoards de démonstration à la base de données

-- Récupérer les IDs des administrateurs existants
DO $$
DECLARE
    admin_id_1 UUID;
    admin_id_2 UUID;
BEGIN
    -- Récupérer deux IDs d'administrateurs existants
    SELECT id INTO admin_id_1 FROM users WHERE role = 'admin' LIMIT 1;
    SELECT id INTO admin_id_2 FROM users WHERE role = 'admin' OFFSET 1 LIMIT 1;

    -- Utiliser l'ID du premier admin comme fallback si le second n'existe pas
    IF admin_id_2 IS NULL THEN
        admin_id_2 := admin_id_1;
    END IF;

    -- Insérer des PixelBoards actifs
    -- PixelBoard 1: Art Rétro (petit)
    INSERT INTO pixel_boards (
        id, title, width, height, grid, cooldown, allow_overwrite,
        start_time, end_time, admin_id, created_at
    ) VALUES (
        gen_random_uuid(),
        'Art Rétro 16x16',
        16,
        16,
        '{}',
        30,
        false,
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP + INTERVAL '7 days',
        admin_id_1,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

    -- PixelBoard 2: Paysage de Montagne (moyen)
    INSERT INTO pixel_boards (
        id, title, width, height, grid, cooldown, allow_overwrite,
        start_time, end_time, admin_id, created_at
    ) VALUES (
        gen_random_uuid(),
        'Paysage de Montagne',
        32,
        32,
        '{}',
        60,
        false,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP + INTERVAL '14 days',
        admin_id_1,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    );

    -- PixelBoard 3: Cosmos (grand)
    INSERT INTO pixel_boards (
        id, title, width, height, grid, cooldown, allow_overwrite,
        start_time, end_time, admin_id, created_at
    ) VALUES (
        gen_random_uuid(),
        'Exploration Cosmique',
        64,
        48,
        '{}',
        90,
        true,
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP + INTERVAL '30 days',
        admin_id_2,
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    );

    -- PixelBoard 4: Pixel Art Libre (très grand, permet l'écrasement)
    INSERT INTO pixel_boards (
        id, title, width, height, grid, cooldown, allow_overwrite,
        start_time, end_time, admin_id, created_at
    ) VALUES (
        gen_random_uuid(),
        'Pixel Art Libre',
        100,
        100,
        '{}',
        15,
        true,
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP + INTERVAL '60 days',
        admin_id_2,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

    -- Insérer des PixelBoards terminés (dates dans le passé)
    -- PixelBoard 5: Projet Terminé 1
    INSERT INTO pixel_boards (
        id, title, width, height, grid, cooldown, allow_overwrite,
        start_time, end_time, admin_id, created_at
    ) VALUES (
        gen_random_uuid(),
        'Ville Futuriste',
        48,
        32,
        '{"0,0":"#FF0000","1,1":"#00FF00","2,2":"#0000FF"}', -- Quelques pixels d'exemple
        45,
        false,
        CURRENT_TIMESTAMP - INTERVAL '60 days',
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        admin_id_1,
        CURRENT_TIMESTAMP - INTERVAL '60 days'
    );

    -- PixelBoard 6: Projet Terminé 2
    INSERT INTO pixel_boards (
        id, title, width, height, grid, cooldown, allow_overwrite,
        start_time, end_time, admin_id, created_at
    ) VALUES (
        gen_random_uuid(),
        'Créatures Imaginaires',
        24,
        24,
        '{"5,5":"#FFFF00","6,6":"#FF00FF","7,7":"#00FFFF"}', -- Quelques pixels d'exemple
        60,
        true,
        CURRENT_TIMESTAMP - INTERVAL '45 days',
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        admin_id_2,
        CURRENT_TIMESTAMP - INTERVAL '45 days'
    );

    -- PixelBoard 7: Projet à venir (futur)
    INSERT INTO pixel_boards (
        id, title, width, height, grid, cooldown, allow_overwrite,
        start_time, end_time, admin_id, created_at
    ) VALUES (
        gen_random_uuid(),
        'Événement Spécial: Festival d''Art Pixel',
        50,
        50,
        '{}',
        30,
        false,
        CURRENT_TIMESTAMP + INTERVAL '30 days',
        CURRENT_TIMESTAMP + INTERVAL '45 days',
        admin_id_1,
        CURRENT_TIMESTAMP
    );
END $$;

-- Afficher les PixelBoards créés
SELECT id, title, width, height, start_time, end_time, is_active FROM pixel_boards ORDER BY created_at DESC;
