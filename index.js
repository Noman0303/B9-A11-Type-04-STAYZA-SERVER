// import express

const express = require('express');
const cors = require('cors');
require('dotenv').config();


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
        // await client.connect();
        console.log('connected to mongodb')


        const roomCollection = client.db('Stayza').collection('rooms');
        const bookedRoomsCollection = client.db('Stayza').collection('bookedRooms');

        // Data read in backend server

        // Room Data read/get in backend server
        //Applying price filer on rooms from backend

        app.get('/rooms', async (req, res) => {
            try {
                const { minPrice, maxPrice, sort } = req.query;
                let query = {};

                // Apply price filtering if provided

                if (minPrice && maxPrice) {
                    query.price = {
                        $gte: Number(minPrice), $lte: Number(maxPrice),
                    }
                }

                // Apply sorting if provided
                const sortOptions = sort ? { price: sort === 'desc' ? -1 : 1 } : {};

                // Fetch rooms from DB with filtering and sorting
                const rooms = await roomCollection.find(query).sort(sortOptions).toArray();

                // console.log('Fetched Rooms:', rooms);
                res.status(200).json(rooms)

            }

            catch (error) {
                console.error('Error fetching rooms:', error);
                res.status(500).json({ message: "Server Error", error });
            }
        })

        // Inidividual Room Details read/get in backend server against mail
        app.get('/roomDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomCollection.findOne(query);
            res.send(result);
            // console.log(result)
        })

        // Inidividual booked Room read/get in backend server

        app.get('/bookedRooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookedRoomsCollection.findOne(query);
            res.send(result);
            // console.log(result)
        })


        //  read all booked Rooms Details read/get in backend server by mail

        app.get(`/bookedRoomsbyEmail/:email`, async (req, res) => {
            const email = req.params.email;
            console.log('email received', email)
            // Query to find all bookings with the provided user email
            const query = { userEmail: email };
            // Fetch bookings from the bookedRooms collection
            const result = await bookedRoomsCollection.find(query).toArray();
            // Send the result back to the client
            res.send(result);
        })


        // update booking date in bookedRoom with review

        app.patch('/bookedRooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const bookingDate = req.body;
            console.log(bookingDate)

            const updatedDoc = {
                $set: {
                    bookingDate: bookingDate
                },
            }
            const result = await bookedRoomsCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        // Update rooms review by room name

        app.patch('/rooms/:roomName', async (req, res) => {
           
            const roomName = req.params.roomName;
            const query = { roomName : roomName };
            const { rating, comment, userName } = req.body;
            const updatedDoc = {
                $push: {
                    reviews:{userName,rating,comment}
                },
            }
            const result = await roomCollection.updateOne(query, updatedDoc);
            res.send(result);            
        });

        // Create booking data in bookedRooms collection

        app.post('/bookedRooms', async (req, res) => {
            const bookingData = req.body;
            const result = await bookedRoomsCollection.insertOne(bookingData);
            res.send(result);
        })

        // Delete booked Room 
        app.delete('/bookedRooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookedRoomsCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db('admin').command({ ping: 1 });
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



