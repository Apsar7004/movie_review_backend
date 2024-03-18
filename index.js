
import express from "express";
import { MongoClient } from 'mongodb'
import { ObjectId } from "mongodb";

const app=express();
const url="mongodb+srv://mapsar0786:mapsar0786@cluster0.ah1hmpi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client=new MongoClient(url);
await client.connect();
console.log("mongoDB connected Successsfully");
app.use(express.json());
import cors from "cors";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

 
app.use(cors())
const auth=(req,res,next)=>{
    try{
    const token = req.header("backend-token");//keyname,assign value as token
    jwt.verify(token,"student");
    next();
    }
    catch(error) {
    res.status(401).send({message:error.message});
    }
    }


app.get("/",async function(req,res){
    res.send("Hello");   
})


app.post("/post",async function(req,res){
    const getPostman=req.body;
    // console.log(getPostman)
    const sendMethod=await client.db("CRUD").collection("data").insertOne(getPostman);
    res.send(sendMethod);
});
app.post("/postmany",async function(req,res){
    const getMany=req.body;
    const sendMethod=await client.db("CRUD").collection("data").insertMany(getMany);
    res.send(sendMethod);
});

app.get("/get",auth,async function(req,res){
    const getMethod=await client.db("CRUD").collection("data").find({}).toArray();
    res.send(getMethod);
});

app.get("/getOne/:id",async function(req,res){
    const {id}=req.params;
    const getMethod=await client.db("CRUD").collection("data").findOne({_id:new ObjectId(id)});
    res.send(getMethod)
    console.log(getMethod);
});

app.put("/update/:id",async function(req,res){
    const {id}=req.params;
    const getPostman=req.body;
    // console.log(getPostman);
    const updateMethod=await client.db("CRUD").collection("data").updateOne({_id:new ObjectId(id)},{$set:getPostman});
    res.send(updateMethod);
});

app.delete("/delete/:id",async function(req,res){
    const {id}=req.params;
    const deleteMethod=await client.db("CRUD").collection("data").deleteOne({_id:new ObjectId(id)});
    res.send(deleteMethod);
});

app.post("/register",async (req, res)=>{
    const {username,email,password} = req.body;
    
    const userfind=await client.db("CRUD").collection("registerdata").findOne({email:email});
    if (!userfind){
    const salt=await bcrypt.genSalt(10);
    const encrypt=await bcrypt.hash(password,salt);
    const registerData = await client.db("CRUD").collection("registerdata").insertOne({name:username,email:email,password:encrypt});
    res.status(201).send(registerData);
    
    }
    else{
        res.status(400).send("user already registerd");
    }
    
    
})
app.post('/login', async(req, res) => {
    const {email,password} = req.body;
    const userfind=await client.db("CRUD").collection("registerdata").findOne({email:email});
    if (userfind){
        const mongopass=userfind.password;
        const check= await bcrypt.compare(password, mongopass);
    if(check){
       const token = jwt.sign({id:userfind._id},"student");
       res.status(200).send({token:token});
    }
    else{
        res.status(400).send({message:"Not a verified user"});
    }
    }
    else{
        res.status(400).send({message:"user not found"});
}
});



app.listen(4001,()=>{
  console.log("Server connected Successfully");
})
