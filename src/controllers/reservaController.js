const validateReserva = require("../services/validateReserva");
const {
  queryAsync,
  formatarHorario,
  getDiaSemana,
  formatarDataParaComparar,
} = require("../utils/functions");

module.exports = class ReservaController {
  static async createReservas(req, res) {
    const { fk_id_usuario, fk_id_sala, data, hora_inicio, hora_fim } = req.body;
    const token = req.userId;

    const erroValidacao = validateReserva.validarCamposReserva({
      fk_id_usuario,
      fk_id_sala,
      data,
      hora_inicio,
      hora_fim,
    });
    if (erroValidacao) return res.status(400).json(erroValidacao);

    try {
      const usuarioExiste = await validateReserva.verificarUsuario(fk_id_usuario);
      if (!usuarioExiste) return res.status(404).json({ error: "Usuário não encontrado" });

      if (Number(fk_id_usuario) !== Number(token)) {
        return res.status(400).json({ message: "Você não pode reservar para outro usuário" });
      }

      const salaExiste = await validateReserva.verificarSala(fk_id_sala);
      if (!salaExiste) return res.status(404).json({ error: "Sala não encontrada" });

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
            error: `A sala já está reservada neste horário. O próximo horário disponível é de ${formatarHorario(
              inicioDisponivel
            )} até ${formatarHorario(fimDisponivel)}`,
          });
        } else {
          return res.status(400).json({
            error: "Não há horários disponíveis para uma reserva de ao menos 30 minutos neste dia.",
          });
        }
      }

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
      return res.status(200).json({
        message: "Obtendo todas as reservas",
        reservas: results,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async updateReserva(req, res) {
    const { fk_id_usuario, data, hora_inicio, hora_fim } = req.body;
    const id_reserva = req.params.id_reserva;
    const token = req.userId;

    const erroValidacao = validateReserva.validarCamposAtualizacao({
      fk_id_usuario,
      data,
      hora_inicio,
      hora_fim,
    });
    if (erroValidacao) return res.status(400).json(erroValidacao);

    if (Number(fk_id_usuario) !== Number(token)) {
      return res.status(400).json({
        message: "Você não pode atualizar as reservas de outro usuário",
      });
    }

    try {
      const querySelect = `SELECT fk_id_sala, data, hora_inicio, hora_fim FROM reserva WHERE id_reserva = ?`;
      const resultado = await queryAsync(querySelect, [id_reserva]);

      if (resultado.length === 0) return res.status(404).json({ error: "Reserva não encontrada" });

      const reservaAtual = resultado[0];

      const dataAtualFormatada = formatarDataParaComparar(reservaAtual.data);
      const dataEnviadaFormatada = data; // já no formato "YYYY-MM-DD"

      if (
        dataAtualFormatada === dataEnviadaFormatada &&
        reservaAtual.hora_inicio === hora_inicio &&
        reservaAtual.hora_fim === hora_fim
      ) {
        return res.status(400).json({
          error: "Os dados informados são iguais aos da reserva atual. Nenhuma alteração foi feita.",
        });
      }

      const { fk_id_sala } = reservaAtual;

      const conflitoResult = await validateReserva.validarConflitoReservaAtualizacao(
        id_reserva,
        fk_id_sala,
        data,
        hora_inicio,
        hora_fim
      );

      if (conflitoResult.conflito) {
        const { inicioDisponivel, fimDisponivel } = conflitoResult;
        return res.status(400).json({
          error: `A sala já está reservada neste horário. O maior intervalo disponível é de ${formatarHorario(
            inicioDisponivel
          )} até ${formatarHorario(fimDisponivel)}`,
        });
      }

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
        id_reserva,
      ]);

      return res.status(200).json({ message: "Reserva atualizada com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar reserva" });
    }
  }

  static async deleteReserva(req, res) {
    const id_reserva = req.params.id_reserva;
    const usuarioId = req.params.id_usuario;
    const token = req.userId;

    if (Number(usuarioId) !== Number(token)) {
      return res.status(400).json({
        message: "Você não pode deletar as reservar de outro usuário",
      });
    }
    const query = `DELETE FROM reserva WHERE id_reserva = ?`;
    try {
      const results = await queryAsync(query, [id_reserva]);
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
