const connect = require("../db/connect");
const validateSala = require("../services/validateSala");

// Função auxiliar para executar queries e retornar uma Promise
const queryAsync = (query, values = []) => {
  return new Promise((resolve, reject) => {
    connect.query(query, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

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
      await queryAsync(query, values);
      return res.status(201).json({ message: "Sala criada com sucesso!" });
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "O nome da sala já existe" });
      }
      if (error.code === "ER_DATA_TOO_LONG") {
        return res.status(400).json({ error: "O bloco deve ter somente uma letra" });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getAllSalasTabela(req, res) {
    const query = `SELECT * FROM sala`;
    try {
      const results = await queryAsync(query);
      return res.status(200).json({ message: "Obtendo todas as salas", salas: results });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getSalasDisponiveisHorario(req, res) {
    const { data, hora_inicio, hora_fim } = req.body;

    // Valida os dados de data/hora informados
    const validationError = validateSala.validateHorario({ data, hora_inicio, hora_fim });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Obtém todas as salas
    const querySalas = `
      SELECT s.id_sala, s.nome, s.descricao, s.bloco, s.tipo, s.capacidade
      FROM sala s
    `;

    try {
      const todasSalas = await queryAsync(querySalas);
      const salasDisponiveisFinal = [];

      // Para cada sala, verifica se há conflito de horários
      for (const sala of todasSalas) {
        const conflito = await validateSala.verificarConflitoHorarioSala(
          sala.id_sala,
          data,
          hora_inicio,
          hora_fim
        );
        if (!conflito) {
          salasDisponiveisFinal.push(sala);
        }
      }

      if (salasDisponiveisFinal.length === 0) {
        return res.status(404).json({
          message: "Não há salas disponíveis para o horário solicitado",
        });
      }
      return res.status(200).json(salasDisponiveisFinal);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao obter as salas disponíveis" });
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
      const results = await queryAsync(query, values);
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
      const results = await queryAsync(query, [salaId]);
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }
      return res.status(200).json({ message: "Sala excluída com sucesso" });
    } catch (error) {
      console.error(error);
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({
          error: "A sala está vinculada a uma reserva, e não pode ser excluída",
        });
      }
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
};
