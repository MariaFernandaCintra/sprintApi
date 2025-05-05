-- Total de reservas em uma determinada sala para um determinado dia
DELIMITER $$

CREATE FUNCTION TotalReservasPorSalaEDia(salaId INT, dataReserva DATE) 
RETURNS INT
not DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total INT;

    SELECT COUNT(*) INTO total
    FROM reserva
    WHERE fk_id_sala = salaId AND data = dataReserva;

    RETURN total;
END$$

DELIMITER ;

SELECT TotalReservasPorSalaEDia(2, '2025-12-31');