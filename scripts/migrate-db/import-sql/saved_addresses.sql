INSERT INTO saved_addresses (user_id, label, full_name, phone, department, city, street, reference, is_default, created_at, updated_at)
VALUES
('28a3682f-b7eb-44d9-8be0-4e51a9263f77', 'Casa', 'Christian', '0972137968', 'Asunción', 'Asunción', 'Nicanor era el rey', '', TRUE, '2026-01-06T20:52:09.847582+00:00', '2026-01-06T20:52:09.847582+00:00')
ON CONFLICT DO NOTHING;

