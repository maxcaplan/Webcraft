const express = require('express')
const app = express()

const bodyParser = require('body-parser');


const hostname = '127.0.0.1';
const port = 3000;

// Static file serving
app.use(express.static('public'))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// app.get('/', (req, res) => res.send('Hello World!'))
app.post("/api/test", (req, res) => {
    console.log(req.body)
    res.send("Request resolved")
})

app.listen(port, hostname, () => console.log(`Example app listening on port ${port}`))