import express from 'express';
import authRouter from "./auth.router";
import userRouter from "./user.router";
import friendRouter from "./friend.router";
import dotenv from "dotenv";

dotenv.config()
const app = express();

app.use(express.json())

app.get('/health', (_req, res) => {
    res.status(200).send('OK');
})

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/friend', friendRouter);

app.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`);
});