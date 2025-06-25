const connect = require("../db/connect");
const { criarDataHora } = require("../utils/functions");

module.exports = {
  validarCamposReservaPeriodica: function ({
    fk_id_usuario,
    fk_id_sala,
    data_inicio,
    data_fim,
    dias_semana,
    hora_inicio,
    hora_fim,
  }) {
    if (
      !fk_id_usuario ||
      !fk_id_sala ||
      !data_inicio ||
      !data_fim ||
      !dias_semana ||
      !hora_inicio ||
      !hora_fim
    ) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    if (!Array.isArray(dias_semana)) {
      return { error: "dias_semana deve ser um array" };
    }

    const diasValidos = ["1", "2", "3", "4", "5", "6"];
    for (const dia of dias_semana.map(String)) {
      if (!diasValidos.includes(dia)) {
        return { error: `Dia da semana inválido: ${dia}` };
      }
    }

    const inicio = criarDataHora(data_inicio, hora_inicio);
    const fim = criarDataHora(data_fim, hora_fim);
    const now = new Date();

    if (inicio < now) return { error: "A data de início deve ser no futuro" };
    if (fim <= inicio)
      return { error: "A data de fim deve ser após a de início" };

    const horaIni = criarDataHora("2025-01-01", hora_inicio);
    const horaFim = criarDataHora("2025-01-01", hora_fim);

    if (horaIni >= horaFim)
      return { error: "Hora de início deve ser antes da de fim" };

    const hInicio = horaIni.getHours();
    const hFim = horaFim.getHours();

    if (hInicio < 7 || hFim > 23) {
      return { error: "A reserva deve estar entre 7:00 e 23:00" };
    }

    const duracao = horaFim - horaIni;
    const limite = 30 * 60 * 1000;
    if (duracao < limite)
      return { error: "Mínimo de 30 minutos por reserva" };

    return null;
  },

  verificarConflitos: async function (
    fk_id_sala,
    data_inicio,
    data_fim,
    dias_semana,
    hora_inicio,
    hora_fim
  ) {
    // Verifica conflitos contra reservas simples e reservas periódicas

    const diasSet = new Set(dias_semana.map(Number));

    // Consulta reservas simples entre data_inicio e data_fim
    const queryReservasSimples = `
      SELECT data, hora_inicio, hora_fim FROM reserva
      WHERE fk_id_sala = ? AND data BETWEEN ? AND ?
    `;

    // Consulta reservas periódicas que se sobrepõem no período e compartilham dia da semana
    const queryReservasPeriodicas = `
      SELECT data_inicio, data_fim, dias_semana, hora_inicio, hora_fim
      FROM reservaperiodica
      WHERE fk_id_sala = ?
        AND data_fim >= ?
        AND data_inicio <= ?
    `;

    const reservasSimples = await new Promise((resolve, reject) => {
      connect.query(queryReservasSimples, [fk_id_sala, data_inicio, data_fim], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    const reservasPeriodicas = await new Promise((resolve, reject) => {
      connect.query(queryReservasPeriodicas, [fk_id_sala, data_inicio, data_fim], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    const conflitos = [];

    const hInicio = criarDataHora("2025-01-01", hora_inicio).getTime();
    const hFim = criarDataHora("2025-01-01", hora_fim).getTime();

    // Verifica conflitos em reservas simples
    for (const r of reservasSimples) {
      let dia = new Date(r.data).getDay();
      dia = dia === 0 ? 7 : dia; // Domingo como 7
      if (!diasSet.has(dia)) continue;

      const rInicio = criarDataHora("2025-01-01", r.hora_inicio).getTime();
      const rFim = criarDataHora("2025-01-01", r.hora_fim).getTime();

      if (hInicio < rFim && hFim > rInicio) {
        conflitos.push({
          tipo: "reserva",
          data: r.data,
          hora_inicio: r.hora_inicio,
          hora_fim: r.hora_fim,
        });
      }
    }

    // Verifica conflitos em reservas periódicas
    for (const rp of reservasPeriodicas) {
      // verifica se dia da semana bate com algum dia da reserva periódica
      const diasRP = rp.dias_semana.split(",").map(Number);
      if (!diasRP.some((d) => diasSet.has(d))) continue;

      // Verifica horário
      const rpInicio = criarDataHora("2025-01-01", rp.hora_inicio).getTime();
      const rpFim = criarDataHora("2025-01-01", rp.hora_fim).getTime();

      if (hInicio < rpFim && hFim > rpInicio) {
        conflitos.push({
          tipo: "reserva_periodica",
          data_inicio: rp.data_inicio,
          data_fim: rp.data_fim,
          dias_semana: rp.dias_semana,
          hora_inicio: rp.hora_inicio,
          hora_fim: rp.hora_fim,
        });
      }
    }

    if (conflitos.length > 0) return { conflito: true, conflitos };
    return { conflito: false };
  },
};
