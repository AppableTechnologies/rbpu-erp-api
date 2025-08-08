const express =  require("express");
const router = express.Router();
const { getMenus } = require("../../controllers/common/menus_controller");

router.get("/:role_id_fk",getMenus);

module.exports = router