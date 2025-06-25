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

router.post("/usuario/verificarsenha/:id_usuario", verifyJWT, usuarioController.verifyUsuarioSenha);

router.get("/usuario/perfil/:id_usuario", verifyJWT, usuarioController.getUsuarioById);
router.get("/usuario/perfil/:id_usuario/reservas", verifyJWT, usuarioController.getUsuarioReservas);

router.get("/usuario/historico/:id_usuario", verifyJWT, usuarioController.getHistoricoReservas);
router.get("/usuario/historico/delecao/:id_usuario", verifyJWT, usuarioController.getHistoricoDelecao);

router.post("/reservasimples", verifyJWT, reservaController.createReservasSimples);
router.post("/reservaperiodica", verifyJWT, reservaController.createReservasPeriodicas);
router.get("/reservas", verifyJWT, reservaController.getAllReservas);
router.put("/reserva/simples/:id_reserva", verifyJWT, reservaController.updateReservasSimples);
router.put("/reserva/periodica/:id_reserva", verifyJWT, reservaController.updateReservasPeriodicas);
router.delete("/reserva/:id_reserva/:id_usuario", verifyJWT, reservaController.deleteReserva);

router.get("/reservas/simples", verifyJWT, reservaController.getAllReservasSimples);
router.get("/reservas/periodicas", verifyJWT, reservaController.getAllReservasPeriodicas);

router.post("/sala", salaController.createSalas);
router.get("/salas", verifyJWT, salaController.getAllSalasTabela);
router.put("/sala/:id_sala", salaController.updateSala);
router.delete("/sala/:id_sala", salaController.deleteSala);

router.post("/salasdisponivelhorario", verifyJWT, salaController.getSalasDisponiveisHorario);

module.exports = router;

//Exportândo a instância de express configurada, para que seja acessada em outros arquivos
