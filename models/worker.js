require('dotenv').config();
const jwt=require('jsonwebtoken');
const mongoose=require('mongoose');
const Joi=require('joi');

const workerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxlength:255
    },
    username:{
        type:String
    },
    w_id:{
        type:Number,
        required:true,
        unique:true
    },
    mobileNumber:{
        type:Number,
        required:true,
        minlength:10,
        maxlength:12,
        unique:true
    },
    birth_date:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        maxlength:100
    },
    address:{
        type:String,
        required:true,
    },
    aadharNo:{
        type:Number,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    descriptions:{
        type:Array,
        required:true
    },
    project: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project'
    }
});

workerSchema.methods.genAuthToken=function(){
    const token=jwt.sign({_id: this._id},process.env.jwtPrivateKey);
    return token;
}

const Worker=mongoose.model('Worker',workerSchema);



function validateWorker(worker){
    const schema=Joi.object({
        name:Joi.string().max(255).required(),
        w_id:Joi.number().required(),
        mobileNumber:Joi.number().required(),
        birth_date:Joi.string().required(),
        address:Joi.string().required(),
        aadharNo:Joi.number().required(),
        gender:Joi.required()
    });

    return schema.validate(worker)
}

exports.Worker=Worker;
exports.validate=validateWorker;