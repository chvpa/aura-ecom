INSERT INTO brands (name, slug, description, logo_url, is_active, created_at)
VALUES
('Versace', 'versace', 'Lujo italiano con fragancias icónicas y sofisticadas.', NULL, TRUE, '2025-12-25T21:40:26.789561+00:00'),
('Dior', 'dior', 'Elegancia francesa en cada fragancia. Clásicos atemporales.', NULL, TRUE, '2025-12-25T21:40:26.789561+00:00'),
('Calvin Klein', 'calvin-klein', 'Modernidad y minimalismo en fragancias unisex y contemporáneas.', NULL, TRUE, '2025-12-25T21:40:26.789561+00:00'),
('Hugo Boss', 'hugo-boss', 'Fragancias masculinas y femeninas con estilo empresarial y sofisticado.', NULL, TRUE, '2025-12-25T21:40:26.789561+00:00'),
('Tom Ford', 'tom-ford', 'Lujo y sofisticación en fragancias exclusivas y atrevidas.', NULL, TRUE, '2025-12-25T21:40:26.789561+00:00'),
('Chanel', 'chanel', 'Iconos de la perfumería francesa. Elegancia y distinción.', NULL, TRUE, '2025-12-25T21:40:26.789561+00:00'),
('Paco Rabanne', 'paco-rabanne', 'Fragancias innovadoras y atrevidas con estilo único.', NULL, TRUE, '2025-12-25T21:40:26.789561+00:00'),
('Aura Collection', 'aura-collection', 'Nuestra línea exclusiva de fragancias diseñadas especialmente para el mercado paraguayo.', NULL, FALSE, '2025-12-25T21:40:26.789561+00:00')
ON CONFLICT DO NOTHING;

