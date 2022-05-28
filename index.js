const express = require('express')
const cors = require('cors')
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 4000
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rqdp4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db('car-engineer').collection('tools')
        const reviewCollection = client.db('car-engineer').collection('review')
        const orderCollection = client.db('car-engineer').collection('orders')
        const userCollection = client.db('car-engineer').collection('user')
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })




        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await toolsCollection.findOne(query);
            res.send(result);
        });
        app.post('/tools', async (req, res) => {
            const tools = req.body;
            const query = { name: tools.name, description: tools.description, available: tools.available, minorder: tools.minorder, price: tools.price, img: tools.img };
            const exist = await toolsCollection.findOne(query);
            if (exist) {
                return res.send({ success: false, tools: exist })
            }
            const result = await toolsCollection.insertOne(tools);
            return res.send({ success: true, result });
        });

        app.post('/tools', async (req, res) => {
            const tools = req.body;
            const query = { name: tools.name, description: tools.description, available: tools.available, minorder: tools.minorder, price: tools.price, img: tools.img };
            const exist = await toolsCollection.findOne(query);
            if (exist) {
                return res.send({ success: false, tools: exist })
            }
            const result = await toolsCollection.insertOne(tools);
            return res.send({ success: true, result });
        });

        app.put('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const requestedQuantity = req.body.quantity;

            const filter = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(filter);
            const quantity = tool.available;
            const newQuantity = quantity - requestedQuantity;

            const options = { upsert: true };
            const updatedDoc = {
                $set:
                {
                    availableQuantity: newQuantity
                },
            };
            const result = await toolsCollection.updateOne(filter, updatedDoc, options);

            res.send(result);
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;

            const result = await orderCollection.insertOne(order);
            return res.send({ success: true, result });
        });
        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email === decodedEmail) {
                const query = { email: email }
                const orders = await orderCollection.find(query).toArray();
                res.send(orders);
            }
            else {
                return res.status(403).send({ message: "forbiddem" })
            }



        })


       

        // review
        app.post('/review', async (req, res) => {
            const rev = req.body;
            const result = await reviewCollection.insertOne(rev);
            res.send(result)
        })
        app.get('/review', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query);
            const rev = await cursor.toArray();
            res.send(rev)
        })
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users)
        })
        app.get('/orders', async (req, res) => {
            const users = await orderCollection.find().toArray();
            res.send(users)
        })

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {

                const filter = { email: email }

                const updateDoc = {
                    $set: { role: 'admin' },

                };
                const result = await userCollection.updateOne(filter, updateDoc);


                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden' })
            }




        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,

            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5d' })

            res.send({ result, token })


        })
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
          })



    }
    finally {

    }

}

run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello!')
})

app.listen(port, () => {
    console.log(port)
})