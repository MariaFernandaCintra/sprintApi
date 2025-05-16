-- TRIGGER: armazenar histórico de deleção de reservas

-- Criação de tabela para armazenar os dados 
CREATE TABLE historicoDelecaoReserva (
  id_historico INT AUTO_INCREMENT PRIMARY KEY,
  nome_sala VARCHAR(100),
  data DATE,
  hora_inicio TIME,
  hora_fim TIME,
  data_delecao DATETIME
);


-- TRIGGER
DELIMITER //

CREATE TRIGGER salvarHistoricoDelecao
AFTER DELETE ON reserva
FOR EACH ROW

BEGIN

  DECLARE nomeSala VARCHAR(100);

  -- Busca o nome da sala no momento da exclusão
  SELECT nome INTO nomeSala FROM sala WHERE id_sala = OLD.fk_id_sala;

  -- Insere no histórico
  INSERT INTO historicoDelecaoReserva (
    nome_sala,
    data,
    hora_inicio,
    hora_fim,
    data_delecao
  )
  VALUES (
    nomeSala,
    OLD.data,
    OLD.hora_inicio,
    OLD.hora_fim,
    NOW()
  );

END; //

DELIMITER ;


DELETE FROM reserva WHERE id_reserva = 5;

DROP TRIGGER IF EXISTS salvarHistoricoDelecao;
