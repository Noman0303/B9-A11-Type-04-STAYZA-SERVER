// import express

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(express.json());
app.use(cors());

// importing mongoClient from mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fguqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        console.log('connected to mongodb')


        const roomCollection = client.db('Stayza').collection('rooms');

        // Data read in backend server
        // Room Data read in backend server

        app.get('/rooms',async(req,res)=>{
            const cursor = roomCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    };
}

run().catch(console.dir);

// running app on backend server
app.get('/', (req, res) => {
    res.send('stayza server is running')
});


//  To listen from server on the declared port
app.listen(port, () => {
    console.log(`Stayza server is running on port ${port}`)
})



