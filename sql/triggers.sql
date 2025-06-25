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