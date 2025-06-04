create event if not exists excluir_reservas_antigas
    on schedule every 1 week 
    starts current_timestamp + interval 1 minute 
    on completion preserve
    ENABLE
do
    delete from logreservas
    where data_reserva < now() - interval 1 year ;



     insert into reserva (fk_id_usuario, fk_id_sala, data, hora_inicio, hora_fim, dia_semana) values 
     (1, 1, "2001-01-01", "12:00:00", "13:00:00", "segunda-feira");