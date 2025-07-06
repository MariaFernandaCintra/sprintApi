// src/services/validateUsuario.js

const { queryAsync, validarSenha } = require("../utils/functions"); // Importa queryAsync

module.exports = {
  // Valida os campos obrigatórios para criação do usuário
  validateUsuario: function ({ NIF, email, senha, nome, confirmarSenha }) {
    const senaiDomains = ["@sp.senai.br"];

    if (!NIF || !email || !senha || !nome || !confirmarSenha) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (isNaN(NIF) || NIF.length !== 7) {
      return {
        error: "NIF inválido. Deve conter exatamente 7 dígitos numéricos",
      };
    }
    if (!email.includes("@")) {
      return { error: "Email inválido. Deve conter @" };
    }
    const emailDomain = email.substring(email.lastIndexOf("@"));
    if (!senaiDomains.includes(emailDomain)) {
      return {
        error: "Email inválido. Deve pertencer a um domínio SENAI autorizado",
      };
    }
    if (senha != confirmarSenha) {
      return { error: "As senhas não coincidem" };
    }
    if (!validarSenha(senha)) {
      return {
        error:
          "A senha deve ter no mínimo 8 caracteres, incluindo letras, números e um caractere especial",
      };
    }
  },

  // Valida se o NIF ou email já estão vinculados a outro usuário
  validateNifEmail: async function (NIF, email) {
    const query = "SELECT id_usuario FROM usuario WHERE NIF = ? OR email = ?";
    const values = [NIF, email];

    try {
      const results = await queryAsync(query, values);
      if (results.length > 0) {
        return {
          error: "O NIF ou email já está vinculado a outro usuário",
        };
      }
      return null;
    } catch (err) {
      console.error("Erro ao verificar NIF ou email:", err);
      throw new Error("Erro interno ao verificar NIF ou email.");
    }
  },

  // Valida os campos para login
  validateLogin: function ({ email, senha }) {
    const senaiDomains = ["@sp.senai.br"];
    if (!email || !senha) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (!email.includes("@")) {
      return { error: "Email inválido. Deve conter @" };
    }
    const emailDomain = email.substring(email.lastIndexOf("@"));
    if (!senaiDomains.includes(emailDomain)) {
      return {
        error: "Email inválido. Deve pertencer a um domínio SENAI autorizado",
      };
    }
    return null;
  },

  validateUpdateUsuario: function ({ email, senha, nome }) {
    const senaiDomains = ["@sp.senai.br"];

    if (email === undefined && senha === undefined && nome === undefined) {
      return { error: "Pelo menos um campo deve ser preenchido" };
    }

    if (email !== undefined) {
      if (!email.includes("@")) {
        return { error: "Email inválido. Deve conter @" };
      }
      const emailDomain = email.substring(email.lastIndexOf("@"));
      if (!senaiDomains.includes(emailDomain)) {
        return {
          error: "Email inválido. Deve pertencer a um domínio SENAI autorizado",
        };
      }
    }

    if (senha !== undefined) {
      if (!validarSenha(senha)) {
        return {
          error:
            "A senha deve ter no mínimo 8 caracteres, incluindo letras, números e um caractere especial",
        };
      }
    }

    return null;
  },

  // Valida se o ID do usuário foi fornecido
  validateUsuarioId: function (id_usuario) {
    if (!id_usuario) {
      return { error: "ID do usuário é obrigatório" };
    }
    if (isNaN(id_usuario) || Number(id_usuario) <= 0) {
      return { error: "ID do usuário inválido" };
    }
    return null;
  },

  // Valida se o Email do usuário foi fornecido
  validateUsuarioEmail: function (email) {
    if (!email) {
      return { error: "Email do usuário é obrigatório" };
    }
    if (!email.includes("@") || !email.includes(".")) {
      return { error: "Formato de email inválido" };
    }
    return null;
  },
};
