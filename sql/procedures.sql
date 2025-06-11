-- ================================
--    Procedures
-- ================================

-- PROCEDURE: Listar histórico de reservas de um usuário

DELIMITER //

CREATE PROCEDURE HistoricoReservaUsuario (p_id_usuario INT)

BEGIN
    SELECT data, hora_inicio, hora_fim, fk_id_sala
    FROM reserva
    WHERE p_id_usuario = fk_id_usuario AND data < CURDATE();
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