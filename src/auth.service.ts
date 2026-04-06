import * as jwt from 'jsonwebtoken';
import type {Request, Response, NextFunction} from "express";

export function createJwt(userId: number): string {
    return jwt.sign({userId}, process.env.JWT_SECRET!)
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader: string | undefined = req.headers?.authorization
    if (!authHeader) {
        res.status(401).end()
        return
    }
    const token: string | undefined = authHeader.split(' ')[1]
    if (!token) {
        res.status(401).end()
        return
    }
    const {userId} = jwt.verify(token, process.env.JWT_SECRET!) as {userId: number}
    (req as any).userId = userId
    next()
}