const express = require('express')
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 4000
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rqdp4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

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
        app.post('/tools', async (req, res)=>{
            const tools = req.body;
            const query = {name: tools.name, description: tools.description, available: tools.available, minorder: tools.minorder, price: tools.price, img: tools.img};
            const exist = await toolsCollection.findOne(query);
            if(exist){
                return res.send({ success: false, tools: exist })
            }
            const result = await toolsCollection.insertOne(tools);
            return res.send({ success: true, result });
        });
       
        app.post('/tools', async (req, res)=>{
            const tools = req.body;
            const query = {name: tools.name, description: tools.description, available: tools.available, minorder: tools.minorder, price: tools.price, img: tools.img};
            const exist = await toolsCollection.findOne(query);
            if(exist){
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
          app.get('/orders', async (req,res)=>{
            const email=req.query.email;
           
            
            const query={email:email}
            const orders= await orderCollection.find(query).toArray();
            res.send(orders);
        })
          
        
        //   app.get('/orders', async (req, res) => {
        //     const query = {};
        //     const cursor = orderCollection.find(query);
        //     const tools = await cursor.toArray();
        //     res.send(tools);
        // })

        // review
        app.post('/review', async(req,res)=>{
            const rev=req.body;
            const result = await reviewCollection.insertOne(rev);
            res.send(result)
        })
        app.get('/review', async(req,res)=>{
            const query={}
            const cursor=reviewCollection.find(query);
            const rev= await cursor.toArray();
            res.send(rev)
        })
    
        app.put('/user/:email',async(req,res)=>{
            const email=req.params.email;
            const user=req.body;
            const filter={email:email}
            const options={upsert : true}
            const updateDoc={
                $set:user,
                
            }
            const result = await userCollection.updateOne(filter,updateDoc,options);
            res.send(result)

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