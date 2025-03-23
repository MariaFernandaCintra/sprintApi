const connect = require("../db/connect");
const validateReserva = require("../services/validateReserva");

// Função auxiliar para executar queries e retornar uma Promise
const queryAsync = (query, values = []) => {
  return new Promise((resolve, reject) => {
    connect.query(query, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Atualiza a função getDiaSemana para evitar deslocamento de data
const getDiaSemana = (data) => {
  // Divide a data (formato YYYY-MM-DD) em ano, mês e dia
  const [year, month, day] = data.split("-").map(Number);
  // Cria o objeto Date utilizando o construtor local (mês em JavaScript inicia em 0)
  const date = new Date(year, month - 1, day);
  const diasSemana = [
    "Domingo",
    "Segunda-Feira",
    "Terça-Feira",
    "Quarta-Feira",
    "Quinta-Feira",
    "Sexta-Feira",
    "Sábado",
  ];
  return diasSemana[date.getDay()];
};

module.exports = class ReservaController {
  static async createReservas(req, res) {
    const { fk_id_usuario, fk_id_sala, data, hora_inicio, hora_fim } = req.body;
  
    // Validação inicial dos campos
    const validationError = validateReserva.validateReserva({
      fk_id_usuario,
      fk_id_sala,
      data,
      hora_inicio,
      hora_fim,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }
  
    try {
      // Verifica se o usuário existe
      const usuarioExiste = await validateReserva.checkUsuarioExiste(fk_id_usuario);
      if (!usuarioExiste) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      // Verifica se a sala existe
      const salaExiste = await validateReserva.checkSalaExiste(fk_id_sala);
      if (!salaExiste) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }
  
      // Consulta todas as reservas do dia para a sala, ordenadas pelo horário de início
      const queryReservas = `
        SELECT hora_inicio, hora_fim 
        FROM reserva 
        WHERE fk_id_sala = ? AND data = ?
        ORDER BY hora_inicio ASC
      `;
      const reservas = await queryAsync(queryReservas, [fk_id_sala, data]);
  
      // Cria objetos Date para o horário desejado (base fixada em 1970-01-01)
      const desiredStart = new Date(`1970-01-01T${hora_inicio}`);
      const desiredEnd = new Date(`1970-01-01T${hora_fim}`);
      let conflictFound = false;
  
      // Verifica se o intervalo desejado conflita com alguma reserva existente
      for (const reserva of reservas) {
        const rStart = new Date(`1970-01-01T${reserva.hora_inicio}`);
        const rEnd = new Date(`1970-01-01T${reserva.hora_fim}`);
        if (desiredStart < rEnd && desiredEnd > rStart) {
          conflictFound = true;
          break;
        }
      }
  
      // Se houver conflito, procura o primeiro intervalo livre com duração de 50 minutos
      if (conflictFound) {
        const duracaoMs = 50 * 60 * 1000; // 50 minutos em milissegundos
        let inicioDisponivel = desiredStart;
        // Define o fim do dia (ajuste se necessário conforme regras do sistema)
        const fimDoDia = new Date('1970-01-01T23:59:59');
  
        // Itera pelas reservas para identificar um intervalo livre
        for (const reserva of reservas) {
          const rStart = new Date(`1970-01-01T${reserva.hora_inicio}`);
          const rEnd = new Date(`1970-01-01T${reserva.hora_fim}`);
          // Se o espaço entre o horário disponível atual e o início da reserva for suficiente:
          if (inicioDisponivel.getTime() + duracaoMs <= rStart.getTime()) {
            break;
          } else {
            // Atualiza o início disponível se houver sobreposição
            if (inicioDisponivel < rEnd) {
              inicioDisponivel = rEnd;
            }
          }
        }
  
        // Se o intervalo livre extrapolar o fim do dia, não há disponibilidade
        if (inicioDisponivel.getTime() + duracaoMs > fimDoDia.getTime()) {
          return res.status(400).json({
            error: "Não há horários disponíveis para uma reserva de 50 minutos neste dia."
          });
        }
  
        const fimDisponivel = new Date(inicioDisponivel.getTime() + duracaoMs);
        const formatTime = (d) => d.toTimeString().split(" ")[0];
        return res.status(400).json({
          error: `A sala já está reservada neste horário. O próximo horário disponível é de ${formatTime(inicioDisponivel)} até ${formatTime(fimDisponivel)}`
        });
      }
  
      // Se não houver conflito, calcula o dia da semana e insere a nova reserva
      const dia_semana = getDiaSemana(data);
      const queryInsert = `
        INSERT INTO reserva (fk_id_usuario, fk_id_sala, dia_semana, data, hora_inicio, hora_fim)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await queryAsync(queryInsert, [
        fk_id_usuario,
        fk_id_sala,
        dia_semana,
        data,
        hora_inicio,
        hora_fim,
      ]);
  
      return res.status(201).json({ message: "Sala reservada com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar reserva" });
    }
  }  

  static async getAllReservas(req, res) {
    const query = `SELECT * FROM reserva`;
    try {
      const results = await queryAsync(query);
      // Mapeia cada reserva para garantir os formatos desejados
      const reservasTransformadas = results.map((reserva) => {
        return {
          id_reserva: reserva.id_reserva,
          fk_id_sala: reserva.fk_id_sala,
          fk_id_usuario: reserva.fk_id_usuario,
          dia_semana: reserva.dia_semana,
          data: reserva.data, // esperado no formato YYYY-MM-DD
          hora_inicio: reserva.hora_inicio, // esperado no formato HH:MM:SS
          hora_fim: reserva.hora_fim,
        };
      });
      return res.status(200).json({
        message: "Obtendo todas as reservas",
        reservas: reservasTransformadas,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async updateReserva(req, res) {
    const { data, hora_inicio, hora_fim } = req.body;
    // Se a rota for /reserva/:id, utilize req.params.id
    const reservaId = req.params.id_reserva; // Alterado de req.params.id_reserva para req.params.id
  
    // Valida os campos de atualização usando a função de validação específica
    const validationError = validateReserva.validateUpdateReserva({
      data,
      hora_inicio,
      hora_fim,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }
  
    try {
      // Obtém o fk_id_sala da reserva para verificação de conflitos
      const querySala = `SELECT fk_id_sala FROM reserva WHERE id_reserva = ?`;
      const resultadosSala = await queryAsync(querySala, [reservaId]);
      if (resultadosSala.length === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }
      const { fk_id_sala } = resultadosSala[0];
  
      // Verifica conflitos de horário para a mesma sala e data (excluindo a própria reserva)
      const queryHorario = `
        SELECT hora_inicio, hora_fim 
        FROM reserva 
        WHERE fk_id_sala = ? AND id_reserva != ? AND data = ? AND (
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio >= ? AND hora_inicio < ?) OR
          (hora_fim > ? AND hora_fim <= ?)
        )
      `;
      const conflitos = await queryAsync(queryHorario, [
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
      ]);
      if (conflitos.length > 0) {
        const reservasOrdenadas = conflitos.sort(
          (a, b) =>
            new Date(`1970-01-01T${a.hora_fim}`) -
            new Date(`1970-01-01T${b.hora_fim}`)
        );
        const proximoHorarioInicio = reservasOrdenadas[0].hora_fim;
        const [hora, min, seg] = proximoHorarioInicio.split(":");
        const inicioDate = new Date(1970, 0, 1, hora, min, seg);
        const fimDate = new Date(inicioDate.getTime() + 50 * 60 * 1000);
        const formatTime = (d) => d.toTimeString().split(" ")[0];
        return res.status(400).json({
          error: `A sala já está reservada neste horário. O próximo horário disponível é de ${formatTime(
            inicioDate
          )} até ${formatTime(fimDate)}`,
        });
      }
  
      // Atualiza o dia da semana com base na nova data
      const dia_semana = getDiaSemana(data);
  
      // Atualiza a reserva
      const queryUpdate = `
        UPDATE reserva 
        SET data = ?, hora_inicio = ?, hora_fim = ?, dia_semana = ?
        WHERE id_reserva = ?
      `;
      await queryAsync(queryUpdate, [
        data,
        hora_inicio,
        hora_fim,
        dia_semana,
        reservaId,
      ]);
  
      return res.status(200).json({ message: "Reserva atualizada com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar reserva" });
    }
  }

  static async deleteReserva(req, res) {
    const reservaId = req.params.id_reserva;
    const query = `DELETE FROM reserva WHERE id_reserva = ?`;
    try {
      const results = await queryAsync(query, [reservaId]);
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }
      return res.status(200).json({ message: "Reserva excluída com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
};
