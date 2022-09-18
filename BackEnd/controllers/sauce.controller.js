const Sauce = require("../models/sauce.models");
const fs = require('fs');

// Création de fonctionnalité pour créer une sauce
exports.createSauce = (req, res, next) => {

    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [""],
        usersDisliked: [""],
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }))
}

// Création de fonctionnalité pour afficher toutes les sauces
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error: error }));
}

// Création de fonctionnalité pour accéder à une seule sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error: error }));
}

// Création de fonctionnalité permettant de modifier une sauce existante
exports.modifySauce = async (req, res, next) => {

    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;

    try {
        let sauce = await Sauce.findOne({ _id: req.params.id })

        // Si la sauce n'existe pas
        if (sauce === null) {
            return res.status(404).json({ message: "Cette sauce n'existe pas" })
        }

        // Si l'utilisateur n'est pas le créateur de la sauce
        if (sauce.userId != req.auth.userId) {
            return res.status(401).json({ message: 'Non autorisé' });
        } else { // Si l'utilisateur est le créateur de la sauce
            if (req.file) { // Modification de l'image dans la base de donnée si besoin
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce modifiée !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            } else { // Modification seulement des informations de la sauce
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => { res.status(200).json({ message: 'Sauce modifiée !' }) })
                    .catch(error => res.status(401).json({ error }));
            }
        }
    }

    catch (err) {
        res.status(400).json({ err });
    };
}

// Création de fonctionnalité pour supprimer une sauce
exports.deleteSauce = async (req, res, next) => {
    try {
        let sauce = await Sauce.findOne({ _id: req.params.id })

        if (sauce.userId != req.auth.userId) { // Si l'utilisateur n'est pas le créateur de la sauce
            return res.status(401).json({ message: 'Non autorisé' });
        } else { // Si l'utilisateur est le créateur de la sauce
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => { // Suppression de l'image de la sauce dans la base de donnée
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                    .catch(error => res.status(401).json({ error }));
            });
        }
    }

    catch (err) {
        res.status(400).json({ err });
    };
}

// Création de fonctionnalité permettant de Like/Dislike une sauce
exports.likeDislikeSauce = async (req, res, next) => {

    try {
        let sauce = await Sauce.findOne({ _id: req.params.id })

        // Si l'utilisateur n'aime pas il mets un dislike
        if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === -1) {
            sauce.dislikes++;
            sauce.usersDisliked.push(req.body.userId);
            sauce.save();
            res.status(200).json({ message: "Je n'aime pas" });
        }

        // Si l'utilisateur aime il mets un like
        if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
            sauce.likes++;
            sauce.usersLiked.push(req.body.userId);
            sauce.save();
            res.status(200).json({ message: "J'aime" });
        }

        // Si l'utilisateur change d'avis il peut enlever son like
        if (req.body.like === 0 && sauce.usersLiked.includes(req.body.userId)) {
            sauce.likes--;
            sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
            sauce.save();
            res.status(200).json({ message: "Unliked" });
        }

        // Si l'utilisateur change d'avis il peut enlever son dislike
        if (req.body.like === 0 && sauce.usersDisliked.includes(req.body.userId)) {
            sauce.dislikes--;
            sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId), 1);
            sauce.save();
            res.status(200).json({ message: "Undisliked" });
        }
    }

    catch (err) {
        res.status(400).json({ err });
    };
} 