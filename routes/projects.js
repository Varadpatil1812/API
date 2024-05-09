const {validate,Project}=require('../models/project');
const express=require('express');
const router=express();

router.get('/',async(req,res)=>{
    try {
        const project = await Project.find(); 
        res.json({ success: true, data: project }); 
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/createProject',async(req,res)=>{
    const {error}=validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let project=await Project.findOne({sr_no: req.body.sr_no});
    if(project) return res.status(400).send("Already exist");

    project=new Project({
        sr_no:req.body.sr_no,
        name:req.body.name,
        altitude:req.body.altitude,
        latitude:req.body.latitude,
        description:req.body.description
    });

    await project.save();

    res.send(project);

});


module.exports=router;