const connect = require("../db/connect");

const queryAsync = (query, values = []) => {
  return new Promise((resolve, reject) => {
    connect.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const formatarData = (data) => {
  const dataConvertida = typeof data === "string" ? new Date(data) : data;
  const day = String(dataConvertida.getDate()).padStart(2, "0");
  const month = String(dataConvertida.getMonth() + 1).padStart(2, "0");
  const year = dataConvertida.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatarHorario = (dateObj) => {
  const horas = String(dateObj.getHours()).padStart(2, "0");
  const minutos = String(dateObj.getMinutes()).padStart(2, "0");
  const segundos = String(dateObj.getSeconds()).padStart(2, "0");
  return `${horas}:${minutos}:${segundos}`;
};

function validarSenha(senha) {
  const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.@$!%*?&])[A-Za-z\d.@$!%*?&]{8,}$/;
  return regex.test(senha);
}

module.exports = { queryAsync, formatarData, formatarHorario, validarSenha };
