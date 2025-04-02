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
  
  module.exports = { formatarData, formatarHorario };
  