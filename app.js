const express = require('express');
const {MongoClient} = require('mongodb');
const objectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();
const cors = require('cors');
const multer = require('multer');
const upload = require('./multer/multer.config');
const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'))

app.use((err,req,res,next) => {
    if(err) {
        if(err instanceof multer.MulterError) {
            res.status(500).json("Thre was an upload error")
        }
        else {
            res.status(500).json(err.message)
        }
    }
    else {
        res.status(200).json("Success")
    }
})


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
            let allBlog;

            if(status) {
                allBlog = await allBlog.find({
                    status: status,
                })
                .toArray();

                res.send(allBlog);
            }
            else {
                allBlog = await allBlog.find({
                    status: 'confirm',
                })
                .toArray();

                res.send(allBlog);
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
        
        // ALL POST API

        app.post('/add-user',async(req,res) => {
            const user = req.body;            
            const result = await allUsers.insertOne(user);
            res.status(201).json(result);            
        });

        app.post('/add-blog',upload.single("sportImage"),async(req, res) => {
            const blog = {
                ...req.body,
                productImage: req.file.path,
            }

            blog.reviewStar = parseInt(blog.reviewStar);

            const result = await allallBlog.insertOne(blog);
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