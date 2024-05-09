const {Worker}=require('./models/worker');
const faceapi=require('face-api.js');
const canvas=require('canvas');

async function loadModels(){
    await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname+"/ml_models");
    await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname+"/ml_models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname+"/ml_models");
}

loadModels();

async function uploadLabeledImages(images){
    try{
        let counter=0;
        const descriptions=[];
        for(let i=0;i<images.length;i++){
            const img=await canvas.loadImage(images[i]);
            counter=(i/images.length)*100;
            console.log(`Progress=${counter}%`);
            const detections=await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            descriptions.push(detections.descriptor);
        }

        

        return descriptions;
    }catch(err){
        console.log(err);
        return false;
    }
}

async function getdescriptorsFromDB(image,id){
    let faces=await Worker.findById(id);
    // for(let i=0;i<faces.length;i++){
    //     for(let j=0;j<faces[i].descriptions.length;j++){
    //         faces[i].descriptions[j]=new Float32Array(Object.values(faces[i].descriptions[j]));
    //     }

    //     faces[i]= new faceapi.LabeledFaceDescriptors(faces[i].username,faces[i].descriptions);
    // }
    for(let j=0;j<faces.descriptions.length;j++){
        faces.descriptions[j]=new Float32Array(Object.values(faces.descriptions[j]));
    }
    faces= new faceapi.LabeledFaceDescriptors(faces.username,faces.descriptions);

    const faceMatcher=new faceapi.FaceMatcher(faces,0.6);

    const img=await canvas.loadImage(image);
    let temp=faceapi.createCanvasFromMedia(img);

    const displaySize={width: img.width, height: img.height};
    faceapi.matchDimensions(temp,displaySize);


    const detections= await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    const resizeDetections= faceapi.resizeResults(detections, displaySize);
    const results=resizeDetections.map((d)=> faceMatcher.findBestMatch(d.descriptor));
    return results;
}


exports.uploadLabeledImages=uploadLabeledImages;
exports.getdescriptorsFromDB=getdescriptorsFromDB;

