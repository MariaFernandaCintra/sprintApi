// validateReservaPeriodica.js
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

    const diasValidos = ["1", "2", "3", "4", "5", "6", "7"];
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

  // Função unificada para duplicata e conflito
  verificarConflitosEDuplicatas: async function ({
    fk_id_usuario,
    fk_id_sala,
    data_inicio,
    data_fim,
    dias_semana,
    hora_inicio,
    hora_fim,
  }) {
    // Consulta reservas periódicas com algum dia e horário sobrepostos
    const query = `
      SELECT * FROM reservasperiodicas
      WHERE fk_id_sala = ?
        AND data_inicio <= ? AND data_fim >= ?
    `;

    const values = [fk_id_sala, data_fim, data_inicio];

    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);

        const conflitos = [];
        const diasNovoSet = new Set(dias_semana.map(Number));

        const novoInicio = criarDataHora("2025-01-01", hora_inicio).getTime();
        const novoFim = criarDataHora("2025-01-01", hora_fim).getTime();

        for (const reserva of results) {
          // converte dias_semana string para array numérica
          const diasExistentes = reserva.dias_semana.split(",").map(Number);

          // verifica se tem dia da semana em comum
          const diasComuns = diasExistentes.filter((d) => diasNovoSet.has(d));
          if (diasComuns.length === 0) continue;

          // checa conflito de horário
          const inicioExistente = criarDataHora("2025-01-01", reserva.hora_inicio).getTime();
          const fimExistente = criarDataHora("2025-01-01", reserva.hora_fim).getTime();

          // duplicata exata: mesmo usuário, mesmo período, mesmos dias e horários
          const isDuplicata =
            reserva.fk_id_usuario === fk_id_usuario &&
            reserva.data_inicio.toISOString().slice(0,10) === data_inicio &&
            reserva.data_fim.toISOString().slice(0,10) === data_fim &&
            reserva.dias_semana === dias_semana.join(",") &&
            reserva.hora_inicio === hora_inicio &&
            reserva.hora_fim === hora_fim;

          // conflito se horários se sobrepõem
          const isConflito = novoInicio < fimExistente && novoFim > inicioExistente;

          if (isDuplicata) {
            return resolve({ tipo: "duplicata", reserva });
          }
          if (isConflito) {
            conflitos.push(reserva);
          }
        }

        if (conflitos.length > 0) {
          return resolve({ tipo: "conflito", conflitos });
        }
        return resolve({ tipo: "ok" });
      });
    });
  },
};
