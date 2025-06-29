const connect = require("../db/connect");

const diasSemanaTexto = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

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

const criarDataHora = (data, hora) => {
  if (!data || !hora || !hora.includes(":")) {
    console.log("Data ou hora inválida:", data, hora);
    return new Date("invalid");
  }

  const [ano, mes, dia] = data.split("-").map(Number);
  const [h, m, s = "00"] = hora.split(":").map(Number);

  const dataHora = new Date(ano, mes - 1, dia, h, m, s);

  if (isNaN(dataHora.getTime())) {
    console.log("Data inválida montada:", ano, mes, dia, h, m, s);
  }

  return dataHora;
};

const formatarDataHoraAtual = () => {
  const now = new Date();
  now.setSeconds(0); // Zera os segundos
  now.setMilliseconds(0); // Zera os milissegundos

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hour}:${minute}:00`;
};

const formatarData = (data) => {
  const dataConvertida = typeof data === "string" ? new Date(data) : data;
  const day = String(dataConvertida.getDate()).padStart(2, "0");
  const month = String(dataConvertida.getMonth() + 1).padStart(2, "0");
  const year = dataConvertida.getFullYear();
  return `${day}-${month}-${year}`;
};

function getDiaSemana(data) {
  const date = new Date(data);
  let dia = date.getDay();
  return dia === 0 ? 1 : dia + 1;
}

function horaParaMinutos(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatarDiasSemanaEmTexto(diasArray) {
  if (!diasArray || diasArray.length === 0) return "";
  const nomesDias = diasArray.map(
    (dia) => diasSemanaTexto[dia] || dia.toString()
  );
  if (nomesDias.length === 1) return nomesDias[0];
  if (nomesDias.length === 2) return `${nomesDias[0]} e ${nomesDias[1]}`;
  return `${nomesDias.slice(0, -1).join(", ")} e ${
    nomesDias[nomesDias.length - 1]
  }`;
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

module.exports = { queryAsync, criarDataHora, formatarDataHoraAtual, formatarData, getDiaSemana, horaParaMinutos, formatarDiasSemanaEmTexto, validarSenha, criarToken };
