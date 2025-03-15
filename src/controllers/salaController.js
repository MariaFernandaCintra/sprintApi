const connect = require("../db/connect");
const validateSala = require("../services/validateSala");

module.exports = class salaController {
  static async createSalas(req, res) {
    const { nome, descricao, bloco, tipo, capacidade } = req.body;

    const validationError = validateSala.validateCreateSala({
      nome,
      descricao,
      bloco,
      tipo,
      capacidade,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const query = `INSERT INTO sala (nome, descricao, bloco, tipo, capacidade) VALUES (?, ?, ?, ?, ?)`;
    const values = [nome, descricao, bloco, tipo, capacidade];

    try {
      await new Promise((resolve, reject) => {
        connect.query(query, values, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      return res.status(201).json({ message: "Sala Criada com Sucesso!" });
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "O nome da sala já existe" });
      }
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async getAllSalasTabela(req, res) {
    const query = `SELECT * FROM sala`;
    try {
      const results = await new Promise((resolve, reject) => {
        connect.query(query, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      return res
        .status(200)
        .json({ message: "Obtendo todas as salas", salas: results });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async getSalasDisponiveisHorario(req, res) {
    const { datahora_inicio, datahora_fim } = req.body;

    // Validação dos dados informados
    const validationError = validateSala.validateHorario({
      datahora_inicio,
      datahora_fim,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const querySalasDisponiveis = `
      SELECT s.id_sala, s.nome, s.descricao, s.bloco, s.tipo, s.capacidade
      FROM sala s
    `;
    const queryHorarioConflito = `
      SELECT 1
      FROM reserva 
      WHERE fk_id_sala = ? AND (
        (datahora_inicio < ? AND datahora_fim > ?) OR
        (datahora_inicio < ? AND datahora_fim > ?) OR
        (datahora_inicio >= ? AND datahora_inicio < ?) OR
        (datahora_fim > ? AND datahora_fim <= ?)
      )
    `;

    try {
      // Obtém todas as salas
      const salasDisponiveis = await new Promise((resolve, reject) => {
        connect.query(querySalasDisponiveis, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      const salasDisponiveisFinal = [];
      // Para cada sala, verifica se há conflito de horário
      for (const sala of salasDisponiveis) {
        const valuesHorario = [
          sala.id_sala,
          datahora_inicio,
          datahora_inicio,
          datahora_inicio,
          datahora_fim,
          datahora_inicio,
          datahora_fim,
          datahora_inicio,
          datahora_fim,
        ];
        const conflito = await new Promise((resolve, reject) => {
          connect.query(queryHorarioConflito, valuesHorario, (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });
        if (conflito.length === 0) {
          salasDisponiveisFinal.push(sala);
        }
      }

      if (salasDisponiveisFinal.length === 0) {
        return res
          .status(404)
          .json({
            message: "Não há salas disponíveis para o horário solicitado",
          });
      }
      return res.status(200).json(salasDisponiveisFinal);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao obter as salas disponíveis" });
    }
  }

  static async getSalasDisponiveisData(req, res) {
    const { data_inicio, data_fim } = req.body;

    // Validação do intervalo de datas
    const validationError = validateSala.validateDataRange({
      data_inicio,
      data_fim,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const querySalasDisponiveis = `
      SELECT s.id_sala, s.nome, s.descricao, s.bloco, s.tipo, s.capacidade
      FROM sala s
    `;
    const queryConflitoReserva = `
      SELECT 1
      FROM reserva
      WHERE fk_id_sala = ? AND (
        (datahora_inicio < ? AND datahora_fim > ?) OR
        (datahora_inicio < ? AND datahora_fim > ?) OR
        (datahora_inicio >= ? AND datahora_inicio < ?) OR
        (datahora_fim > ? AND datahora_fim <= ?)
      )
    `;

    try {
      const salasDisponiveis = await new Promise((resolve, reject) => {
        connect.query(querySalasDisponiveis, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      const salasDisponiveisFinal = [];
      for (const sala of salasDisponiveis) {
        const valuesConflito = [
          sala.id_sala,
          data_inicio,
          data_inicio,
          data_fim,
          data_fim,
          data_inicio,
          data_fim,
          data_inicio,
          data_fim,
        ];
        const conflito = await new Promise((resolve, reject) => {
          connect.query(
            queryConflitoReserva,
            valuesConflito,
            (err, results) => {
              if (err) return reject(err);
              resolve(results);
            }
          );
        });
        if (conflito.length === 0) {
          salasDisponiveisFinal.push(sala);
        }
      }

      if (salasDisponiveisFinal.length === 0) {
        return res
          .status(404)
          .json({
            message: "Não há salas disponíveis para o período solicitado",
          });
      }
      return res.status(200).json(salasDisponiveisFinal);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao obter as salas disponíveis" });
    }
  }

  static async getSalasDisponiveis(req, res) {
    const queryReserva = `SELECT fk_id_sala FROM reserva`;
    const querySala = `SELECT id_sala FROM sala`;
    try {
      const salasDisponiveisRows = await new Promise((resolve, reject) => {
        connect.query(querySala, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      const salasReservadasRows = await new Promise((resolve, reject) => {
        connect.query(queryReserva, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      const salasDisponiveis = salasDisponiveisRows.map((row) => row.id_sala);
      const salasReservadas = salasReservadasRows.map((row) => row.fk_id_sala);
      const salasSomenteDisponiveis = salasDisponiveis.filter(
        (sala) => !salasReservadas.includes(sala)
      );
      const salasOrdenadas = salasSomenteDisponiveis.sort((a, b) => a - b);

      return res.status(200).json(salasOrdenadas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao obter as salas" });
    }
  }

  static async updateSala(req, res) {
    const { nome, descricao, bloco, tipo, capacidade } = req.body;
    const salaId = req.params.id_sala;

    const validationError = validateSala.validateUpdateSala({
      nome,
      descricao,
      bloco,
      tipo,
      capacidade,
    });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const query = `UPDATE sala SET nome = ?, descricao = ?, bloco = ?, tipo = ?, capacidade = ? WHERE id_sala = ?`;
    const values = [nome, descricao, bloco, tipo, capacidade, salaId];

    try {
      const results = await new Promise((resolve, reject) => {
        connect.query(query, values, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }
      return res.status(200).json({ message: "Sala atualizada com sucesso" });
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "O nome da sala já existe" });
      }
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  static async deleteSala(req, res) {
    const salaId = req.params.id_sala;
    const query = `DELETE FROM sala WHERE id_sala = ?`;
    try {
      const results = await new Promise((resolve, reject) => {
        connect.query(query, [salaId], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }
      return res.status(200).json({ message: "Sala excluída com sucesso" });
    } catch (error) {
      console.error(error);
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        return res
          .status(400)
          .json({
            error:
              "A sala está vinculada a uma reserva, e não pode ser excluída",
          });
      }
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
};
