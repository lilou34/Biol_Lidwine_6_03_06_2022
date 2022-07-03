//importation package
const express = require('express');
//const morgan = require('morgan');
const mongoose = require('mongoose');
//console.log(mongoose);
//const stuffRoutes = require('./routes/stuff');
//const userRoutes = require('./routes/user');
//const path = require('path');//accéder au path de notre serveur
//package dotenv variables d'environnement
const dotenv = require('dotenv');
const result = dotenv.config();
//créer express
const app = express();

//log requête
//app.use(morgan("dev"));

//appel modele sauces
//const Sauce = require('./models/sauces');

//connect mangoose mondoDB atlas
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusterlilou.8fxw0es.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());//intercepte req qui ont un content type json et met a dispo corps de la requete

//header requête
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use((req, res) => {
  res.status(200);
  console.log("c'est ok");
});
/*app.use('/images', express.static(path.join(__dirname, 'images')));
//indique à Express qu'il faut gérer la ressource images de manière statique (un sous-répertoire de notre répertoire de base, __dirname) à chaque fois qu'elle reçoit une requête vers la route /images
app.use('/api/stuff', stuffRoutes);

app.use('/api/auth', userRoutes);//racine lié à l'auth et on passe userRoutes*/

//exportation app.js
module.exports = app;
