const verifyJWT = require("../services/verifyJWT");
const router = require("express").Router(); //importando o módolo express

const reservaController = require("../controllers/reservaController");
const usuarioController = require("../controllers/usuarioController");
const salaController = require("../controllers/salaController");

router.post("/cadastro", usuarioController.createUsuarios);
router.post("/login",  usuarioController.loginUsuario);
router.get("/usuarios", verifyJWT, usuarioController.getAllUsuarios);
router.put("/usuario/:id_usuario", verifyJWT, usuarioController.updateUsuario);
router.delete("/usuario/:id_usuario", verifyJWT, usuarioController.deleteUsuario);

router.get('/usuario/perfil/:id_usuario', verifyJWT, usuarioController.getUsuarioById);
router.get('/usuario/perfil/', verifyJWT, usuarioController.getUsuarioByEmail);
router.get('/usuario/perfil/:id_usuario/reservas', verifyJWT, usuarioController.getUsuarioReservas);
router.get('/usuario/email/perfil/reservas', verifyJWT, usuarioController.getUsuarioReservasByEmail);

router.post("/reserva", reservaController.createReservas);
router.get("/reservas", reservaController.getAllReservas);
router.put("/reserva/:id_reserva", reservaController.updateReserva);
router.delete("/reserva/:id_reserva", reservaController.deleteReserva);

router.post("/sala", salaController.createSalas);
router.get("/salas", verifyJWT, salaController.getAllSalasTabela);
router.put("/sala/:id_sala", verifyJWT, salaController.updateSala);
router.delete("/sala/:id_sala", verifyJWT, salaController.deleteSala);

router.get("/salasdisponivelhorario", salaController.getSalasDisponiveisHorario);

module.exports = router;

//Exportândo a instância de express configurada, para que seja acessada em outros arquivos
