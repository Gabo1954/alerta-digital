DROP DATABASE IF EXISTS alerta_digital;
CREATE DATABASE alerta_digital;
USE alerta_digital;



-- =========================
-- CREACIÓN TABLAS BASE
-- =========================

CREATE TABLE tipo_usuario (
  id_tipo_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(45),
  descripcion VARCHAR(100)
);

CREATE TABLE usuario (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(45),
  ap_paterno VARCHAR(45),
  ap_materno VARCHAR(45),
  fecha_nacimiento DATE,
  correo VARCHAR(45) UNIQUE,
  celular VARCHAR(15) UNIQUE,
  tipo_usuario_id_tipo_usuario INT,
  FOREIGN KEY (tipo_usuario_id_tipo_usuario) REFERENCES tipo_usuario(id_tipo_usuario)
);

CREATE TABLE configuracion (
  id_configuracion INT PRIMARY KEY AUTO_INCREMENT,
  notificaciones TINYINT,
  idioma CHAR(2),
  usuario_id_usuario INT UNIQUE,
  FOREIGN KEY (usuario_id_usuario) REFERENCES usuario(id_usuario)
);

-- =========================
-- HISTORIAL
-- =========================

CREATE TABLE accion (
  id_accion INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(45)
);

CREATE TABLE historial (
  id_historial INT PRIMARY KEY AUTO_INCREMENT,
  fecha DATETIME,
  usuario_id_usuario INT,
  accion_id_accion INT,
  FOREIGN KEY (usuario_id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (accion_id_accion) REFERENCES accion(id_accion)
);

-- =========================
-- MENSAJES
-- =========================

CREATE TABLE numero_origen (
  id_numero INT PRIMARY KEY AUTO_INCREMENT,
  numero VARCHAR(15) UNIQUE
);

CREATE TABLE mensaje (
  id_mensaje INT PRIMARY KEY AUTO_INCREMENT,
  contenido TEXT,
  fecha_recepcion DATETIME,
  usuario_id_usuario INT,
  numero_id_numero INT,
  FOREIGN KEY (usuario_id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (numero_id_numero) REFERENCES numero_origen(id_numero)
);

-- =========================
-- ANALISIS
-- =========================

CREATE TABLE nivel_riesgo (
  id_nivel INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(30)
);

CREATE TABLE resultado_analisis (
  id_resultado INT PRIMARY KEY AUTO_INCREMENT,
  descripcion VARCHAR(200)
);

CREATE TABLE analisis (
  id_analisis INT PRIMARY KEY AUTO_INCREMENT,
  fecha_analisis DATETIME,
  mensaje_id_mensaje INT,
  nivel_riesgo_id_nivel INT,
  resultado_analisis_id_resultado INT,
  FOREIGN KEY (mensaje_id_mensaje) REFERENCES mensaje(id_mensaje),
  FOREIGN KEY (nivel_riesgo_id_nivel) REFERENCES nivel_riesgo(id_nivel),
  FOREIGN KEY (resultado_analisis_id_resultado) REFERENCES resultado_analisis(id_resultado)
);

-- =========================
-- ASISTENCIA
-- =========================

CREATE TABLE institucion (
  id_institucion INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(45)
);

CREATE TABLE telefono_institucion (
  id_telefono INT PRIMARY KEY AUTO_INCREMENT,
  numero VARCHAR(15),
  institucion_id_institucion INT,
  FOREIGN KEY (institucion_id_institucion) REFERENCES institucion(id_institucion)
);

CREATE TABLE categoria_asistencia (
  id_categoria INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(45)
);

CREATE TABLE asistencia (
  id_asistencia INT PRIMARY KEY AUTO_INCREMENT,
  institucion_id_institucion INT,
  categoria_asistencia_id_categoria INT,
  FOREIGN KEY (institucion_id_institucion) REFERENCES institucion(id_institucion),
  FOREIGN KEY (categoria_asistencia_id_categoria) REFERENCES categoria_asistencia(id_categoria)
);

-- =========================
-- RELACION N:M
-- =========================

CREATE TABLE analisis_asistencia (
  analisis_id_analisis INT,
  asistencia_id_asistencia INT,
  PRIMARY KEY (analisis_id_analisis, asistencia_id_asistencia),
  FOREIGN KEY (analisis_id_analisis) REFERENCES analisis(id_analisis),
  FOREIGN KEY (asistencia_id_asistencia) REFERENCES asistencia(id_asistencia)
);
