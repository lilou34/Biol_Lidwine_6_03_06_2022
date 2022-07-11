const rateLimit = require("express-rate-limit");

// limite les tentatives de connexion user
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	max: 30, // limite de requête de la même ip par 15 mn
})

module.exports = { limiter }
//export sur la route user