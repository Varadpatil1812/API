require('dotenv').config();
const auth=require('../middleware/auth');
const Joi=require('joi');
const client = require('twilio')(process.env.accountSid,process.env.twilioToken);
const {uploadLabeledImages,getdescriptorsFromDB}= require('../faceFunc');
const bcrypt=require('bcrypt');

const mongoose=require('mongoose');
const {Worker, validate}=require('../models/worker');
const {Attendance}=require('../models/attendance');
const express=require('express');
const router=express()
const cors=require('cors');
router.use(cors());

router.get('/all',async(req,res)=>{
    try {
        const workers = await Worker.find().select('_id w_id name mobileNumber address'); 
        res.json({ success: true, data: workers }); 
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/me',auth,async(req,res)=>{ 
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
        return res.status(400).json({ success: false, message: 'Invalid ObjectId' });
    }
    const worker = await Worker   
        .findById(req.user._id)
        .select('-_id -project -descriptions');

    if(!worker) return res.status(404).send("no user found"); 

    res.send(worker);
});

router.post('/signup',async(req,res)=>{ 
    const {error}=validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let worker=await Worker.findOne({mobileNumber: req.body.mobileNumber});
    if(worker) {
        res.json({message:"Already Registered"});
    }

    const username = generateUsername();
    const password = generatePassword();
    const mobileNumber=req.body.mobileNumber;

    const File1=req.files.File1.tempFilePath;
    const File2=req.files.File2.tempFilePath;
    const File3=req.files.File3.tempFilePath;

    let descriptions= await uploadLabeledImages([File1,File2,File3]);
    if(!descriptions){
        res.json({message:"Something went wrong"});
    }

    worker=new Worker({
        name:req.body.name,
        username:username,
        w_id:req.body.w_id,
        mobileNumber:mobileNumber,
        password:password,
        aadharNo:req.body.aadharNo,
        birth_date:req.body.birth_date,
        address:req.body.address,
        gender:req.body.gender,
        descriptions:descriptions
    });
    const salt=await bcrypt.genSalt(10);
    worker.password=await bcrypt.hash(worker.password,salt);
    // await worker.save();

    worker.save()
        .catch((err) => console.error(err.message))
        .then(()=>{
            client.messages
                .create({
                    body: `
                    Thank You For Registration,
                    Welcome to Shramik,
                    Your Credentials Are:Your username: ${username}, Password: ${password}`,
                    from: '+19183022379',
                    to: mobileNumber
                })
                .then(message => {
                    console.log(message.sid);
                    res.status(200).json({success:true ,message: 'Username and Password sent to mobile number' });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ success:false ,message: 'Failed to send SMS' });
                });
        });

});
router.post("/check-face", auth, async (req, res) => {
    try {
        const worker = await Worker.findById(req.user._id).populate('project');
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        if (!worker.project) {
            return res.status(400).json({ success: false, message: 'Worker has no project assigned' });
        }

        const File1 = req.files.File1.tempFilePath;
        let result = await getdescriptorsFromDB(File1, req.user._id);

        const threshold = 0.6;

        if (result[0]._distance < threshold) {
            // Fetch the last attendance record for this worker
            const lastAttendance = await Attendance.findOne({ worker_name: worker.name }).sort({ _id: -1 });

            // Set the type based on the last attendance type
            let type = 'in';
            if (lastAttendance) {
                type = lastAttendance.type === 'in' ? 'out' : 'in';
            }

            const attendance = new Attendance({
                worker_name: worker.name,
                project_name: worker.project.name,
                type: type
            });

            await attendance.save();
        } else {
            return res.json({ success: false, result });
        }

        res.json({ success: true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/signin',async(req,res)=>{
    const {error}=validateLog(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const worker=await Worker.findOne({username: req.body.username});
    if(!worker) return res.status(400).send("Invalid credentials");

    const validPass=await bcrypt.compare(req.body.password, worker.password);
    if(!validPass) return res.status(400).send("Invalid credentials");

    const token=worker.genAuthToken();

    res.header('auth-token',token).send(true);

});

router.put('/addproject', async (req, res) => {
    const { workerId, projectId } = req.body; 
    try {
      
        if (!mongoose.Types.ObjectId.isValid(workerId) || !mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ success: false, message: 'Invalid ObjectId' });
        }

        const worker = await Worker.findById(workerId);
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        if (worker.project) {
            return res.status(400).json({ success: false, message: 'Worker already has a project assigned' });
        }
      
        const updatedWorker = await Worker.findByIdAndUpdate(workerId, { project: projectId }, { new: true });
  
        res.json({ success: true, message: 'worker added' });
  
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/project',auth,async(req,res)=>{
    const worker = await Worker
        .findById(req.user._id)
        .populate('project','-_id')
        .select('-_id project');

    if (!worker.project) {
        return res.status(400).json({ success: false, message: 'Worker does not have project'});
    }

    res.json({ success: true, data: worker});
});

function validateLog(worker){
    const schema=Joi.object({
        username:Joi.string().max(255).required(),
        password:Joi.string().max(100).required()
    });

    return schema.validate(worker);
}

function generateUsername() {
    const numbers = '0123456789';
    
    let username = 'User';
    // Append random numbers of length 4
    for (let i = 0; i < 4; i++) {
        username += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return username;
}

function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    let password = '';
    
    for (let i = 0; i < 4; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    password += '@';
    
    for (let i = 0; i < 3; i++) {
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return password;
}


module.exports=router;
