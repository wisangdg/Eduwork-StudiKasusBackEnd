const router = require("express").Router();
const orderController = require("./controller.js");

router.post("/orders", police_check("create", "Order"), orderController.store);

router.get("/orders", police_check("view", "Order"), orderController.index);

module.exports = router;
