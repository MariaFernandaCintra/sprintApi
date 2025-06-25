// services/validateReserva.js
const connect = require("../db/connect");
const { criarDataHora } = require("../utils/functions"); // Assumindo que criarDataHora está definido aqui

// Função auxiliar para normalizar qualquer entrada de data (string ou Date) para
// o início do dia (meia-noite) na timezone local. Isso garante que as comparações
// de data pura sejam consistentes.
function normalizeToLocalMidnight(dateInput) {
  let d = new Date(dateInput);
  d.setHours(0, 0, 0, 0); // Define para meia-noite local
  return d;
}

// Função auxiliar para converter uma string de hora (HH:MM:SS) em minutos desde a meia-noite.
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

module.exports = {
  validarUsuario: async function (fk_id_usuario) {
    const query = `SELECT id_usuario FROM usuario WHERE id_usuario = ?`;
    const values = [fk_id_usuario];
    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) {
          console.error("Erro em validarUsuario:", err);
          return reject(err);
        }
        resolve(results.length > 0);
      });
    });
  },

  validarSala: async function (fk_id_sala) {
    const query = `SELECT id_sala FROM sala WHERE id_sala = ?`;
    const values = [fk_id_sala];
    return new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) {
          console.error("Erro em validarSala:", err);
          return reject(err);
        }
        resolve(results.length > 0);
      });
    });
  },

  validarCamposCreate: function ({
    fk_id_usuario,
    fk_id_sala,
    data_inicio,
    data_fim,
    dias_semana,
    hora_inicio,
    hora_fim,
  }) {

    const diasSemanaArray = Array.isArray(dias_semana)
      ? dias_semana
      : String(dias_semana).split(",").map(Number);

    if (
      !fk_id_usuario ||
      !fk_id_sala ||
      !data_inicio ||
      !data_fim ||
      !diasSemanaArray ||
      diasSemanaArray.length === 0 ||
      !hora_inicio ||
      !hora_fim
    ) {
      return { error: "Todos os campos devem ser preenchidos" };
    }

    if (!Array.isArray(diasSemanaArray)) {
      return { error: "dias_semana deve ser um array de números" };
    }

    const diasValidos = ["1", "2", "3", "4", "5", "6"];
    for (const dia of diasSemanaArray.map(String)) {
      if (!diasValidos.includes(dia)) {
        return {
          error: `Dia da semana inválido: ${dia}. Os dias válidos são de 1 a 6 (segunda a sábado).`,
        };
      }
    }

    const inicio = criarDataHora(data_inicio, hora_inicio);
    const fim = criarDataHora(data_fim, hora_fim);
    const now = new Date();

    if (inicio.getTime() < now.getTime()) {
      return { error: "A data e hora de início devem ser no futuro" };
    }
    if (fim.getTime() <= inicio.getTime()) {
      return { error: "A data e hora de fim devem ser após a de início" };
    }

    const horaIni = criarDataHora("2000-01-01", hora_inicio);
    const horaFim = criarDataHora("2000-01-01", hora_fim);

    if (horaIni.getTime() >= horaFim.getTime()) {
      return { error: "Hora de início deve ser antes da de fim" };
    }

    const hInicio = horaIni.getHours();
    const hFim = horaFim.getHours();

    if (hInicio < 7 || hFim > 23 || (hFim === 23 && horaFim.getMinutes() > 0)) {
      return { error: "A reserva deve estar entre 07:00 e 23:00" };
    }

    const duracao = horaFim.getTime() - horaIni.getTime();
    const limite = 30 * 60 * 1000;
    if (duracao < limite) {
      return { error: "A duração mínima por reserva é de 30 minutos" };
    }
    return null;
  },

  validarCamposUpdate: function (
    {
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim,
    },
    reservaAtual = null
  ) {
    // Validação de campos obrigatórios (chama a função de validação do create)
    const erroCamposObrigatorios = this.validarCamposCreate({
      fk_id_usuario,
      fk_id_sala,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim,
    });
    if (erroCamposObrigatorios) return erroCamposObrigatorios;

    const diasSemanaArray = Array.isArray(dias_semana)
      ? dias_semana
      : String(dias_semana).split(",").map(Number);

    // Verificação se algum campo foi alterado
    if (reservaAtual) {
      const reservaAtualDias = reservaAtual.dias_semana
        .split(",")
        .map(String)
        .sort();
      const novosDias = diasSemanaArray.map(String).sort();

      const mesmosCampos =
        reservaAtual.fk_id_usuario === fk_id_usuario &&
        reservaAtual.fk_id_sala === fk_id_sala &&
        reservaAtual.data_inicio === data_inicio &&
        reservaAtual.data_fim === data_fim &&
        JSON.stringify(reservaAtualDias) === JSON.stringify(novosDias) &&
        reservaAtual.hora_inicio === hora_inicio &&
        reservaAtual.hora_fim === hora_fim;

      if (mesmosCampos) {
        return { error: "Nenhuma alteração foi feita na reserva atual." };
      }
    }

    const inicio = criarDataHora(data_inicio, hora_inicio);
    const fim = criarDataHora(data_fim, hora_fim);
    const now = new Date();

    if (inicio.getTime() < now.getTime()) {
      return { error: "A data e hora de início devem ser no futuro" };
    }
    if (fim.getTime() <= inicio.getTime()) {
      return { error: "A data e hora de fim devem ser após a de início" };
    }

    const horaIni = criarDataHora("2000-01-01", hora_inicio);
    const horaFim = criarDataHora("2000-01-01", hora_fim);

    if (horaIni.getTime() >= horaFim.getTime()) {
      return { error: "Hora de início deve ser antes da de fim" };
    }

    const hInicio = horaIni.getHours();
    const hFim = horaFim.getHours();

    if (hInicio < 7 || hFim > 23 || (hFim === 23 && horaFim.getMinutes() > 0)) {
      return { error: "A reserva deve estar entre 07:00 e 23:00" };
    }

    const duracao = horaFim.getTime() - horaIni.getTime();
    const limite = 30 * 60 * 1000;
    if (duracao < limite) {
      return { error: "A duração mínima por reserva é de 30 minutos" };
    }

    return null;
  },

  validarConflitoReserva: async function (
    fk_id_sala,
    nova_data_inicio,
    nova_data_fim,
    novos_dias_semana,
    nova_hora_inicio,
    nova_hora_fim
  ) {
    // Converte horários da nova reserva para minutos desde a meia-noite (local)
    const novaHoraInicioMinutos = timeToMinutes(nova_hora_inicio);
    const novaHoraFimMinutos = timeToMinutes(nova_hora_fim);

    // Criação de um Set com os novos dias da semana para verificar os conflitos
    const novosDiasSet = new Set(novos_dias_semana.map(Number));

    // Consulta SQL para buscar reservas existentes para a mesma sala
    const queryReservasExistentes = `
    SELECT
      id_reserva,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim
    FROM reserva
    WHERE fk_id_sala = ?
      AND data_fim >= ?
      AND data_inicio <= ?
  `;

    // Executando a consulta para buscar as reservas existentes
    const reservasExistentes = await new Promise((resolve, reject) => {
      connect.query(
        queryReservasExistentes,
        [fk_id_sala, nova_data_inicio, nova_data_fim],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });

    const conflitosEncontrados = [];

    // Verificando cada reserva existente
    for (const existingReserva of reservasExistentes) {
      // Convertendo os dias da semana da reserva existente para um Set
      const existingDiasSet = new Set(
        existingReserva.dias_semana.split(",").map(Number)
      );

      // Verifica se há sobreposição de dias da semana
      const hasDayOverlap = novosDiasSet.has([...existingDiasSet][0]);

      if (!hasDayOverlap) {
        continue;
      }

      // Convertendo os horários das reservas existentes para minutos desde a meia-noite (local)
      const existingHoraInicioMinutos = timeToMinutes(
        existingReserva.hora_inicio
      );
      const existingHoraFimMinutos = timeToMinutes(existingReserva.hora_fim);

      // Verifica se há sobreposição de horários
      const hasTimeOverlap =
        novaHoraInicioMinutos < existingHoraFimMinutos &&
        novaHoraFimMinutos > existingHoraInicioMinutos;

      if (hasTimeOverlap) {
        conflitosEncontrados.push({
          tipo:
            existingReserva.data_inicio === existingReserva.data_fim
              ? "reservasimples"
              : "reservaperiodica", // Verificação do tipo de reserva
          id_reserva: existingReserva.id_reserva, // ID do conflito
          data_conflito: nova_data_inicio, // Data do conflito
        });
      }
    }

    // Retorna os conflitos encontrados ou sucesso
    if (conflitosEncontrados.length > 0) {
      return { conflito: true, conflitos: conflitosEncontrados };
    }

    return { conflito: false };
  },

  validarConflitoReservaUpdate: async function (
    id_reserva_atual,
    fk_id_sala,
    nova_data_inicio,
    nova_data_fim,
    novos_dias_semana,
    nova_hora_inicio,
    nova_hora_fim
  ) {
    const novosDiasSet = new Set(novos_dias_semana.map(Number));

    // Converte horários da nova reserva para minutos desde a meia-noite
    const novaHoraInicioMinutos = timeToMinutes(nova_hora_inicio);
    const novaHoraFimMinutos = timeToMinutes(nova_hora_fim);

    const queryReservasExistentes = `
    SELECT
      id_reserva,
      data_inicio,
      data_fim,
      dias_semana,
      hora_inicio,
      hora_fim
    FROM reserva
    WHERE fk_id_sala = ?
      AND data_fim >= ?
      AND data_inicio <= ?
      AND id_reserva != ?
  `;

    const reservasExistentes = await new Promise((resolve, reject) => {
      connect.query(
        queryReservasExistentes,
        [fk_id_sala, nova_data_inicio, nova_data_fim, id_reserva_atual],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    const conflitosEncontrados = [];
    const normalizedNovaDataInicioUpdate =
      normalizeToLocalMidnight(nova_data_inicio);
    const normalizedNovaDataFimUpdate = normalizeToLocalMidnight(nova_data_fim);

    for (const existingReserva of reservasExistentes) {
      const existingDiasArr = existingReserva.dias_semana
        .split(",")
        .map(Number);
      const existingDiasSet = new Set(existingDiasArr);

      const hasDayOverlap = existingDiasArr.some((day) =>
        novosDiasSet.has(day)
      );
      if (!hasDayOverlap) continue;

      const existingHoraInicioMinutos = timeToMinutes(
        existingReserva.hora_inicio
      );
      const existingHoraFimMinutos = timeToMinutes(existingReserva.hora_fim);

      const hasTimeOverlap =
        novaHoraInicioMinutos < existingHoraFimMinutos &&
        novaHoraFimMinutos > existingHoraInicioMinutos;
      if (!hasTimeOverlap) continue;

      const normalizedExistingDataInicioUpdate = normalizeToLocalMidnight(
        existingReserva.data_inicio
      );
      const normalizedExistingDataFimUpdate = normalizeToLocalMidnight(
        existingReserva.data_fim
      );

      const overlapStartDateUpdate = new Date(
        Math.max(
          normalizedNovaDataInicioUpdate.getTime(),
          normalizedExistingDataInicioUpdate.getTime()
        )
      );
      const overlapEndDateUpdate = new Date(
        Math.min(
          normalizedNovaDataFimUpdate.getTime(),
          normalizedExistingDataFimUpdate.getTime()
        )
      );

      if (overlapStartDateUpdate.getTime() > overlapEndDateUpdate.getTime())
        continue;

      for (
        let d = new Date(overlapStartDateUpdate);
        d <= overlapEndDateUpdate;
        d.setDate(d.getDate() + 1)
      ) {
        const currentDayOfWeek = d.getDay();
        const mappedCurrentDayOfWeek =
          currentDayOfWeek === 0 ? null : currentDayOfWeek;

        if (
          mappedCurrentDayOfWeek !== null &&
          novosDiasSet.has(mappedCurrentDayOfWeek) &&
          existingDiasSet.has(mappedCurrentDayOfWeek)
        ) {
          conflitosEncontrados.push({
            tipo:
              existingReserva.data_inicio === existingReserva.data_fim
                ? "reservasimples"
                : "reservaperiodica",
            id_reserva: existingReserva.id_reserva,
            data_conflito: d.toISOString().split("T")[0],
          });
          break;
        }
      }
    }

    return conflitosEncontrados.length > 0
      ? { conflito: true, conflitos: conflitosEncontrados }
      : { conflito: false };
  },
};
