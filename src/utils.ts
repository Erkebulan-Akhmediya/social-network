import * as z from 'zod'
import {createTransport} from 'nodemailer'
import dotenv from "dotenv";

dotenv.config()

export function camelToSnakeCase(camel: string): string {
    let snake = camel.charAt(0)
    for (let i = 1; i < camel.length; i++) {
        const char = camel.charAt(i)
        if (char >= 'A' && char <= 'Z') {
            snake += '_'
        }
        snake += char.toLowerCase()
    }
    return snake
}

export const paginationSchema = z.object({
    page: z.coerce.number().nonnegative().default(0),
    size: z.coerce.number().positive().max(100_000).default(100),
})

export const emailTransport = createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
    },
})