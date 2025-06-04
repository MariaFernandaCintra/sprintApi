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

    SELECT COUNT(*) INTO total
    FROM reserva
    WHERE fk_id_sala = salaId AND data = dataReserva;

    RETURN total;
END; //

DELIMITER ;