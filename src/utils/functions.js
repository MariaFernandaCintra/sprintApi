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

function getDiaSemana(data) {
  const date = new Date(data);
  let dia = date.getDay();
  return dia === 0 ? 1 : dia + 1;
}

function formatarDataParaComparar(dateInput) {
  const d = new Date(dateInput);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

const jwt = require("jsonwebtoken");

const tokenSecret = process.env.SECRET;

function criarToken(payload, tempoExpiracao = "1h") {
  return jwt.sign(payload, tokenSecret, { expiresIn: tempoExpiracao });
}

function validarSenha(senha) {
  const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.@$!%*?&])[A-Za-z\d.@$!%*?&]{8,}$/;
  return regex.test(senha);
}

module.exports = { queryAsync, formatarData, formatarHorario, getDiaSemana, formatarDataParaComparar, validarSenha, criarToken };
