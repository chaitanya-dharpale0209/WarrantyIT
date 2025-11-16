
// import { Router } from "express";
// import {
//     handleCreateWarranty, handleDeleteWarranty,
//     handleGetAllWarranties,
//     handleGetWarranty,
//     handleUpdateWarranty,
//     handleGetWarrantiesBycategory
// } from "../controllers/warranty.controllers.js";
// import { isUserAuthenticated } from "../middlewares/Authentication.middleware.js";

// const router = Router();

// router.route("/")
//     .get(isUserAuthenticated, handleGetAllWarranties)
//     .post(isUserAuthenticated, handleCreateWarranty);

// router.route("/:id")
//     .get(isUserAuthenticated, handleGetWarranty)
//     .patch(isUserAuthenticated, handleUpdateWarranty)
//     .delete(isUserAuthenticated, handleDeleteWarranty);

// router.route("/category/:cat")
//     .get(isUserAuthenticated, handleGetWarrantiesBycategory);

// export default router;


import { Router } from "express";
import {
    handleCreateWarranty, handleDeleteWarranty,
    handleGetAllWarranties,
    handleGetWarranty,
    handleUpdateWarranty,
    handleGetWarrantiesBycategory
} from "../controllers/warranty.controllers.js";
import { isUserAuthenticated } from "../middlewares/Authentication.middleware.js";

const router = Router();

router.route("/")
    .get(isUserAuthenticated, handleGetAllWarranties)
    .post(isUserAuthenticated, handleCreateWarranty);

router.route("/:id")
    .get(isUserAuthenticated, handleGetWarranty)
    .patch(isUserAuthenticated, handleUpdateWarranty)
    .delete(isUserAuthenticated, handleDeleteWarranty);

router.route("/category/:cat")
    .get(isUserAuthenticated, handleGetWarrantiesBycategory);

export default router;