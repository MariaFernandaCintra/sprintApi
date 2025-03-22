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
validateHorario: function ({ data, hora_inicio, hora_fim }) {
  if (!data || !hora_inicio || !hora_fim) {
    return { error: "Todos os campos devem ser preenchidos" };
  }
  
  // Cria os objetos Date concatenando data e hora
  const inicioDate = new Date(`${data}T${hora_inicio}`);
  const fimDate = new Date(`${data}T${hora_fim}`);
  
  if (inicioDate >= fimDate) {
    return { error: "Para checar a reserva, a data de início deve ser anterior à data de fim" };
  }
  
  const inicioHour = inicioDate.getHours();
  const fimHour = fimDate.getHours();
  
  if (inicioHour < 7 || inicioHour >= 23 || fimHour < 7 || fimHour >= 23) {
    return {
      error:
        "Para checar a reserva, ela deve ser feita no horário de funcionamento do SENAI. Entre 7:00 e 23:00",
    };
  }
  
  const duration = fimDate - inicioDate;
  const limit = 50 * 60 * 1000; // 50 minutos em milissegundos
  if (duration !== limit) {
    return { error: "Para checar a reserva, ela deve ter exatamente 50 minutos" };
  }
  
  return null;
},
};
