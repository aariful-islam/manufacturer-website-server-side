const express = require('express')
const cors=require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 4000
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rqdp4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

 async function run(){
     try{
         await client.connect();
        const toolsCollection = client.db('car-engineer').collection('tools')
        app.get('/tools', async(req,res)=>{
            const query={};
            const cursor=toolsCollection.find(query);
            const tools=await cursor.toArray();
            res.send(tools);
        })

     }
     finally{

     }

 }

 run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello!')
})

app.listen(port, () => {
  console.log(port)
})