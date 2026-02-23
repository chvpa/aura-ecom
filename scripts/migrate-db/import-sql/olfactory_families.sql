INSERT INTO olfactory_families (name, slug, description, color, icon, created_at)
VALUES
('Floral', 'floral', 'Notas de flores frescas y delicadas. Perfectas para ocasiones románticas y diurnas.', '#FFB6C1', '🌸', '2025-12-25T21:40:23.842458+00:00'),
('Cítrico', 'citrico', 'Notas frescas y energizantes de cítricos. Ideales para el día y climas cálidos.', '#FFD700', '🍋', '2025-12-25T21:40:23.842458+00:00'),
('Amaderado', 'amaderado', 'Notas cálidas y sofisticadas de maderas. Perfectas para ocasiones formales y nocturnas.', '#8B4513', '🪵', '2025-12-25T21:40:23.842458+00:00'),
('Especiado', 'especiado', 'Notas cálidas y picantes de especias. Ideales para invierno y ocasiones especiales.', '#DC143C', '🌶️', '2025-12-25T21:40:23.842458+00:00'),
('Oriental', 'oriental', 'Notas exóticas y sensuales con toques de incienso y resinas. Perfectas para la noche.', '#4B0082', '🕯️', '2025-12-25T21:40:23.842458+00:00'),
('Acuático', 'acuatico', 'Notas frescas y acuáticas que evocan el mar. Ideales para el día y climas cálidos.', '#00CED1', '🌊', '2025-12-25T21:40:23.842458+00:00'),
('Gourmand', 'gourmand', 'Notas dulces y comestibles como vainilla, caramelo y chocolate. Perfectas para ocasiones casuales.', '#D2691E', '🍰', '2025-12-25T21:40:23.842458+00:00'),
('Frutal', 'frutal', 'Notas jugosas y dulces de frutas. Ideales para el día y ocasiones casuales.', '#FF69B4', '🍓', '2025-12-25T21:40:23.842458+00:00')
ON CONFLICT DO NOTHING;

