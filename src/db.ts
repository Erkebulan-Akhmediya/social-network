import {Pool} from 'pg';
import dotenv from 'dotenv';
import {camelToSnakeCase} from "./utils";
dotenv.config()

export const pool = new Pool({
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
})

export type BuildWhereClauseResult = {
    whereClause: string
    args: any[]
}

export function buildWhereClause(searchOptions: any): BuildWhereClauseResult {
    let whereClause = '';
    const props: string[] = searchOptions ? Object.keys(searchOptions) : []
    const args = new Array(props.length)
    props.forEach((prop: string, index: number): void => {
        whereClause += index == 0 ? ' where' : ' and'
        whereClause += ` "${camelToSnakeCase(prop)}" = $${index + 1}`
        args[index] = (searchOptions as any)[prop];
    })
    return {
        whereClause,
        args
    }
}