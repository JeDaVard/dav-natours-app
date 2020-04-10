const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.status(200).send('Hello!')
})

app.listen(port, () => {
    console.log(`Server is up on port: ${port}. ...`)
})