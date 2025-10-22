-- Clear existing employees and add real employees from PDF
DELETE FROM employees;

-- Reset the sequence
ALTER SEQUENCE employees_id_seq RESTART WITH 1;

-- Insert real employees from PDF with employee numbers starting from 1001
-- Main Group
INSERT INTO employees (employee_number, first_name, last_name, phone, email, hourly_rate, role, status, pin_hash) VALUES
(1001, 'Alex Oswaldo', 'Castaneda Molina', '786-776-7872', 'alex.castaneda@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1002, 'Alexy Edgardo', 'Antunez Chinchilla', '305-323-0874', 'alexy.antunez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1003, 'Alian', 'Naranjo Ramirez', '305-930-5046', 'alian.naranjo@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1004, 'Andres', 'Acosta Acosta', '786-865-5800', 'andres.acosta@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1005, 'Angelo', 'Rayo Torrez', '786-407-3725', 'angelo.rayo@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1006, 'Bayron Josue', 'Maldonado Carcamo', '786-671-9968', 'bayron.maldonado@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1007, 'Darwin Noe', 'Castro Cruz', '256-691-8652', 'darwin.castro@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1008, 'Erick', 'Martinez', '786-366-2976', 'erick.martinez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1009, 'Jose Alonso', 'Diaz Martinez', '786-958-3797', 'jose.diaz.martinez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1010, 'Jose Gregorio', 'Mundarain', '786-426-6497', 'jose.mundarain@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1011, 'Jose Manuel', 'Diaz Contreras', '786-524-8808', 'jose.diaz.contreras@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1012, 'Jose Roberto', 'Meneses Jiron', '786-370-4027', 'jose.meneses@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1013, 'Mario', 'Melendez', '786-597-4007', 'mario.melendez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1014, 'Miguel Angel', 'Miranda', '786-444-5079', 'miguel.miranda@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1015, 'Luis Diego', 'Ruiz Sanchez', '770-902-2734', 'luis.ruiz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1016, 'Oswaldo L.', 'Muñoz', NULL, 'oswaldo.munoz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1017, 'Raul', 'Diaz Morel', '786-445-4042', 'raul.diaz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1018, 'Roberto', 'Carranza Carranza', '786-303-9176', 'roberto.carranza@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1019, 'Santos', 'Jimenez', NULL, 'santos.jimenez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1020, 'Wilder', 'Quiñones Matos', '856-882-0985', 'wilder.quinones@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1021, 'Winston A.', 'Baldelomar Alegria', '786-564-6014', 'winston.baldelomar@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1022, 'Wiston', 'Bermudez', '305-391-7779', 'wiston.bermudez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1023, 'Yader Antonio', 'Mejias', '786-203-7105', 'yader.mejias@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1024, 'Yunior Alexander', 'Diaz Castro', NULL, 'yunior.diaz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1025, 'Yusmanys', 'Beritan Espinoza', '561-480-0112', 'yusmanys.beritan@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),

-- Roberto Carranza Group (Opera Tower)
(1026, 'Alexis', 'Antonio', NULL, 'alexis.antonio@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1027, 'Bayron Enrique', 'Rosales Cruz', '786-4451963', 'bayron.rosales@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1028, 'Carlos Arnulfo', 'Hernandez Flores', '309-9731486', 'carlos.hernandez.flores@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1029, 'Esteban', 'Zamora', NULL, 'esteban.zamora@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1030, 'Georvis', 'de la Torre Sanchez', '754-284-9219', 'georvis.delatorre@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1031, 'Kevin Edgardo', 'Hernandez Flores', '847-7662484', 'kevin.hernandez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1032, 'Yeison C.', 'Bermudez', NULL, 'yeison.bermudez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),

-- Gilberto Oval Group (Oceanside 4)
(1033, 'Bayardo V.', 'Obregon Urbina', '786-704-2233', 'bayardo.obregon@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1034, 'Brayan Antonio', 'Urroz Saravia', '786-828-3203', 'brayan.urroz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1035, 'Carlos Arturo', 'Campo', '786-382-3711', 'carlos.campo@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1036, 'Cairo Danilo', 'Toruno Pineda', '786-754-0759', 'cairo.toruno@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1037, 'Dafri Eduardo', 'Chavarria Lopez', '480-430-5682', 'dafri.chavarria@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1038, 'Dorvin Armando', 'Reyes Cruz', '786-914-9636', 'dorvin.reyes@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1039, 'Edgar Alberto', 'Trejo Andrade', '786-486-7915', 'edgar.trejo@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1040, 'Eduin Jose', 'Baca Canales', '815-372-8776', 'eduin.baca@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1041, 'Elmer Antonio', 'Sanchez Martinez', '305-793-3531', 'elmer.sanchez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1042, 'Fernando Javier', 'Sagastume Urquia', '305-384-0236', 'fernando.sagastume@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1043, 'Gilberto', 'Oval', '786-390-8634', 'gilberto.oval@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1044, 'Jesus Antonio', 'Cubias Sanchez', '239-645-3126', 'jesus.cubias@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1045, 'Jonhson A.', 'Ascanio Monsalve', '786-762-5794', 'jonhson.ascanio@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1046, 'Jose Antonio', 'Gomez', '669-239-1867', 'jose.gomez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1047, 'Mario Jose', 'Guzman', '864-247-1585', 'mario.guzman@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1048, 'Marvin Gabriel', 'Estrada Maradiaga', '605-920-3200', 'marvin.estrada@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1049, 'Marvin Noe', 'Mencias Chirinos', '786-641-4251', 'marvin.mencias@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1050, 'Norlan Antonio', 'Muñoz Gaitan', '786-635-2585', 'norlan.munoz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1051, 'Osmar', 'Lagos Tercero', '305-766-8125', 'osmar.lagos@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1052, 'Osmen Eli', 'Medrano Medrano', '305-413-6343', 'osmen.medrano@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1053, 'Ronal Alexander', 'Marroquin Sanchez', NULL, 'ronal.marroquin@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1054, 'Rony Alberto', 'Ruiz Escobar', '786-764-2092', 'rony.ruiz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1055, 'Rudys Moises', 'Lopez Quiroz', '786-447-1262', 'rudys.lopez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),

-- Osmin Ortiz Group (Bayview 2)
(1056, 'Aniel', 'Youyoute', '786-725-1931', 'aniel.youyoute@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1057, 'Edixon', 'Sanchez', '754-299-8710', 'edixon.sanchez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1058, 'Esteban', 'Garcia Campos', '305-975-9827', 'esteban.garcia@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1059, 'Evener', 'Ruiz', '786-762-6809', 'evener.ruiz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1060, 'Gerardo Lino', 'Guillen Tarrero', '786-778-9448', 'gerardo.guillen@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1061, 'Herminio', 'Rodriguez Cifuentes', '786-356-1205', 'herminio.rodriguez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1062, 'Jose Alexander', 'Saavedra', '786-794-8911', 'jose.saavedra@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1063, 'Jose Carlos', 'Ortiz Hernandez', '786-374-5830', 'jose.ortiz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1064, 'Jose Luis', 'Perez Antunez', '305-481-7765', 'jose.perez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1065, 'Manuel D.', 'Mendez Sanchez', '786-938-4380', 'manuel.mendez.sanchez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1066, 'Manuel de Jesus', 'Mendez Matamoros', '786-754-0757', 'manuel.mendez.matamoros@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1067, 'Marco Tulio', 'Galicia Ramos', '786-300-6752', 'marco.galicia@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1068, 'Marcos Felipe', 'Ramos Disla', '786-598-9719', 'marcos.ramos@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1069, 'Nestor Xavier', 'Palacios Duarte', '786-304-5572', 'nestor.palacios@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1070, 'Orlando de Jesus', 'Oviedo Alvarado', '786-537-7422', 'orlando.oviedo@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1071, 'Osmin Neptali', 'Ortiz Funes', '786-380-5026', 'osmin.ortiz@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1072, 'Raul', 'Carmona Delgado', '305-834-1963', 'raul.carmona@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1073, 'William Jose', 'Ruiz Castro', '786-762-6809', 'william.ruiz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1074, 'Yoandy', 'Lantigua Lopez', '786-602-7704', 'yoandy.lantigua@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1075, 'Yosnier', 'Peraza Gonzalez', '786-809-7071', 'yosnier.peraza@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),

-- Jose Gabriel Novoa Group (Acua Allison Island)
(1076, 'Antonio Jose', 'Canelones Omana', '786-627-3911', 'antonio.canelones@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1077, 'Cesar Amady', 'Geoson Mejia', '786-826-4334', 'cesar.geoson@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1078, 'Cesar Berardo', 'Trochez', '786-260-1995', 'cesar.trochez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1079, 'Eslier Mauricio', 'Martinez Jimenez', '786-355-5429', 'eslier.martinez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1080, 'Franklin David', 'Guerrero Berroa', '305-522-3813', 'franklin.guerrero@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1081, 'Jose Gabriel', 'Novoa Osorio', '928-287-4788', 'jose.novoa@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1082, 'Josue Nahum', 'Calix Montenegro', '786-378-3914', 'josue.calix@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1083, 'Josue Osmin', 'Rodriguez Caballero', '786-531-8947', 'josue.rodriguez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1084, 'Kedyn D.', 'Rivera Ramos', '786-803-6465', 'kedyn.rivera@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1085, 'Olban Joel', 'Cruz Ventura', '786-424-9219', 'olban.cruz@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1086, 'Oscar Danilo', 'Rivas Quiroz', '253-881-9771', 'oscar.rivas@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1087, 'Wilmer Marcelino', 'de Jesus Ramirez', '786-914-0697', 'wilmer.ramirez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),

-- Newton Garcia Group (The Ambassador Hotel)
(1088, 'David', 'Ros Cardona', '561-401-5486', 'david.ros@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1089, 'Efrain de Jesús', 'Gomez Diaz', '305-775-2453', 'efrain.gomez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1090, 'Esteban Alexander', 'Ros Galdamez', '561-262-1811', 'esteban.ros@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1091, 'Fredy Victor', 'Quiñones Diaz', '561-941-1442', 'fredy.quinones@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1092, 'Jaime Victor Adrian', 'Quiñones Diaz', '561-805-0083', 'jaime.quinones@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1093, 'Newton Miguel', 'Garcia', '786-419-3473', 'newton.garcia@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),

-- Alirio Turcios Group (Omar Townhouse Kendall)
(1094, 'Jose Alirio', 'Turcios Cruz', '786-712-6158', 'jose.turcios@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1095, 'Nery David', 'Apen Cortez', '786-340-3567', 'nery.apen@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1096, 'Reynier', 'Colas Puente', '754-275-2843', 'reynier.colas@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1097, 'Aurelio Rufino', 'Rangel', '305-684-7069', 'aurelio.rangel@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1098, 'Wilfredo', 'Reyes', '786-420-7908', 'wilfredo.reyes@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),

-- Dilmer Ortiz Group (400 Sunny Isles)
(1099, 'Dilmer Adelson', 'Ortiz Lopez', '786-873-8876', 'dilmer.ortiz@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1100, 'Edgar Leonel', 'Guaran', '508-840-1029', 'edgar.guaran@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),

-- Oswaldo Mendoza Group (Palmetto Place Apartments)
(1101, 'Alex Gabriel', 'Mencias', '954-270-9252', 'alex.mencias@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1102, 'Carlos Enrique', 'Rosales Almendares', '786-873-8876', 'carlos.rosales@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1103, 'Criss', 'Hernandez', NULL, 'criss.hernandez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1104, 'Manuel', 'Zapata', '786-454-6656', 'manuel.zapata@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1105, 'Omar', 'Acevedo', NULL, 'omar.acevedo@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1106, 'Oscar David', 'Aguillon Juarez', '305-586-4703', 'oscar.aguillon@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1107, 'Oscar Giovanni', 'Rosales Antunez', '786-576-8614', 'oscar.rosales@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1108, 'Oswaldo Javier', 'Mendoza Salas', '254-319-5831', 'oswaldo.mendoza@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1109, 'Pedro Esteban', 'Montero', NULL, 'pedro.montero@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),

-- Byron Apen Group
(1110, 'Byron', 'Apen Cortez', '239-265-0556', 'byron.apen@sandgservice.com', 20.00, 'supervisor', 'active', crypt('1234', gen_salt('bf'))),
(1111, 'Jacob', 'Bedoya', '786-304-4364', 'jacob.bedoya@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1112, 'Javier Alejandro', 'Gonzalez', '786-346-7729', 'javier.gonzalez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1113, 'Jesus', 'Martinez', '787-974-3894', 'jesus.martinez@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1114, 'Josue Israel', 'Rodriguez Euceda', '305-781-2813', 'josue.rodriguez.euceda@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf'))),
(1115, 'Ramon Enrique', 'Bastidas Vielma', '786-603-8021', 'ramon.bastidas@sandgservice.com', 20.00, 'field_worker', 'active', crypt('1234', gen_salt('bf')));
