const router = require("express").Router(); //importando o módolo express

const reservaController = require("../controllers/reservaController");
const usuarioController = require("../controllers/usuarioController");
const salaController = require("../controllers/salaController");
const verifyJWT = require("../middlewares/verifyJWT");

router.post("/cadastro", usuarioController.createUsuarios);
router.post("/login",  usuarioController.loginUsuario);

router.get("/usuarios", verifyJWT, usuarioController.getAllUsuarios);
router.put("/usuario/:id_usuario", verifyJWT, usuarioController.updateUsuario);
router.delete("/usuario/:id_usuario", verifyJWT, usuarioController.deleteUsuario);

router.get("/usuario/perfil/:id_usuario", verifyJWT, usuarioController.getUsuarioById);
router.get("/usuario/perfil/:id_usuario/reservas", verifyJWT, usuarioController.getUsuarioReservas);

router.post("/reserva", verifyJWT, reservaController.createReservas);
router.get("/reservas", verifyJWT, reservaController.getAllReservas);
router.put("/reserva/:id_reserva", verifyJWT, reservaController.updateReserva);
router.delete("/reserva/:id_reserva", verifyJWT, reservaController.deleteReserva);

router.post("/sala", salaController.createSalas);
router.get("/salas", salaController.getAllSalasTabela);
router.put("/sala/:id_sala", salaController.updateSala);
router.delete("/sala/:id_sala", salaController.deleteSala);

router.post("/salasdisponivelhorario", verifyJWT, salaController.getSalasDisponiveisHorario);

module.exports = router;

//Exportândo a instância de express configurada, para que seja acessada em outros arquivos
