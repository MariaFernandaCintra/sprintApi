const validateSala = require("../services/validateSala");
const { queryAsync } = require("../utils/functions");

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
      const result = await queryAsync(query, values);
      return res.status(200).json({
        message: "Sala cadastrada com sucesso!",
        salaId: result.insertId,
      });
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "O nome da sala já existe" });
      }
      if (error.code === "ER_DATA_TOO_LONG") {
        return res
          .status(400)
          .json({ error: "O bloco deve ter somente uma letra" });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getAllSalasTabela(req, res) {
    const query = `SELECT * FROM sala`;
    try {
      const results = await queryAsync(query);
      return res
        .status(200)
        .json({ message: "Obtendo todas as salas", salas: results });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getSalasDisponiveisHorario(req, res) {
    const { data_inicio, data_fim, hora_inicio, hora_fim, dias_semana } =
      req.body;

    // Valida os dados enviados
    const validationError = validateSala.validateHorario({
      data_inicio,
      data_fim,
      hora_inicio,
      hora_fim,
      dias_semana,
    });
    if (validationError) return res.status(400).json(validationError);

    // Busca todas as salas
    const querySalas = `
    SELECT id_sala, nome, descricao, bloco, tipo, capacidade
    FROM sala
  `;

    try {
      const todasSalas = await queryAsync(querySalas);
      const salasDisponiveis = [];

      for (const sala of todasSalas) {
        const conflito =
          await validateSala.verificarConflitoHorarioSala(
            sala.id_sala,
            data_inicio,
            data_fim,
            hora_inicio,
            hora_fim,
            dias_semana
          );

        if (!conflito) salasDisponiveis.push(sala);
      }

      if (salasDisponiveis.length === 0) {
        return res
          .status(404)
          .json({
            error:
              "Não há salas disponíveis para o período e horários informados.",
          });
      }

      return res.status(200).json({
        message: "Salas disponíveis",
        salas: salasDisponiveis,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar salas disponíveis" });
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
