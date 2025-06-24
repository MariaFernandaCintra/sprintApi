const validateReservaPeriodica = require("../services/validateReservaPeriodica");
const validateReserva = require("../services/validateReserva");
const { queryAsync } = require("../utils/functions");

module.exports = class ReservaPeriodicaController {
  static async createReservasPeriodicas(req, res) {
    const {
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim,
    } = req.body;

    const erroValidacao = validateReservaPeriodica.validarCamposReservaPeriodica({
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim,
    });

    if (erroValidacao) return res.status(400).json(erroValidacao);

    try {
      // Verifica se usuário existe
      const usuarioExiste = await validateReserva.verificarUsuario(fk_id_usuario);
      if (!usuarioExiste) return res.status(404).json({ error: "Usuário não encontrado" });

      // Verifica se sala existe
      const salaExiste = await validateReserva.verificarSala(fk_id_sala);
      if (!salaExiste) return res.status(404).json({ error: "Sala não encontrada" });

      // Verifica duplicatas e conflitos
      const resultado = await validateReservaPeriodica.verificarConflitosEDuplicatas({
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim,
      });

      if (resultado.tipo === "duplicata") {
        return res.status(409).json({ error: "Reserva duplicada já existente." });
      }

      if (resultado.tipo === "conflito") {
        return res.status(409).json({
          error: "Conflito de horário com reservas existentes.",
          conflitos: resultado.conflitos,
        });
      }

      // Insere nova reserva periódica
      const insertQuery = `
        INSERT INTO reservasperiodicas (
          fk_id_usuario, fk_id_sala, data_inicio, data_fim, dias_semana, hora_inicio, hora_fim
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await queryAsync(insertQuery, [
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana.join(","),
        hora_inicio,
        hora_fim,
      ]);

      return res.status(201).json({ message: "Reserva periódica criada com sucesso." });
    } catch (error) {
      console.error("Erro ao criar reserva periódica:", error);
      return res.status(500).json({ error: "Erro interno ao criar reserva periódica." });
    }
  }
};
