const validateUsuario = require("../services/validateUsuario");
const { queryAsync, formatarData, criarToken } = require("../utils/functions");
const bcrypt = require("bcrypt");

module.exports = class usuarioController {
  static async createUsuarios(req, res) {
    const { NIF, email, senha, nome } = req.body;

    const userValidationError = validateUsuario.validateUsuario(req.body);
    if (userValidationError) {
      return res.status(400).json(userValidationError);
    }

    try {
      const nifEmailValidationError = await validateUsuario.validateNifEmail(
        NIF,
        email
      );
      if (nifEmailValidationError && nifEmailValidationError.error) {
        return res.status(400).json(nifEmailValidationError);
      }

      const saltRounds = Number(process.env.SALT_ROUNDS);
      const hashedPassword = bcrypt.hashSync(senha, saltRounds);

      const queryInsert = `INSERT INTO usuario (nome, email, NIF, senha) VALUES (?, ?, ?, ?)`;
      const valuesInsert = [nome, email, NIF, hashedPassword];
      await queryAsync(queryInsert, valuesInsert);

      return res.status(201).json({
        message: "Cadastro bem-sucedido. Por favor, faça login.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async loginUsuario(req, res) {
    const { email, senha } = req.body;

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
      const senhaOK = bcrypt.compareSync(senha, usuario.senha);

      if (!senhaOK) {
        return res.status(401).json({ error: "Senha Incorreta" });
      }

      const accessToken = criarToken({
        id: usuario.id_usuario,
        email: usuario.email,
      });

      // Define o token de acesso como um HTTP-only cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000, // 1 hora
        path: "/",
      });

      return res.status(200).json({
        message: "Login Bem-sucedido",
        usuario: {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          nome: usuario.nome,
          NIF: usuario.NIF,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async logoutUsuario(req, res) {
    // Limpa o cookie de autenticação
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });
    return res.status(200).json({ message: "Logout bem-sucedido!" });
  }

  static async getAllUsuarios(req, res) {
    const query = `SELECT id_usuario, nome, email, NIF FROM usuario`;
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

  static async verifyUsuarioSenha(req, res) {
    const { senha } = req.body;
    const id_usuario = req.params.id_usuario;
    const authenticatedUserId = req.userId;

    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }

    // Garante que o usuário está verificando a própria senha
    if (Number(id_usuario) !== Number(authenticatedUserId)) {
      return res.status(403).json({ error: "Acesso Negado: Não autorizado." });
    }

    try {
      const query = `SELECT senha FROM usuario WHERE id_usuario = ?`;
      const results = await queryAsync(query, [id_usuario]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const usuario = results[0];
      const senhaOK = bcrypt.compareSync(senha, usuario.senha);

      if (senhaOK) {
        return res.status(200).json({ valido: true });
      } else {
        return res
          .status(401)
          .json({ valido: false, error: "Senha incorreta" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async updateUsuario(req, res) {
    const { email, senha, nome } = req.body;
    const usuarioId = req.params.id_usuario;
    const authenticatedUserId = req.userId;

    // Garante que o usuário está atualizando o próprio perfil
    if (Number(usuarioId) !== Number(authenticatedUserId)) {
      return res
        .status(403)
        .json({ message: "Acesso Negado: Você não pode atualizar outro usuário." });
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

      const novoEmail =
        email && email.trim() !== "" ? email.trim() : usuarioAtual.email;
      const novoNome =
        nome && nome.trim() !== "" ? nome.trim() : usuarioAtual.nome;
      const novaSenha = senha && senha.trim() !== "" ? senha.trim() : null;

      const dataFinalParaValidar = {
        email: novoEmail,
        nome: novoName,
      };

      if (novaSenha) {
        dataFinalParaValidar.senha = novaSenha;
      }

      const updateValidationError =
        validateUsuario.validateUpdateUsuario(dataFinalParaValidar);
      if (updateValidationError) {
        return res.status(400).json(updateValidationError);
      }

      const houveAlteracao =
        usuarioAtual.email !== novoEmail ||
        usuarioAtual.nome !== novoNome ||
        (novaSenha && !bcrypt.compareSync(novaSenha, usuarioAtual.senha));

      if (!houveAlteracao) {
        return res
          .status(400)
          .json({ error: "Nenhuma alteração detectada nos dados enviados." });
      }

      const senhaFinal = novaSenha
        ? bcrypt.hashSync(novaSenha, Number(process.env.SALT_ROUNDS))
        : usuarioAtual.senha;

      const updateQuery = `UPDATE usuario SET email = ?, senha = ?, nome = ? WHERE id_usuario = ?`;
      const results = await queryAsync(updateQuery, [
        novoEmail,
        senhaFinal,
        novoNome,
        usuarioId,
      ]);

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado para atualização." });
      }

      return res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso." });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "O email já está vinculado a outro usuário." });
      }
      return res.status(500).json({ error: "Erro interno no servidor ao atualizar usuário." });
    }
  }

  static async deleteUsuario(req, res) {
    const usuarioId = req.params.id_usuario;
    const authenticatedUserId = req.userId;

    const idValidationError = validateUsuario.validateUsuarioId(usuarioId);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    // Garante que o usuário está deletando o próprio perfil
    if (Number(usuarioId) !== Number(authenticatedUserId)) {
      return res
        .status(403)
        .json({ message: "Acesso Negado: Você não pode deletar outro usuário." });
    }
    const query = `DELETE FROM usuario WHERE id_usuario = ?`;
    try {
      const results = await queryAsync(query, [usuarioId]);
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }
      // Após a exclusão, é recomendável limpar o cookie do usuário
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
      });
      return res.status(200).json({ message: "Usuário excluído com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor ao deletar usuário." });
    }
  }

  static async getUsuarioById(req, res) {
    const id_usuario = req.params.id_usuario;
    const authenticatedUserId = req.userId;

    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    // Garante que o usuário está visualizando o próprio perfil
    if (Number(id_usuario) !== Number(authenticatedUserId)) {
      return res.status(403).json({
        message: "Acesso Negado: Você não pode visualizar as informações de outro usuário.",
      });
    }
    const query = `SELECT id_usuario, nome, email, NIF FROM usuario WHERE id_usuario = ?`;
    try {
      const results = await queryAsync(query, [id_usuario]);
      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }
      const usuario = results[0];
      return res.status(200).json({
        usuario: {
          id_usuario: usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          NIF: usuario.NIF,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor ao buscar usuário." });
    }
  }

  static async getUsuarioReservas(req, res) {
    const id_usuario = req.params.id_usuario;
    const authenticatedUserId = req.userId;

    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }

    // Garante que o usuário está visualizando as próprias reservas
    if (Number(id_usuario) !== Number(authenticatedUserId)) {
      return res.status(403).json({
        message: "Acesso Negado: Você não pode visualizar as reservas de outro usuário.",
      });
    }

    const queryReservas = `
      SELECT r.id_reserva, r.fk_id_usuario, r.fk_id_sala, r.data_inicio, r.data_fim, r.dias_semana, r.hora_inicio, r.hora_fim, s.nome
      FROM reserva r
      JOIN sala s ON r.fk_id_sala = s.id_sala
      WHERE r.fk_id_usuario = ?
    `;

    try {
      const resultados = await queryAsync(queryReservas, [id_usuario]);

      const reservas = resultados.map((reserva) => ({
        tipo:
          formatarData(new Date(reserva.data_inicio)) ===
          formatarData(new Date(reserva.data_fim))
            ? "simples"
            : "periodica",
        id_reserva: reserva.id_reserva,
        sala: reserva.nome,
        fk_id_sala: reserva.fk_id_sala,
        data_inicio: formatarData(new Date(reserva.data_inicio)),
        data_fim: formatarData(new Date(reserva.data_fim)),
        dias_semana: reserva.dias_semana ? reserva.dias_semana.split(",") : [],
        hora_inicio: reserva.hora_inicio,
        hora_fim: reserva.hora_fim,
      }));

      if (reservas.length === 0) {
        return res.status(404).json({
          message: "Nenhuma reserva encontrada para este usuário.",
          reservas: [],
        });
      }

      return res.status(200).json({ reservas });
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      return res.status(500).json({ message: "Erro interno do servidor ao buscar reservas." });
    }
  }

  static async getHistoricoReservas(req, res) {
    const id_usuario = req.params.id_usuario;
    const authenticatedUserId = req.userId;

    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }

    // Garante que o usuário está visualizando o próprio histórico de reservas
    if (Number(id_usuario) !== Number(authenticatedUserId)) {
      return res.status(403).json({
        message: "Acesso Negado: Você não pode visualizar o histórico de outro usuário.",
      });
    }

    try {
      const query = `CALL HistoricoReservaUsuario(?)`;

      const [resultadosHistorico] = await queryAsync(query, [id_usuario]);

      const reservasHistorico = resultadosHistorico.map((reserva) => ({
        tipo:
          formatarData(new Date(reserva.data_inicio)) ===
          formatarData(new Date(reserva.data_fim))
            ? "simples"
            : "periodica",
        id_reserva: reserva.id_reserva,
        sala: reserva.sala_nome,
        data_inicio: formatarData(new Date(reserva.data_inicio)),
        data_fim: formatarData(new Date(reserva.data_fim)),
        dias_semana: reserva.dias_semana ? reserva.dias_semana.split(",") : [],
        hora_inicio: reserva.hora_inicio,
        hora_fim: reserva.hora_fim,
      }));

      if (reservasHistorico.length === 0) {
        return res.status(404).json({
          message: "Nenhuma reserva anterior encontrada.",
          reservasHistorico: [],
        });
      }

      return res.status(200).json({ reservasHistorico });
    } catch (error) {
      console.error("Erro ao buscar histórico de reservas:", error);
      return res.status(500).json({ message: "Erro interno do servidor ao buscar histórico de reservas." });
    }
  }

  static async getHistoricoDelecao(req, res) {
    const authenticatedUserId = req.userId;
    const id_usuario = req.params.id_usuario;

    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }

    // Garante que o usuário está visualizando o próprio histórico de deleções
    if (Number(id_usuario) !== Number(authenticatedUserId)) {
      return res.status(403).json({
        message: "Acesso Negado: Você não pode visualizar o histórico de deleções de outro usuário.",
      });
    }

    const call = "CALL HistoricoDelecaoUsuario(?)";

    try {
      const [resultadosDelecao] = await queryAsync(call, [id_usuario]);

      const reservasDeletadas = resultadosDelecao.map((delecao) => ({
        tipo:
          formatarData(new Date(delecao.data_inicio)) ===
          formatarData(new Date(delecao.data_fim))
            ? "simples"
            : "periodica",
        id_reserva: delecao.id,
        sala: delecao.sala_nome,
        data_inicio: formatarData(new Date(delecao.data_inicio)),
        data_fim: formatarData(new Date(delecao.data_fim)),
        dias_semana: delecao.dias_semana ? delecao.dias_semana.split(",") : [],
        hora_inicio: delecao.hora_inicio,
        hora_fim: delecao.hora_fim,
        data_delecao: formatarData(new Date(delecao.data_hora_log)),
      }));

      if (reservasDeletadas.length === 0) {
        return res.status(200).json({
          reservasDeletadas: [],
        });
      }

      return res.status(200).json({ reservasDeletadas });
    } catch (error) {
      console.error("Erro ao buscar histórico de deleções:", error);
      return res
        .status(500)
        .json({ message: "Erro interno ao buscar histórico de deleções." });
    }
  }
};