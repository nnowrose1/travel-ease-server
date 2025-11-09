const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;



const serviceAccount = require("./serviceKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// middlewares
app.use(cors());
app.use(express.json());

const verifyFirebaseToken = () => {

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fawnknm.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const vehiclesdb = client.db("vehiclesDB");
    const vehiclesCollection = vehiclesdb.collection("vehicles");

    // getting all the vehicles
    app.get("/allVehicles", async (req, res) => {
      const cursor = vehiclesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // getting a particular vehicle
    app.get("/allVehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await vehiclesCollection.findOne(query);
      res.send(result);
      if(!result) {
        res.send({message: "Vehicle not found!"})
      }
    });

    // getting the latest vehicles
    app.get("/latestVehicles", async (req, res) => {
      const cursor = vehiclesCollection.find().sort({ createdAt: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travel Ease server is running");
});

app.listen(port, () => {
  console.log(`Travel ease server is running on port: ${port}`);
});
