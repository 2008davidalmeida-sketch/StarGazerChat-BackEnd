import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';    

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

const app = express();

app.use(express.json());

app.listen(3000, () => console.log('server running'));
