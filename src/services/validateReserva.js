const connect = require("../db/connect");

// Função auxiliar para formatar a data e hora atuais no padrão "DD-MM-YYYY HH:MM:SS"
const formatarDataHoraAtual = () => {
  const now = new Date();
  now.setSeconds(0); // Zera os segundos
  now.setMilliseconds(0); // Zera os milissegundos

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hour}:${minute}:00`;
};

// Função auxiliar para criar um objeto Date a partir de data e horário
const criarDataHora = (data, hora) => {
  if (!data || !hora || !hora.includes(":")) {
    console.log("Data ou hora inválida:", data, hora);
    return new Date("invalid");
  }

  const [ano, mes, dia] = data.split("-").map(Number);
  const [h, m, s = "00"] = hora.split(":").map(Number);

  const dataHora = new Date(ano, mes - 1, dia, h, m, s);

  if (isNaN(dataHora.getTime())) {
    console.log("Data inválida montada:", ano, mes, dia, h, m, s);
  }

  return dataHora;
};

// Função auxiliar para criar um objeto Date com base somente no horário (fixando a data em 1970-01-01)
const criarHorario = (hora) => new Date(`1970-01-01T${hora}`);

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
    if (inicioHour < 7 || inicioHour >= 23 || fimHour < 7 || fimHour >= 23) {
      return {
        error:
          "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 23:00",
      };
    }

    const duracao = fimTime - inicioTime;
    const limite = 60 * 60 * 1000;

    // Verifica se inicioTime e fimTime são válidos
    if (isNaN(inicioTime.getTime()) || isNaN(fimTime.getTime())) {
      return { error: "Hora de início ou Hora de Fim Inválida" };
    }

    if (duracao !== limite) {
      return { error: "A reserva deve ter exatamente 1 Hora" };
    }

    return null;
  },

  // Valida os campos para atualização da reserva
  validarCamposAtualizacao: function ({ fk_id_usuario, data, hora_inicio, hora_fim }) {
    if (!fk_id_usuario || !data || !hora_inicio || !hora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    const inicioTime = criarDataHora(data, hora_inicio);
    const fimTime = criarDataHora(data, hora_fim);
    const now = new Date();
    const nowFormatado = formatarDataHoraAtual();

    if (inicioTime < now) {
      return { error: "A reserva deve ser depois de: " + nowFormatado };
    }

    if (fimTime <= inicioTime) {
      return { error: "A hora de início deve ser antes da hora de fim" };
    }

    const inicioHour = inicioTime.getHours();
    const fimHour = fimTime.getHours();
    if (inicioHour < 7 || inicioHour >= 23 || fimHour < 7 || fimHour >= 23) {
      return {
        error:
          "A reserva deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 23:00",
      };
    }

    const duracao = fimTime - inicioTime;
    const limite = 60 * 60 * 1000;
    if (duracao !== limite) {
      return { error: "A reserva deve ter exatamente 50 minutos" };
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

  // Valida conflitos de horário para criação de reserva e, se houver, tenta obter o próximo horário disponível
  validarConflitoReserva: async function (
    fk_id_sala,
    data,
    hora_inicio,
    hora_fim
  ) {
    const query = `
      SELECT hora_inicio, hora_fim 
      FROM reserva 
      WHERE fk_id_sala = ? AND data = ? 
      ORDER BY hora_inicio ASC
    `;
    const values = [fk_id_sala, data];

    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, reservas) => {
        if (err) return reject(err);

        // Função para criar um horário sem segundos e milissegundos
        function truncarSegundosEms(date) {
          const novaData = new Date(date);
          novaData.setSeconds(0, 0); // Remove segundos e milissegundos
          return novaData;
        }

        // Função para criar o horário de forma consistente
        function criarHorario(horaStr) {
          const [hour, minute, second] = horaStr.split(":").map(Number);
          const now = new Date();
          now.setHours(hour, minute, second, 0); // Sem milissegundos
          return now;
        }

        const uReservaInicio = truncarSegundosEms(criarHorario(hora_inicio));
        const uReservaFim = truncarSegundosEms(criarHorario(hora_fim));

        let conflito = false;

        // Verifica se há conflito com alguma reserva existente
        for (const reserva of reservas) {
          const reservaInicio = truncarSegundosEms(
            criarHorario(reserva.hora_inicio)
          );
          const reservaFim = truncarSegundosEms(criarHorario(reserva.hora_fim));

          // Verifica o conflito de horários
          if (uReservaInicio < reservaFim && uReservaFim > reservaInicio) {
            conflito = true;
            break;
          }
        }

        // Se não houver conflito, retorna o resultado
        if (!conflito) {
          return resolve({ conflito: false });
        }

        // Se houver conflito, procura o primeiro intervalo livre de 1 Hora
        const duracaoMs = 60 * 60 * 1000;
        let inicioDisponivel = uReservaInicio;
        const fimDoDia = truncarSegundosEms(criarHorario("23:00:00"));

        for (const reserva of reservas) {
          const reservaInicio = truncarSegundosEms(
            criarHorario(reserva.hora_inicio)
          );
          const reservaFim = truncarSegundosEms(criarHorario(reserva.hora_fim));

          // Verifica o espaço livre entre as reservas
          if (
            inicioDisponivel.getTime() + duracaoMs <=
            reservaInicio.getTime()
          ) {
            break;
          } else if (inicioDisponivel < reservaFim) {
            inicioDisponivel = reservaFim;
          }
        }

        // Verifica se o horário disponível é antes do fim do dia
        if (inicioDisponivel.getTime() + duracaoMs > fimDoDia.getTime()) {
          return resolve({ conflito: true, disponivel: false });
        }

        const fimDisponivel = new Date(inicioDisponivel.getTime() + duracaoMs);
        return resolve({
          conflito: true,
          disponivel: true,
          inicioDisponivel,
          fimDisponivel,
        });
      });
    });
  },
  // Valida conflitos de horário para atualização de reserva (excluindo a própria reserva)
  validarConflitoReservaAtualizacao: async function (
    fk_id_sala,
    data,
    hora_inicio,
    hora_fim,
    reservaId
  ) {
    const query = `
      SELECT hora_inicio, hora_fim 
      FROM reserva 
      WHERE fk_id_sala = ? AND id_reserva != ? AND data = ?
      AND (
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio >= ? AND hora_inicio < ?) OR
          (hora_fim > ? AND hora_fim <= ?)
      )
    `;
    const values = [
      fk_id_sala,
      reservaId,
      data,
      hora_inicio,
      hora_inicio,
      hora_inicio,
      hora_fim,
      hora_inicio,
      hora_fim,
      hora_inicio,
      hora_fim,
    ];

    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) {
          return resolve({ conflito: false });
        } else {
          // Ordena as reservas conflitantes para identificar o próximo horário disponível
          results.sort(
            (a, b) => criarHorario(a.hora_fim) - criarHorario(b.hora_fim)
          );
          const proximoInicio = results[0].hora_fim;
          const inicioDisponivel = criarHorario(proximoInicio);
          const fimDisponivel = new Date(
            inicioDisponivel.getTime() + 60 * 60 * 1000
          );
          return resolve({
            conflito: true,
            inicioDisponivel,
            fimDisponivel,
          });
        }
      });
    });
  },
};
