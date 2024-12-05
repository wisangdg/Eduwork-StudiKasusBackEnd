const router = require("express").Router();
const { police_check } = require("../../middlewares/index.js");
const categoryController = require("./controller.js");

router.get("/categories", categoryController.index);

router.post(
  "/categories",
  police_check("create", "Category"),
  categoryController.store
);

router.put(
  "/categories:id",
  police_check("update", "Category"),
  categoryController.update
);

router.delete(
  "/categories:id",
  police_check("delete", "Category"),
  categoryController.destroy
);

module.exports = router;
