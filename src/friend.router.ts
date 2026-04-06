import {Router} from "express";
import {authMiddleware} from "./auth.service";
import {createRequest, requestReply, listRequests, listFriends} from "./friend.controller";

const router = Router();

router.get('/', authMiddleware, listFriends);
router.post('/request', authMiddleware, createRequest)
router.get('/request', authMiddleware, listRequests)
router.post('/request/:id/reply', authMiddleware, requestReply)

export default router;