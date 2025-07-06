const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({
        auth: false,
        message: "Token não foi fornecido (cookie ausente)",
      });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
      });
      return res
        .status(403)
        .json({
          auth: false,
          message: "Falha na autenticação - Token Expirado ou Inválido",
        });
    }

    req.userId = decoded.id;
    req.email = decoded.email;
    next();
  });
}

module.exports = verifyJWT;
