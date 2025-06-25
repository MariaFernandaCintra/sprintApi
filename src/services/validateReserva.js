const connect = require("../db/connect");
const { criarDataHora, formatarDataHoraAtual } = require("../utils/functions");

module.exports = {
  // Valida os campos obrigatórios e regras de negócio para criação de reserva
  validarCamposReserva: function ({
    fk_id_usuario,
    fk_id_sala,
    data,
    hora_inicio,
    hora_fim,
  }) {
    if (!fk_id_usuario || !fk_id_sala || !data || !hora_inicio || !hora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    const inicioTime = criarDataHora(data, hora_inicio);
    const fimTime = criarDataHora(data, hora_fim);
    const now = new Date();
    const nowFormatado = formatarDataHoraAtual();
    const [year, month, day] = data.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    // Remove segundos e milissegundos da hora
    inicioTime.setSeconds(0, 0);
    fimTime.setSeconds(0, 0);
    now.setSeconds(0, 0);

    if (inicioTime < now) {
      return { error: "A reserva deve ser depois de: " + nowFormatado };
    }

    if (fimTime <= inicioTime) {
      return { error: "A hora de início deve ser antes da hora de fim" };
    }

    if (date.getDay() === 0) {
      return { error: "A reserva não pode ser feita em um domingo" };
    }

    const inicioHour = inicioTime.getHours();
    const fimHour = fimTime.getHours();

    if (inicioHour < 7 || inicioHour > 23 || fimHour < 7 || fimHour > 23) {
      return {
        error:
          "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 23:00",
      };
    }

    // Verifica se inicioTime e fimTime são válidos
    if (isNaN(inicioTime.getTime()) || isNaN(fimTime.getTime())) {
      return { error: "Hora de início ou Hora de Fim Inválida" };
    }

    const duracao = fimTime - inicioTime;
    const limite = 30 * 60 * 1000;

    if (duracao < limite) {
      return { error: "A reserva deve ter no mínimo 30 minutos" };
    }

    return null;
  },

  // Valida os campos para atualização da reserva
  validarCamposAtualizacao: function (
    { fk_id_usuario, data, hora_inicio, hora_fim },
    reservaAtual = null
  ) {
    if (!fk_id_usuario || !data || !hora_inicio || !hora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    if (reservaAtual) {
      const dataAtualFormatada = reservaAtual.data;
      const dataEnviadaFormatada = data;

      if (
        dataAtualFormatada === dataEnviadaFormatada &&
        reservaAtual.hora_inicio === hora_inicio &&
        reservaAtual.hora_fim === hora_fim
      ) {
        return {
          error:
            "Os dados informados são iguais aos da reserva atual. Nenhuma alteração foi feita.",
        };
      }
    }

    const inicioTime = criarDataHora(data, hora_inicio);
    const fimTime = criarDataHora(data, hora_fim);
    const now = new Date();
    const nowFormatado = formatarDataHoraAtual();
    const [year, month, day] = data.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (inicioTime < now) {
      return { error: "A reserva deve ser depois de: " + nowFormatado };
    }

    if (fimTime <= inicioTime) {
      return { error: "A hora de início deve ser antes da hora de fim" };
    }

    if (date.getDay() === 0) {
      return { error: "A reserva não pode ser feita em um domingo" };
    }

    const inicioHour = inicioTime.getHours();
    const fimHour = fimTime.getHours();
    if (inicioHour < 7 || inicioHour > 23 || fimHour < 7 || fimHour > 23) {
      return {
        error:
          "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 23:00",
      };
    }

    if (isNaN(inicioTime.getTime()) || isNaN(fimTime.getTime())) {
      return { error: "Hora de início ou Hora de Fim Inválida" };
    }

    const duracao = fimTime - inicioTime;
    const limite = 30 * 60 * 1000;

    if (duracao < limite) {
      return { error: "A reserva deve ter no mínimo 30 minutos" };
    }

    return null;
  },

  // Verifica se o usuário existe no banco de dados
  verificarUsuario: async function (fk_id_usuario) {
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
  verificarSala: async function (fk_id_sala) {
    const query = `SELECT id_sala FROM sala WHERE id_sala = ?`;
    const values = [fk_id_sala];
    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      });
    });
  },

  validarConflitoReserva: async function (
    fk_id_sala,
    data,
    hora_inicio,
    hora_fim
  ) {
    const querySimples = `
    SELECT hora_inicio, hora_fim
    FROM reserva
    WHERE fk_id_sala = ? AND data = ?
  `;
    const queryPeriodicas = `
    SELECT data_inicio, data_fim, dias_semana, hora_inicio, hora_fim
    FROM reservaperiodica
    WHERE fk_id_sala = ? AND data_inicio <= ? AND data_fim >= ?
  `;

    const reservasSimples = await new Promise((res, rej) => {
      connect.query(querySimples, [fk_id_sala, data], (err, rows) => {
        if (err) return rej(err);
        res(rows);
      });
    });

    const reservasPeriodicas = await new Promise((res, rej) => {
      connect.query(queryPeriodicas, [fk_id_sala, data, data], (err, rows) => {
        if (err) return rej(err);
        res(rows);
      });
    });

    const horaParaMinutos = (hora) => {
      const [h, m, s = 0] = hora.split(":").map(Number);
      return h * 60 + m + s / 60;
    };

    const inicioUser = horaParaMinutos(hora_inicio);
    const fimUser = horaParaMinutos(hora_fim);

    // Bloqueia domingo (getDay() = 0)
    const [ano, mes, dia] = data.split("-").map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);
    const diaSemana = dataLocal.getDay();

    // Verificar conflito com reservas simples
    for (const r of reservasSimples) {
      const inicio = horaParaMinutos(r.hora_inicio);
      const fim = horaParaMinutos(r.hora_fim);
      if (inicioUser < fim && fimUser > inicio) {
        return { conflito: true };
      }
    }

    for (const rp of reservasPeriodicas) {
      const dias = rp.dias_semana.split(",").map(Number);
      if (!dias.includes(diaSemana)) continue;

      const inicio = horaParaMinutos(rp.hora_inicio);
      const fim = horaParaMinutos(rp.hora_fim);

      if (inicioUser < fim && fimUser > inicio) {
        return { conflito: true };
      }
    }

    return { conflito: false };
  },

  validarConflitoReservaAtualizacao: async function (
    id_reserva,
    fk_id_sala,
    data,
    hora_inicio,
    hora_fim
  ) {
    const querySimples = `
    SELECT hora_inicio, hora_fim
    FROM reserva
    WHERE fk_id_sala = ? AND data = ? AND id_reserva != ?
  `;
    const queryPeriodicas = `
    SELECT data_inicio, data_fim, dias_semana, hora_inicio, hora_fim
    FROM reservaperiodica
    WHERE fk_id_sala = ? AND data_inicio <= ? AND data_fim >= ?
  `;

    const reservasSimples = await new Promise((res, rej) => {
      connect.query(
        querySimples,
        [fk_id_sala, data, id_reserva],
        (err, rows) => {
          if (err) return rej(err);
          res(rows);
        }
      );
    });

    const reservasPeriodicas = await new Promise((res, rej) => {
      connect.query(queryPeriodicas, [fk_id_sala, data, data], (err, rows) => {
        if (err) return rej(err);
        res(rows);
      });
    });

    const horaParaMinutos = (hora) => {
      const [h, m, s = 0] = hora.split(":").map(Number);
      return h * 60 + m + s / 60;
    };

    const inicioUser = horaParaMinutos(hora_inicio);
    const fimUser = horaParaMinutos(hora_fim);

    const [ano, mes, dia] = data.split("-").map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);
    const diaSemana = dataLocal.getDay();

    for (const r of reservasSimples) {
      const inicio = horaParaMinutos(r.hora_inicio);
      const fim = horaParaMinutos(r.hora_fim);
      if (inicioUser < fim && fimUser > inicio) {
        return { conflito: true };
      }
    }

    for (const rp of reservasPeriodicas) {
      const dias = rp.dias_semana.split(",").map(Number);
      if (!dias.includes(diaSemana)) continue;

      const inicio = horaParaMinutos(rp.hora_inicio);
      const fim = horaParaMinutos(rp.hora_fim);

      if (inicioUser < fim && fimUser > inicio) {
        return { conflito: true };
      }
    }

    return { conflito: false };
  },
};
