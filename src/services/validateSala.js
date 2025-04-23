const connect = require("../db/connect");

module.exports = {
  // Valida os dados obrigatórios para criação de uma sala
  validateCreateSala: function ({ nome, descricao, bloco, tipo, capacidade }) {
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

  // Valida os campos de data/hora para checagem do horário de reserva
  validateHorario: function ({ data, hora_inicio, hora_fim }) {
    if (!data || !hora_inicio || !hora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    // Cria os objetos Date concatenando data e hora
    const inicioDate = new Date(`${data}T${hora_inicio}`);
    const fimDate = new Date(`${data}T${hora_fim}`);

    if (inicioDate >= fimDate) {
      return { error: "Para checar a reserva, a data de início deve ser anterior à data de fim" };
    }

    const inicioHour = inicioDate.getHours();
    const fimHour = fimDate.getHours();

    if (inicioHour < 7 || inicioHour >= 23 || fimHour < 7 || fimHour >= 23) {
      return {
        error:
          "Para checar a reserva, ela deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 23:00",
      };
    }

    const duration = fimDate - inicioDate;
    const limit = 50 * 60 * 1000; // 50 minutos em milissegundos
    if (duration !== limit) {
      return { error: "Para checar a reserva, ela deve ter exatamente 50 minutos" };
    }

    return null;
  },

  // Verifica se há conflito de horário para uma sala, data e horários informados
  verificarConflitoHorarioSala: async function (id_sala, data, hora_inicio, hora_fim) {
    const query = `
      SELECT 1
      FROM reserva
      WHERE fk_id_sala = ? AND data = ?
        AND (
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio >= ? AND hora_inicio < ?) OR
          (hora_fim > ? AND hora_fim <= ?)
        )
    `;
    const values = [
      id_sala,
      data,
      hora_inicio, hora_inicio,
      hora_inicio, hora_fim,
      hora_inicio, hora_fim,
      hora_inicio, hora_fim,
    ];

    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      });
    });
  },
};
