const connect = require("../db/connect");
const usuarioValidator = require("../services/validateUsuario");

// Função auxiliar para executar queries e retornar uma Promise
const queryAsync = (query, values = []) => {
  return new Promise((resolve, reject) => {
    connect.query(query, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = class usuarioController {
  static async createUsuarios(req, res) {
    const { NIF, email, senha, nome } = req.body;

    // Valida todos os campos necessários para criação
    const userValidationError = usuarioValidator.validateUsuario(req.body);
    if (userValidationError) {
      return res.status(400).json(userValidationError);
    }

    try {
      const nifEmailValidationError = await usuarioValidator.validateNifEmail(NIF, email);
      if (nifEmailValidationError && nifEmailValidationError.error) {
        return res.status(400).json(nifEmailValidationError);
      }

      const queryInsert = `INSERT INTO usuario (nome, email, NIF, senha) VALUES (?, ?, ?, ?)`;
      const valuesInsert = [nome, email, NIF, senha];
      await queryAsync(queryInsert, valuesInsert);

      const querySelect = `SELECT * FROM usuario WHERE email = ?`;
      const results = await queryAsync(querySelect, [email]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const usuario = results[0];
      return res.status(200).json({
        usuario: {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
        },
        message: "Cadastro bem-sucedido",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async loginUsuario(req, res) {
    const { senha, email } = req.body;

    const loginValidationError = usuarioValidator.validateLogin(req.body);
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
        return res.status(200).json({
          message: "Login realizado com sucesso!",
          usuario: {
            id_usuario: usuario.id_usuario,
            email: usuario.email,
            nome: usuario.nome,
          },
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
      return res.status(200).json({ message: "Obtendo todos os usuários", usuarios: results });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async updateUsuario(req, res) {
    const { email, senha, nome } = req.body;
    const usuarioId = req.params.id_usuario;

    // Valida os campos de atualização e o ID do usuário
    const updateValidationError = usuarioValidator.validateUpdateUsuario({ email, senha, nome });
    if (updateValidationError) {
      return res.status(400).json(updateValidationError);
    }
    const idValidationError = usuarioValidator.validateUsuarioId(usuarioId);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }

    const query = `UPDATE usuario SET email = ?, senha = ?, nome = ? WHERE id_usuario = ?`;
    try {
      const results = await queryAsync(query, [email, senha, nome, usuarioId]);
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
    // Valida se o ID do usuário foi fornecido
    const idValidationError = usuarioValidator.validateUsuarioId(usuarioId);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
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
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({ error: "Usuário não pode ser excluido, pois tem uma reserva" });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getUsuarioById(req, res) {
    const id_usuario = req.params.id_usuario; // Obtém o ID do usuário a partir dos parâmetros da URL

    // Valida se o ID foi fornecido
    const idValidationError = usuarioValidator.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
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
    // Valida se o ID foi fornecido
    const idValidationError = usuarioValidator.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }

    const queryReservas = `
      SELECT r.id_reserva, s.nome, r.datahora_inicio, r.datahora_fim
      FROM reserva r
      JOIN sala s ON r.fk_id_sala = s.id_sala
      WHERE r.fk_id_usuario = ?
    `;
    try {
      const results = await queryAsync(queryReservas, [id_usuario]);
      return res.status(200).json({ reservas: results });
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
