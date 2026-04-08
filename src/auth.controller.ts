import type {Request, Response} from "express";
import {createUser, getUsers} from "./user.service";
import bcrypt from "bcrypt";
import {createJwt} from "./auth.service";
import * as z from "zod";

export async function signUp(req: Request, res: Response): Promise<void> {
    const signUpSchema = z.object({
        username: z.string(),
        password: z.string(),
    })
    try {
        const {username, password} = signUpSchema.parse(req.body)
        const {length: userCount} = await getUsers({username})
        if (userCount > 0) {
            res.status(400).json({error: "Username already exists"})
            return
        }
        await createUser(username, password)
        res.status(201).json({message: 'Congrats! You have successfully signed up'})
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            res.status(400).json({error: z.prettifyError(e)})
        }
        res.status(500).end()
    }
}

export async function signIn(req: Request, res: Response): Promise<void> {
    const signInSchema = z.object({
        username: z.string(),
        password: z.string(),
    })
    try {
        const {username, password} = signInSchema.parse(req.body)
        const users = await getUsers({username}, {withPassword: true})
        if (users.length === 0) {
            res.status(400).json({error: "Incorrect username or password"})
            return
        }
        const validPassword: boolean = await bcrypt.compare(password, users[0]!.password!)
        if (!validPassword) {
            res.status(400).json({error: "Incorrect username or password"})
            return
        }
        const token: string = createJwt(users[0]!.id)
        res.status(200).json({token})
    } catch (e) {
        console.error(e)
        if (e instanceof z.ZodError) {
            res.status(400).json({error: z.prettifyError(e)})
        }
        res.status(500).end()
    }
}