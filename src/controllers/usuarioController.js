const connect = require("../db/connect");

module.exports = class usuarioController {
  static async createUsuarios(req, res) {
    const { NIF, email, senha, nome } = req.body;

    if (!NIF || !email || !senha || !nome) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    if (isNaN(NIF) || NIF.length !== 7) {
      return res.status(400).json({
        error: "NIF inválido. Deve conter exatamente 7 dígitos numéricos",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Email inválido. Deve conter @" });
    }

    const queryInsert = `INSERT INTO usuario (nome, email, NIF, senha) VALUES (?, ?, ?, ?)`;
    const valuesInsert = [nome, email, NIF, senha];

    try {
      connect.query(queryInsert, valuesInsert, function (err) {
        if (err) {
          console.error(err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              error: "O NIF ou email já está vinculado a outro usuário",
            });
          }
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }

        // Após inserir o usuário, buscar os dados inseridos para enviar na resposta
        const querySelect = `SELECT * FROM usuario WHERE email = ?`;
        connect.query(querySelect, [email], function (err, results) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro Interno do Servidor" });
          }

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
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async loginUsuario(req, res) {
    const { senha, email } = req.body;

    // Valida se todos os campos obrigatórios estão devidamente preenchidos
    if (!senha || !email) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    // Consulta para verificar se o email existe no banco de dados
    const query = `SELECT * FROM usuario WHERE email = ?`;
    const values = [email];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }

        // Verifica se o usuário foi encontrado
        if (results.length === 0) {
          return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const usuario = results[0];

        // Verifica se a senha está correta
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
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async getAllUsuarios(req, res) {
    const query = `SELECT * FROM usuario`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res
          .status(200)
          .json({ message: "Obtendo todos os usuários", usuarios: results });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async updateUsuario(req, res) {
    const { email, senha, nome } = req.body;
    const usuarioId = req.params.id_usuario;

    // Valida se todos os campos obrigatórios estão preenchidos
    if (!email || !senha || !nome) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    // Valida se o email contém o caractere "@"
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Email inválido. Deve conter @" });
    }

    // Query para atualizar os dados do usuário
    const query = `UPDATE usuario SET email = ?, senha = ?, nome = ? WHERE id_usuario = ?`;
    const values = [email, senha, nome, usuarioId];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              error: "O email já está vinculado a outro usuário",
            });
          }
          return res.status(500).json({ error: "Erro interno no servidor" });
        }

        // Verifica se o usuário foi encontrado e atualizado
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Usuário não encontrado" });
        }
        return res
          .status(200)
          .json({ message: "Usuário atualizado com sucesso" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async deleteUsuario(req, res) {
    const usuarioId = req.params.id_usuario;
    const query = `DELETE FROM usuario WHERE id_usuario = ?`;
    const values = [usuarioId];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro interno no servidor" });
        }

        // Verifica se o usuário foi encontrado e excluído
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Usuario não encontrado" });
        }
        return res
          .status(200)
          .json({ message: "Usuario excluído com sucesso" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getUsuarioById(req, res) {
    const id_usuario = req.params.id_usuario; // Obtém o ID do usuário a partir dos parâmetros da URL

    // Valida se o ID foi fornecido
    if (!id_usuario) {
      return res.status(400).json({ error: "ID do usuário é obrigatório" });
    }

    const query = `SELECT * FROM usuario WHERE id_usuario = ?`; // Consulta SQL para buscar o usuário pelo ID

    connect.query(query, [id_usuario], function (err, results) {
      if (err) {
        console.error("Erro ao buscar usuário:", err); // Loga o erro no console para depuração
        return res.status(500).json({ error: "Erro interno do servidor" }); // Retorna erro genérico ao cliente
      }

      // Verifica se o usuário foi encontrado
      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Obtém os dados do usuário encontrado
      const usuario = results[0];
      const queryUsuario = `SELECT * FROM usuario WHERE id_usuario = ?`; // Consulta redundante, pode ser ajustada

      connect.query(queryUsuario, [id_usuario], function (err) {
        if (err) {
          console.error("Erro ao buscar reservas:", err);
          return res.status(500).json({
            error: "Erro interno ao buscar reservas",
          });
        }

        // Retorna os dados do usuário no formato JSON
        return res.status(200).json({
          usuario: {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            NIF: usuario.NIF,
            senha: usuario.senha,
          },
        });
      });
    });
  }

  static async getUsuarioReservas(req, res) {
    const id_usuario = req.params.id_usuario; // Obtém o ID do usuário a partir dos parâmetros da URL

    // Consulta SQL para buscar as reservas do usuário, incluindo informações da sala
    const queryReservas = `
      SELECT r.id_reserva, s.nome, r.datahora_inicio, r.datahora_fim
      FROM reserva r
      JOIN sala s ON r.fk_id_sala = s.id_sala
      WHERE r.fk_id_usuario = ?
    `;

    try {
      // Executa a consulta no banco de dados
      connect.query(queryReservas, [id_usuario], (err, results) => {
        if (err) {
          console.error("Erro ao buscar reservas:", err); // Loga o erro no console
          return res.status(500).json({ error: "Erro ao buscar reservas" });
        }

        // Verifica se há reservas encontradas
        if (results.length === 0) {
          return res.status(200).json({ reservas: [] }); // Retorna lista vazia se não houver reservas
        }

        // Retorna as reservas encontradas no formato JSON
        return res.status(200).json({ reservas: results });
      });
    } catch (error) {
      console.error("Erro ao buscar reservas:", error); // Loga erros inesperados
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
