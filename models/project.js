require('dotenv').config();
const mongoose=require('mongoose');
const Joi=require('joi');


const projectSchema=new mongoose.Schema({
    sr_no:{
        type:Number,
        required:true,
        unique: true
    },
    name:{
        type:String,
        required:true
    },
    altitude:{
        type:Number,
        required:true
    },
    latitude:{
        type:Number,
        required:true
    },
    description:{
        type:String
    }
});


const Project= mongoose.model('Project',projectSchema);

function validateProject(proj){
    const schema=Joi.object({
        sr_no:Joi.number().required(),
        name:Joi.string().required(),
        altitude:Joi.number().required(),
        latitude:Joi.number().required(),
        description: Joi.string()
    });

    return schema.validate(proj);
}

exports.projectSchema=projectSchema;
exports.Project=Project;
exports.validate=validateProject;
