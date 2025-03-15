module.exports = {
  // Valida os dados obrigatórios para criação de uma sala
  validateCreateSala: function ({ nome, descricao, bloco, tipo, capacidade }) {
    if (!nome || !descricao || !bloco || !tipo || !capacidade) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (isNaN(capacidade) || Number(capacidade) <= 0) {
      return { error: "Capacidade deve ser um número positivo" };
    }
    return null;
  },

  // Valida os dados obrigatórios para atualização de uma sala
  validateUpdateSala: function ({ nome, descricao, bloco, tipo, capacidade }) {
    if (!nome || !descricao || !bloco || !tipo || !capacidade) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (isNaN(capacidade) || Number(capacidade) <= 0) {
      return { error: "Capacidade deve ser um número positivo" };
    }
    return null;
  },

  // Valida se os campos de data/hora estão preenchidos e se a data de início é anterior à data de fim
  validateHorario: function ({ datahora_inicio, datahora_fim }) {
    if (!datahora_inicio || !datahora_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (new Date(datahora_inicio) >= new Date(datahora_fim)) {
      return { error: "A data de início deve ser anterior à data de fim" };
    }
    return null;
  },

  // Valida se o intervalo de datas está correto
  validateDataRange: function ({ data_inicio, data_fim }) {
    if (!data_inicio || !data_fim) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (new Date(data_inicio) >= new Date(data_fim)) {
      return { error: "A data de início deve ser anterior à data de fim" };
    }
    return null;
  },
};
