const connect = require("../db/connect");
const validateReserva = require("../services/validateReserva");

// Função auxiliar para executar queries e retornar uma Promise
const queryAsync = (query, values = []) => {
  return new Promise((resolve, reject) => {
    connect.query(query, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = class AgendamentoController {
  static async createReservas(req, res) {
    const { fk_id_usuario, fk_id_sala, datahora_inicio, datahora_fim } =
      req.body;

    // Validação inicial dos campos
    const validationError = validateReserva.validateReserva({
      fk_id_usuario,
      fk_id_sala,
      datahora_inicio,
      datahora_fim,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    try {
      // Verifica se o usuário existe
      const userExists = await validateReserva.checkUserExists(fk_id_usuario);
      if (!userExists) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Verifica se a sala existe
      const salaExists = await validateReserva.checkSalaExists(fk_id_sala);
      if (!salaExists) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }

      // Verifica conflitos de horário para a sala
      const conflitos = await validateReserva.checkConflitoHorario(
        fk_id_sala,
        datahora_inicio,
        datahora_fim
      );
      if (conflitos && conflitos.length > 0) {
        const reservasOrdenadas = conflitos.sort(
          (a, b) => new Date(a.datahora_fim) - new Date(b.datahora_fim)
        );
        const proximoHorarioInicio = new Date(
          reservasOrdenadas[0].datahora_fim
        );
        proximoHorarioInicio.setHours(proximoHorarioInicio.getHours() - 3);
        const proximoHorarioFim = new Date(
          proximoHorarioInicio.getTime() + 50 * 60 * 1000
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
      await queryAsync(queryInsert, [
        fk_id_usuario,
        fk_id_sala,
        datahora_inicio,
        datahora_fim,
      ]);

      return res.status(201).json({ message: "Sala reservada com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar reserva" });
    }
  }

  static async getAllReservas(req, res) {
    // const query = `SELECT * FROM reserva;`
    // try {
    //   const results = await queryAsync(query);
    //   return res.status(200).json({ message: "Obtendo todas as reservas", reservas: results });
    // } catch (error) {
    //   console.error(error);
    //   return res.status(500).json({ error: "Erro Interno do Servidor" });
    // }
    const query = `SELECT * FROM reserva`;
    try {
      const results = await queryAsync(query);

      const reservasTransformadas = results.map((reserva) => {
        // Extrai as strings de data/hora
        const startStr = reserva.datahora_inicio.toISOString();
        const endStr = reserva.datahora_fim.toISOString();

        // Caso o formato não esteja em ISO (com "T"), converte para garantir que o Date entenda corretamente
        const startISO = startStr.includes("T")
          ? startStr
          : startStr.replace(" ", "T");
        const endISO = endStr.includes("T") ? endStr : endStr.replace(" ", "T");

        const startDate = new Date(startISO);
        const endDate = new Date(endISO);

        // Função para formatar data no formato YYYY-MM-DD
        const formatDate = (date) => {
          const ano = date.getFullYear();
          const mes = String(date.getMonth() + 1).padStart(2, "0");
          const dia = String(date.getDate()).padStart(2, "0");
          return `${ano}-${mes}-${dia}`;
        };

        // Função para formatar hora no formato HH:MM:SS
        const formatTime = (date) => {
          const hora = String(date.getHours()).padStart(2, "0");
          const minuto = String(date.getMinutes()).padStart(2, "0");
          const segundo = String(date.getSeconds()).padStart(2, "0");
          return `${hora}:${minuto}:${segundo}`;
        };

        // Mapeamento dos dias da semana em português
        // Em JavaScript, getDay() retorna 0 para domingo, 1 para segunda, etc.
        const diasSemana = [
          "domingo",
          "segunda-feira",
          "terça-feira",
          "quarta-feira",
          "quinta-feira",
          "sexta-feira",
          "sábado",
        ];

        const diaSemana = diasSemana[startDate.getDay()];

        return {
          // Caso queira manter outras propriedades da reserva, pode desestruturar o objeto original:
          // ...reserva,
          id_reserva : reserva.id_reserva,
          fk_id_sala: reserva.fk_id_sala,
          fk_id_usuario : reserva.fk_id_usuario,
          dia: diaSemana,
          data_inicio: formatDate(startDate),
          data_fim: formatDate(endDate),
          hora_inicio: formatTime(startDate),
          hora_fim: formatTime(endDate),
        };
      });

      return res.status(200).json({
        message: "Obtendo todas as reservas",
        reservas: reservasTransformadas,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async updateReserva(req, res) {
    const { datahora_inicio, datahora_fim } = req.body;
    const reservaId = req.params.id_reserva;

    // Valida os campos de atualização usando a função de validação específica
    const validationError = validateReserva.validateUpdateReserva({
      datahora_inicio,
      datahora_fim,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    try {
      // Obtém o fk_id_sala da reserva para verificação de conflitos
      const querySala = `SELECT fk_id_sala FROM reserva WHERE id_reserva = ?`;
      const resultadosSala = await queryAsync(querySala, [reservaId]);
      if (resultadosSala.length === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }
      const fk_id_sala = resultadosSala[0].fk_id_sala;

      // Verifica conflitos de horário (excluindo a própria reserva)
      const queryHorario = `
        SELECT datahora_inicio, datahora_fim 
        FROM reserva 
        WHERE fk_id_sala = ? AND id_reserva != ? AND (
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
      const conflitos = await queryAsync(queryHorario, valuesHorario);
      if (conflitos.length > 0) {
        const reservasOrdenadas = conflitos.sort(
          (a, b) => new Date(a.datahora_fim) - new Date(b.datahora_fim)
        );
        const proximoHorarioInicio = new Date(
          reservasOrdenadas[0].datahora_fim
        );
        proximoHorarioInicio.setHours(proximoHorarioInicio.getHours() - 3);
        const proximoHorarioFim = new Date(
          proximoHorarioInicio.getTime() + 50 * 60 * 1000
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

      // Atualiza a reserva
      const queryUpdate = `
        UPDATE reserva 
        SET datahora_inicio = ?, datahora_fim = ? 
        WHERE id_reserva = ?
      `;
      await queryAsync(queryUpdate, [datahora_inicio, datahora_fim, reservaId]);

      return res
        .status(200)
        .json({ message: "Reserva atualizada com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar reserva" });
    }
  }

  static async deleteReserva(req, res) {
    const reservaId = req.params.id_reserva;
    const query = `DELETE FROM reserva WHERE id_reserva = ?`;
    try {
      const results = await queryAsync(query, [reservaId]);
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }
      return res.status(200).json({ message: "Reserva excluída com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
};
