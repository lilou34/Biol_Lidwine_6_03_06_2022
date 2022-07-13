const Sauce = require('../models/Sauce');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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
exports.likeDislike = (req, res, next) => {
  const userId = req.body.userId;//on accède à l'user qui a aimé
    const like = req.body.like;//on accede au corps rêq de like
    const sauceId = req.params.id;//on accède à l'id de la sauce
 
    Sauce.findOne({_id : sauceId})//Renvoie un document qui satisfait les critères de requête spécifiés sur la collection ou la vue
    .then((sauce) => {

      // like = 1 (likes +1 )
      if(!sauce.usersLiked.includes(userId) && like === 1){//true cherche dans userLiked le tableau si userId de la pers qui vote est présent quand il fait un like 
        Sauce.updateOne({_id : sauceId},//mets à jour l'User en incluant l'id
          {
            $inc: {likes: 1},//$inc Incrémente la valeur du champ du montant spécifié.
            $push: {usersLiked: userId}  //$push Ajoute un élément à un tableau.
          }
          )
          .then(() => res.status(201).json({message: "User like +1"}))
          .catch((error) => res.status(400).json({error}));
      };
      //like = 0 (likes = 0)
      if(sauce.usersLiked.includes(userId) && like === 0){
        Sauce.updateOne({_id : sauceId},
          {
            $inc: {likes: -1},//$inc opérateur mongoDB incrémente
            $pull: {usersLiked: userId}  //$pull Supprime tous les éléments du tableau qui correspondent à une requête spécifiée.
          }
          )
          .then(() => res.status(201).json({message: "User like 0"}))
          .catch((error) => res.status(400).json({error}));
      };

      //like -1 (dislikes +1)
      if(!sauce.usersDisliked.includes(userId) && like === -1){// cherche dans userDisliked si l'userId est présent quand il appuie sur dislike
        Sauce.updateOne({_id : sauceId},
          {
            $inc: {dislikes: 1},
            $push: {usersDisliked: userId}
          }
          )
          .then(() => res.status(201).json({message: "User disLike +1"}))
          .catch((error) => res.status(400).json({error}));
      };

      // like = 0 pas de vote
      if(sauce.usersDisliked.includes(userId) && like === 0){
        Sauce.updateOne({_id : sauceId},
          {
            $inc: {dislikes: -1},
            $pull: {usersDisliked: userId}  
          }
          )
          .then(() => res.status(201).json({message: "User disLike +1"}))
          .catch((error) => res.status(400).json({error}));
      };
})      
  .catch((error) => res.status(404).json({error}));
};
