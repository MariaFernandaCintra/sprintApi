const connect = require("../db/connect");

module.exports = {
  validateUsuario: function ({ NIF, email, senha, nome }) {
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
    return null;
  },

  validateNifEmail: async function (NIF, email) {
    return new Promise((resolve, reject) => {
      const query = "SELECT id_usuario FROM usuario WHERE NIF = ? OR email = ?";
      const values = [NIF, email];

      connect.query(query, values, (err, results) => {
        if (err) {
          return reject("Erro ao verificar NIF ou email");
        } else if (results.length > 0) {
          return resolve({
            error: "O NIF ou email já está vinculado a outro usuário",
          });
        } else {
          return resolve(null);
        }
      });
    });
  },

  validateLogin: function ({ email, senha }) {
    if (!email || !senha) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (!email.includes("@")) {
      return { error: "Email inválido. Deve conter @" };
    }
    return null;
  },

  validateUpdateUsuario: function ({ email, senha, nome }) {
    if (!email || !senha || !nome) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (!email.includes("@")) {
      return { error: "Email inválido. Deve conter @" };
    }
    return null;
  },

  validateUsuarioId: function (id_usuario) {
    if (!id_usuario) {
      return { error: "ID do usuário é obrigatório" };
    }
    return null;
  },
};
