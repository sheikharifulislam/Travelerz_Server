const express = require('express');
const {MongoClient} = require('mongodb');
const objectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();


const corsConfig = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,    
  }

app.use(express.json());
app.use(cors(corsConfig))




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jrudo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try{
        await client.connect();
        const database = client.db("Travelerz");
        const allBlog = database.collection("All_Blog");
        const allUsers = database.collection("All_Users");

        // ALL GET API

        app.get('/all-blog', async(req,res) => {
            const {status} = req.query;
            const {skip} = req.query;
            const {limit} = req.query;
            let result;

            console.log(status);

            if(status) {
                result = await allBlog.find({
                    status: status,
                })
                .toArray();

                res.send(result);
            }
            else if(skip && limit && status) {
                result = await allBlog.find(
                    {
                        status: status,
                    }
                )
                .skip(skip)
                .limit(limit)
                .toArray()

                res.send(result);
            }
        })

        app.get('/check-admin',async(req,res) => {
            const {userEmail} = req.query;
            const user = await allUsers.findOne(
                {
                    email: userEmail
                }
            );
    
            let isAdmin = false;

            if(user?.role === 'admin') {
                isAdmin = true;
            }

            res.status(200).json({isAdmin});
        })

        app.get('/single-blog', async (req, res) => {
            const {blogId} = req.query;
            const result = await allBlog.find({_id: objectId(blogId)});
            res.send(result);
        })
        
        // ALL POST API

        app.post('/add-user',async(req,res) => {
            const user = req.body;            
            const result = await allUsers.insertOne(user);
            res.status(201).json(result);            
        });

        app.post('/add-blog',async(req, res) => {
            const blog = {
                ...req.body,                
            }

            blog.reviewStar = parseInt(blog.reviewStar);

            const result = await allBlog.insertOne(blog);
            res.send(result);
        })

        //ALL UPDATE API

        app.patch('/update-blog-status',async(req,res) => {
            const {blogId} = req.query;
            const result = await allBlog.updateOne(
                {
                    _id: objectId(blogId),
                },
                {
                    $set: {
                        
                    }
                }
            )

            res.send(result);
        })

        //ALL DELETE API
        app.delete('/delete-single-blog', async(req, res) => {
            const {blogId} = req.query;
            const result = await allBlog.deleteOne({
                _id: objectId(blogId),
            })

            res.send(result);
        })
       
    }
    catch(error) {
        console.log(error.message);
    }
    finally{
         //await client.close();      
    }
}

run();

app.get('/',async(req,res) => {
    res.send("Ariful");
})


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server Is Running At Port ${port}`);
})