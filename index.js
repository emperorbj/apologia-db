import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from "swagger-ui-express";
import { connectDB } from './config/connectDB.js';
import authRouter from './routes/user.route.js'
import ebookRouter from './routes/ebook.route.js';
import videoRouter from './routes/video.route.js'
import jobs from  './lib/cron.js'
import chatRouter from './routes/chat.route.js';
import swaggerDefinition from './config/swagger.js';


dotenv.config();
const port = Number(process.env.PORT) || 3000;
const app = express();


jobs.start()


// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
app.use('/api/auth',authRouter);
app.use('/api/ebooks',ebookRouter);
app.use('/api/videos',videoRouter)
app.use('/api/ai',chatRouter);

// CONNECTION WITH MONGODB

app.listen(port, () => {
    
    connectDB();
    console.log(`server running on port ${port}`);
    
    
})


