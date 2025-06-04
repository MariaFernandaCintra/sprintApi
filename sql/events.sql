
-- ===================================
--    Events
-- ===================================

-- EVENT: Exclui registros antigos da tabela de logs de reservas (1 ano)

CREATE EVENT IF NOT EXISTS excluirReservasAntigas
    ON SCHEDULE EVERY 1 WEEK 
    STARTS CURRENT_TIMESTAMP + INTERVAL 1 MINUTE 
    ON COMPLETION PRESERVE
    ENABLE
DO
    DELETE FROM logreservas
    WHERE data_reserva < NOW() - INTERVAL 1 YEAR;
