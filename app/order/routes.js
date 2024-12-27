const router = require("express").Router();
const orderController = require("./controller.js");
const { police_check } = require("../../middlewares/index.js");

router.post("/orders", police_check("create", "Order"), orderController.store);

router.get("/orders", police_check("view", "Order"), orderController.index);

router.delete(
  "/orders/:id",
  police_check("delete", "Order"),
  orderController.delete
);

module.exports = router;
