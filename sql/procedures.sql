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