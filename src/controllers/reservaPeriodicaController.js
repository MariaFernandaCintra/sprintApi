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
  return diasSemana.map((d) => diasSemanaTexto[d] || d).join(", ");
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

    const erroValidacao = validateReservaPeriodica.validarCamposCreate({
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
      const usuarioExiste = await validateReserva.validarUsuario(fk_id_usuario);
      const salaExiste = await validateReserva.validarSala(fk_id_sala);
      if (!usuarioExiste || !salaExiste) {
        return res
          .status(404)
          .json({ error: "Sala ou usuário não encontrado." });
      }

      const datasConflitantes = [];
      const inicio = new Date(data_inicio);
      const fim = new Date(data_fim);
      const diasSet = new Set(dias_semana.map(Number));

      for (let dt = new Date(inicio); dt <= fim; dt.setDate(dt.getDate() + 1)) {
        const diaSemana = dt.getDay() === 0 ? 7 : dt.getDay();
        if (diasSet.has(diaSemana)) {
          const dataStr = dt.toISOString().split("T")[0];

          const conflito =
            await validateReservaPeriodica.validarConflitoReservaPeriodica(
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
      return res
        .status(500)
        .json({ error: "Erro interno ao criar reserva periódica." });
    }
  }

  static async getAllReservasPeriodicas(req, res) {
    try {
      const query = `
      SELECT 
        id_reservaperiodica,
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim
      FROM reservaperiodica
      ORDER BY data_inicio DESC
    `;

      const reservas = await queryAsync(query);

      return res.status(200).json({
        message: "Obtendo todas as reservas periódicas",
        reservas,
      });
    } catch (error) {
      console.error("Erro ao buscar reservas periódicas:", error);
      return res.status(500).json({
        error: "Erro ao buscar reservas periódicas.",
      });
    }
  }

  static async updateReservaPeriodica(req, res) {
    const { id_reservaperiodica } = req.params;
    const {
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim,
    } = req.body;

    // Busca reserva atual para comparar
    let reservaAtual;
    try {
      const querySelect = `
        SELECT 
          id_reservaperiodica,
          fk_id_usuario,
          fk_id_sala,
          data_inicio,
          data_fim,
          dias_semana,
          hora_inicio,
          hora_fim
        FROM reservaperiodica
        WHERE id_reservaperiodica = ?
      `;
      const resultados = await queryAsync(querySelect, [id_reservaperiodica]);
      if (resultados.length === 0) {
        return res
          .status(404)
          .json({ error: "Reserva periódica não encontrada." });
      }
      reservaAtual = resultados[0];
    } catch (error) {
      console.error("Erro ao buscar reserva periódica atual:", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao buscar reserva periódica." });
    }

    // Valida campos e regras
    const erroValidacao = validateReservaPeriodica.validarCamposUpdate(
      {
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim,
      },
      reservaAtual
    );
    if (erroValidacao) return res.status(400).json(erroValidacao);

    try {
      // Valida existência usuário e sala
      const usuarioExiste = await validateReserva.validarUsuario(fk_id_usuario);
      const salaExiste = await validateReserva.validarSala(fk_id_sala);
      if (!usuarioExiste || !salaExiste) {
        return res
          .status(404)
          .json({ error: "Sala ou usuário não encontrado." });
      }

      // Verifica conflitos, ignorando a própria reserva periódica
      const datasConflitantes = [];
      const inicio = new Date(data_inicio);
      const fim = new Date(data_fim);
      const diasSet = new Set(dias_semana.map(Number));

      for (let dt = new Date(inicio); dt <= fim; dt.setDate(dt.getDate() + 1)) {
        const diaSemana = dt.getDay() === 0 ? 7 : dt.getDay();
        if (diasSet.has(diaSemana)) {
          const dataStr = dt.toISOString().split("T")[0];

          const conflito =
            await validateReservaPeriodica.validarConflitoReservaPeriodicaUpdate(
              id_reservaperiodica,
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

      // Executa update no banco
      const updateQuery = `
        UPDATE reservaperiodica SET
          fk_id_usuario = ?,
          fk_id_sala = ?,
          data_inicio = ?,
          data_fim = ?,
          dias_semana = ?,
          hora_inicio = ?,
          hora_fim = ?
        WHERE id_reservaperiodica = ?
      `;

      await queryAsync(updateQuery, [
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana.join(","),
        hora_inicio,
        hora_fim,
        id_reservaperiodica,
      ]);

      let mensagem = "";
      if (dias_semana.length === 1) {
        const diaTexto = diasSemanaTexto[dias_semana[0]] || dias_semana[0];
        mensagem = `Reserva atualizada com sucesso. Ela vai acontecer toda ${diaTexto}, começando às ${hora_inicio} até ${hora_fim}.`;
      } else {
        const diasTexto = formatarDiasSemanaEmTexto(dias_semana);
        mensagem = `Reserva atualizada com sucesso. Ela vai acontecer de ${data_inicio} até ${data_fim}, todas as ${diasTexto}, começando sempre às ${hora_inicio} até ${hora_fim}.`;
      }

      return res.status(200).json({ message: mensagem });
    } catch (error) {
      console.error("Erro ao atualizar reserva periódica:", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao atualizar reserva periódica." });
    }
  }

  static async deleteReservaPeriodica(req, res) {
    const id_reservaperiodica = req.params.id_reservaperiodica;
    const usuarioId = req.params.id_usuario;
    const token = req.userId;

    if (Number(usuarioId) !== Number(token)) {
      return res.status(400).json({
        message:
          "Você não pode deletar as reservas periódicas de outro usuário",
      });
    }

    const selectQuery = `SELECT fk_id_usuario FROM reservaperiodica WHERE id_reservaperiodica = ?`;
    try {
      const rows = await queryAsync(selectQuery, [id_reservaperiodica]);
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Reserva periódica não encontrada" });
      }
      if (rows[0].fk_id_usuario !== Number(usuarioId)) {
        return res
          .status(403)
          .json({ error: "Você não pode deletar esta reserva periódica" });
      }

      const deleteQuery = `DELETE FROM reservaperiodica WHERE id_reservaperiodica = ?`;
      const results = await queryAsync(deleteQuery, [id_reservaperiodica]);
      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Reserva periódica não encontrada" });
      }

      return res
        .status(200)
        .json({ message: "Reserva periódica excluída com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
};
