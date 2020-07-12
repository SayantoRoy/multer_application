const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const { chdir } = require('process');

//Init App
const app = express();

//Port 
const port = 5000;

//Set Storage Engine
const storeage = multer.diskStorage({
    destination:'./src/public/uploads/',
    filename: function(req , file , cb){
        cb(null , file.fieldname +'-'+ Date.now()+path.extname(file.originalname));
    }
});

//Initialize Upload Var
const upload = multer({
    storage : storeage,
    limits: {fileSize: 10000000} ,
    fileFilter : function(req , file , cb){
        checkFileType(file , cb);
    }
}
).single('myImage');

//Filter File
function checkFileType(file , cb){
    // Whitelist Filter
    const filetypes = /jpeg|jpg|png|gif/;
    //Ext

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    console.log(extname);
    //Mime Type
    const mimetype = filetypes.test(file.mimetype);
    console.log(mimetype);
    if(extname && mimetype){
        return cb( null , true);
    }else{
        cb('Error : Images only');
    }

}

//EJS
app.set('views' , './src/views');
app.set('view engine' , 'ejs');

//Public Folder
app.use(express.static('./src/public'));


//Basic Routes
app.get('/', (req , res ) =>{
    res.render('index');
});

app.post('/upload' , (req , res)=>{
    upload(req , res , (err) => {
        if(err)
        {
            res.render('index' , {
                msg : err
            })
        }
        else{
            
            if(req.file === undefined)
            {
                res.render('index' , {
                    msg : 'Error : Please Select a File'
                });
            }
            else
            {
                res.render('index' , {
                    msg : 'File Successfully Uploaded',
                    file : `/uploads/${req.file.filename}`
                })
            }
        }
    });

})



app.listen(port , ()=>{
    console.log(`Listening on ${port}`);
});