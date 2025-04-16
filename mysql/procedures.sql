DELIMITER //

CREATE PROCEDURE HistoricoReservaUsuario (
    p_id_usuario int
)
BEGIN
    SELECT data, hora_inicio, hora_fim, fk_id_sala
    FROM reserva
    WHERE p_id_usuario = fk_id_usuario;

END; //

DELIMITER ;

CALL  HistoricoReservaUsuario(1);