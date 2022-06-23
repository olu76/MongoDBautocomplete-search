const express = require('express');
const app = express();
const {MongoClient, objectId} = require('mongodb')
const cors = require('cors');
const { response } = require('express');
require('dotenv').config()
const PORT = 8000;

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log(`Connected to database`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })
// Middleware
app.use(express.urlencoded({extended: true})) 
app.use(express.json())
app.use(cors())

app.get('/search', async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                $search: {
                    "autocomplete": {
                        "query": `${req.query.query}`,
                        "path": "title",
                        "fuzzy": {
                            "maxEdits": 2,
                            "prefixLength": 3
                        }
                    }
                }
            }
        ]).toArray()
        console.log(result) 
        res.send(result)

    } catch (error) {
        response.status(500).send({error: error.message})
        console.log(error)
    }
})

app.get("/get/:id", async (req, res) => {
    try {
        let result = await collection.findOne({_id: objectId(req.params.id)})
        res.send(result)
    } catch (error) {
        response.status(500).send({error: error.message})
    } 
})   





app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running `)
})

// THIS IS THE INDEX TO APPLY TO MONGODB MOVIES COLLECTION
//{
//    "mappings": {
//      "dynamic": false,
//      "fields": {
//        "title": [
//          {
//            "foldDiacritics": false,
//           "maxGrams": 7,
//            "minGrams": 3,
//            "tokenization": "edgeGram",
//            "type": "autocomplete"
//          }
//        ]
//      }
//    }
// }    
//}