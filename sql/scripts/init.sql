-- =============================================
--    -- Criação do Banco de Dados e Tabelas
-- =============================================

-- Permite que usuários sem privilégio SUPER criem funções armazenadas mesmo com o log binário ativado

SET GLOBAL log_bin_trust_function_creators = 1;

SET NAMES 'utf8mb4';

CREATE DATABASE IF NOT EXISTS rs;

USE rs;

CREATE TABLE IF NOT EXISTS usuario(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    NIF CHAR(7) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS sala(
    id_sala INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) UNIQUE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    bloco VARCHAR(1) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    capacidade INT NOT NULL
);

CREATE TABLE IF NOT EXISTS reserva (
    id_reserva INT PRIMARY KEY AUTO_INCREMENT,
    fk_id_usuario INT NOT NULL,
    fk_id_sala INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    dias_semana SET('1','2','3','4','5','6') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (fk_id_sala) REFERENCES sala(id_sala),
    FOREIGN KEY (fk_id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_reserva_conflito ON reserva(fk_id_sala, data_inicio, data_fim, dias_semana, hora_inicio, hora_fim);
CREATE INDEX idx_logreservas_usuario ON logreservas(fk_id_usuario, tipo_operacao, data_hora_log);

-- ================================
--    Inserção dos Dados
-- ================================

INSERT IGNORE INTO usuario (nome, email, senha, NIF) VALUES
('João Silva', 'joao.silva@docente.senai.br', '$2b$12$j/zX1Wjtyg.IJkWCYh35P.r4YfngvCyuZOCd4pxjD5eMI1adiFMdm', '3456789');

INSERT IGNORE INTO sala (nome, descricao, bloco, tipo, capacidade) VALUES
('AMA - Automotiva', 'Alta Mogiana Automotiva', 'A', 'Oficina', 16),
('AMS - Desenvolvimento', 'Alta Mogiana Desenvolvimento de Sistema', 'A', 'Sala', 16),
('AME - Eletroeletrônica', 'Alta Mogiana Eletroeletrônica', 'A', 'Laboratório', 16),
('AMM - Manutenção', 'Alta Mogiana Manutenção', 'A', 'Oficina', 16),
('A2 - ELETRÔNICA', 'Laboratório de Eletrônica', 'A', 'Laboratório', 16),
('A3 - CLP', 'Controladores Lógicos Programáveis', 'A', 'Laboratório', 16),
('A4 - AUTOMAÇÃO', 'Sistemas de Automação', 'A', 'Laboratório', 20),
('A5 - METROLOGIA', 'Instrumentos de Medição', 'A', 'Laboratório', 16),
('A6 - PNEUMÁTICA', 'Equipamentos Pneumáticos e Hidráulicos', 'A', 'Laboratório', 20),
('B2 - AULA', 'Sala de Aula', 'B', 'Sala', 32),
('B3 - AULA', 'Sala de Aula', 'B', 'Sala', 32),
('B5 - AULA', 'Sala de Aula', 'B', 'Sala', 40),
('B6 - AULA', 'Sala de Aula', 'B', 'Sala', 32),
('B7 - AULA', 'Sala de Aula', 'B', 'Sala', 32),
('B8 - INFORMÁTICA', 'Laboratório de Informática', 'B', 'Laboratório', 20),
('B9 - INFORMÁTICA', 'Estação de Trabalho', 'B', 'Laboratório', 16),
('B10 - INFORMÁTICA', 'Computadores Programáveis', 'B', 'Laboratório', 16),
('B11 - INFORMÁTICA', 'Equipamentos de Rede', 'B', 'Laboratório', 40),
('B12 - INFORMÁTICA', 'Laboratório de TI', 'B', 'Laboratório', 40),
('CA - Colorado A1', 'Sala Multimídia', 'C', 'Sala', 16),
('COF - Colorado Oficina', 'Ferramentas Manuais', 'C', 'Oficina', 16),
('C1 - AULA (ALP)', 'Sala de Aula (ALP)', 'C', 'Sala', 24),
('C2 - INFORMATICA', 'Software Educacional', 'C', 'Laboratório', 32),
('C3 - MODELAGEM', 'Máquinas de Costura', 'C', 'Oficina', 20),
('C4 - MODELAGEM', 'Equipamentos de Modelagem', 'C', 'Oficina', 20),
('C5 - AULA', 'Materiais Didáticos', 'C', 'Sala', 16),
('D1 - MODELAGEM', 'Ferramentas de Modelagem', 'C', 'Oficina', 16),
('D2 - MODELAGEM', 'Estações de Trabalho de Modelagem', 'C', 'Oficina', 20),
('D3 - AULA', 'Quadro e Projetor', 'C', 'Sala', 16),
('D4 - CRIAÇÃO', 'Materiais de Artesanato', 'C', 'Oficina', 18),
('LAB - ALIMENTOS', 'Equipamentos de Cozinha', 'C', 'Laboratório', 16),
('OFI - AJUSTAGEM/FRESAGEM', 'Máquinas de Fresagem', 'C', 'Oficina', 16),
('OFI - COMANDOS ELÉTRICOS', 'Circuitos Elétricos', 'C', 'Oficina', 16),
('OFI - TORNEARIA', 'Torno Mecânico', 'C', 'Oficina', 20),
('OFI - SOLDAGEM', 'Equipamentos de Solda', 'C', 'Oficina', 16),
('OFI - MARCENARIA', 'Ferramentas de Marcenaria', 'C', 'Oficina', 16),
('OFI - LIXAMENTO', 'Lixadeiras e Polidoras', 'C', 'Oficina', 16);

INSERT IGNORE INTO reserva (data_inicio, data_fim, hora_inicio, hora_fim, dias_semana, fk_id_usuario, fk_id_sala) VALUES
('2025-12-31', '2025-12-31', '07:00:00', '08:00:00', '3', 1, 1),
('2025-12-31', '2025-12-31', '08:00:00', '09:00:00', '3', 1, 1),
('2025-01-01', '2025-01-01', '07:00:00', '08:00:00', '3', 1, 1),
('2025-01-01', '2025-01-01', '08:00:00', '09:00:00', '3', 1, 1);

INSERT IGNORE INTO reserva (fk_id_usuario, fk_id_sala, data_inicio, data_fim, dias_semana, hora_inicio, hora_fim) VALUES
(1, 2, '2025-01-01', '2025-12-31', '1,2,3,4,5,6', '07:00:00', '12:00:00'),
(1, 1, '2025-01-01', '2025-01-04', '3,4,5,6', '07:00:00', '12:00:00'),
(1, 1, '2025-12-29', '2025-12-31', '1,2,3', '07:00:00', '12:00:00');

-- ================================
--    Views
-- ================================

-- VIEW: Conta quantas reservas cada usuário tem

CREATE OR REPLACE VIEW cru AS
SELECT
    u.id_usuario,
    u.nome,
    COUNT(r.id_reserva) AS total_reservas
FROM
    usuario u
LEFT JOIN
    reserva r ON u.id_usuario = r.fk_id_usuario
GROUP BY
    u.id_usuario, u.nome;

-- VIEW: Lista as reservas de forma mais detalhada

CREATE OR REPLACE VIEW rd AS
SELECT
    r.id_reserva,
    r.data_inicio AS data_inicio,
    r.data_inicio AS data_fim,
    r.dias_semana,
    r.hora_inicio,
    r.hora_fim,
    s.id_sala AS sala_id_sala,
    s.nome AS sala_nome,
    u.nome AS usuario_nome
FROM
    reserva r
JOIN
    sala s ON r.fk_id_sala = s.id_sala
JOIN
    usuario u ON r.fk_id_usuario = u.id_usuario;

-- ================================
--    Functions
-- ================================

-- FUNCTION: Total de reservas em uma determinada sala para um determinado dia

DELIMITER //

CREATE FUNCTION TotalReservasPorSalaEDia(salaId INT, dataReserva DATE)

RETURNS INT
NOT DETERMINISTIC
READS SQL DATA

BEGIN
    DECLARE total INT;

    -- Contar reservas simples
    SELECT COUNT(*) INTO total
    FROM reserva
    WHERE fk_id_sala = salaId 
      AND data_inicio <= dataReserva
      AND data_fim >= dataReserva
      AND FIND_IN_SET(DAYOFWEEK(dataReserva), dias_semana) > 0;

    RETURN total;
END; //

DELIMITER ;

-- ================================
--    Procedures
-- ================================

-- PROCEDURE: Listar histórico de reservas de um usuário

DELIMITER //

CREATE PROCEDURE HistoricoReservaUsuario (p_id_usuario INT)

BEGIN
    SELECT
        r.id_reserva AS id,
        CASE
            WHEN r.data_inicio = r.data_fim THEN 'reservasimples'
            ELSE 'reservaperiodica'
        END AS tipo,
        r.fk_id_usuario,
        s.nome AS sala_nome,
        s.descricao AS sala_descricao,
        s.bloco AS sala_bloco,
        s.tipo AS sala_tipo,
        s.capacidade AS sala_capacidade,
        r.data_inicio,
        r.data_fim,
        r.dias_semana,
        r.hora_inicio,
        r.hora_fim
    FROM reserva r
    JOIN sala s ON r.fk_id_sala = s.id_sala
    WHERE r.fk_id_usuario = p_id_usuario
      AND r.data_fim < CURDATE()
    ORDER BY r.data_inicio DESC;

END; //

-- PROCEDURE: Listar histórico de reservas deletadas de um usuário

CREATE PROCEDURE HistoricoDelecaoUsuario (IN p_id_usuario INT)

BEGIN

    SELECT
        lr.id_log,
        CASE
            WHEN lr.data_inicio = lr.data_fim THEN 'reservasimples'
            ELSE 'reservaperiodica'
        END AS tipo,
        lr.id_reserva AS id,
        s.nome AS nome_sala,
        lr.data_inicio AS data_inicio,
        lr.data_fim AS data_fim,
        lr.dias_semana,
        lr.hora_inicio AS hora_inicio,
        lr.hora_fim AS hora_fim,
        lr.data_hora_log
    FROM logreservas lr
    JOIN sala s ON lr.fk_id_sala = s.id_sala
    WHERE lr.fk_id_usuario = p_id_usuario
      AND lr.tipo_operacao = 0
    ORDER BY lr.data_hora_log DESC;

END; //

-- PROCEDURE: Filtro de salas pelo nome ou descrição

CREATE PROCEDURE buscarSalasNome (IN p_termo VARCHAR(100))

BEGIN
    SELECT *
    FROM sala
    WHERE nome LIKE CONCAT('%', p_termo, '%')
        OR descricao LIKE CONCAT('%', p_termo, '%');
END; //

DELIMITER ;

-- ===================================
--    Triggers e Tabela de Histórico
-- ===================================

-- Criação da tabela para armazenar os logs de criação e deleção das Reservas

CREATE TABLE IF NOT EXISTS logreservas (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    fk_id_sala INT NOT NULL,
    fk_id_usuario INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    dias_semana SET('1','2','3','4','5','6') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    tipo_operacao TINYINT NOT NULL,
    data_hora_log DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela para armazenar os logs de criação e deleção dos Usuários

CREATE TABLE IF NOT EXISTS logusuarios (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    NIF CHAR(7) NOT NULL,
    tipo_operacao TINYINT NOT NULL,
    data_hora_log DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TRIGGER: Armazenar histórico de criação de reservas (tipo = 1)

DELIMITER //

CREATE TRIGGER logreservacriacao
AFTER INSERT ON reserva
FOR EACH ROW
BEGIN
    INSERT INTO logreservas (
        id_reserva,
        fk_id_sala,
        fk_id_usuario,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim,
        tipo_operacao
    )
    VALUES (
        NEW.id_reserva,
        NEW.fk_id_sala,
        NEW.fk_id_usuario,
        NEW.data_inicio,
        NEW.data_fim,
        NEW.dias_semana,
        NEW.hora_inicio,
        NEW.hora_fim,
        1
    );
END; //

DELIMITER ;

-- TRIGGER: Armazenar histórico de deleção de reservas (tipo = 0)

DELIMITER //

CREATE TRIGGER logreservadelecao
AFTER DELETE ON reserva
FOR EACH ROW
BEGIN
    INSERT INTO logreservas (
        id_reserva,
        fk_id_sala,
        fk_id_usuario,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim,
        tipo_operacao
    )
    VALUES (
        OLD.id_reserva,
        OLD.fk_id_sala,
        OLD.fk_id_usuario,
        OLD.data_inicio,
        OLD.data_fim,
        OLD.dias_semana,
        OLD.hora_inicio,
        OLD.hora_fim,
        0
    );
END; //

DELIMITER ;

-- TRIGGER: Armazenar histórico de criação de um usuário (tipo = 1)

DELIMITER //

CREATE TRIGGER logusuariocriacao
AFTER INSERT ON usuario
FOR EACH ROW
BEGIN
    INSERT INTO logusuarios (
        id_usuario,
        nome,
        email,
        NIF,
        tipo_operacao
    )
    VALUES (
        NEW.id_usuario,
        NEW.nome,
        NEW.email,
        NEW.NIF,
        1
    );
END; //

DELIMITER ;

-- TRIGGER: Armazenar histórico de deleção de um usuário (tipo = 0)

DELIMITER //

CREATE TRIGGER logusuariodelecao
AFTER DELETE ON usuario
FOR EACH ROW
BEGIN
    INSERT INTO logusuarios (
        id_usuario,
        nome,
        email,
        NIF,
        tipo_operacao
    )
    VALUES (
        OLD.id_usuario,
        OLD.nome,
        OLD.email,
        OLD.NIF,
        0
    );
END; //

DELIMITER ;

-- ==========================================================================
--    Retro­população de logreservas e logusuarios e logreservaperiodica
-- ==========================================================================

INSERT INTO logreservas (
    id_reserva,
    fk_id_sala,
    fk_id_usuario,
    data_inicio,
    data_fim,
    dias_semana,
    hora_inicio,
    hora_fim,
    tipo_operacao,
    data_hora_log
)
SELECT
    id_reserva,
    fk_id_sala,
    fk_id_usuario,
    data_inicio,
    data_fim,
    dias_semana,
    hora_inicio,
    hora_fim,
    1 AS tipo_operacao,
    NOW() AS data_hora_log
FROM reserva;

INSERT INTO logusuarios (
    id_usuario,
    nome,
    email,
    NIF,
    tipo_operacao,
    data_hora_log
)
SELECT
    id_usuario,
    nome,
    email,
    NIF,
    1 AS tipo_operacao,
    NOW() AS data_hora_log
FROM
    usuario;

-- ==================================
--   Events
-- ==================================

-- EVENT: Exclui registros antigos da tabela de logs de reservas (1 ano)

CREATE EVENT IF NOT EXISTS excluirReservasAntigas
    ON SCHEDULE EVERY 1 WEEK
    STARTS CURRENT_TIMESTAMP + INTERVAL 1 MINUTE
    ON COMPLETION PRESERVE
    ENABLE
DO
    DELETE FROM logreservas
    WHERE data_inicio < NOW() - INTERVAL 1 YEAR;
