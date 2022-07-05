const bcrypt = require('bcrypt');
const User = require('../models/User');//on importe notre model User
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)//
        .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    };


    exports.login = (req, res, next) => {//Nous utilisons notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données :
        User.findOne({ email: req.body.email })
            .then(user => {//Dans le cas contraire, nous renvoyons une erreur401 Unauthorized
                if (!user) {
                    return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});// ne pas dire email pas dans la bdd !!!
                }
                //Si l'e-mail correspond à un utilisateur existant, nous continuons.
                bcrypt.compare(req.body.password, user.password)//Nous utilisons la fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données :
                    .then(valid => {
                        if (!valid) {//S'ils ne correspondent pas, nous renvoyons une erreur401 Unauthorized avec le même message que lorsque l’utilisateur n’a pas été trouvé, afin de ne pas laisser quelqu’un vérifier si une autre personne est inscrite sur notre site.
                            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                        }
                        //Nous renvoyons le token au front-end avec notre réponse.
                        res.status(200).json({//S'ils correspondent, les informations d'identification de notre utilisateur sont valides. Dans ce cas, nous renvoyons une réponse 200 contenant l'ID utilisateur et un token. Ce token est une chaîne générique pour l'instant, mais nous allons le modifier et le crypter dans le prochain chapitre.
                            userId: user._id,
                       token: jwt.sign(//Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token.Ce token contient l'ID de l'utilisateur en tant que payload (les données encodées dans le token).
                           { userId: user._id },
                           'RANDOM_TOKEN_SECRET',//Nous utilisons une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour crypter notre token (à remplacer par une chaîne aléatoire beaucoup plus longue pour la production). Puisque cette chaîne sert de clé pour le chiffrement et le déchiffrement du token, elle doit être difficile à deviner, sinon n’importe qui pourrait générer un token en se faisant passer pour notre serveur.
                           { expiresIn: '24h' }//durée de validité du token à 24 heures. L'utilisateur devra donc se reconnecter au bout de 24 heures.
                       )
                   });
               })
                    .catch(error => res.status(500).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
     };