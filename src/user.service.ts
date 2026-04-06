import {buildWhereClause, pool} from "./db";
import bcrypt from 'bcrypt';

export type User = {
    id: number
    username: string
    password?: string
    createdAt: Date
}

export async function createUser(username: string, password: string): Promise<void> {
    const query = 'insert into "user" (username, password) values ($1, $2)'
    const passHash: string = await bcrypt.hash(password, 10)
    await pool.query(query, [username, passHash])
}

export type SearchOptions = {
    id?: number
    username?: string
    createdAt?: Date
}

export type ResultOptions = {
    withPassword?: boolean
}

export async function getUsers(searchOptions?: SearchOptions, resultOptions?: ResultOptions): Promise<User[]> {
    const selectCols = ['id', 'username', 'created_at']
    if (resultOptions && resultOptions.withPassword)
        selectCols.push('password')

    let query = `select ${selectCols.join(', ')}
                 from "user"`;

    const {whereClause, args} = buildWhereClause(searchOptions)
    query += whereClause

    const {rows: users} = await pool.query(query, args)
    return users.map((user): User => ({
        id: user.id,
        username: user.username,
        password: user?.password,
        createdAt: new Date(user.created_at),
    }));
}
