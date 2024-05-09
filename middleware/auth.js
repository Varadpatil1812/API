require('dotenv').config();
const jwt=require('jsonwebtoken');

module.exports=function (req,res,next){
    const token=req.header('auth-token');
    if(!token) return res.status(401).send('Acess denied');

    try{
        const decoded=jwt.verify(token,process.env.jwtPrivateKey);
        req.user=decoded;
        next();
    }catch(ex){
        res.status(400).send('Inavalid token.');
    }
}