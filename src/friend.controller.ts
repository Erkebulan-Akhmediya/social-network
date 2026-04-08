import type {Request, Response} from 'express';
import {
    addFriend,
    createFriendRequest, deleteFriend, deleteWaitingFriendRequest,
    Friend,
    friendExists,
    friendRequestExists,
    FriendRequestStatus,
    getFriends,
    getWaitingFriendRequests,
    setFriendRequestStatus,
    WaitingFriendRequest
} from "./friend.service";
import * as z from 'zod'
import {paginationSchema} from "./utils";

export async function createRequest(req: Request, res: Response): Promise<void> {
    const createRequestSchema = z.object({
        userId: z.coerce.number()
    })
    try {
        const {userId: to} = createRequestSchema.parse(req.body)
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
        if (e instanceof z.ZodError) {
            res.status(400).send({error: z.prettifyError(e)})
            return
        }
        res.status(500).end();
    }
}

export async function listRequests(req: Request, res: Response): Promise<void> {
    try {
        const {userId} = req as any
        const {page, size} = paginationSchema.parse(req.query)
        const friendReqs: WaitingFriendRequest[] = await getWaitingFriendRequests(userId, {page, size})
        res.json(friendReqs)
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            res.status(400).send({error: z.prettifyError(e)})
            return
        }
        res.status(500).end()
    }
}

export async function requestReply(req: Request, res: Response): Promise<void> {
    const requestReplySchema = z.object({
        query: z.object({
            accepted: z.coerce.boolean().default(false),
        }),
        params: z.object({
            id: z.coerce.number().nonnegative()
        })
    })
    try {
        const {query: {accepted}, params: {id: friendReqId}} = requestReplySchema.parse(req)

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
        if (e instanceof z.ZodError) {
            res.status(400).send({error: z.prettifyError(e)})
            return
        }
        res.status(500).end();
    }
}

export async function deleteFriendRequest(req: Request, res: Response): Promise<void> {
    const deleteFriendRequestSchema = z.object({
        id: z.coerce.number()
    })
    try {
        const {userId: from} = req as any
        const {id: friendReqId} = deleteFriendRequestSchema.parse(req.params)
        const rowsDeleted: number = await deleteWaitingFriendRequest(friendReqId, from)
        if (rowsDeleted === 0) {
            res.status(404).send({
                error: 'You can\'t delete the request because you are not author of it or it is not waiting'
            })
            return
        }
        res.json({message: 'successfully deleted the friend request'})
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            res.status(400).send({error: z.prettifyError(e)})
            return
        }
        res.status(500).end();
    }
}

export async function listFriends(req: Request, res: Response): Promise<void> {
    try {
        const {userId} = req as any
        const {page, size} = paginationSchema.parse(req.query)
        const friends: Friend[] = await getFriends(userId, {page, size})
        res.json(friends)
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            res.status(400).send({error: z.prettifyError(e)})
            return
        }
        res.status(500).end()
    }
}

export async function deleteFriendById(req: Request, res: Response): Promise<void> {
    const deleteFriendSchema = z.object({
        id: z.coerce.number()
    })
    try {
        const {userId} = req as any
        const {id: friendId} = deleteFriendSchema.parse(req.params)
        const rowsDeleted: number = await deleteFriend(userId, friendId)
        if (rowsDeleted === 0) {
            res.status(400).send({error: 'The user is not your friend'})
            return
        }
        res.json({message: 'successfully deleted the friend'})
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            res.status(400).send({error: z.prettifyError(e)})
            return
        }
        res.status(500).end()
    }
}