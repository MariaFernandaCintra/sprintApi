const validateUsuario = require("../services/validateUsuario");
const { queryAsync, formatarData } = require("../utils/functions");
const jwt = require("jsonwebtoken");

module.exports = class usuarioController {
  static async createUsuarios(req, res) {
    const { NIF, email, senha, nome } = req.body;

    // Valida os campos obrigatórios para criação
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

      // Após a inserção, busca o usuário cadastrado
      const querySelect = `SELECT * FROM usuario WHERE email = ?`;
      const results = await queryAsync(querySelect, [email]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const usuario = results[0];
      const token = jwt.sign(
        {id: usuario.id_usuario, email: usuario.email}, 
        process.env.SECRET, 
        {expiresIn: "1h",});

        //Remove um atributo de um obj
        delete usuario.senha

        return res.status(200).json({message: "Cadastro bem-sucedido",
      usuario, 
      token
    })
        
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async loginUsuario(req, res) {
    const { email, senha } = req.body;

    // Valida os campos para login
    const loginValidationError = validateUsuario.validateLogin(req.body);
    if (loginValidationError) {
      return res.status(400).json(loginValidationError);
    }

    const query = `SELECT * FROM usuario WHERE email = ?`
    try {
      const results = await queryAsync(query, [email]);
      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const usuario = results[0];
      if (usuario.senha === senha) {
        const token = jwt.sign(
          {id: usuario.id_usuario, email: usuario.email}, 
          process.env.SECRET, 
          {expiresIn: "1h",});

          //Remove um atributo de um obj
          delete usuario.senha

          return res.status(200).json({message:"Login Bem-sucedido",
        usuario, 
        token
      })
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
    const verificarToken =  req.userId;

    // Valida os campos de atualização e o ID do usuário
    const updateValidationError = validateUsuario.validateUpdateUsuario({
      email,
      senha,
      nome,
    });
    if (updateValidationError) {
      return res.status(400).json(updateValidationError);
    }
    const idValidationError = validateUsuario.validateUsuarioId(usuarioId);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if (Number(verificarToken) !== Number(usuarioId)){
      return res.status(400).json({message: "Você não pode atualizar outro usuário!"});
    }
    const query = `UPDATE usuario SET email = ?, senha = ?, nome = ? WHERE id_usuario = ?`;
    try {
      const results = await queryAsync(query, [email, senha, nome, usuarioId]);
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      return res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "O email já está vinculado a outro usuário" });
      }
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  static async deleteUsuario(req, res) {
    const usuarioId = req.params.id_usuario;
    const verificarToken = req.userId; 
    
    // Valida se o ID do usuário foi fornecido
    const idValidationError = validateUsuario.validateUsuarioId(usuarioId);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if(Number(verificarToken) !== Number(usuarioId)){
      return res.status(400).json({message: "Você não pode deletar outro usuário!"});
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
      if (error.code === "ER_ROW_IS_REFERENCED") {
        return res
          .status(400)
          .json({
            error: "Usuário não pode ser excluído, pois tem uma reserva",
          });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getUsuarioById(req, res) {
    const id_usuario = req.params.id_usuario;
    const verificarToken =  req.userId;
    
    // Valida se o ID foi fornecido
    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if (Number(verificarToken) !== Number(id_usuario)){
      return res.status(400).json({message: "Você não pode atualizar outro usuário!"});
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

  static async getUsuarioByEmail(req, res) {
    const { email } = req.query;
    const verificarToken =  req.email;

    const emailValidationError = validateUsuario.validateUsuarioEmail(email);
    if (emailValidationError) {
      return res.status(400).json(emailValidationError);
    }
    if (verificarToken !== email){
      return res.status(400).json({message: "Você não pode visualizar outro usuário!"});
    }

    const query = `SELECT * FROM usuario WHERE email = ?`;
    try {
      const results = await queryAsync(query, [email]);
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

  static async getUsuarioReservasByEmail(req, res) {
    const { email } = req.query;
    const verificarToken =  req.email;
  
    const emailValidationError = validateUsuario.validateUsuarioEmail(email);
    if (emailValidationError) {
      return res.status(400).json(emailValidationError);
    }
    if (verificarToken !== email){
      return res.status(400).json({message: "Você não pode visualizar as reservas de outro usuário!"});
    }
  
    const queryReservas = `
      SELECT r.id_reserva, s.nome, r.data, r.hora_inicio, r.hora_fim, r.dia_semana
      FROM reserva r
      JOIN sala s ON r.fk_id_sala = s.id_sala
      JOIN usuario u ON r.fk_id_usuario = u.id_usuario
      WHERE u.email = ?
    `;
  
    try {
      const results = await queryAsync(queryReservas, [email]);
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

  static async getUsuarioReservas(req, res) {
    const id_usuario = req.params.id_usuario;
    const verificarToken =  req.userId;
    // Valida se o ID foi fornecido
    const idValidationError = validateUsuario.validateUsuarioId(id_usuario);
    if (idValidationError) {
      return res.status(400).json(idValidationError);
    }
    if (Number(verificarToken) !== Number(id_usuario)){
      return res.status(400).json({message: "Você não tem autirização para ver as reservas de outro usuário!"});
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
};
