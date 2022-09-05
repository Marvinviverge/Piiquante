/* Import des modules necessaires */
const express = require("express");
const router = express.Router();

const Guardauth = require("../middleware/Guardauth");
const Guardmulter = require("../middleware/Guardmulter");

const sauceCtrl = require("../controllers/sauce.controller");



/* Routage Sauce */
// router.get("/", Guardauth, sauceCtrl.getAllSauce);
// router.get("/:id", Guardauth, sauceCtrl.getOneSauce);
// router.post("/", Guardauth, Guardmulter, sauceCtrl.createSauce);
// router.put("/:id", Guardauth, Guardmulter, sauceCtrl.modifySauce);
// router.delete("/:id", Guardauth, sauceCtrl.deleteSauce);
// router.post("/:id/like", Guardauth, sauceCtrl.likeDislikeSauce);

module.exports = router;
