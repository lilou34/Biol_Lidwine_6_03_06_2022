const express = require('express');
const mongoose = require('mongoose');
const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');
const path = require('path');//accéder au path de notre serveur

const app = express();
const Sauce = require('./models/sauces');
mongoose.connect('mongodb+srv://lilou:zavata03@clusterlilou.8fxw0es.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());//intercepte req qui ont un content type json et met a dispo corps de la requete
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

/*app.post('/api/sauces', (req, res, next) =>{
  const sauce = new Sauce({
      ...req.body
  });
  sauce.save()
  .then(sauce => res.status(201).json({ sauce }))
  .catch(error => res.status(400).json({ error }));
});

app.get('/api/sauces', (req, res, next) => {
    Sauce.find()//tableau des thing dans notre bdd
  .then((sauces) => res.status(200).json({sauces}))
  .catch(error => res.status(400).json({ error }));
});*/

module.exports = app;