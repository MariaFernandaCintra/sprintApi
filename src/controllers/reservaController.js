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

// Retorna o dia da semana em português, dado uma data no formato "YYYY-MM-DD"
const getDiaSemana = (data) => {
  const [year, month, day] = data.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const diasSemana = [
    "Domingo",
    "Segunda-Feira",
    "Terça-Feira",
    "Quarta-Feira",
    "Quinta-Feira",
    "Sexta-Feira",
    "Sábado",
  ];
  return diasSemana[date.getDay()];
};

module.exports = class ReservaController {
  static async createReservas(req, res) {
    const { fk_id_usuario, fk_id_sala, data, hora_inicio, hora_fim } = req.body;

    // Validação inicial dos campos
    const erroValidacao = validateReserva.validarCamposReserva({
      fk_id_usuario,
      fk_id_sala,
      data,
      hora_inicio,
      hora_fim,
    });
    if (erroValidacao) {
      return res.status(400).json(erroValidacao);
    }

    try {
      // Verifica se o usuário existe
      const usuarioExiste = await validateReserva.verificarUsuario(fk_id_usuario);
      if (!usuarioExiste) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Verifica se a sala existe
      const salaExiste = await validateReserva.verificarSala(fk_id_sala);
      if (!salaExiste) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }

      // Valida conflito de horário e, se houver, obtém o próximo intervalo disponível
      const conflitoResult = await validateReserva.validarConflitoReserva(
        fk_id_sala,
        data,
        hora_inicio,
        hora_fim
      );

      if (conflitoResult.conflito) {
        if (conflitoResult.disponivel) {
          const { inicioDisponivel, fimDisponivel } = conflitoResult;
          return res.status(400).json({
            error: `A sala já está reservada neste horário. O próximo horário disponível é de ${validateReserva.formatarHorario(inicioDisponivel)} até ${validateReserva.formatarHorario(fimDisponivel)}`
          });
        } else {
          return res.status(400).json({
            error: "Não há horários disponíveis para uma reserva de 50 minutos neste dia."
          });
        }
      }

      // Se não houver conflito, insere a nova reserva
      const dia_semana = getDiaSemana(data);
      const queryInsert = `
        INSERT INTO reserva (fk_id_usuario, fk_id_sala, dia_semana, data, hora_inicio, hora_fim)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await queryAsync(queryInsert, [
        fk_id_usuario,
        fk_id_sala,
        dia_semana,
        data,
        hora_inicio,
        hora_fim,
      ]);

      return res.status(201).json({ message: "Sala reservada com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar reserva" });
    }
  }

  static async getAllReservas(req, res) {
    const query = `SELECT * FROM reserva`;
    try {
      const results = await queryAsync(query);
      const reservasFormatadas = results.map((reserva) => ({
        id_reserva: reserva.id_reserva,
        fk_id_sala: reserva.fk_id_sala,
        fk_id_usuario: reserva.fk_id_usuario,
        dia_semana: reserva.dia_semana,
        data: reserva.data,
        hora_inicio: reserva.hora_inicio,
        hora_fim: reserva.hora_fim,
      }));
      return res.status(200).json({
        message: "Obtendo todas as reservas",
        reservas: reservasFormatadas,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async updateReserva(req, res) {
    const { data, hora_inicio, hora_fim } = req.body;
    const reservaId = req.params.id_reserva;

    // Valida os campos de atualização
    const erroValidacao = validateReserva.validarCamposAtualizacao({
      data,
      hora_inicio,
      hora_fim,
    });
    if (erroValidacao) {
      return res.status(400).json(erroValidacao);
    }

    try {
      // Obtém o fk_id_sala da reserva para verificação de conflitos
      const querySala = `SELECT fk_id_sala FROM reserva WHERE id_reserva = ?`;
      const resultadosSala = await queryAsync(querySala, [reservaId]);
      if (resultadosSala.length === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }
      const { fk_id_sala } = resultadosSala[0];

      // Valida conflito de horário na atualização (excluindo a própria reserva)
      const conflitoResult = await validateReserva.validarConflitoReservaAtualizacao(
        fk_id_sala,
        data,
        hora_inicio,
        hora_fim,
        reservaId
      );
      if (conflitoResult.conflito) {
        const { inicioDisponivel, fimDisponivel } = conflitoResult;
        return res.status(400).json({
          error: `A sala já está reservada neste horário. O próximo horário disponível é de ${validateReserva.formatarHorario(inicioDisponivel)} até ${validateReserva.formatarHorario(fimDisponivel)}`
        });
      }

      // Atualiza o dia da semana com base na nova data
      const dia_semana = getDiaSemana(data);
      const queryUpdate = `
        UPDATE reserva 
        SET data = ?, hora_inicio = ?, hora_fim = ?, dia_semana = ?
        WHERE id_reserva = ?
      `;
      await queryAsync(queryUpdate, [
        data,
        hora_inicio,
        hora_fim,
        dia_semana,
        reservaId,
      ]);

      return res.status(200).json({ message: "Reserva atualizada com sucesso!" });
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
