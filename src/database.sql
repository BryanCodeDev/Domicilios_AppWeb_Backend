-- ============================================================
--  PLATAFORMA DE DOMICILIOS — DATABASE SEED
--  Motor:    MySQL 8
--  ORM:      Sequelize
--  Password: Domi12345 (bcrypt, todos los usuarios)
--  Generado: 2026-06-03
-- ============================================================

CREATE DATABASE IF NOT EXISTS domiapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE domiapp;

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────
--  TABLAS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash TEXT         NOT NULL,
  rol           ENUM('admin','cliente','repartidor','negocio') NOT NULL,
  phone         VARCHAR(20),
  avatar_url    TEXT,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS businesses (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36)     NOT NULL,
  nombre        VARCHAR(150) NOT NULL,
  descripcion   TEXT,
  categoria     VARCHAR(80)  NOT NULL,
  direccion     TEXT         NOT NULL,
  lat           DECIMAL(10,7),
  lng           DECIMAL(10,7),
  logo_url      TEXT,
  horario       VARCHAR(100),
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_business_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id            CHAR(36)      NOT NULL DEFAULT (UUID()),
  business_id   CHAR(36)      NOT NULL,
  nombre        VARCHAR(150)  NOT NULL,
  descripcion   TEXT,
  precio        DECIMAL(12,2) NOT NULL,
  imagen_url    TEXT,
  disponible    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_product_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rider_profiles (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  vehiculo        VARCHAR(50),
  placa           VARCHAR(20),
  disponible      TINYINT(1)   NOT NULL DEFAULT 1,
  lat_actual      DECIMAL(10,7),
  lng_actual      DECIMAL(10,7),
  calificacion    DECIMAL(3,2) DEFAULT 5.00,
  total_entregas  INT          DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rider_user (user_id),
  CONSTRAINT fk_rider_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  cliente_id        CHAR(36)      NOT NULL,
  repartidor_id     CHAR(36),
  business_id       CHAR(36)      NOT NULL,
  estado            ENUM('PENDING','ACCEPTED','ASSIGNED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  total             DECIMAL(12,2) NOT NULL,
  direccion_entrega TEXT          NOT NULL,
  lat_entrega       DECIMAL(10,7),
  lng_entrega       DECIMAL(10,7),
  notas             TEXT,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_order_cliente    FOREIGN KEY (cliente_id)    REFERENCES users(id),
  CONSTRAINT fk_order_repartidor FOREIGN KEY (repartidor_id) REFERENCES users(id),
  CONSTRAINT fk_order_business   FOREIGN KEY (business_id)   REFERENCES businesses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  order_id        CHAR(36)      NOT NULL,
  product_id      CHAR(36)      NOT NULL,
  cantidad        INT           NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_item_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS deliveries (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  order_id        CHAR(36)     NOT NULL,
  repartidor_id   CHAR(36)     NOT NULL,
  lat_actual      DECIMAL(10,7),
  lng_actual      DECIMAL(10,7),
  estado          VARCHAR(30)  DEFAULT 'EN_CAMINO',
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_delivery_order (order_id),
  CONSTRAINT fk_delivery_order      FOREIGN KEY (order_id)     REFERENCES orders(id),
  CONSTRAINT fk_delivery_repartidor FOREIGN KEY (repartidor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  order_id        CHAR(36)      NOT NULL,
  mp_payment_id   VARCHAR(100),
  monto           DECIMAL(12,2) NOT NULL,
  estado          ENUM('PENDING','APPROVED','REJECTED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  metodo          VARCHAR(50),
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_order (order_id),
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ratings (
  id              CHAR(36)   NOT NULL DEFAULT (UUID()),
  order_id        CHAR(36)   NOT NULL,
  from_user_id    CHAR(36)   NOT NULL,
  to_user_id      CHAR(36)   NOT NULL,
  rol_calificado  ENUM('repartidor','negocio') NOT NULL,
  puntaje         TINYINT    NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
  comentario      TEXT,
  created_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_rating_order    FOREIGN KEY (order_id)     REFERENCES orders(id),
  CONSTRAINT fk_rating_from     FOREIGN KEY (from_user_id) REFERENCES users(id),
  CONSTRAINT fk_rating_to       FOREIGN KEY (to_user_id)   REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commissions (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  order_id          CHAR(36)      NOT NULL,
  business_id       CHAR(36),
  repartidor_id     CHAR(36),
  porcentaje_neg    DECIMAL(5,2)  DEFAULT 15.00,
  porcentaje_rep    DECIMAL(5,2)  DEFAULT 10.00,
  monto_negocio     DECIMAL(12,2),
  monto_repartidor  DECIMAL(12,2),
  estado            VARCHAR(20)   DEFAULT 'PENDIENTE',
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_commission_order      FOREIGN KEY (order_id)     REFERENCES orders(id),
  CONSTRAINT fk_commission_business   FOREIGN KEY (business_id)  REFERENCES businesses(id),
  CONSTRAINT fk_commission_repartidor FOREIGN KEY (repartidor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
--  ÍNDICES DE PERFORMANCE
-- ─────────────────────────────────────────────

CREATE INDEX idx_orders_cliente    ON orders(cliente_id);
CREATE INDEX idx_orders_repartidor ON orders(repartidor_id);
CREATE INDEX idx_orders_business   ON orders(business_id);
CREATE INDEX idx_orders_estado     ON orders(estado);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_deliveries_order  ON deliveries(order_id);
CREATE INDEX idx_payments_order    ON payments(order_id);
CREATE INDEX idx_ratings_order     ON ratings(order_id);

-- ─────────────────────────────────────────────
--  SEED — USUARIOS
--  Password de todos: Domi12345
-- ─────────────────────────────────────────────

INSERT INTO users (id, nombre, email, password_hash, rol, phone, activo) VALUES

-- ADMIN
('00000000-0000-0000-0000-000000000001',
 'Bryan Admin',
 'admin@domiapp.co',
 '$2b$10$WukvaahmnjnYW3alSw3meujAc9eHpVBIuiI8Ew1wVBOyE.bbDHlsm',
 'admin', '+57 310 000 0001', 1),

-- CLIENTES
('00000000-0000-0000-0000-000000000002',
 'Camila Torres',
 'camila@cliente.co',
 '$2b$10$iSgvz8YH3mlz0KC/IoDZ4uA.HuV76J9K5.o1C7/xVsgR0CeI7qZuC',
 'cliente', '+57 311 111 1111', 1),

('00000000-0000-0000-0000-000000000003',
 'Sebastián Mora',
 'sebastian@cliente.co',
 '$2b$10$isUO2ywWu7pOXTFhnRczourGGi5ykKoPsOFaW5pv3OWuL3nuUoOo2',
 'cliente', '+57 312 222 2222', 1),

-- REPARTIDORES
('00000000-0000-0000-0000-000000000004',
 'Andrés Roa',
 'andres@rider.co',
 '$2b$10$1yBXDU3yuGu5lsO47HTEne4JsY4DO/NvTa7QVZMPIinOcefOcCyP6',
 'repartidor', '+57 313 333 3333', 1),

('00000000-0000-0000-0000-000000000005',
 'Luis Peña',
 'luis@rider.co',
 '$2b$10$9BUuPSAFdmi/4VIM2xs9NenzXjPNiZiZjknWm8pfmu9s5Z262VKUy',
 'repartidor', '+57 314 444 4444', 1),

-- NEGOCIOS
('00000000-0000-0000-0000-000000000006',
 'El Fogón Casero',
 'elfogon@negocio.co',
 '$2b$10$9MpM.P3BvjGstNWD7Nxd1uBd3gAhV60Zfiv30hNLfLrXw0ZCfEyhW',
 'negocio', '+57 315 555 5555', 1),

('00000000-0000-0000-0000-000000000007',
 'Pizza Express Bogotá',
 'pizzaexpress@negocio.co',
 '$2b$10$XtpBqjoHY77.g8m9a3lRiOBu3NIbFfZQUMf88r9zDCCUBfqR8iRp2',
 'negocio', '+57 316 666 6666', 1),

('00000000-0000-0000-0000-000000000008',
 'Sushi Nakama',
 'nakama@negocio.co',
 '$2b$10$m7d3kKYOTN1nvKXSNzVUX.ccE4BxHNspS9ZBrUIKKS7SfDhjm3wkS',
 'negocio', '+57 317 777 7777', 1);

-- ─────────────────────────────────────────────
--  SEED — PERFILES REPARTIDORES
-- ─────────────────────────────────────────────

INSERT INTO rider_profiles (user_id, vehiculo, placa, disponible, lat_actual, lng_actual, calificacion, total_entregas) VALUES
('00000000-0000-0000-0000-000000000004', 'Moto', 'ABC123', 1,  4.7110, -74.0721, 4.85, 47),
('00000000-0000-0000-0000-000000000005', 'Moto', 'XYZ789', 0,  4.6954, -74.0855, 4.60, 31);

-- ─────────────────────────────────────────────
--  SEED — NEGOCIOS
-- ─────────────────────────────────────────────

INSERT INTO businesses (id, user_id, nombre, descripcion, categoria, direccion, lat, lng, horario, activo) VALUES

('10000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000006',
 'El Fogón Casero',
 'Comida tradicional colombiana: bandeja paisa, sobrebarriga, sudados y más.',
 'Comida colombiana',
 'Cra. 15 #85-32, Bogotá',
 4.6682, -74.0549, 'Lun–Sáb 11:00–21:00', 1),

('10000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000007',
 'Pizza Express Bogotá',
 'Pizzas artesanales en horno de piedra, pastas y antipastos.',
 'Italiana',
 'Av. Calle 72 #10-45, Bogotá',
 4.6516, -74.0581, 'Lun–Dom 12:00–23:00', 1),

('10000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000008',
 'Sushi Nakama',
 'Rolls, nigiris y ramen auténtico japonés en el corazón de Bogotá.',
 'Japonesa',
 'Calle 93 #11-27, Bogotá',
 4.6760, -74.0483, 'Mar–Dom 12:00–22:00', 1);

-- ─────────────────────────────────────────────
--  SEED — PRODUCTOS
-- ─────────────────────────────────────────────

-- El Fogón Casero
INSERT INTO products (business_id, nombre, descripcion, precio, disponible) VALUES
('10000000-0000-0000-0000-000000000001', 'Bandeja Paisa',        'Fríjoles, chicharrón, carne, huevo, arroz y aguacate.',  28000, 1),
('10000000-0000-0000-0000-000000000001', 'Sobrebarriga al horno','Sobrebarriga con papas criollas y ensalada.',            24000, 1),
('10000000-0000-0000-0000-000000000001', 'Sudado de Pollo',      'Muslos de pollo en salsa criolla con arroz.',            20000, 1),
('10000000-0000-0000-0000-000000000001', 'Ajiaco Santafereño',   'Caldo tradicional con tres tipos de papa y guascas.',    18000, 1),
('10000000-0000-0000-0000-000000000001', 'Jugo de Lulo',         'Jugo natural de lulo con agua o leche.',                  5000, 1),
('10000000-0000-0000-0000-000000000001', 'Mazamorra Chocoana',   'Postre tradicional con leche y panela.',                  7000, 1);

-- Pizza Express Bogotá
INSERT INTO products (business_id, nombre, descripcion, precio, disponible) VALUES
('10000000-0000-0000-0000-000000000002', 'Pizza Margarita',      'Tomate, mozzarella y albahaca fresca. Personal.',        22000, 1),
('10000000-0000-0000-0000-000000000002', 'Pizza Pepperoni',      'Salsa de tomate, pepperoni y queso. Mediana.',           32000, 1),
('10000000-0000-0000-0000-000000000002', 'Pizza Cuatro Quesos',  'Mozzarella, parmesano, gouda y provolone.',              35000, 1),
('10000000-0000-0000-0000-000000000002', 'Pasta Carbonara',      'Spaghetti con tocino, yema y parmesano.',                26000, 1),
('10000000-0000-0000-0000-000000000002', 'Pasta Bolognesa',      'Tagliatelle con ragú de res y laurel.',                  25000, 1),
('10000000-0000-0000-0000-000000000002', 'Tiramisú',             'Postre clásico italiano con mascarpone.',                12000, 1);

-- Sushi Nakama
INSERT INTO products (business_id, nombre, descripcion, precio, disponible) VALUES
('10000000-0000-0000-0000-000000000003', 'Roll Philadelphia',    'Salmón, queso crema y pepino. 8 piezas.',               28000, 1),
('10000000-0000-0000-0000-000000000003', 'Roll Dragon',          'Camarón tempura, aguacate y anguila. 8 piezas.',        34000, 1),
('10000000-0000-0000-0000-000000000003', 'Nigiri Salmón x4',     'Cuatro nigiris de salmón fresco sobre arroz.',          22000, 1),
('10000000-0000-0000-0000-000000000003', 'Ramen Tonkotsu',       'Caldo de cerdo, chashu, huevo y bambú.',                32000, 1),
('10000000-0000-0000-0000-000000000003', 'Edamame',              'Vainas de soya con sal marina. Entrada.',                8000, 1),
('10000000-0000-0000-0000-000000000003', 'Mochi Helado x3',      'Tres bolas de mochi: chocolate, vainilla y fresa.',     14000, 1);

-- ─────────────────────────────────────────────
--  SEED — PEDIDOS
-- ─────────────────────────────────────────────

INSERT INTO orders (id, cliente_id, repartidor_id, business_id, estado, total, direccion_entrega, lat_entrega, lng_entrega, notas, created_at) VALUES

-- Pedido entregado (Camila — El Fogón)
('20000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000004',
 '10000000-0000-0000-0000-000000000001',
 'DELIVERED', 51000,
 'Cra. 7 #32-15, Bogotá', 4.6391, -74.0849,
 'Apartamento 302, tocar timbre.',
 DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Pedido entregado (Sebastián — Pizza Express)
('20000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000005',
 '10000000-0000-0000-0000-000000000002',
 'DELIVERED', 70000,
 'Calle 45 #20-10, Bogotá', 4.6380, -74.0680,
 'Edificio Torre Norte, piso 5.',
 DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Pedido en tránsito ahora (Camila — Sushi Nakama)
('20000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000004',
 '10000000-0000-0000-0000-000000000003',
 'IN_TRANSIT', 68000,
 'Av. El Dorado #68-55, Bogotá', 4.6543, -74.1060,
 'Casa esquinera, reja azul.',
 DATE_SUB(NOW(), INTERVAL 25 MINUTE)),

-- Pedido pendiente (Sebastián — El Fogón)
('20000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000003',
 NULL,
 '10000000-0000-0000-0000-000000000001',
 'PENDING', 40000,
 'Cra. 30 #25-90, Bogotá', 4.6289, -74.0855,
 NULL,
 DATE_SUB(NOW(), INTERVAL 3 MINUTE));

-- ─────────────────────────────────────────────
--  SEED — ITEMS DE PEDIDOS
-- ─────────────────────────────────────────────

-- Pedido 1: Camila — El Fogón (Bandeja Paisa + Ajiaco + Jugo de Lulo)
INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario)
SELECT '20000000-0000-0000-0000-000000000001', id, 1, precio
FROM products
WHERE business_id = '10000000-0000-0000-0000-000000000001'
  AND nombre IN ('Bandeja Paisa','Ajiaco Santafereño','Jugo de Lulo');

-- Pedido 2: Sebastián — Pizza Express (Pizza Pepperoni + Pasta Carbonara + Tiramisú)
INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario)
SELECT '20000000-0000-0000-0000-000000000002', id, 1, precio
FROM products
WHERE business_id = '10000000-0000-0000-0000-000000000002'
  AND nombre IN ('Pizza Pepperoni','Pasta Carbonara','Tiramisú');

-- Pedido 3: Camila — Sushi (Roll Philadelphia + Ramen Tonkotsu + Edamame)
INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario)
SELECT '20000000-0000-0000-0000-000000000003', id, 1, precio
FROM products
WHERE business_id = '10000000-0000-0000-0000-000000000003'
  AND nombre IN ('Roll Philadelphia','Ramen Tonkotsu','Edamame');

-- Pedido 4: Sebastián — El Fogón (2x Sudado de Pollo)
INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario)
SELECT '20000000-0000-0000-0000-000000000004', id, 2, precio
FROM products
WHERE business_id = '10000000-0000-0000-0000-000000000001'
  AND nombre = 'Sudado de Pollo';

-- ─────────────────────────────────────────────
--  SEED — PAGOS
-- ─────────────────────────────────────────────

INSERT INTO payments (order_id, mp_payment_id, monto, estado, metodo) VALUES
('20000000-0000-0000-0000-000000000001', 'MP-TEST-001', 51000, 'APPROVED', 'Tarjeta débito'),
('20000000-0000-0000-0000-000000000002', 'MP-TEST-002', 70000, 'APPROVED', 'PSE'),
('20000000-0000-0000-0000-000000000003', 'MP-TEST-003', 68000, 'APPROVED', 'Tarjeta crédito'),
('20000000-0000-0000-0000-000000000004', NULL,           40000, 'PENDING',  NULL);

-- ─────────────────────────────────────────────
--  SEED — DELIVERY (rastreo activo)
-- ─────────────────────────────────────────────

INSERT INTO deliveries (order_id, repartidor_id, lat_actual, lng_actual, estado) VALUES
('20000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000004',
 4.6391, -74.0849, 'ENTREGADO'),

('20000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000005',
 4.6380, -74.0680, 'ENTREGADO'),

('20000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000004',
 4.6621, -74.0973, 'EN_CAMINO');

-- ─────────────────────────────────────────────
--  SEED — CALIFICACIONES
-- ─────────────────────────────────────────────

INSERT INTO ratings (order_id, from_user_id, to_user_id, rol_calificado, puntaje, comentario) VALUES
('20000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000004',
 'repartidor', 5, 'Muy puntual y amable, llegó antes de lo esperado.'),

('20000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000006',
 'negocio', 5, 'La bandeja paisa estaba deliciosa, bien embalada.'),

('20000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000005',
 'repartidor', 4, 'Llegó en buen tiempo, la pizza estaba un poco fría.'),

('20000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000007',
 'negocio', 4, 'Buena pizza, pero el empaque podría ser mejor.');

-- ─────────────────────────────────────────────
--  SEED — COMISIONES
-- ─────────────────────────────────────────────

INSERT INTO commissions (order_id, business_id, repartidor_id, porcentaje_neg, porcentaje_rep, monto_negocio, monto_repartidor, estado) VALUES
('20000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000004',
 15.00, 10.00, 7650.00, 5100.00, 'PAGADO'),

('20000000-0000-0000-0000-000000000002',
 '10000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000005',
 15.00, 10.00, 10500.00, 7000.00, 'PAGADO'),

('20000000-0000-0000-0000-000000000003',
 '10000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000004',
 15.00, 10.00, 10200.00, 6800.00, 'PENDIENTE');

SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────
--  VERIFICACIÓN
-- ─────────────────────────────────────────────

SELECT
  (SELECT COUNT(*) FROM users)        AS total_usuarios,
  (SELECT COUNT(*) FROM businesses)   AS total_negocios,
  (SELECT COUNT(*) FROM products)     AS total_productos,
  (SELECT COUNT(*) FROM orders)       AS total_pedidos,
  (SELECT COUNT(*) FROM order_items)  AS total_items,
  (SELECT COUNT(*) FROM payments)     AS total_pagos,
  (SELECT COUNT(*) FROM deliveries)   AS total_deliveries,
  (SELECT COUNT(*) FROM ratings)      AS total_calificaciones,
  (SELECT COUNT(*) FROM commissions)  AS total_comisiones;

-- ─────────────────────────────────────────────
--  CREDENCIALES DE ACCESO
-- ─────────────────────────────────────────────
--
--  ROL          EMAIL                        PASSWORD
--  ──────────────────────────────────────────────────
--  admin        admin@domiapp.co             Domi12345
--  cliente      camila@cliente.co            Domi12345
--  cliente      sebastian@cliente.co         Domi12345
--  repartidor   andres@rider.co              Domi12345
--  repartidor   luis@rider.co                Domi12345
--  negocio      elfogon@negocio.co           Domi12345
--  negocio      pizzaexpress@negocio.co      Domi12345
--  negocio      nakama@negocio.co            Domi12345
--
-- ─────────────────────────────────────────────