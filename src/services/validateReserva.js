const connect = require("../db/connect");

module.exports = {
  // Valida os campos obrigatórios e regras de negócio para criação de reserva
  validateReserva: function ({
    fk_id_usuario,
    fk_id_sala,
    data,
    hora_inicio,
    hora_fim,
  }) {
    if (!fk_id_usuario || !fk_id_sala || !data || !hora_inicio || !hora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    // Concatena data e hora para criar os objetos Date
    const inicioTime = new Date(`${data}T${hora_inicio}`);
    const fimTime = new Date(`${data}T${hora_fim}`);
    const now = new Date();
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const nowFormatted = `${day}-${month}-${year} ${hour}:${minute}:${second}`;
    
    // A reserva deve ser para um horário futuro e com fim após o início
    if (inicioTime < now) {
      return { error: "A reserva deve ser depois de: " + nowFormatted };
    }

    if (fimTime <= inicioTime) {
      return {
        error: "A hora de início deve ser antes da hora de fim",
      };
    }

    // Verifica se os horários estão dentro do funcionamento do SENAI (das 7:00 às 23:00)
    const inicioHour = inicioTime.getHours();
    const fimHour = fimTime.getHours();
    if (inicioHour < 7 || inicioHour >= 23 || fimHour < 7 || fimHour >= 23) {
      return {
        error:
          "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 23:00",
      };
    }

    // Verifica se a duração é exatamente de 50 minutos
    const duration = fimTime - inicioTime;
    const limit = 50 * 60 * 1000; // 50 minutos em milissegundos
    if (duration !== limit) {
      return { error: "A reserva deve ter exatamente 50 minutos" };
    }

    return null;
  },

  // Valida os campos para atualização da reserva
  validateUpdateReserva: function ({ data, hora_inicio, hora_fim }) {
    if (!data || !hora_inicio || !hora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    // Concatena data e hora para criar os objetos Date
    const inicioTime = new Date(`${data}T${hora_inicio}`);
    const fimTime = new Date(`${data}T${hora_fim}`);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const nowFormatted = `${day}-${month}-${year} ${hour}:${minute}:${second}`;
    
    // A reserva deve ser para um horário futuro e com fim após o início
    if (inicioTime < now) {
      return { error: "A reserva deve ser depois de: " + nowFormatted };
    }

    if (fimTime <= inicioTime) {
      return {
        error: "A hora de início deve ser antes da hora de fim",
      };
    }

    // Verifica se os horários estão dentro do funcionamento do SENAI (das 7:00 às 23:00)
    const inicioHour = inicioTime.getHours();
    const fimHour = fimTime.getHours();
    if (inicioHour < 7 || inicioHour >= 23 || fimHour < 7 || fimHour >= 23) {
      return {
        error:
          "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 23:00",
      };
    }

    // Verifica se a duração é exatamente de 50 minutos
    const duration = fimTime - inicioTime;
    const limit = 50 * 60 * 1000;
    if (duration !== limit) {
      return { error: "A reserva deve ter exatamente 50 minutos" };
    }

    return null;
  },

  // Verifica se o usuário existe no banco de dados
  checkUsuarioExiste: async function (fk_id_usuario) {
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
  checkSalaExiste: async function (fk_id_sala) {
    const query = `SELECT id_sala FROM sala WHERE id_sala = ?`;
    const values = [fk_id_sala];
    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      });
    });
  },

  // Verifica conflitos de horário para uma reserva na sala informada e na data informada
  checkConflitoHorario: async function (
    fk_id_sala,
    data,
    hora_inicio,
    hora_fim
  ) {
    const query = `
      SELECT hora_inicio, hora_fim FROM reserva
      WHERE fk_id_sala = ? AND data = ? 
      AND (
        (hora_inicio < ? AND hora_fim > ?) OR
        (hora_inicio < ? AND hora_fim > ?) OR
        (hora_inicio >= ? AND hora_inicio < ?) OR
        (hora_fim > ? AND hora_fim <= ?)
      )
    `;
    const values = [
      fk_id_sala,
      data,
      hora_inicio, hora_inicio,
      hora_inicio, hora_fim,
      hora_inicio, hora_fim,
      hora_inicio, hora_fim,
    ];
    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};
