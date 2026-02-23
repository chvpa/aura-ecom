INSERT INTO users (id, email, full_name, phone, created_at, updated_at)
VALUES
('28a3682f-b7eb-44d9-8be0-4e51a9263f77'::uuid, 'chvpa.contacto@gmail.com', 'Christian Chaparro', '+595972137968', '2025-12-25T23:37:53.304878+00:00', '2025-12-25T23:38:51.875885+00:00'),
('62761978-3c25-44d6-8f02-9214b3eea20b'::uuid, 'aramiadorno18@gmail.com', 'aramiadorno18', NULL, '2026-01-06T13:49:46.161051+00:00', '2026-01-06T13:49:46.161051+00:00'),
('c73bec6e-a9a7-470b-9914-27c486d463d3'::uuid, 'odoraimports@gmail.com', 'odoraimports', NULL, '2026-01-06T14:01:56.209441+00:00', '2026-01-06T14:01:56.209441+00:00'),
('f045c8c1-2c21-4b5e-b890-6f2910450120'::uuid, 'ch7suarez@gmail.com', 'Evelio Adrián Suárez Samaniego', NULL, '2026-01-06T19:19:47.387884+00:00', '2026-01-06T19:19:47.387884+00:00')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  updated_at = EXCLUDED.updated_at;

