import {Router} from "express";
import {createCategory, createSubCategory, getAllCategories, getAllSubCategories} from "../controllers/category.controllers.js";
import {isUserAuthenticated} from "../middlewares/Authentication.middleware.js";

const router = Router();

router.get('/:cat', isUserAuthenticated, getAllSubCategories);
router.get('/', isUserAuthenticated, getAllCategories);

// router.post('/:cat', isUserAuthenticated, getAllSubCategories);
// router.post('/', isUserAuthenticated, getAllCategories);
// Create category
router.post('/', isUserAuthenticated, createCategory);
// Create subcategory
router.post('/subcategory', isUserAuthenticated, createSubCategory);

export default router;