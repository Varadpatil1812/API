require('dotenv').config();
require('express-async-errors');
const error=require('./middleware/error');
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const {Canvas,Image}=require('canvas');
const fileUpload=require('express-fileupload');
const faceapi=require('face-api.js');
faceapi.env.monkeyPatch({Canvas, Image});

const cors=require('cors');
app.use(cors());

const bdo=require('./routes/bdos');
const worker=require('./routes/workers');
const project=require('./routes/projects');
const attendance=require('./routes/attendance');

const db=process.env.db;
mongoose.connect(db)
    .then(()=>console.log("connected Mongodb"))
    .catch(err=>console.error('could not connect mongodb...',err));


app.use(express.json());
app.use(
    fileUpload({
        useTempFiles:true
    })
);
app.use('/api/bdo',bdo);
app.use('/api/worker',worker);
app.use('/api/project',project);
app.use('/api/attendance',attendance);
app.use(error);


const port=process.env.PORT || 3000;
app.listen(port,()=>console.log(`Listning on port ${port}...`));