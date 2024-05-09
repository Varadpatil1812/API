const mongoose=require('mongoose');
const Joi=require('joi');

const attendanceSchema=new mongoose.Schema({
    // project_name:{
    //     type:String,
    //     required:true
    // },
    worker_name:{
        type:String,
        required:true
    },
    project_name:{
        type:String,
        required:true
    },
    date: {
        type: String,
        default: function() {
            const date = new Date();
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
    },
    time: {
        type: String,
        default: function() {
            const date = new Date();
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        }
    },
    type: {
        type: String,
        enum: ['in', 'out'],
        required: true
    }
});

const Attendance= mongoose.model('Attendance',attendanceSchema);

exports.Attendance=Attendance;