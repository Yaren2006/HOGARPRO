-- HogarPro. Selecciona una base vacía antes de importar este archivo.
-- npm run db:init crea y selecciona hogarpro automáticamente. No elimina tablas.
CREATE TABLE IF NOT EXISTS categories (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(80) NOT NULL, slug VARCHAR(80) NOT NULL UNIQUE,
 description VARCHAR(150) NOT NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL, email VARCHAR(190) NOT NULL UNIQUE,
 phone VARCHAR(20) NOT NULL, password_hash VARCHAR(255) NOT NULL,
 role ENUM('client','professional') NOT NULL,
 district VARCHAR(100) NOT NULL DEFAULT 'Tamburco, Abancay',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS professional_profiles (
 user_id INT UNSIGNED PRIMARY KEY,
 bio TEXT NOT NULL, experience_years INT UNSIGNED NOT NULL DEFAULT 0,
 available BOOLEAN NOT NULL DEFAULT TRUE,
 rating DECIMAL(2,1) NOT NULL DEFAULT 0, review_count INT UNSIGNED NOT NULL DEFAULT 0,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS professional_categories (
 professional_id INT UNSIGNED NOT NULL, category_id INT UNSIGNED NOT NULL,
 PRIMARY KEY(professional_id, category_id),
 FOREIGN KEY(professional_id) REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
 FOREIGN KEY(category_id) REFERENCES categories(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS sessions (
 token_hash CHAR(64) PRIMARY KEY, user_id INT UNSIGNED NOT NULL,
 expires_at DATETIME NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 INDEX idx_session_expiry(expires_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS requests (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 client_id INT UNSIGNED NOT NULL, professional_id INT UNSIGNED NOT NULL,
 category_id INT UNSIGNED NOT NULL, description TEXT NOT NULL,
 address VARCHAR(200) NOT NULL, district VARCHAR(100) NOT NULL,
 reference VARCHAR(250) NOT NULL DEFAULT '',
 preferred_when ENUM('soon','scheduled') NOT NULL DEFAULT 'soon',
 preferred_date DATE NULL, preferred_time TIME NULL,
 status ENUM('pending','accepted','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(client_id) REFERENCES users(id),
 FOREIGN KEY(professional_id) REFERENCES professional_profiles(user_id),
 FOREIGN KEY(category_id) REFERENCES categories(id),
 INDEX idx_client_requests(client_id, created_at),
 INDEX idx_professional_requests(professional_id, status)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS request_events (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, request_id INT UNSIGNED NOT NULL,
 actor_id INT UNSIGNED NOT NULL,
 status ENUM('pending','accepted','rejected','cancelled','completed') NOT NULL,
 note VARCHAR(300) NOT NULL DEFAULT '', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE,
 FOREIGN KEY(actor_id) REFERENCES users(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS request_attachments (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, request_id INT UNSIGNED NOT NULL,
 filename VARCHAR(100) NOT NULL, mime_type VARCHAR(40) NOT NULL, data MEDIUMBLOB NOT NULL,
 FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;
