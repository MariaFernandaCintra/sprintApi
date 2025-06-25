
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
    WHERE data_inicio < NOW() - INTERVAL 1 YEAR;

INSERT IGNORE INTO reserva (data, hora_inicio, hora_fim, dia_semana, fk_id_usuario, fk_id_sala) VALUES
('2020-12-31', '07:00:00', '08:00:00', 'Quarta-Feira', 1, 1);
