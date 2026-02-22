-- Rally Estudiantil 2.0 - Esquema de base de datos
-- Ejecutar en MySQL para crear la base y tablas

CREATE DATABASE IF NOT EXISTS rally_estudiantil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rally_estudiantil;

-- Registro de puntajes por equipo y juego
CREATE TABLE IF NOT EXISTS puntajes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_equipo VARCHAR(100) NOT NULL,
    tipo_juego ENUM('memorama', 'quiz', 'pistas', 'reto') NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    tiempo_segundos INT UNSIGNED NOT NULL,
    calificacion DECIMAL(2,1) NOT NULL CHECK (calificacion >= 1.0 AND calificacion <= 5.0),
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_equipo (nombre_equipo),
    INDEX idx_fecha (fecha_hora),
    INDEX idx_tipo (tipo_juego)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentario: cada fila representa un juego completado por un equipo
-- El puntaje total del rally se obtiene sumando/ponderando estos registros
