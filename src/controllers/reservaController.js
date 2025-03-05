const connect = require("../db/connect");

module.exports = class AgendamentoController {

  static createReservas(req, res) {
    // Extrai os dados enviados no corpo da requisição
    const { fk_id_usuario, fk_id_sala, datahora_inicio, datahora_fim } =
      req.body;

    // Validação inicial: verifica se todos os campos obrigatórios foram preenchidos
    if (!fk_id_usuario || !fk_id_sala || !datahora_inicio || !datahora_fim) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    // Consulta SQL para verificar se o usuário existe
    const queryUsuario = `SELECT * FROM usuario WHERE id_usuario = ?`;
    const valuesUsuario = [fk_id_usuario];

    // Consulta SQL para verificar se a sala existe
    const querySala = `SELECT * FROM sala WHERE id_sala = ?`;
    const valuesSala = [fk_id_sala];

    // Consulta SQL para verificar conflitos de horário com reservas existentes
    const queryHorario = `
    SELECT datahora_inicio, datahora_fim FROM reserva
    WHERE fk_id_sala = ? 
    AND (
      (datahora_inicio < ? AND datahora_fim > ?) OR  -- Caso 1: Nova reserva começa dentro de uma reserva existente.
      (datahora_inicio < ? AND datahora_fim > ?) OR  -- Caso 2: Nova reserva termina dentro de uma reserva existente.
      (datahora_inicio >= ? AND datahora_inicio < ?) OR  -- Caso 3: Nova reserva engloba uma reserva existente.
      (datahora_fim > ? AND datahora_fim <= ?)  -- Caso 4: Uma reserva existente engloba a nova reserva.
    )
  `;

    // Valores usados na consulta
    const valuesHorario = [
      fk_id_sala, // Sala para verificar as reservas.
      datahora_inicio, // Início da nova reserva para verificar os conflitos.
      datahora_inicio, // Fim da reserva existente deve ser após o início da nova reserva.
      datahora_inicio, // Início da nova reserva para verificar outro tipo de conflito.
      datahora_fim, // Fim da nova reserva para verificar outro tipo de conflito.
      datahora_inicio, // Início da reserva existente dentro do intervalo da nova reserva.
      datahora_fim, // Fim da nova reserva para verificar outro tipo de conflito.
      datahora_inicio, // Início da nova reserva para verificar outro tipo de conflito.
      datahora_fim, // Fim da nova reserva para verificar outro tipo de conflito.
    ];

    // Verifica conflitos de horário para a sala
    connect.query(queryHorario, valuesHorario, (err, resultadosH) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao verificar horário" });
      }

      // Verifica se o usuário existe
      connect.query(queryUsuario, valuesUsuario, (err, resultadosU) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao buscar usuário" });
        }

        // Verifica se a sala existe
        connect.query(querySala, valuesSala, (err, resultadosS) => {
          if (err) {
            return res.status(500).json({ error: "Erro ao buscar sala" });
          }

          // Retorna erro se o usuário não foi encontrado
          if (resultadosU.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
          }

          // Retorna erro se a sala não foi encontrada
          if (resultadosS.length === 0) {
            return res.status(404).json({ error: "Sala não encontrada" });
          }

          // Verifica se o horário solicitado está fora do horário permitido (8:00 - 21:00)
          const inicio = new Date(datahora_inicio).getHours();
          const fim = new Date(datahora_fim).getHours();
          if (inicio < 7 || inicio >= 21 || fim < 7 || fim >= 21) {
            return res.status(400).json({
              error:
                "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 21:00",
            });
          }

          // Verifica se as datas e horários são válidos
          const inicioDate = new Date(datahora_inicio);
          const fimDate = new Date(datahora_fim);
          if (inicioDate < new Date() || fimDate <= inicioDate) {
            return res.status(400).json({ error: "Data ou Horário Inválidos" });
          }

          // Verifica se o tempo da reserva é exatamente 50 minutos
          const tempoReserva = fimDate - inicioDate;
          const limite = 50 * 60 * 1000; // 50 minutos em milissegundos
          if (tempoReserva !== limite) {
            return res
              .status(400)
              .json({ error: "A reserva deve ter exatamente 50 minutos" });
          }

          // Se houver conflitos de horário, sugere o próximo horário disponível
          if (resultadosH.length > 0) {
            const reservasOrdenadas = resultadosH.sort(
              (a, b) => new Date(a.datahora_fim) - new Date(b.datahora_fim)
            );
            const proximoHorarioInicio = new Date(
              reservasOrdenadas[0].datahora_fim
            );

            proximoHorarioInicio.setHours(proximoHorarioInicio.getHours() - 3);
            
            const proximoHorarioFim = new Date(
              proximoHorarioInicio.getTime() + limite
            );

            return res.status(400).json({
              error: `A sala já está reservada neste horário. O próximo horário disponível é de ${proximoHorarioInicio
                .toISOString()
                .replace("T", " ")
                .substring(0, 19)} até ${proximoHorarioFim
                .toISOString()
                .replace("T", " ")
                .substring(0, 19)}`,
            });
          }

          // Insere a nova reserva no banco de dados
          const queryInsert = `
            INSERT INTO reserva (fk_id_usuario, fk_id_sala, datahora_inicio, datahora_fim)
            VALUES (?, ?, ?, ?)
          `;
          const valuesInsert = [
            fk_id_usuario,
            fk_id_sala,
            datahora_inicio,
            datahora_fim,
          ];

          connect.query(queryInsert, valuesInsert, (err) => {
            if (err) {
              return res.status(500).json({ error: "Erro ao criar reserva" });
            }
            return res
              .status(201)
              .json({ message: "Sala reservada com sucesso!" });
          });
        });
      });
    });
  }

  static getAllReservas(req, res) {
    const query = `SELECT * FROM reserva`;

    connect.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro Interno do Servidor" });
      }
      return res
        .status(200)
        .json({ message: "Obtendo todas as reservas", reservas: results });
    });
  }

  static updateReserva(req, res) {
    const { datahora_inicio, datahora_fim } = req.body;
    const reservaId = req.params.id_reserva;

    // Valida se os campos obrigatórios foram enviados
    if (!datahora_inicio || !datahora_fim) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    // Função para validar horários de funcionamento
    const validaHorarioFuncionamento = (data) => {
      const hora = new Date(data).getHours();
      return hora >= 7 && hora < 21;
    };

    // Verifica se os horários estão no intervalo permitido
    if (
      !validaHorarioFuncionamento(datahora_inicio) ||
      !validaHorarioFuncionamento(datahora_fim)
    ) {
      return res.status(400).json({
        error:
          "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 21:00",
      });
    }

    // Verifica se as datas são válidas
    const inicio = new Date(datahora_inicio);
    const fim = new Date(datahora_fim);

    if (inicio < new Date() || fim < new Date()) {
      return res.status(400).json({ error: "Data ou Horário inválidos" });
    }

    if (fim <= inicio) {
      return res.status(400).json({
        error: "A data/hora de fim deve ser após a data/hora de início",
      });
    }

    const tempoReserva = fim - inicio;
    const limiteReserva = 50 * 60 * 1000; // 50 minutos em milissegundos

    if (tempoReserva !== limiteReserva) {
      return res
        .status(400)
        .json({ error: "A reserva deve ter exatamente 50 minutos" });
    }

    // Consulta para obter o fk_id_sala com base no id_reserva
    const querySala = `
      SELECT fk_id_sala 
      FROM reserva 
      WHERE id_reserva = ?
    `;
    const valuesSala = [reservaId];

    connect.query(querySala, valuesSala, (err, resultadosSala) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erro ao consultar o banco de dados" });
      }

      if (resultadosSala.length === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }

      const fk_id_sala = resultadosSala[0].fk_id_sala;

      // Verifica conflitos de horário
      const queryHorario = `
        SELECT datahora_inicio, datahora_fim 
        FROM reserva 
        WHERE fk_id_sala = ? 
          AND id_reserva != ? 
          AND (
            (datahora_inicio < ? AND datahora_fim > ?) OR
            (datahora_inicio < ? AND datahora_fim > ?) OR
            (datahora_inicio >= ? AND datahora_inicio < ?) OR
            (datahora_fim > ? AND datahora_fim <= ?)
          )
      `;
      const valuesHorario = [
        fk_id_sala,
        reservaId,
        datahora_inicio,
        datahora_inicio,
        datahora_inicio,
        datahora_fim,
        datahora_inicio,
        datahora_fim,
        datahora_inicio,
        datahora_fim,
      ];

      connect.query(queryHorario, valuesHorario, (err, resultadosH) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Erro ao consultar banco de dados" });
        }

        if (resultadosH.length > 0) {
          // Calcula o próximo horário disponível
          const reservasOrdenadas = resultadosH.sort(
            (a, b) => new Date(a.datahora_fim) - new Date(b.datahora_fim)
          );

          const proximoHorarioInicio = new Date(
            reservasOrdenadas[0].datahora_fim
          );
          proximoHorarioInicio.setHours(proximoHorarioInicio.getHours() - 3);

          const proximoHorarioFim = new Date(proximoHorarioInicio);
          proximoHorarioFim.setMinutes(proximoHorarioFim.getMinutes() + 50);

          return res.status(400).json({
            error: `A sala já está reservada neste horário. O próximo horário disponível é de ${proximoHorarioInicio
              .toISOString()
              .replace("T", " ")
              .substring(0, 19)} até ${proximoHorarioFim
              .toISOString()
              .replace("T", " ")
              .substring(0, 19)}`,
          });
        }

        // Atualiza a reserva
        const queryUpdate = `
          UPDATE reserva 
          SET datahora_inicio = ?, datahora_fim = ? 
          WHERE id_reserva = ?
        `;
        const valuesUpdate = [datahora_inicio, datahora_fim, reservaId];

        connect.query(queryUpdate, valuesUpdate, (err, results) => {
          if (err) {
            return res.status(500).json({ error: "Erro ao atualizar reserva" });
          }

          return res
            .status(200)
            .json({ message: "Reserva atualizada com sucesso!" });
        });
      });
    });
  }

  static deleteReserva(req, res) {
    const reservaId = req.params.id_reserva;
    const query = `DELETE FROM reserva WHERE id_reserva = ?`;
    const values = [reservaId];

    connect.query(query, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro interno no servidor" });
      }

      // Verifica se o usuário foi encontrado e excluído
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }
      return res.status(200).json({ message: "Reserva excluída com sucesso" });
    });
  }
};
