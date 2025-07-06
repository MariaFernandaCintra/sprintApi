const { queryAsync, horaParaMinutos } = require("../utils/functions");

module.exports = {
  validateSalaFields: function ({ nome, descricao, bloco, tipo, capacidade }) {
    if (!nome || !descricao || !bloco || !tipo || !capacidade) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (isNaN(capacidade) || Number(capacidade) <= 0) {
      return { error: "Capacidade deve ser um número positivo" };
    }
    if (typeof bloco !== "string" || !/^[A-Z]$/.test(bloco)) {
      return { error: "Bloco deve ser uma letra maiúscula" };
    }
    if (Number(capacidade) < 5 || Number(capacidade) > 100) {
      return { error: "Capacidade deve estar entre 5 e 100 pessoas" };
    }
    return null;
  },

  validateHorario: function ({
    data_inicio,
    data_fim,
    hora_inicio,
    hora_fim,
    dias_semana,
  }) {
    if (
      !data_inicio ||
      !data_fim ||
      !hora_inicio ||
      !hora_fim ||
      !dias_semana
    ) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    if (!Array.isArray(dias_semana) || dias_semana.length === 0) {
      return { error: "dias_semana deve ser um array não vazio" };
    }

    for (const dia of dias_semana) {
      const diaNum = Number(dia);
      if (diaNum < 1 || diaNum > 6) {
        return {
          error:
            "dias_semana deve conter apenas valores entre 1 (segunda) e 6 (sábado)",
        };
      }
    }

    const inicioDate = new Date(`${data_inicio}T${hora_inicio}`);
    const fimDate = new Date(`${data_fim}T${hora_fim}`);

    if (inicioDate > fimDate) {
      return { error: "Data/hora início deve ser anterior a data/hora fim" };
    }

    const inicioHour = inicioDate.getHours();
    const fimHour = fimDate.getHours();

    if (inicioHour < 7 || inicioHour > 23 || fimHour < 7 || fimHour > 23) {
      return {
        error: "As reserva são feitas entre 07:00 e 23:00",
      };
    }

    return null;
  },

  verificarConflitoHorarioSala: async function (
    id_sala,
    data_inicio,
    data_fim,
    hora_inicio,
    hora_fim,
    dias_semana
  ) {
    const novaHoraInicioMin = horaParaMinutos(hora_inicio);
    const novaHoraFimMin = horaParaMinutos(hora_fim);
    const novosDiasSet = new Set(dias_semana.map(Number));

    const query = `
      SELECT id_reserva, data_inicio, data_fim, dias_semana, hora_inicio, hora_fim
      FROM reserva
      WHERE fk_id_sala = ?
        AND data_fim >= ?
        AND data_inicio <= ?
        AND data_fim >= CURDATE()
    `;

    try {
      const reservasExistentes = await queryAsync(query, [id_sala, data_inicio, data_fim]);

      for (const reserva of reservasExistentes) {
        const diasExistentesSet = new Set(
          reserva.dias_semana.split(",").map(Number)
        );

        const temDiaSobreposto = [...novosDiasSet].some((dia) =>
          diasExistentesSet.has(dia)
        );
        if (!temDiaSobreposto) continue;

        const horaInicioExistente = horaParaMinutos(reserva.hora_inicio);
        const horaFimExistente = horaParaMinutos(reserva.hora_fim);

        const temConflitoHorario =
          novaHoraInicioMin < horaFimExistente &&
          novaHoraFimMin > horaInicioExistente;

        if (temConflitoHorario) return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao verificar conflito de horário da sala:", err);
      throw new Error("Erro interno ao verificar conflitos de horários.");
    }
  },
};