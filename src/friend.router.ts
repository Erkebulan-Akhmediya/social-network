import {Router} from "express";
import {authMiddleware} from "./auth.service";
import {createRequest, requestReply, listRequests, listFriends, deleteFriendRequest} from "./friend.controller";

const router = Router();

router.get('/', authMiddleware, listFriends);
router.post('/request', authMiddleware, createRequest)
router.get('/request', authMiddleware, listRequests)
router.post('/request/:id/reply', authMiddleware, requestReply)
router.delete('/request/:id', authMiddleware, deleteFriendRequest)

export default router;