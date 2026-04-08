import type {Request, Response} from 'express';
import {getUsers, User} from "./user.service";

export async function search(req: Request, res: Response): Promise<void> {
    try {
        const {username} = req.query;
        const users: User[] = await getUsers({username: String(username)});
        res.json(users)
    } catch (e) {
        console.error(e);
        res.status(500).end();
    }
}

export async function getById(req: Request, res: Response): Promise<void> {
    try {
        const {id: idParam} = req.params;
        if (!idParam || Array.isArray(idParam)) {
            res.status(400).send({error: 'Invalid user id'});
            return
        }
        const id: number = parseInt(idParam)
        const [user] = await getUsers({id})
        if (!user) {
            res.status(404).send({error: 'User not found'});
            return
        }
        res.json(user)
    } catch (e) {
        console.error(e);
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
