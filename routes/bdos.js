require('dotenv').config()
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const {BDO, validate}=require('../models/bdo');
const express=require('express');
const router=express()

router.post('/signup',async(req,res)=>{
    const {error}=validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let bdo=await BDO.findOne({email: req.body.email});
    if(bdo) return res.status(400).send("Already registered");

    bdo=new BDO({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    });
    const salt=await bcrypt.genSalt(10);
    bdo.password=await bcrypt.hash(bdo.password,salt);
    await bdo.save();

    
    res.send(bdo);

});

router.post('/signin',async(req,res)=>{
    const {error}=validateLog(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const bdo=await BDO.findOne({email: req.body.email});
    if(!bdo) return res.status(400).send("Invalid credentials");

    const validPass=await bcrypt.compare(req.body.password, bdo.password);
    if(!validPass) return res.status(400).send("Invalid credentials");


    res.send(true);

});

function validateLog(bdo){
    const schema=Joi.object({
        email:Joi.string().max(255).required().email(),
        password:Joi.string().max(100).required()
    });

    return schema.validate(bdo)
}


module.exports=router;