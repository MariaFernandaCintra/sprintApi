const validateUsuario = require("../services/validateUsuario");
const { queryAsync, formatarData, criarToken } = require("../utils/functions");

module.exports = class usuarioController {
  static async createUsuarios(req, res) {
    const { NIF, email, senha, nome } = req.body;

    // Validação dos campos obrigatórios
    const userValidationError = validateUsuario.validateUsuario(req.body);
    if (userValidationError) {
      return res.status(400).json(userValidationError);
    }

    try {
      // Valida se NIF ou email já estão cadastrados
      const nifEmailValidationError = await validateUsuario.validateNifEmail(
        NIF,
        email
      );
      if (nifEmailValidationError && nifEmailValidationError.error) {
        return res.status(400).json(nifEmailValidationError);
      }

      const queryInsert = `INSERT INTO usuario (nome, email, NIF, senha) VALUES (?, ?, ?, ?)`;
      const valuesInsert = [nome, email, NIF, senha];
      await queryAsync(queryInsert, valuesInsert);

      // Busca o usuário recém-cadastrado
      const querySelect = `SELECT * FROM usuario WHERE email = ?`;
      const results = await queryAsync(querySelect, [email]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const usuario = results[0];

      // Gera o token
      const token = criarToken({
        id: usuario.id_usuario,
        email: usuario.email,
      });

      // Retorna usuário e token
      return res.status(200).json({
        message: "Cadastro bem-sucedido",
        usuario,
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async loginUsuario(req, res) {
    const { email, senha } = req.body;

    // Validação dos campos para login
    const loginValidationError = validateUsuario.validateLogin(req.body);
    if (loginValidationError) {
      return res.status(400).json(loginValidationError);
    }

    const query = `SELECT * FROM usuario WHERE email = ?`;

    try {
      const results = await queryAsync(query, [email]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const usuario = results[0];

      if (usuario.senha === senha) {
        // Gera o token
        const token = criarToken({
          id: usuario.id_usuario,
          email: usuario.email,
        });

        return res.status(200).json({
          message: "Login Bem-sucedido",
          usuario,
          token,
        });
      } else {
        return res.status(401).json({ error: "Senha ou E-mail incorreto" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async getAllUsuarios(req, res) {
    const query = `SELECT * FROM usuario`;
    try {
      const results = await queryAsync(query);
      return res
        .status(200)
        .json({ message: "Obtendo todos os usuários", usuarios: results });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

static async updateUsuario(req, res) {
  const { email, senha, nome } = req.body;
  const usuarioId = req.params.id_usuario;
  const token = req.userId;

  const updateValidationError = validateUsuario.validateUpdateUsuario({
    email,
    senha,
    nome,
  });
  if (Number(usuarioId) !== Number(token)) {
    return res.status(400).json({ message: "Você não pode atualizar outro usuário" });
  }
  if (updateValidationError) {
    return res.status(400).json(updateValidationError);
  }
  const idValidationError = validateUsuario.validateUsuarioId(usuarioId);
  if (idValidationError) {
    return res.status(400).json(idValidationError);
  }

  try {
    const selectQuery = `SELECT email, senha, nome FROM usuario WHERE id_usuario = ?`;
    const [usuarioAtual] = await queryAsync(selectQuery, [usuarioId]);

    if (!usuarioAtual) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const dadosIguais =
      usuarioAtual.email === email &&
      usuarioAtual.senha === senha &&
      usuarioAtual.nome === nome;

    if (dadosIguais) {
      return res.status(400).json({ error: "Nenhuma alteração detectada nos dados enviados" });
    }

    const updateQuery = `UPDATE usuario SET email = ?, senha = ?, nome = ? WHERE id_usuario = ?`;
    const results = await queryAsync(updateQuery, [email, senha, nome, usuarioId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "O email já está vinculado a outro usuário" });
    }
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

  static async deleteUsuario(req, res) {
    const usuarioId = req.params.id_usuario;
    const token = req.userId;

    // Valida se o ID do usuário foi fornecido
    const idValidationError = validateUsuario.validateUsuarioId(usuarioId);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if (Number(usuarioId) !== Number(token)) {
      return res
        .status(400)
        .json({ message: "Você não pode deletar outro usuário" });
    }
    const query = `DELETE FROM usuario WHERE id_usuario = ?`;
    try {
      const results = await queryAsync(query, [usuarioId]);
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      return res.status(200).json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getUsuarioById(req, res) {
    const id_usuario = req.params.id_usuario;
    const token = req.userId;

    // Valida se o ID foi fornecido
    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if (Number(id_usuario) !== Number(token)) {
      return res.status(400).json({
        message: "Você não pode visualizar as informações de outro usuário",
      });
    }
    const query = `SELECT * FROM usuario WHERE id_usuario = ?`;
    try {
      const results = await queryAsync(query, [id_usuario]);
      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      const usuario = results[0];
      return res.status(200).json({
        usuario: {
          id_usuario: usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          NIF: usuario.NIF,
          senha: usuario.senha,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getUsuarioReservas(req, res) {
    const id_usuario = req.params.id_usuario;
    const token = req.userId;

    // Valida se o ID foi fornecido
    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if (Number(id_usuario) !== Number(token)) {
      return res.status(400).json({
        message: "Você não pode visualizar as reservas de outro usuário",
      });
    }
    const queryReservas = `
      SELECT r.id_reserva, s.nome, r.data, r.hora_inicio, r.hora_fim, r.dia_semana
      FROM reserva r
      JOIN sala s ON r.fk_id_sala = s.id_sala
      WHERE r.fk_id_usuario = ?
    `;
    try {
      const results = await queryAsync(queryReservas, [id_usuario]);
      const reservas = results.map((reserva) => ({
        id_reserva: reserva.id_reserva,
        sala: reserva.nome,
        dia_semana: reserva.dia_semana,
        data: reserva.data ? formatarData(new Date(reserva.data)) : null,
        hora_inicio: reserva.hora_inicio,
        hora_fim: reserva.hora_fim,
      }));
      if (reservas.length === 0) {
        return res
          .status(404)
          .json({ error: "Nenhuma reserva encontrada para este usuário" });
      }
      return res.status(200).json({ reservas });
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getHistoricoReservas(req, res) {
    const id_usuario = req.params.id_usuario;
    const token = req.userId;

    // Valida ID e token (somente o próprio usuário pode ver seu histórico)
    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if (Number(id_usuario) !== Number(token)) {
      return res.status(400).json({
        message: "Você não pode visualizar o histórico de outro usuário",
      });
    }

    try {
      const query = `CALL HistoricoReservaUsuario(?)`;
      const [results] = await queryAsync(query, [id_usuario]);

      // Atenção: MySQL retorna um array de arrays quando se usa CALL
      const historico = results;

      if (historico.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma reserva anterior encontrada." });
      }

      return res.status(200).json({ historico });
    } catch (error) {
      console.error("Erro ao buscar histórico de reservas:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getHistoricoDelecao(req, res) {
    const token = req.userId;
    const id_usuario = req.params.id_usuario;

    // Valida ID e token (somente o próprio usuário pode ver seu histórico)
    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if (Number(id_usuario) !== Number(token)) {
      return res.status(400).json({
        message: "Você não pode visualizar o histórico de outro usuário",
      });
    }

    const query = `
    SELECT 
      id_log,
      id_reserva,
      fk_id_sala,
      fk_id_usuario,
      data_reserva,
      hora_inicio_reserva,
      hora_fim_reserva,
      data_hora_log
    FROM logreservas
    WHERE fk_id_usuario = ?
      AND tipo_operacao = 0
    ORDER BY data_hora_log DESC
  `;

    try {
      const results = await queryAsync(query, [id_usuario]);
      res.status(200).json({ historicoDelecao: results });
    } catch (error) {
      console.error("Erro ao buscar histórico de deleções:", error);
      res.status(500).json({ error: "Erro ao buscar histórico de deleções" });
    }
  }
};
