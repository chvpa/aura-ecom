INSERT INTO user_profiles (user_id, onboarding_completed, preferences, created_at, updated_at, role)
VALUES
('28a3682f-b7eb-44d9-8be0-4e51a9263f77', TRUE, '{"ocasiones":["Deportivo","Romántico","Nocturno","Profesional","Formal","Casual"],"clima_preferido":["Caluroso","Templado","Frío"],"familias_favoritas":["3c3e9c18-f377-411a-97ff-507629815f9b","7ef9445d-ee53-4dd6-9e9e-dbd588440d42","77d47d56-2ec9-44a1-82b6-867bf334b363","d715f662-092b-4ae6-9951-d98157535870","557a686a-9655-4a0d-9ab6-0a4fd3d19704"],"intensidad_preferida":"Moderada"}'::jsonb, '2025-12-25T23:37:53.761845+00:00', '2025-12-29T14:17:42.605894+00:00', 'admin')
ON CONFLICT DO NOTHING;

