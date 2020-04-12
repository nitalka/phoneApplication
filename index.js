const express=require('express');
const bodyParser=require('body-parser');
const path=require('path');
const userRoutes=require('./routes/userRoutes.js');

const uuidv1 = require('uuid/v1');

const uuidv4 = require('uuid/v4');

const app=express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:true}));


app.use('/phoneapi',userRoutes); 

app.use('/',(req,res)=>{
    res.status(404).send({message:"resource dnot found,type correct URL"});
});


const PORT=process.env.PORT || 8090;
app.listen(PORT,()=>{
console.log('server started ....');
}
);