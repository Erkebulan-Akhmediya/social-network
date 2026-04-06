import type {Request, Response} from 'express';
import {
    addFriend,
    createFriendRequest,
    Friend,
    friendExists,
    friendRequestExists,
    FriendRequestStatus,
    getFriends,
    getWaitingFriendRequests,
    setFriendRequestStatus,
    WaitingFriendRequest
} from "./friend.service";

export async function createRequest(req: Request, res: Response): Promise<void> {
    try {
        const {userId: to} = req.body
        const {userId: from} = req as any
        if (from === to) {
            res.status(400).send({error: 'Cannot send a request to yourself'})
            return
        }
        if (await friendExists(from, to)) {
            res.status(400).send({error: 'You are already friends'})
            return
        }
        if (await friendRequestExists({from, to, status: FriendRequestStatus.waiting})) {
            res.status(400).send({error: 'Friend request already exists'})
            return
        }
        await createFriendRequest(from, to)
        res.status(201).end();
    } catch (e) {
        console.error(e);
        res.status(500).end();
    }
}

export async function listRequests(req: Request, res: Response): Promise<void> {
    try {
        const {userId} = req as any
        const friendReqs: WaitingFriendRequest[] = await getWaitingFriendRequests(userId)
        res.json(friendReqs)
    } catch (e) {
        console.error(e);
        res.status(500).end()
    }
}

export async function requestReply(req: Request, res: Response): Promise<void> {
    try {
        const {acceptedParam} = req.query
        const accepted: boolean = acceptedParam === 'false' ? false : Boolean(acceptedParam)

        let {id: friendReqIdParam} = req.params
        if (!friendReqIdParam || Array.isArray(friendReqIdParam)) {
            res.status(404).end();
            return;
        }
        const friendReqId: number = parseInt(friendReqIdParam)

        const friendRequestIsWaiting: boolean = await friendRequestExists({
            id: friendReqId,
            status: FriendRequestStatus.waiting
        })
        if (!friendRequestIsWaiting) {
            res.status(404).send({error: 'Friend request is not waiting'})
            return
        }

        const {from, to} = await setFriendRequestStatus(friendReqId, accepted)
        if (accepted)
            await addFriend(from, to)
        res.status(200).end()
    } catch (e) {
        console.error(e);
        res.status(500).end();
    }
}

export async function listFriends(req: Request, res: Response): Promise<void> {
    try {
        const {userId} = req as any
        const friends: Friend[] = await getFriends(userId)
        res.json(friends)
    } catch (e) {
        console.error(e);
        res.status(500).end()
    }
}