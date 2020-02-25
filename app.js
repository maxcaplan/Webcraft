const express = require('express')
const app = express()

const {
    spawn,
    fork
} = require('child_process')

const bodyParser = require('body-parser');

const hostname = '127.0.0.1';
const port = 3000;

// Static file serving
app.use(express.static('public'))

// Support encoded bodies and json encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Mesh generation post
app.post("/world/chunkMesh", (req, res) => {
    console.log(req.body)
    res.send("Request resolved")
})



// test post
app.post("/api/test", (req, res) => {
    console.log(req.body)
    res.send("Request resolved")
})

app.post("/world/chunkGen", (req, res) => {
    console.log("Got chunk request")
    // Get request data
    let x = req.body.x
    let y = req.body.y
    let chunkDepth = req.body.chunkDepth
    let chunkHeight = req.body.chunkHeight
    let chunkSize = req.body.chunkSize
    let seed = req.body.seed

    // Check all data is there
    if (x == 'undefined' || y == 'undefined' || chunkDepth == 'undefined' || chunkHeight == 'undefined' && chunkSize == 'undefined' || seed == 'undefined') {
        res.send("Incorrect chunk request")
    } else {
        // Fork chunk generation to child process
        const forkTest = fork('./private/chunkGen.js')
        var data = {
            x: x,
            y: y,
            chunkDepth: chunkDepth,
            chunkHeight: chunkHeight,
            chunkSize: chunkSize,
            seed: seed
        }

        forkTest.send(JSON.stringify(data))
        forkTest.on('message', result => {
            console.log("Chunk generated")
            res.send(result)
        });
    }
})


app.listen(port, hostname, () => console.log(`Server listening on port ${port}`))