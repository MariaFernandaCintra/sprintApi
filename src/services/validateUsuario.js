const connect = require("../db/connect");

module.exports = {
  // Valida os campos obrigatórios para criação do usuário
  validateUsuario: function ({ NIF, email, senha, nome }) {

    const senaiDomains = [
      "@edu.senai.br",
      "@docente.senai.br",
      "@sesisenaisp.org.br"
    ];

    if (!NIF || !email || !senha || !nome) {
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
      return { error: "Email inválido. Deve pertencer a um domínio SENAI autorizado" };
    }
    return null;
  },

  // Valida se o NIF ou email já estão vinculados a outro usuário
  validateNifEmail: async function (NIF, email) {
    return new Promise((resolve, reject) => {
      const query = "SELECT id_usuario FROM usuario WHERE NIF = ? OR email = ?";
      const values = [NIF, email];

      connect.query(query, values, (err, results) => {
        if (err) {
          return reject("Erro ao verificar NIF ou email");
        }
        if (results.length > 0) {
          return resolve({
            error: "O NIF ou email já está vinculado a outro usuário",
          });
        }
        return resolve(null);
      });
    });
  },

  // Valida os campos para login
  validateLogin: function ({ email, senha }) {
    if (!email || !senha) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (!email.includes("@")) {
      return { error: "Email inválido. Deve conter @" };
    }
    return null;
  },

  // Valida os campos para atualização do usuário
  validateUpdateUsuario: function ({ email, senha, nome }) {

    const senaiDomains = [
      "@edu.senai.br",
      "@docente.senai.br",
      "@sesisenaisp.org.br"
    ];

    if (!email || !senha || !nome) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (!email.includes("@")) {
      return { error: "Email inválido. Deve conter @" };
    }
    const emailDomain = email.substring(email.lastIndexOf("@"));
    if (!senaiDomains.includes(emailDomain)) {
      return { error: "Email inválido. Deve pertencer a um domínio SENAI autorizado" };
    }
    return null;
  },

  // Valida se o ID do usuário foi fornecido
  validateUsuarioId: function (id_usuario) {
    if (!id_usuario) {
      return { error: "ID do usuário é obrigatório" };
    }
    return null;
  },
};
