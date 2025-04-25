DELIMITER //

CREATE FUNCTION TotalUsuarios()
RETURNS INT
not DETERMINISTIC
reads sql data
BEGIN
    DECLARE total INT;

    SELECT COUNT(*) INTO total
    FROM usuario;

    RETURN total;
END; //

DELIMITER ;

SELECT TotalUsuarios();