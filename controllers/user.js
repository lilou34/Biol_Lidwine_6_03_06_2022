const bcrypt = require('bcrypt');
const User = require('../models/User');//on importe notre model User
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config();
const emailValidator = require("email-validator");
const passwordValidator = require("password-validator");
//chiffrage email
const cryptoJs = require("crypto-js");



// Creation schema passwordValidator
var schemaMDP = new passwordValidator();
// Add properties to it
schemaMDP
.is().min(8)                                    // longueur mini 8
.is().max(20)                                  // longueur max 100
.has().uppercase(1)                              // min majuscule
.has().lowercase(1)                              // min minuscule
.has().digits(1)                                // min nombre
.has().not().spaces()                           // pas d'espaces
.is().not().oneOf(['Passw0rd', 'Password123', 'Azerty1', 'Azerty2']); // entrées interdites


exports.signup = (req, res, next) => {
    const emailCrypt = cryptoJs.HmacSHA256(req.body.email, '${process.env.CLE_EMAIL}').toString();//crypt email

    if(!emailValidator.validate(req.body.email)) {
        throw  "Adresse email invalide !" 
    } else if (!schemaMDP.validate(req.body.password)) {
        throw  "Mot de passe invalide !"
    } else {
        // Crypter le mot de passe
        bcrypt.hash(req.body.password, 10)//bcrypt hash le mdp
        
            .then(hash => {
                const user = new User ({
                    email: emailCrypt,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error }))
            })
            .catch(error => res.status(500).json({ error }))
    };   
};


    exports.login = (req, res, next) => {//Nous utilisons notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données :
        User.findOne({ email: req.body.email })
            .then(user => {//Dans le cas contraire, nous renvoyons une erreur401 Unauthorized
                if (!user) {
                    return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
                }
                //Si l'e-mail correspond à un utilisateur existant, nous continuons.
                bcrypt.compare(req.body.password, user.password)//Nous utilisons la fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données :
                    .then(valid => {
                        if (!valid) {//S'ils ne correspondent pas, nous renvoyons une erreur401 Unauthorized avec le même message que lorsque l’utilisateur n’a pas été trouvé, afin de ne pas laisser quelqu’un vérifier si une autre personne est inscrite sur notre site.
                            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                        }
                        //Nous renvoyons le token au front-end avec notre réponse.
                        res.status(200).json({//S'ils correspondent, les informations d'identification de notre utilisateur sont valides. Dans ce cas, nous renvoyons une réponse 200 contenant l'ID utilisateur et un token.
                            userId: user._id,
                       token: jwt.sign(//Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token.Ce token contient l'ID de l'utilisateur en tant que payload (les données encodées dans le token).
                           { userId: user._id },
                           process.env.TOKEN_SECRET,// chiffrage secret
                           { expiresIn: '24h' }//durée de validité du token à 24 heures. L'utilisateur devra donc se reconnecter au bout de 24 heures.
                       )
                   });
               })
                    .catch(error => res.status(500).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
     };