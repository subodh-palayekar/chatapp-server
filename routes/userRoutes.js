const express = require("express");
const router = express.Router();
const {registrationController,loginController, fetchAllUser, modify} = require("../controllers/userController");
const verify = require("../middleware/auth");

router.post("/register",registrationController);
router.post("/login",loginController);
router.get("/fetchusers",verify,fetchAllUser);
router.get("/fetchModify",verify,modify)



module.exports = router;