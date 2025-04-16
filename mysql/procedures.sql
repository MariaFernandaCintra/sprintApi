DELIMITER //

CREATE PROCEDURE HistoricoReservaUsuario (
    p_id_usuario int
)
BEGIN
    SELECT datahora_inicio, datahora_fim, fk_id_sala
    FROM reserva
    WHERE p_id_usuario = fk_id_usuario;

END; //

DELIMITER ;

CALL VerificarHistoricoUsuario(1);