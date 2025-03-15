const connect = require("../db/connect");

module.exports = {
  // Valida os campos obrigatórios e regras de negócio para criação de reserva
  validateReserva: function ({ fk_id_usuario, fk_id_sala, datahora_inicio, datahora_fim }) {
    if (!fk_id_usuario || !fk_id_sala || !datahora_inicio || !datahora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    const inicioDate = new Date(datahora_inicio);
    const fimDate = new Date(datahora_fim);
    if (inicioDate < new Date() || fimDate <= inicioDate) {
      return { error: "Data ou Horário Inválidos" };
    }

    const inicioHour = inicioDate.getHours();
    const fimHour = fimDate.getHours();
    if (inicioHour < 7 || inicioHour >= 21 || fimHour < 7 || fimHour >= 21) {
      return { error: "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 21:00" };
    }

    const duration = fimDate - inicioDate;
    const limit = 50 * 60 * 1000; // 50 minutos em milissegundos
    if (duration !== limit) {
      return { error: "A reserva deve ter exatamente 50 minutos" };
    }

    return null;
  },

  // Valida os campos para atualização da reserva
  validateUpdateReserva: function ({ datahora_inicio, datahora_fim }) {
    if (!datahora_inicio || !datahora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    const inicioDate = new Date(datahora_inicio);
    const fimDate = new Date(datahora_fim);
    if (inicioDate < new Date() || fimDate < new Date()) {
      return { error: "Data ou Horário inválidos" };
    }
    if (fimDate <= inicioDate) {
      return { error: "A data/hora de fim deve ser após a data/hora de início" };
    }

    const inicioHour = inicioDate.getHours();
    const fimHour = fimDate.getHours();
    if (inicioHour < 7 || inicioHour >= 21 || fimHour < 7 || fimHour >= 21) {
      return { error: "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 21:00" };
    }

    const duration = fimDate - inicioDate;
    const limit = 50 * 60 * 1000;
    if (duration !== limit) {
      return { error: "A reserva deve ter exatamente 50 minutos" };
    }
    return null;
  },

  // Verifica se o usuário existe no banco de dados
  checkUserExists: async function (fk_id_usuario) {
    const query = `SELECT id_usuario FROM usuario WHERE id_usuario = ?`;
    const values = [fk_id_usuario];
    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      });
    });
  },

  // Verifica se a sala existe no banco de dados
  checkSalaExists: async function (fk_id_sala) {
    const query = `SELECT id_sala FROM sala WHERE id_sala = ?`;
    const values = [fk_id_sala];
    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      });
    });
  },

  // Verifica conflitos de horário para uma reserva na sala informada
  checkConflitoHorario: async function (fk_id_sala, datahora_inicio, datahora_fim) {
    const query = `
      SELECT datahora_inicio, datahora_fim FROM reserva
      WHERE fk_id_sala = ? 
      AND (
        (datahora_inicio < ? AND datahora_fim > ?) OR
        (datahora_inicio < ? AND datahora_fim > ?) OR
        (datahora_inicio >= ? AND datahora_inicio < ?) OR
        (datahora_fim > ? AND datahora_fim <= ?)
      )
    `;
    const values = [
      fk_id_sala,
      datahora_inicio,
      datahora_inicio,
      datahora_inicio,
      datahora_fim,
      datahora_inicio,
      datahora_fim,
      datahora_inicio,
      datahora_fim,
    ];
    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};
