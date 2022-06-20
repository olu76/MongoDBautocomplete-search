const express = require('express');
const app = express();
const PORT = 3000;
const {MongoClient, objectId} = require('mongodb')
const cors = require('cors');
const { response } = require('express');
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('Connected to database')
        db = client.db(dbName)
        collection = db.collection('movies')
    })

app.use(express.urlencoded({extended: true})) 
app.use(express.json())
app.use(cors())

app.get('/search', async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                $search: {
                    "auto_complete": {
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
        res.send(result)

    } catch (error) {
        response.status(500).send({error: error.message})
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