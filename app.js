const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const { chdir } = require('process');
const fs = require('fs');
const directory = './src/public/uploads';
const pth = '/uploads';
const bodyParser = require('body-parser');


let dirBuf = Buffer.from(directory);

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

//Body Parser
app.use(bodyParser({extended:false}));


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
    
    //Mime Type
    const mimetype = filetypes.test(file.mimetype);
    
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
app.get('/users' , (req ,res) =>{
    res.render('users');
})
.post('/users' , (req ,res)=>{
    console.log(req.body);
    let {user} = req.body;
    fs.mkdir(`${directory}/${user}`, function(err) {
        if (err) {
          console.log("There is an error")
        } else {
          console.log("New directory successfully created.")
        }
      });
    res.redirect('/upload');
})



app.get('/dashboard', (req , res ) =>{
    fs.readdir(dirBuf , (err , files)=>{
        var files = files.reverse();
        if(err)
        {
            res.render('dasboard' , {
                msg : 'Error : Files errors'
            });
        }
        else
        {
            res.render('dashboard' , {
                files,
                path : pth
            });
        }
    })
});

app.get('/upload' , (req , res) =>{
    res.render('index');
})

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
                    file : `${pth}/${req.file.filename}`
                })
            }
        }
    });

})



app.get('/dashboard/:id' , (req , res )=>{
    const {id } = req.params;
    res.render('imageView' , {
        path : pth,
        file : id
    })
});

app.get('/delete/:id' , (req,res)=>{
    const {id} = req.params;
    
    fs.unlinkSync(`${directory}/${id}`);

    res.redirect('/dashboard');

   
});


app.listen(port , ()=>{
    console.log(`Listening on ${port}`);
});