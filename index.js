const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');



const app = express()
port = process.env.PORT || 5000

// middel war
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.Access_userName}:${process.env.password}@cluster0.xvxzn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// const client = new MongoClient(uri);
// console.log(uri);

const varyfyJWT = (req , res , next) =>{
    const authorization = req.headers.authorization
    if(!authorization){
    return res.status(401).send({message:"Unauthorization Access"})
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.Access_token, function(err, decoded) {
        if(err){
            return res.status(403).send({message:"Forbidden Access"})
        }
        res.decoded = decoded
        console.log(decoded.email);
        next()
      });
}

async function run() {

    try {
        await client.connect()

        const toolCollection = client.db("manufacture").collection("tools");
        const productCollection = client.db("manufacture").collection("product");
        const userCollection = client.db("manufacture").collection("users");

        //get all tool
        app.get("/tool", async (req, res) => {
            const result = await toolCollection.find().toArray()
            res.send(result)
        });

        //find a toll for spcifif data

        app.get("/tool/:id", async (req, res) => {
            const id = req.params.id
            const quary = { _id: ObjectId(id) }
            const result = await toolCollection.findOne(quary)
            res.send(result)
        });

        //insert a data
        app.post('/product', async (req, res) => {
            const product = req.body
            const result = await productCollection.insertOne(product)
            res.send(result)
        });

        // get all product detals
        app.get('/product', async (req, res) => {
            const result = await productCollection.find().toArray()
            res.send(result)
        });

        // get the all user
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set:user
              };
            const result = await userCollection.updateOne(filter , updateDoc ,options)
            const token = jwt.sign({ email }, process.env.Access_token,{ expiresIn: '1h' })

            res.send({result, token})
        });

        //get the all user

        app.get('/user',varyfyJWT, async(req , res)=>{
            const result = await userCollection.find().toArray()
            console.log("find decoded",req.decoded);
            console.log(req)
            res.send(result)
        });

    }
    finally {

    }

}
run().catch(console.dir)


app.get("/", (req, res) => {
    res.send("Manufacturing")
})

app.listen(port, () => {
    console.log(`listen port on ${port} `);
})