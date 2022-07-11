const express = require('express');
const router = express.Router();
const max = require("../middleware/limiter")

const userCtrl = require('../controllers/user');
//route post car on envoi email et mdp
router.post('/signup', userCtrl.signup);//méthode signup
router.post('/login', max.limiter, userCtrl.login);//méthode login
//Les routes fournies sont celles prévues par l'application front-end.le segment de route indiqué ici est uniquement le segment final, car le reste de l'adresse de la route sera déclaré dans notre application Express. importation de rate-limiter
module.exports = router;