const express = require("express");
const verify = require("../middleware/auth");
const { allMessages, sendMessage } = require("../controllers/messageController");
const router = express.Router();


router.route("/:chatId").get(verify,allMessages)
router.route("/").post(verify,sendMessage)


module.exports = router;
