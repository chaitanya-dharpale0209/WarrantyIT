// import {Router} from "express";
// import {isUserAuthenticated} from "../middlewares/Authentication.middleware.js";
// import {
//     handleCreateClaim, handleDeleteClaim,
//     handleGetAllClaims,
//     handleGetClaimById,
//     handleUpdateClaim,
//     handleUpdateClaimStatus
// } from "../controllers/claims.controller.js";

// const router = Router();

// // Fixed routes - using proper REST conventions
// router.get('/', isUserAuthenticated, handleGetAllClaims);
// router.get('/:id', isUserAuthenticated, handleGetClaimById); // Fixed: GET for single claim
// router.post('/', isUserAuthenticated, handleCreateClaim);
// router.put('/:id', isUserAuthenticated, handleUpdateClaim); // Fixed: PUT with ID in params
// router.patch('/status/:claimId', isUserAuthenticated, handleUpdateClaimStatus); // Better: PATCH for status updates
// router.delete('/:id', isUserAuthenticated, handleDeleteClaim); // Fixed: DELETE with ID in params

// export default router;

import {Router} from "express";
import {isUserAuthenticated} from "../middlewares/Authentication.middleware.js";
import {
    handleCreateClaim, handleDeleteClaim,
    handleGetAllClaims,
    handleGetClaimById,
    handleUpdateClaim,
    handleUpdateClaimStatus
} from "../controllers/claims.controller.js";

const router = Router();

// router.get('/', isUserAuthenticated, handleGetAllClaims);
// router.get('/:id', isUserAuthenticated, handleGetClaimById);
// router.post('/', isUserAuthenticated, handleCreateClaim);
// router.put('/', isUserAuthenticated, handleUpdateClaim);
// router.put('/status/:id', isUserAuthenticated, handleUpdateClaimStatus);
// router.delete('/', isUserAuthenticated, handleDeleteClaim);


router.get('/', isUserAuthenticated, handleGetAllClaims);
router.post('/:id', isUserAuthenticated, handleGetClaimById);
router.post('/', isUserAuthenticated, handleCreateClaim);
router.put('/', isUserAuthenticated, handleUpdateClaim);
router.put('/status/:id', isUserAuthenticated, handleUpdateClaimStatus);
router.delete('/', isUserAuthenticated, handleDeleteClaim);

export default router;