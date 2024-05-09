const {Attendance}=require('../models/attendance');
const express=require('express');
const router=express();

router.get('/',async(req,res)=>{
    try {
        const attendance = await Attendance.find().select('-_id'); 
        res.json({ success: true, data: attendance }); 
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports=router;