const { queryAsync, criarDataHora, horaParaMinutos } = require("../utils/functions");

module.exports = {
  validarUsuario: async function (fk_id_usuario) {
    const query = `SELECT id_usuario FROM usuario WHERE id_usuario = ?`;
    try {
      const results = await queryAsync(query, [fk_id_usuario]);
      return results.length > 0;
    } catch (err) {
      console.error("Erro em validarUsuario:", err);
      throw new Error("Erro ao validar usuário.");
    }
  },

  validarSala: async function (fk_id_sala) {
    const query = `SELECT id_sala FROM sala WHERE id_sala = ?`;
    try {
      const results = await queryAsync(query, [fk_id_sala]);
      return results.length > 0;
    } catch (err) {
      console.error("Erro em validarSala:", err);
      throw new Error("Erro ao validar sala.");
    }
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
    // Garante que dias_semana é um array de números
    const diasSemanaArray = Array.isArray(dias_semana)
      ? dias_semana.map(Number)
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

    if (!Array.isArray(diasSemanaArray) || diasSemanaArray.some(isNaN)) {
      return { error: "dias_semana deve ser um array de números válidos" };
    }

    const inicio = criarDataHora(data_inicio, hora_inicio);
    const fim = criarDataHora(data_fim, hora_fim);
    const now = new Date();

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
    const trintaMinutos = 30 * 60 * 1000;

    if (inicio.getTime() - trintaMinutos < now.getTime()) {
      return {
        error: "A reserva deve ser feita no futuro, com pelo menos 30 minutos de antecedência",
      };
    }

    if (duracao < trintaMinutos) {
      return { error: "A duração mínima por reserva é de 30 minutos" };
    }

    const dataLocal = new Date(data_inicio + "T00:00:00");
    const diaSemana = dataLocal.getDay(); // 0 para domingo, 1 para segunda...

    if (diaSemana === 0) {
      return {
        error: "Reservas não são permitidas no domingo. Por favor, escolha um dia entre segunda e sábado.",
      };
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
      ? dias_semana.map(Number)
      : String(dias_semana).split(",").map(Number);


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

    // A validação de datas e horas já foi feita em validarCamposCreate
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
    const novaHoraInicioMinutos = horaParaMinutos(nova_hora_inicio);
    const novaHoraFimMinutos = horaParaMinutos(nova_hora_fim);
    const novosDiasSet = new Set(novos_dias_semana.map(Number));

    const queryReservasExistentes = `
      SELECT
        id_reserva,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim
      FROM reserva
      WHERE data_fim >= CURDATE()
        AND fk_id_sala = ?
        AND data_fim >= ?
        AND data_inicio <= ?
    `;

    try {
      const reservasExistentes = await queryAsync(
        queryReservasExistentes,
        [fk_id_sala, nova_data_inicio, nova_data_fim]
      );

      const conflitosEncontrados = [];

      for (const existingReserva of reservasExistentes) {
        const existingDiasSet = new Set(
          existingReserva.dias_semana.split(",").map(Number)
        );

        const hasDayOverlap = [...novosDiasSet].some((dia) =>
          existingDiasSet.has(dia)
        );

        if (!hasDayOverlap) {
          continue;
        }

        const existingHoraInicioMinutos = horaParaMinutos(
          existingReserva.hora_inicio
        );
        const existingHoraFimMinutos = horaParaMinutos(existingReserva.hora_fim);

        const hasTimeOverlap =
          novaHoraInicioMinutos < existingHoraFimMinutos &&
          novaHoraFimMinutos > existingHoraInicioMinutos;

        if (hasTimeOverlap) {
          conflitosEncontrados.push({
            tipo:
              existingReserva.data_inicio === existingReserva.data_fim
                ? "reservasimples"
                : "reservaperiodica",
            id_reserva: existingReserva.id_reserva,
            data_conflito: nova_data_inicio,
          });
        }
      }

      if (conflitosEncontrados.length > 0) {
        return { conflito: true, conflitos: conflitosEncontrados };
      }

      return { conflito: false };
    } catch (err) {
      console.error("Erro em validarConflitoReserva:", err);
      throw new Error("Erro interno ao validar conflito de reserva.");
    }
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
    const novaHoraInicioMinutos = horaParaMinutos(nova_hora_inicio);
    const novaHoraFimMinutos = horaParaMinutos(nova_hora_fim);
    const novosDiasSet = new Set(novos_dias_semana.map(Number));

    const queryReservasExistentes = `
      SELECT
        id_reserva,
        data_inicio,
        data_fim,
        dias_semana,
        hora_inicio,
        hora_fim
      FROM reserva
      WHERE data_fim >= CURDATE()
        AND fk_id_sala = ?
        AND data_fim >= ?
        AND data_inicio <= ?
        AND id_reserva != ?
    `;

    try {
      const reservasExistentes = await queryAsync(
        queryReservasExistentes,
        [fk_id_sala, nova_data_inicio, nova_data_fim, id_reserva_atual]
      );

      const conflitosEncontrados = [];

      for (const existingReserva of reservasExistentes) {
        if (
          existingReserva.data_inicio === nova_data_inicio &&
          existingReserva.data_fim === nova_data_fim &&
          existingReserva.hora_inicio === nova_hora_inicio &&
          existingReserva.hora_fim === nova_hora_fim &&
          existingReserva.dias_semana.split(",").map(Number).sort().join(",") ===
            novos_dias_semana.map(Number).sort().join(",")
        ) {
          return {
            conflito: true,
            erros: [
              {
                error:
                  "Dados idênticos encontrados. Não é possível atualizar para os mesmos dados.",
              },
            ],
          };
        }

        const existingDiasArr = existingReserva.dias_semana
          .split(",")
          .map(Number);
        const existingDiasSet = new Set(existingDiasArr);

        const hasDayOverlap = [...novosDiasSet].some((dia) =>
          existingDiasSet.has(dia)
        );

        if (!hasDayOverlap) {
          continue;
        }

        const existingHoraInicioMinutos = horaParaMinutos(
          existingReserva.hora_inicio
        );
        const existingHoraFimMinutos = horaParaMinutos(existingReserva.hora_fim);

        const hasTimeOverlap =
          novaHoraInicioMinutos < existingHoraFimMinutos &&
          novaHoraFimMinutos > existingHoraInicioMinutos;

        if (hasTimeOverlap) {
          conflitosEncontrados.push({
            tipo:
              existingReserva.data_inicio === existingReserva.data_fim
                ? "reservasimples"
                : "reservaperiodica",
            id_reserva: existingReserva.id_reserva,
            data_conflito: nova_data_inicio,
          });
        }
      }

      if (conflitosEncontrados.length > 0) {
        return { conflito: true, conflitos: conflitosEncontrados };
      }

      return { conflito: false };
    } catch (err) {
      console.error("Erro em validarConflitoReservaUpdate:", err);
      throw new Error("Erro interno ao validar conflito de reserva para atualização.");
    }
  },
};