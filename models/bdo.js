const mongoose=require('mongoose');
const Joi=require('joi');
const passwordcomplexity=require('joi-password-complexity');

const bdoSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxlength:255
    },
    email:{
        type:String,
        required:true,
        maxlength:255,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        maxlength:100
    }
});

const BDO=mongoose.model('BDO',bdoSchema);

const complexityOptions={
    min:8,
    max:100,
    numeric:1,
    Symbol:1
}

function validateBDO(bdo){
    const schema=Joi.object({
        name:Joi.string().max(255).required(),
        email:Joi.string().max(255).required().email(),
        password:passwordcomplexity(complexityOptions)
    });

    return schema.validate(bdo)
}

exports.BDO=BDO;
exports.validate=validateBDO;