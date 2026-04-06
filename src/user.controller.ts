import type { Request, Response} from 'express';
import {/*addFriend,*/ getUsers, User} from "./user.service";

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
