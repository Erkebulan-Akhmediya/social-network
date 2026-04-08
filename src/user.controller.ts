import type {Request, Response} from 'express';
import {getUsers, User} from "./user.service";
import * as z from 'zod'

export async function search(req: Request, res: Response): Promise<void> {
    const searchSchema = z.object({
        username: z.coerce.string()
    })
    try {
        const {username} = searchSchema.parse(req.query);
        const users: User[] = await getUsers({username});
        res.json(users)
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            res.status(400).json({error: z.prettifyError(e)})
        }
        res.status(500).end();
    }
}

export async function getById(req: Request, res: Response): Promise<void> {
    const getByIdSchema = z.object({
        id: z.coerce.number()
    })
    try {
        const {id} = getByIdSchema.parse(req.params)
        const [user] = await getUsers({id})
        if (!user) {
            res.status(404).send({error: 'User not found'});
            return
        }
        res.json(user)
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            res.status(400).json({error: z.prettifyError(e)})
        }
        res.status(500).end();
    }
}

export async function whoami(req: Request, res: Response): Promise<void> {
    try {
        const {userId} = req as any
        const [user] = await getUsers({id: userId})
        if (!user) {
            res.status(404).json({error: 'User not found'});
            return
        }
        res.json(user)
    } catch (e) {
        console.error(e);
        res.status(500).end();
    }
}
