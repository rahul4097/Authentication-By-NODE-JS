const express = require('express');
const fs = require('fs');
const userRouter = require('../routes/userRoutes')
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use('/users', userRouter)

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });