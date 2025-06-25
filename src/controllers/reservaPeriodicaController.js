const validateReserva = require("../services/validateReserva");
const validateReservaPeriodica = require("../services/validateReservaPeriodica");
const { queryAsync } = require("../utils/functions");

const diasSemanaTexto = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

function formatarDiasSemanaEmTexto(diasSemana) {
  return diasSemana
    .map((d) => diasSemanaTexto[d] || d)
    .join(", ");
}

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
      const usuarioExiste = await validateReserva.verificarUsuario(fk_id_usuario);
      const salaExiste = await validateReserva.verificarSala(fk_id_sala);
      if (!usuarioExiste || !salaExiste) {
        return res.status(404).json({ error: "Sala ou usuário não encontrado." });
      }

      const datasConflitantes = [];
      const inicio = new Date(data_inicio);
      const fim = new Date(data_fim);
      const diasSet = new Set(dias_semana.map(Number));

      for (let dt = new Date(inicio); dt <= fim; dt.setDate(dt.getDate() + 1)) {
        const diaSemana = dt.getDay() === 0 ? 7 : dt.getDay();
        if (diasSet.has(diaSemana)) {
          const dataStr = dt.toISOString().split("T")[0];

          const conflito = await validateReservaPeriodica.verificarConflitos(
            fk_id_sala,
            dataStr,
            dataStr,
            [diaSemana],
            hora_inicio,
            hora_fim
          );

          if (conflito.conflito) datasConflitantes.push(dataStr);
        }
      }

      if (datasConflitantes.length > 0) {
        return res.status(409).json({
          error: "Conflitos encontrados nas seguintes datas:",
          datas: datasConflitantes,
        });
      }

      const insertQuery = `
        INSERT INTO reservaperiodica (
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

      let mensagem = "";
      if (dias_semana.length === 1) {
        const diaTexto = diasSemanaTexto[dias_semana[0]] || dias_semana[0];
        mensagem = `Reserva criada com sucesso. Ela vai acontecer toda ${diaTexto}, começando às ${hora_inicio} até ${hora_fim}.`;
      } else {
        const diasTexto = formatarDiasSemanaEmTexto(dias_semana);
        mensagem = `Reserva criada com sucesso. Ela vai acontecer de ${data_inicio} até ${data_fim}, todas as ${diasTexto}, começando sempre às ${hora_inicio} até ${hora_fim}.`;
      }

      return res.status(201).json({ message: mensagem });
    } catch (error) {
      console.error("Erro ao criar reserva periódica:", error);
      return res.status(500).json({ error: "Erro interno ao criar reserva periódica." });
    }
  }
};
