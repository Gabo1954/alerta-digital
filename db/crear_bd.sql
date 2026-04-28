-- =======================================================
-- 1. ELIMINAR TABLAS (SI EXISTEN) PARA REINICIAR EL MUNDO
-- =======================================================
DROP TABLE analisis_asistencia CASCADE CONSTRAINTS;
DROP TABLE analisis CASCADE CONSTRAINTS;
DROP TABLE resultado_analisis CASCADE CONSTRAINTS;
DROP TABLE nivel_riesgo CASCADE CONSTRAINTS;
DROP TABLE mensaje CASCADE CONSTRAINTS;
DROP TABLE numero_origen CASCADE CONSTRAINTS;
DROP TABLE historial CASCADE CONSTRAINTS;
DROP TABLE accion CASCADE CONSTRAINTS;
DROP TABLE configuracion CASCADE CONSTRAINTS;
DROP TABLE usuario CASCADE CONSTRAINTS;
DROP TABLE tipo_usuario CASCADE CONSTRAINTS;
DROP TABLE asistencia CASCADE CONSTRAINTS;
DROP TABLE telefono_institucion CASCADE CONSTRAINTS;
DROP TABLE institucion CASCADE CONSTRAINTS;
DROP TABLE categoria_asistencia CASCADE CONSTRAINTS;
DROP TABLE ia_diccionario CASCADE CONSTRAINTS; 

-- =======================================================
-- 2. CREACIÓN DE TABLAS Y RESTRICCIONES (CONSTRAINTS)
-- =======================================================

CREATE TABLE tipo_usuario (
    id_tipo_usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(45),
    descripcion VARCHAR2(100)
);

CREATE TABLE usuario (
    id_usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(45),
    ap_paterno VARCHAR2(45),
    ap_materno VARCHAR2(45),
    fecha_nacimiento DATE,
    correo VARCHAR2(45) UNIQUE,
    celular VARCHAR2(15) UNIQUE,
    password VARCHAR2(255), 
    es_vip NUMBER(1) DEFAULT 0, 
    tipo_usuario_id_tipo_usuario NUMBER,
    CONSTRAINT fk_usuario_tipo FOREIGN KEY (tipo_usuario_id_tipo_usuario)
        REFERENCES tipo_usuario(id_tipo_usuario)
);

