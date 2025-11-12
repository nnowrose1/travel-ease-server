const express = require("express");
// const admin = require("firebase-admin");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// // index.js
// const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY, "base64").toString("utf8");
// const serviceAccount = JSON.parse(decoded);

// const serviceAccount = require("./serviceKey.json")

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// middlewares
app.use(cors());
app.use(express.json());

// const verifyFirebaseToken = async (req, res, next) => {
//   // console.log("In the verify middleware", req.headers.authorization);
//   // verify if there is headers there
//   const authorization = req.headers.authorization;
//   if (!authorization) {
//     return res.status(401).send({ message: "Unauthorized Access" });
//   }
//   const token = authorization.split(" ")[1];
//   // verify if token is there
//   if (!token) {
//     return res.status(401).send({ message: "Unauthorized Access" });
//   }
//   // verify the token
//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     // console.log("After token validation", decoded);
//     req.token_email = decoded.email;
//     next();
//   } catch {
//     console.log("Invalid token");
//     return res.status(401).send({ message: "Unauthorized Access" });
//   }
// };

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
    // await client.connect();
    const vehiclesdb = client.db("vehiclesDB");
    const vehiclesCollection = vehiclesdb.collection("vehicles");
    const myBookingCollection = vehiclesdb.collection("myBookings");

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
      if (!result) {
        res.send({ message: "Vehicle not found!" });
      }
    });

    // getting the latest vehicles
    app.get("/latestVehicles", async (req, res) => {
      const cursor = vehiclesCollection.find().sort({ createdAt: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // posting a new vehicle
    app.post("/allVehicles", async (req, res) => {
      const newVehicle = req.body;
      newVehicle.createdAt = new Date();
      const result = await vehiclesCollection.insertOne(newVehicle);
      res.send(result);
    });

    // updating a vehicle
    app.patch("/allVehicles/:id", async (req, res) => {
      const id = req.params.id;
      const updatedVehicle = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          vehicle_name: updatedVehicle.vehicle_name,
          owner: updatedVehicle.owner,
          category: updatedVehicle.category,
          price_per_day: updatedVehicle.price_per_day,
          location: updatedVehicle.location,
          availability: updatedVehicle.availability,
          description: updatedVehicle.description,
          image: updatedVehicle.image,
          vehicle_owner_email: updatedVehicle.vehicle_owner_email,
          categories: updatedVehicle.categories,
        },
      };
      const result = await vehiclesCollection.updateOne(query, update);
      res.send(result);
    });

    // deleting a vehicle
    app.delete("/allVehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await vehiclesCollection.deleteOne(query);
      res.send(result);
    });

    // sorting by price
    app.get('/vehicles/sort', async(req, res) => {
      const sort = req.query.sort;
      // console.log(req.query.sort);
      
      const sortOption = {};

      if(sort === "priceAsc") {
        sortOption.price_per_day = 1;
      }
      else if(sort === "priceDesc"){
        sortOption.price_per_day = -1;
      }

      const result = await vehiclesCollection.find().sort(sortOption).toArray();
      res.send(result);
    })

    // my vehicles API
    app.get("/myVehicles", async (req, res) => {
      const email = req.query.email;

      const query = {};
      if (email) {
        // if (req.token_email !== email) {
        //   return res.status(403).send({ message: "Forbidden access" });
        // }

        query.vehicle_owner_email = email;
      }
      const result = await vehiclesCollection.find(query).toArray();
      res.send(result);
    });

    // getting my booking vehicles API
    app.get("/myBookings", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        //  if (req.token_email !== email) {
        //   return res.status(403).send({ message: "Forbidden access" });
        // }

        query.booked_by = email;
      }
      const result = await myBookingCollection.find(query).toArray();
      res.send(result);
    });

    // posting my booking vehicles API
    app.post("/myBookings", async (req, res) => {
      const newBooking = req.body;
      const result = await myBookingCollection.insertOne(newBooking);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("LuxTrip server is running");
});

app.listen(port, () => {
  console.log(`LuxTrip server is running on port: ${port}`);
});
