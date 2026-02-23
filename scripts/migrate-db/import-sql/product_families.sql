-- Mapeo de family_id: amaderado=70104991, citrico=770f2b23, oriental=f432e85b, especiado=323c05c9, floral=d4c7d4cc, frutal=7a56c2b1, acuatico=dbf135b4, gourmand=8441a020
-- Los product_id se mantienen iguales ya que se importaron con los mismos UUIDs
INSERT INTO product_families (product_id, family_id, is_primary)
VALUES
('4dd06a75-2ab6-4735-b84c-f07192a9304e', '70104991-16e5-4570-8743-b06b2c011837', TRUE),
('03826908-873d-4dde-9916-3cacc707b3fa', '70104991-16e5-4570-8743-b06b2c011837', TRUE),
('f1178ea7-1b3c-4d21-8296-084656b2d3d2', '70104991-16e5-4570-8743-b06b2c011837', FALSE),
('00b02c38-fe6c-45c7-a712-96edb256592b', '770f2b23-498d-415c-b611-3f4afa768012', TRUE),
('86c8787e-4679-49ef-bc0c-3a7b70dad030', '770f2b23-498d-415c-b611-3f4afa768012', FALSE),
('4dd06a75-2ab6-4735-b84c-f07192a9304e', 'f432e85b-8e41-47df-9bc2-d9911c451353', FALSE),
('3013171f-8ac2-4b7e-b409-ba8d378ca30f', 'f432e85b-8e41-47df-9bc2-d9911c451353', TRUE),
('86c8787e-4679-49ef-bc0c-3a7b70dad030', 'f432e85b-8e41-47df-9bc2-d9911c451353', FALSE),
('aa0d4a09-7bba-4a3e-9270-073fe3cdfbff', 'f432e85b-8e41-47df-9bc2-d9911c451353', FALSE),
('4dd06a75-2ab6-4735-b84c-f07192a9304e', '323c05c9-50b7-4eec-ae7b-672d1f721a90', FALSE),
('3013171f-8ac2-4b7e-b409-ba8d378ca30f', '323c05c9-50b7-4eec-ae7b-672d1f721a90', FALSE),
('aa0d4a09-7bba-4a3e-9270-073fe3cdfbff', '323c05c9-50b7-4eec-ae7b-672d1f721a90', TRUE),
('3013171f-8ac2-4b7e-b409-ba8d378ca30f', 'd4c7d4cc-abb3-46b3-beec-7180619d0f58', FALSE),
('03826908-873d-4dde-9916-3cacc707b3fa', 'd4c7d4cc-abb3-46b3-beec-7180619d0f58', FALSE),
('aa0d4a09-7bba-4a3e-9270-073fe3cdfbff', 'd4c7d4cc-abb3-46b3-beec-7180619d0f58', FALSE),
('f81a4dac-e713-4add-a454-ac4673967c47', 'd4c7d4cc-abb3-46b3-beec-7180619d0f58', FALSE),
('00b02c38-fe6c-45c7-a712-96edb256592b', '7a56c2b1-d034-43c6-924c-6086890ca5a4', FALSE),
('86c8787e-4679-49ef-bc0c-3a7b70dad030', '7a56c2b1-d034-43c6-924c-6086890ca5a4', TRUE),
('f81a4dac-e713-4add-a454-ac4673967c47', '8441a020-c513-4203-80a8-ba798dbcf94c', TRUE),
('f1178ea7-1b3c-4d21-8296-084656b2d3d2', '8441a020-c513-4203-80a8-ba798dbcf94c', FALSE),
('00b02c38-fe6c-45c7-a712-96edb256592b', 'dbf135b4-932c-4cf9-998f-a2afaf7fc9ad', FALSE),
('03826908-873d-4dde-9916-3cacc707b3fa', 'dbf135b4-932c-4cf9-998f-a2afaf7fc9ad', FALSE),
('f81a4dac-e713-4add-a454-ac4673967c47', 'dbf135b4-932c-4cf9-998f-a2afaf7fc9ad', FALSE),
('f1178ea7-1b3c-4d21-8296-084656b2d3d2', 'dbf135b4-932c-4cf9-998f-a2afaf7fc9ad', TRUE)
ON CONFLICT DO NOTHING;

