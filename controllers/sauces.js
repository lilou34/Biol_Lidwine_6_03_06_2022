const Sauce = require('../models/Sauce');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config();

//version avec multer
//Pour ajouter un fichier à la requête, le front-end doit envoyer les données de la requête sous la forme form-data et non sous forme de JSON. Le corps de la requête contient une chaîne sauce, qui est simplement un objetsauce converti en chaîne. Nous devons donc l'analyser à l'aide de JSON.parse() pour obtenir un objet utilisable.
//Nous supprimons le champ_userId de la requête envoyée par le client car nous ne devons pas lui faire confiance (rien ne l’empêcherait de nous passer le userId d’une autre personne). Nous le remplaçons en base de données par le _userId extrait du token par le middleware d’authentification.
//////////////ajout sauce////////////////////
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
      likes: 0,
      dislikes: 0,
      usersLiked: [" "],
      usersdisLiked: [" "],
    });
    
    sauce.save()
      .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
      .catch((error) => res.status(400).json({ error }));
  };
////////////////////////modification sauce//////////////////
exports.modifySauce = (req, res, next) => {
  if(req.file) { // Si l'image est modifiée, on supprime l'ancienne image dans /images
      Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  const sauceObject = 
                  {   
                      ...JSON.parse(req.body.sauce),
                      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                  }
                  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                      .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                      .catch(error => res.status(400).json({ error }))
              });
          });
  } else { // Si l'image n'est pas modifée
      const sauceObject = { ...req.body } 
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce modifiée avec succès !' }))
          .catch(error => res.status(400).json({ error }))
  }
};
//////////////////voir toute les sauces//////////////////////
exports.getAllSauce= (req, res, next) => {
  Sauce.find()
  .then((sauces) => res.status(200).json(sauces))
  .catch((error) => res.status(400).json({error: error}))
};
////////////////////////////détail 1 sauce//////////////////
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => res.status(200).json(sauce))
  .catch(error => res.status(404).json({error: error}))
};

////////////////////supression sauce//////////////////////
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) 
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1]; // On récupère avec .split le nom ficher image dans l'URL
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(res.status(200).json({ message: "Sauce supprimée !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      })
      .catch((error) => res.status(500).json({ error }));
  };

/////////////like ou pas/////////
/*exports.likeDislike = (req, res, next) => {
 //contenu de la requête like dislike envoyé par le navigateur
  const sauceLike = req.body;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //like = +1 (like +1 l'utilisateur ajoute un like)

      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like == 1) {
        // l'userId n'est pas dans le tableau [usersLiked] de BDD et la requête like = +1

        console.log("ok like +1");

        // Mise à jour de l'objet sauce dans BDD
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 }, // l'opérateur mongoDB $ inc incrémente un champ d'un valeur spécifiée, ici likes +1
            $push: { usersLiked: req.body.userId }, // l'opérateur mongoDB push pour ajouter l'id de l'utilisateur dans le tableau usersLiked
            _id: req.params.id,
          }
        )
          .then(() => res.status(201).json({ message: "sauce +1 like" }))
          .catch((error) => {
            res.status(400).json({ error });
          });
      }

      // like = 0 (si l'utilisateur annule son like)

      if (sauce.usersLiked.includes(req.body.userId) && req.body.like == 0) {
        // l'userId est le tableau [usersLiked] de la BDD et la requête like = 0

        console.log("ok like = 0");

        // Mise à jour de l'objet sauce dans BDD
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: -1 }, // l'opérateur mongoDB $ inc incrémente un champ d'un valeur spécifiée, ici likes -1
            $pull: { usersLiked: req.body.userId }, // l'opérateur mongoDB pull pour supprimer l'id de l'utilisateur dans le tableau userLiked
            _id: req.params.id,
          }
        )
          .then(() => res.status(201).json({ message: "sauce 0 like" }))
          .catch((error) => {
            res.status(400).json({ error });
          });
      }

      //like = -1 (dislike = +1 l'utilisateur ajoute un dislike)
      if (
        !sauce.usersDisliked.includes(req.body.userId) &&
        req.body.like == -1
      ) {
        // l'userId n'est pas dans le tableau [usersDisliked] de BDD et la requête like = -1

        console.log("ok dislike +1");

        // Mise à jour de l'objet sauce dans BDD
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 }, // l'opérateur mongoDB $ inc incrémente un champ d'un valeur spécifiée, ici dislikes +1
            $push: { usersDisliked: req.body.userId }, // l'opérateur mongoDB push pour ajouter l'id de l'utilisateur dans le tableau usersDisliked

            _id: req.params.id,
          }
        )
          .then(() => res.status(201).json({ message: "sauce +1 dislike" }))
          .catch((error) => {
            res.status(400).json({ error });
          });
      }

      // dislike = 0 (si l'utilisateur annule son dislike)

      if (sauce.usersDisliked.includes(req.body.userId) && req.body.like == 0) {
        // l'userId est le tableau [usersLiked] de la BDD et la requête like = 0

        console.log("ok dislike = 0");

        // Mise à jour de l'objet sauce dans BDD
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: -1 }, // l'opérateur mongoDB $ inc incrémente un champ d'un valeur spécifiée, ici dislikes -1
            $pull: { usersDisliked: req.body.userId }, // l'opérateur mongoDB pull pour supprimer l'id de l'utilisateur dans le tableau userDisliked
            _id: req.params.id,
          }
        )
          .then(() => res.status(201).json({ message: "sauce 0 like" }))
          .catch((error) => {
            res.status(400).json({ error });
          });
      }
    })
    .catch((error) => res.status(404).json({ error }));
};


};*/