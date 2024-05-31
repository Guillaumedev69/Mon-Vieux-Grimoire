const express = require("express");
const router = express.Router();
const booksCtrl = require("../controllers/books");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get("/", booksCtrl.getAllBook);
router.get("/bestrating", booksCtrl.getBestRating);
router.get("/:id", booksCtrl.getOneBook);

router.post("/", auth, multer,  booksCtrl.createBook);
router.post("/:id/rating", auth, booksCtrl.createRating);

router.put("/:id", auth, multer,  booksCtrl.modifyBook);

router.delete("/:id", auth, booksCtrl.deleteBook);

module.exports = router;
