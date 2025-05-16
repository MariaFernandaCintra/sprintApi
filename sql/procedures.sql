-- PROCEDURE: listar histórico de reservas de um usuário

DELIMITER //

CREATE PROCEDURE HistoricoReservaUsuario (
    p_id_usuario int
)

BEGIN
    SELECT data, hora_inicio, hora_fim, fk_id_sala
    FROM reserva
    WHERE p_id_usuario = fk_id_usuario AND data < curdate();

END; //

DELIMITER ;

CALL  HistoricoReservaUsuario(1);

-- PROCEDURE: filtro de salas pelo nome ou descrição

DELIMITER //

CREATE PROCEDURE buscarSalasNome (
  IN p_termo VARCHAR(100)
)

BEGIN
  SELECT *
  FROM sala
  WHERE nome LIKE CONCAT('%', p_termo, '%')
     OR descricao LIKE CONCAT('%', p_termo, '%');

END //

DELIMITER ;

CALL buscarSalasNome("modelagem");