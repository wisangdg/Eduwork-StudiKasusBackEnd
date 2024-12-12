const router = require("express").Router();
const { police_check } = require("../../middlewares");
const cartController = require("./controller.js");

router.post("/carts", police_check("create", "Cart"), cartController.store);
router.put("/carts", police_check("update", "Cart"), cartController.update);
router.get("/carts", police_check("read", "Cart"), cartController.index);
router.delete(
  "/carts/:id",
  police_check("delete", "Cart"),
  cartController.destroy
);

module.exports = router;