CREATE TABLE configuracion (
    id_configuracion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mensajes NUMBER(1) DEFAULT 1, 
    notificaciones NUMBER(1) DEFAULT 1,
    idioma CHAR(2) DEFAULT 'es',
    usuario_id_usuario NUMBER UNIQUE,
    CONSTRAINT fk_config_usuario FOREIGN KEY (usuario_id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE accion (
    id_accion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(45)
);

CREATE TABLE historial (
    id_historial NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha TIMESTAMP,
    accion_id_accion NUMBER,
    usuario_id_usuario NUMBER,
    CONSTRAINT fk_hist_accion FOREIGN KEY (accion_id_accion)
        REFERENCES accion(id_accion),
    CONSTRAINT fk_hist_usuario FOREIGN KEY (usuario_id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE numero_origen (
    id_numero NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero VARCHAR2(15) UNIQUE
);

CREATE TABLE mensaje (
    id_mensaje NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contenido CLOB,
    fecha_recepcion TIMESTAMP,
    usuario_id_usuario NUMBER,
    numero_id_numero NUMBER,
    CONSTRAINT fk_mensaje_usuario FOREIGN KEY (usuario_id_usuario)
        REFERENCES usuario(id_usuario),
    CONSTRAINT fk_mensaje_numero FOREIGN KEY (numero_id_numero)
        REFERENCES numero_origen(id_numero)
);

CREATE TABLE nivel_riesgo (
    id_nivel NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(30)
);

CREATE TABLE resultado_analisis (
    id_resultado NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(30)
);

CREATE TABLE analisis (
    id_analisis NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha_analisis TIMESTAMP,
    mensaje_id_mensaje NUMBER,
    nivel_riesgo_id_nivel NUMBER,
    resultado_analisis_id_resultado NUMBER,
    CONSTRAINT fk_analisis_mensaje FOREIGN KEY (mensaje_id_mensaje)
        REFERENCES mensaje(id_mensaje),
    CONSTRAINT fk_analisis_nivel FOREIGN KEY (nivel_riesgo_id_nivel)
        REFERENCES nivel_riesgo(id_nivel),
    CONSTRAINT fk_analisis_resultado FOREIGN KEY (resultado_analisis_id_resultado)
        REFERENCES resultado_analisis(id_resultado)
);

CREATE TABLE institucion (
    id_institucion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(45)
);

CREATE TABLE telefono_institucion (
    id_telefono NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero VARCHAR2(15) UNIQUE,
    institucion_id_institucion NUMBER,
    CONSTRAINT fk_tel_inst FOREIGN KEY (institucion_id_institucion)
        REFERENCES institucion(id_institucion)
);

CREATE TABLE categoria_asistencia (
    id_categoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(45)
);

CREATE TABLE asistencia (
    id_asistencia NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    institucion_id_institucion NUMBER,
    categoria_asistencia_id_categoria NUMBER,
    CONSTRAINT fk_asis_inst FOREIGN KEY (institucion_id_institucion)
        REFERENCES institucion(id_institucion),
    CONSTRAINT fk_asis_cat FOREIGN KEY (categoria_asistencia_id_categoria)
        REFERENCES categoria_asistencia(id_categoria)
);

CREATE TABLE analisis_asistencia (
    analisis_id_analisis NUMBER,
    asistencia_id_asistencia NUMBER,
    CONSTRAINT pk_analisis_asistencia PRIMARY KEY (analisis_id_analisis, asistencia_id_asistencia),
    CONSTRAINT fk_rel_analisis FOREIGN KEY (analisis_id_analisis)
        REFERENCES analisis(id_analisis),
    CONSTRAINT fk_rel_asistencia FOREIGN KEY (asistencia_id_asistencia)
        REFERENCES asistencia(id_asistencia)
);

CREATE TABLE ia_diccionario (
    palabra VARCHAR2(100) PRIMARY KEY,
    peso_spam NUMBER(5,2) DEFAULT 0,
    peso_safe NUMBER(5,2) DEFAULT 0
);

-- =======================================================
-- 3. INSERCIÓN DE DATOS (DATA SEEDING GENERAL)
-- =======================================================

INSERT INTO tipo_usuario (nombre, descripcion) VALUES ('Usuario', 'Usuario normal');
INSERT INTO tipo_usuario (nombre, descripcion) VALUES ('Administrador', 'Usuario con privilegios');

INSERT INTO usuario (nombre, ap_paterno, ap_materno, fecha_nacimiento, correo, celular, password, es_vip, tipo_usuario_id_tipo_usuario)
VALUES ('Gabriel', 'Tello', 'Fernandez', DATE '2000-05-10', 'tello953@gmail.com', '912345678', 'AUTH_GOOGLE', 1, 2);

INSERT INTO configuracion (mensajes, notificaciones, idioma, usuario_id_usuario) VALUES (1, 1, 'es', 1);

INSERT INTO accion (nombre) VALUES ('Inicio de sesión');
INSERT INTO accion (nombre) VALUES ('Analisis de mensaje');
INSERT INTO accion (nombre) VALUES ('Cambio de configuracion');

INSERT INTO nivel_riesgo (nombre) VALUES ('Bajo');
INSERT INTO nivel_riesgo (nombre) VALUES ('Medio');
INSERT INTO nivel_riesgo (nombre) VALUES ('Alto');

INSERT INTO resultado_analisis (nombre) VALUES ('Mensaje seguro');
INSERT INTO resultado_analisis (nombre) VALUES ('Mensaje sospechoso');
INSERT INTO resultado_analisis (nombre) VALUES ('Fraude detectado');

INSERT INTO institucion (nombre) VALUES ('Banco Estado');
INSERT INTO institucion (nombre) VALUES ('PDI Cibercrimen');
INSERT INTO institucion (nombre) VALUES ('Carabineros');
INSERT INTO institucion (nombre) VALUES ('Denuncia Seguro');

INSERT INTO telefono_institucion (numero, institucion_id_institucion) VALUES ('6002007000', 1);
INSERT INTO telefono_institucion (numero, institucion_id_institucion) VALUES ('134', 2);
INSERT INTO telefono_institucion (numero, institucion_id_institucion) VALUES ('133', 3);
INSERT INTO telefono_institucion (numero, institucion_id_institucion) VALUES ('*4242', 4);

INSERT INTO categoria_asistencia (nombre) VALUES ('Banco');
INSERT INTO categoria_asistencia (nombre) VALUES ('Seguridad');
INSERT INTO categoria_asistencia (nombre) VALUES ('Anonimo');

INSERT INTO asistencia (institucion_id_institucion, categoria_asistencia_id_categoria) VALUES (1, 1);
INSERT INTO asistencia (institucion_id_institucion, categoria_asistencia_id_categoria) VALUES (2, 2);
INSERT INTO asistencia (institucion_id_institucion, categoria_asistencia_id_categoria) VALUES (3, 2);
INSERT INTO asistencia (institucion_id_institucion, categoria_asistencia_id_categoria) VALUES (4, 3);

-- =======================================================
-- 4. INSERCIÓN DEL DICCIONARIO IA (TUS DATOS PERSONALIZADOS)
-- =======================================================

-- Palabras Exclusivas de Riesgo (Spam)
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('2026', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('urgente', 5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('bloqueada', 5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('premio', 5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('ganador', 5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('contraseña', 4, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('actualizar', 3, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('cuenta', 2, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('verificar', 3, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('banco', 3, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('aaaaaaaaaaaaaa', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('estimada/o', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('estudiante:', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('postulaste', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('innova', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('sostenible', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('torneo', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('innovacin', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('emprendimiento', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('busca', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('ideas', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('capaces', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('enfrentar', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('cambio', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('climtico', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('mejorar', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('calidad', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('vida', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('personas.', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('eres', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('estudiante', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('titulado/a', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('puedes', 3, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('postular', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('equipo', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('integrantes', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('desarrollar', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('solucin', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('impacto', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('real', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('reas', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('sostenibilidad', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('economa', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('circular', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('ciudades', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('resilientes', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('energa', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('limpia.', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('lograr', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('formacin', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('mentoras', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('acom', 1.5, 0);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('aaaaaa', 1.5, 0);

-- Palabras Exclusivas de Seguridad (Safe)
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('4051', 0, 1.5);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('6623', 0, 1.5);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('8856', 0, 1.5);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('hola', 0, 3.5);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('mañana', 0, 2);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('reunión', 0, 2);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('gracias', 0, 2);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('ok', 0, 1);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('saludos', 0, 2);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('universidad', 0, 2);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('estas', 0, 1.5);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('0044', 0, 1.5);

-- Palabras Compartidas en Ambas Listas (Fusionadas)
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('duoc', 1.5, 2);
INSERT INTO ia_diccionario (palabra, peso_spam, peso_safe) VALUES ('como', 1.5, 0.5);

COMMIT;