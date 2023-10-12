const express = require("express");
const verify = require("../middleware/auth");
const {  accessChat,
    fetchChats,
    fetchGroup,
    createGroupChat,
    groupExit,
    deleteGroup,
    addSelfToGroup, 
    removeFriend} = require("../controllers/chatController");
const router = express.Router();


router.route("/").get(verify,fetchChats);
router.route("/").post(verify,accessChat);
router.route("/creategroup").post(verify,createGroupChat);
router.route("/fetchgroup").get(verify,fetchGroup);
router.route("/groupexit").post(verify,groupExit);
router.route("/deleteGroup").post(verify,deleteGroup);
router.route("/addMe").patch(verify,addSelfToGroup);
router.route("/removeFriend").post(verify,removeFriend);


module.exports = router;