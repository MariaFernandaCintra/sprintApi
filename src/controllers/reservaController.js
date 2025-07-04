const validateReserva = require("../services/validateReserva");
const { queryAsync, formatarDiasSemanaEmTexto } = require("../utils/functions");

const diasSemanaTexto = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

module.exports = class ReservaController {
  static async createReservasSimples(req, res) {
    const { fk_id_usuario, fk_id_sala, data, hora_inicio, hora_fim } = req.body;

    const data_inicio = data;
    const data_fim = data;
    const dataLocal = new Date(data + "T00:00:00");
    const diaSemana = dataLocal.getDay();
    const dias_semana = [diaSemana];

    const erroValidacao = validateReserva.validarCamposCreate({
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim,
    });

    if (erroValidacao) {
      return res.status(400).json(erroValidacao);
    }

    try {
      const usuarioExiste = await validateReserva.validarUsuario(fk_id_usuario);
      const salaExiste = await validateReserva.validarSala(fk_id_sala);

      if (!usuarioExiste || !salaExiste) {
        return res
          .status(404)
          .json({ error: "Sala ou usuário não encontrado." });
      }

      // Verificação de conflito de reserva
      const conflito = await validateReserva.validarConflitoReserva(
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim
      );

      if (conflito.conflito) {
        return res.status(409).json({
          error: "Conflitos encontrados com reservas existentes",
          conflitos: conflito.conflitos,
        });
      }

      const insertQuery = `
      INSERT INTO reserva (
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

      const diaTexto = diasSemanaTexto[dias_semana[0]] || dias_semana[0];
      const mensagem = `Reserva simples criada com sucesso. Ela vai acontecer no dia ${data_inicio}, toda ${diaTexto}, das ${hora_inicio} até ${hora_fim}.`;

      return res.status(201).json({ message: mensagem });
    } catch (error) {
      return res.status(500).json({ error: "Erro interno ao criar reserva." });
    }
  }

  static async createReservasPeriodicas(req, res) {
    let {
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim,
    } = req.body;

    let diasSemanaArray = Array.isArray(dias_semana)
      ? dias_semana
      : String(dias_semana).split(",").map(Number);

    if (data_inicio === data_fim && diasSemanaArray.length === 1) {
      const dataLocal = new Date(data_inicio + "T00:00:00");
      const diaSemanaDaData = dataLocal.getDay();

      if (diasSemanaArray[0] !== diaSemanaDaData) {
        if (diaSemanaDaData >= 1 && diaSemanaDaData <= 6) {
          diasSemanaArray = [diaSemanaDaData];
        }
      }
    }

    const erroValidacao = validateReserva.validarCamposCreate({
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana: diasSemanaArray,
      hora_inicio,
      hora_fim,
    });

    if (erroValidacao) {
      return res.status(400).json(erroValidacao);
    }

    try {
      const usuarioExiste = await validateReserva.validarUsuario(fk_id_usuario);
      const salaExiste = await validateReserva.validarSala(fk_id_sala);

      if (!usuarioExiste || !salaExiste) {
        return res
          .status(404)
          .json({ error: "Sala ou usuário não encontrado." });
      }

      const conflito = await validateReserva.validarConflitoReserva(
        fk_id_sala,
        data_inicio,
        data_fim,
        diasSemanaArray,
        hora_inicio,
        hora_fim
      );

      if (conflito.conflito) {
        return res.status(409).json({
          error: "Conflitos encontrados com reservas existentes",
          conflitos: conflito.conflitos,
        });
      }

      const insertQuery = `
      INSERT INTO reserva (
        fk_id_usuario, fk_id_sala, data_inicio, data_fim, dias_semana, hora_inicio, hora_fim
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

      await queryAsync(insertQuery, [
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        diasSemanaArray.join(","),
        hora_inicio,
        hora_fim,
      ]);

      let mensagem = "";
      if (data_inicio === data_fim && diasSemanaArray.length === 1) {
        const diaTexto =
          diasSemanaTexto[diasSemanaArray[0]] || diasSemanaArray[0];
        mensagem = `Reserva simples criada com sucesso. Ela vai acontecer no dia ${data_inicio}, em uma ${diaTexto}, às ${hora_inicio} até ${hora_fim}.`;
      } else {
        const diasTexto = formatarDiasSemanaEmTexto(diasSemanaArray);
        mensagem = `Reserva periódica criada com sucesso. Ela vai acontecer de ${data_inicio} até ${data_fim}, todas as ${diasTexto}, começando sempre às ${hora_inicio} até ${hora_fim}.`;
      }

      return res.status(201).json({ message: mensagem });
    } catch (error) {
      console.error("Erro ao criar reserva periódica:", error);
      return res.status(500).json({ error: "Erro interno ao criar reserva." });
    }
  }

  static async getAllReservas(req, res) {
    try {
      const query = `
        SELECT
          id_reserva,
          fk_id_usuario,
          fk_id_sala,
          data_inicio,
          data_fim,
          dias_semana,
          hora_inicio,
          hora_fim
        FROM reserva
        ORDER BY data_inicio DESC
      `;

      const reservas = await queryAsync(query);

      return res.status(200).json({
        message: "Obtendo todas as reservas",
        reservas,
      });
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      return res.status(500).json({
        error: "Erro ao buscar reservas.",
      });
    }
  }

  static async getAllReservasSimples(req, res) {
    try {
      const query = `
      SELECT
        id_reserva,
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim
      FROM reserva
      WHERE data_inicio = data_fim
      ORDER BY data_inicio DESC
    `;

      const reservasSimples = await queryAsync(query);

      return res.status(200).json({
        message: "Obtendo todas as reservas simples",
        reservas: reservasSimples,
      });
    } catch (error) {
      console.error("Erro ao buscar reservas simples:", error);
      return res.status(500).json({
        error: "Erro ao buscar reservas simples.",
      });
    }
  }

  static async getAllReservasPeriodicas(req, res) {
    try {
      const query = `
      SELECT
        id_reserva,
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim
      FROM reserva
      WHERE data_inicio != data_fim
      ORDER BY data_inicio DESC
    `;

      const reservasPeriodicas = await queryAsync(query);

      return res.status(200).json({
        message: "Obtendo todas as reservas periódicas",
        reservas: reservasPeriodicas,
      });
    } catch (error) {
      console.error("Erro ao buscar reservas periódicas:", error);
      return res.status(500).json({
        error: "Erro ao buscar reservas periódicas.",
      });
    }
  }

  static async updateReservasSimples(req, res) {
    const { id_reserva } = req.params;
    const { fk_id_usuario, fk_id_sala, data, hora_inicio, hora_fim } = req.body;

    const dataLocal = new Date(data + "T00:00:00");
    const diaSemana = dataLocal.getDay();
    const dias_semana = [diaSemana];

    let reservaAtual;

    try {
      const querySelect = `
    SELECT
      id_reserva,
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim
    FROM reserva
    WHERE id_reserva = ?
  `;
      const resultados = await queryAsync(querySelect, [id_reserva]);
      if (resultados.length === 0) {
        return res
          .status(404)
          .json({ error: "Reserva não encontrada para atualização." });
      }
      reservaAtual = resultados[0];
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro interno ao buscar reserva para atualização." });
    }

    // Validação dos campos da reserva
    const erroValidacao = validateReserva.validarCamposUpdate(
      {
        fk_id_usuario,
        fk_id_sala,
        data_inicio: data,
        data_fim: data,
        dias_semana: dias_semana,
        hora_inicio,
        hora_fim,
      },
      reservaAtual
    );
    if (erroValidacao) {
      return res.status(400).json(erroValidacao);
    }

    try {
      // Verificação de existência de usuário e sala
      const usuarioExiste = await validateReserva.validarUsuario(fk_id_usuario);
      const salaExiste = await validateReserva.validarSala(fk_id_sala);
      if (!usuarioExiste || !salaExiste) {
        return res
          .status(404)
          .json({ error: "Sala ou usuário não encontrado." });
      }

      // Verificando conflitos de reservas
      const conflito = await validateReserva.validarConflitoReservaUpdate(
        id_reserva,
        fk_id_sala,
        data,
        data,
        dias_semana, // Passando o dia da semana corretamente
        hora_inicio,
        hora_fim
      );

      if (conflito.conflito) {
        return res.status(409).json({
          error: "Conflitos encontrados com outras reservas existentes:",
          conflitos: conflito.conflitos,
        });
      }

      // Atualizando a reserva
      const updateQuery = `
    UPDATE reserva SET
      fk_id_usuario = ?,
      fk_id_sala = ?,
      data_inicio = ?,
      data_fim = ?,
      dias_semana = ?,
      hora_inicio = ?,
      hora_fim = ?
    WHERE id_reserva = ?
  `;
      await queryAsync(updateQuery, [
        fk_id_usuario,
        fk_id_sala,
        data,
        data,
        dias_semana.join(","), // Certifique-se de armazenar o valor correto para os dias
        hora_inicio,
        hora_fim,
        id_reserva,
      ]);

      // Convertendo o dia da semana para o nome por extenso
      const diaSemanaTexto = formatarDiasSemanaEmTexto(dias_semana);
      const mensagem = `Reserva simples atualizada com sucesso. Ela vai acontecer na ${diaSemanaTexto}, dia ${data}, das ${hora_inicio} até ${hora_fim}.`;

      return res.status(200).json({ message: mensagem });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro interno ao atualizar reserva." });
    }
  }

  static async updateReservasPeriodicas(req, res) {
    const { id_reserva } = req.params;
    let {
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim,
    } = req.body;

    let diasSemanaArray = Array.isArray(dias_semana)
      ? dias_semana
      : String(dias_semana).split(",").map(Number);

    if (data_inicio === data_fim && diasSemanaArray.length === 1) {
      const dataLocal = new Date(data_inicio + "T00:00:00");
      const diaSemanaDaData = dataLocal.getDay();

      if (diasSemanaArray[0] !== diaSemanaDaData) {
        if (diaSemanaDaData >= 1 && diaSemanaDaData <= 6) {
          diasSemanaArray = [diaSemanaDaData];
        }
      }
    }

    let reservaAtual;

    try {
      const querySelect = `
      SELECT
        id_reserva,
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim
      FROM reserva
      WHERE id_reserva = ?
    `;
      const resultados = await queryAsync(querySelect, [id_reserva]);
      if (resultados.length === 0) {
        return res
          .status(404)
          .json({ error: "Reserva não encontrada para atualização." });
      }
      reservaAtual = resultados[0];
    } catch (error) {
      console.error("Erro ao buscar reserva atual para atualização:", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao buscar reserva para atualização." });
    }

    const erroValidacao = validateReserva.validarCamposUpdate(
      {
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        dias_semana: diasSemanaArray,
        hora_inicio,
        hora_fim,
      },
      reservaAtual
    );
    if (erroValidacao) {
      return res.status(400).json(erroValidacao);
    }

    try {
      const usuarioExiste = await validateReserva.validarUsuario(fk_id_usuario);
      const salaExiste = await validateReserva.validarSala(fk_id_sala);
      if (!usuarioExiste || !salaExiste) {
        return res
          .status(404)
          .json({ error: "Sala ou usuário não encontrado." });
      }

      const conflito = await validateReserva.validarConflitoReservaUpdate(
        id_reserva,
        fk_id_sala,
        data_inicio,
        data_fim,
        diasSemanaArray,
        hora_inicio,
        hora_fim
      );

      if (conflito.conflito) {
        return res.status(409).json({
          error: "Conflitos encontrados com outras reservas existentes:",
          conflitos: conflito.conflitos,
        });
      }

      const updateQuery = `
      UPDATE reserva SET
        fk_id_usuario = ?,
        fk_id_sala = ?,
        data_inicio = ?,
        data_fim = ?,
        dias_semana = ?,
        hora_inicio = ?,
        hora_fim = ?
      WHERE id_reserva = ?
    `;
      await queryAsync(updateQuery, [
        fk_id_usuario,
        fk_id_sala,
        data_inicio,
        data_fim,
        diasSemanaArray.join(","),
        hora_inicio,
        hora_fim,
        id_reserva,
      ]);

      let mensagem = "";
      if (data_inicio === data_fim && diasSemanaArray.length === 1) {
        const diaTexto =
          diasSemanaTexto[diasSemanaArray[0]] || diasSemanaArray[0];
        mensagem = `Reserva simples atualizada com sucesso. Ela vai acontecer no dia ${data_inicio}, em uma ${diaTexto}, às ${hora_inicio} até ${hora_fim}.`;
      } else {
        const diasTexto = formatarDiasSemanaEmTexto(diasSemanaArray);
        mensagem = `Reserva periódica atualizada com sucesso. Ela vai acontecer de ${data_inicio} até ${data_fim}, todas as ${diasTexto}, começando sempre às ${hora_inicio} até ${hora_fim}.`;
      }
      return res.status(200).json({ message: mensagem });
    } catch (error) {
      console.error("Erro ao atualizar reserva periódica:", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao atualizar reserva." });
    }
  }

  static async deleteReserva(req, res) {
    const { id_reserva } = req.params;
    const usuarioId = req.params.id_usuario;
    const token = req.userId;

    if (Number(usuarioId) !== Number(token)) {
      return res.status(403).json({
        message:
          "Você não tem permissão para deletar as reservas de outro usuário.",
      });
    }

    const selectQuery = `SELECT fk_id_usuario FROM reserva WHERE id_reserva = ?`;
    try {
      const rows = await queryAsync(selectQuery, [id_reserva]);
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Reserva não encontrada para deleção." });
      }
      if (rows[0].fk_id_usuario !== Number(usuarioId)) {
        return res
          .status(403)
          .json({ error: "Você não tem permissão para deletar esta reserva." });
      }

      const deleteQuery = `DELETE FROM reserva WHERE id_reserva = ?`;
      const results = await queryAsync(deleteQuery, [id_reserva]);
      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Reserva não encontrada ou já deletada." });
      }

      return res.status(200).json({ message: "Reserva excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar reserva:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
};
