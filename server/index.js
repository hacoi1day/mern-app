const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mern-app.ydsqk.mongodb.net/?retryWrites=true&w=majority`, {
            // useCreateIndex: true,
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useFindAndModify: false,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
