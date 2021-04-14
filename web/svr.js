/*const http = require('http');
const app = http.createServer(function(req, res){
    res.setHeader('Content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);

    let dataObj = {id: 123 , name:'Bob', email: 'bob@work.org'};
    let data = JSON.stringify(dataObj);
    res.end(data);
});


app.listen(8080, function(){
    console.log('Ahoj, tak to funguje');
});*/


const express = require('express');
const http = require('http');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './views/pages/',
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
})

const upload = multer({
    storage: storage
}).single('m_image');



app.use(bodyParser.urlencoded({extended:true}));


const dateFormat = require('dateformat');
const now = new Date();

app.set('view engine', 'ejs');
app.use(express.static('./views/pages/'));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "PEpa1997_1997",
    
})

con.connect(function(err){
    if (err) throw err;
    console.log('Connected');
})

con.query("CREATE schema IF NOT EXISTS woof;", function(err, result){
    if (err) throw err;
    console.log('Created');
})

let query = " CREATE TABLE IF NOT EXISTS woof.males (";
query +=  "m_id int NOT NULL AUTO_INCREMENT, ";
query +=   "m_email varchar(255) NOT NULL, ";
query +=  "m_dog_name VARCHAR(255), ";
query +=  "m_start_date date, ";
query +=   "m_end_date date, "
query +=  "m_desc varchar(3000), ";
query +=  "m_fname VARCHAR(255), ";
query +=  "m_lname VARCHAR(255), ";
query +=  "m_location VARCHAR(200), ";
query +=  "m_fb VARCHAR(5000), ";
query +=   "m_image text, ";
query +=   "m_password VARCHAR(45), ";
query +=   "m_addtime DATETIME, ";
query +=  "PRIMARY KEY (m_id));";


con.query(query, function(err, result){
    if (err) throw err;
    console.log('Created males');
})
let query1 = " CREATE TABLE IF NOT EXISTS woof.females (";
query1 +=  "f_id int NOT NULL AUTO_INCREMENT, ";
query1 +=   "f_email varchar(255) NOT NULL, ";
query1 +=  "f_dog_name VARCHAR(255), ";
query1 +=  "f_start_date date, ";
query1 +=   "f_end_date date, "
query1 +=  "f_desc varchar(3000), ";
query1 +=  "f_fname VARCHAR(255), ";
query1 +=  "f_lname VARCHAR(255), ";
query1 +=  "f_location VARCHAR(200), ";
query1 +=  "f_fb VARCHAR(5000), ";
query1 +=   "m_image text, ";
query1 +=   "f_password VARCHAR(45), ";
query1 +=   "f_addtime DATETIME, ";
query1 +=  "PRIMARY KEY (f_id));";

con.query(query1, function(err, result){
    if (err) throw err;
    console.log('Created females');
})


const siteTitle = 'WOOF';
const baseURL = 'http://localhost:8080/male';
const femaleURL = 'http://localhost:8080/female';
const addURL = 'http://localhost:8080/event/edit/:id';



app.get('/', function(req, res){
 
    res.render('pages/coursework')
 
})




// PAGE WITH DATABASE of males
app.get('/male', function(req, res){
    
    con.query('SELECT * FROM woof.males ORDER BY m_id DESC', function(err,result){

        
      
        res.render('pages/index',{
            siteTitle: siteTitle,
            pageTitle: 'Event list',
            items: result
        })
    
    })

})

// PAGE WITH DATABASE of females
app.get('/female', function(req, res){
    con.query('SELECT * FROM woof.females ORDER BY f_id DESC', function(err,result){

        
      
        res.render('pages/female',{
            siteTitle: siteTitle,
            pageTitle: 'Event list',
            items: result
        })
    
    })
})

app.get('/female/:id', function(req, res){
    upload(req, res, function(err){
        if (err) throw err;
    con.query("SELECT * FROM woof.females WHERE (f_id = "+req.params.id+");", function(err,result){
        if (result == undefined){
            res.render('pages/error');
        }else if(result[0] == undefined){
            res.render('pages/error');
                
        }else{
                result[0].f_start_date = dateFormat(result[0].f_start_date, "yyyy-mm-dd");
        result[0].f_end_date = dateFormat(result[0].f_end_date, "yyyy-mm-dd");
         
       
            res.render('pages/female-profile',{
                siteTitle: siteTitle,
                pageTitle: "Editing event : " + result[0].f_dog_name,
                item: result
            }) 
        } 
    })
})
})

app.get('/male/:id', function(req, res){
    upload(req, res, function(err){
        if (err) throw err;
    con.query("SELECT * FROM woof.males WHERE (m_id = "+req.params.id+");", function(err,result){
        if (result == undefined){
            res.render('pages/error');
        }else if(result[0] == undefined){
            res.render('pages/error');
                
        }else{
                result[0].m_start_date = dateFormat(result[0].m_start_date, "yyyy-mm-dd");
        result[0].m_end_date = dateFormat(result[0].m_end_date, "yyyy-mm-dd");
         
       
            res.render('pages/male-profile',{
                siteTitle: siteTitle,
                pageTitle: "Editing event : " + result[0].m_dog_name,
                item: result
            }) 
        } 
    })
})
})


//PAGE FOR ADDING A DOG (GET METHOD)
app.get('/event/add/male', function(req, res){
    con.query('SELECT * FROM woof.males ORDER BY m_start_date DESC', function(err,result){
      
        res.render('pages/add-event.ejs',{
            siteTitle: siteTitle,
            pageTitle: 'Event list',
            items: ''
       })
    })
})

app.get('/event/add/female', function(req, res){
    con.query('SELECT * FROM woof.females ORDER BY f_start_date DESC', function(err,result){
      
        res.render('pages/add-female.ejs',{
            siteTitle: siteTitle,
            pageTitle: 'Event list',
            items: ''
       })
    })
})


/*app.get('/event/:a', function(req, res){
     if(req.params.a !== 'add')
        res.render('pages/error');
    
})*/


//PAGE FOR ADDING A DOG (POST METHOD)
app.post('/event/add/male', function(req, res){
        upload(req, res, function(err){
            if (err) throw err;
            
        let picture =  (req.file === undefined) ? "'notimage.png', " : "'"+req.file.originalname+"',";

    let query = "INSERT INTO woof.males (m_email,m_dog_name,m_start_date,m_end_date,m_addtime,m_desc,m_location,m_image,m_fb,m_password) VALUES(";  
        query += "'"+req.body.m_email+"',";
        query += "'"+req.body.m_dog_name+"',";
        query += "'"+dateFormat(req.body.m_start_date,"yyyy-mm-dd") +"',";
        query += "'"+dateFormat(req.body.m_end_date,"yyyy-mm-dd") +"',";
        query += "'"+dateFormat(now,"yyyy-mm-dd") +"',";
        query += ""+JSON.stringify(req.body.m_desc)+",";
        query += ""+JSON.stringify(req.body.m_location)+",";
        query += picture;
        query += ""+JSON.stringify(req.body.m_fb)+", ";
        query += "'"+req.body.m_password+"')";
        
        con.query(query, function(err, result){
            if(err) throw err;
            res.redirect(baseURL);
        })
    }) 
})

//PAGE FOR ADDING A DOG (POST METHOD)
app.post('/event/add/female', function(req, res){
    upload(req, res, function(err){
        if (err) throw err;
        
    let picture =  (req.file === undefined) ? "'notimage.png', " : "'"+req.file.originalname+"',";

let query = "INSERT INTO woof.females (f_email,f_dog_name,f_start_date,f_end_date,f_addtime,f_desc,f_location,m_image,f_fb,f_password) VALUES(";  
    query += "'"+req.body.f_email+"',";
    query += "'"+req.body.f_dog_name+"',";
    query += "'"+dateFormat(req.body.f_start_date,"yyyy-mm-dd") +"',";
    query += "'"+dateFormat(req.body.f_end_date,"yyyy-mm-dd") +"',";
    query += "'"+dateFormat(now,"yyyy-mm-dd") +"',";
    query += ""+JSON.stringify(req.body.f_desc)+",";
    query += ""+JSON.stringify(req.body.f_location)+",";
    query += picture;
    query += ""+JSON.stringify(req.body.f_fb)+",";
    query += "'"+req.body.f_password+"')";
    
    con.query(query, function(err, result){
        if(err) throw err;
        res.redirect(femaleURL);
    })
}) 
})

//PAGE FOR EDIT PROFILE (GET METHOD)
app.get('/event/edit/male/:id', function(req, res){
    upload(req, res, function(err){
        if (err) throw err;
    con.query("SELECT * FROM woof.males WHERE (m_id = "+req.params.id+");", function(err,result){
        if (result == undefined){
            res.render('pages/error');
        }else if(result[0] == undefined){
            res.render('pages/error');
                
        }else{
                result[0].m_start_date = dateFormat(result[0].m_start_date, "yyyy-mm-dd");
        result[0].m_end_date = dateFormat(result[0].m_end_date, "yyyy-mm-dd");
         
       
            res.render('pages/edit-event',{
                siteTitle: siteTitle,
                pageTitle: "Editing event : " + result[0].m_dog_name,
                item: result
            }) 
        } 
    })
})
})

//PAGE FOR EDIT PROFILE (GET METHOD)
app.get('/event/edit/female/:id', function(req, res){
    upload(req, res, function(err){
        if (err) throw err;
    con.query("SELECT * FROM woof.females WHERE (f_id = "+req.params.id+");", function(err,result){
        if (result == undefined){
            res.render('pages/error');
        }else if(result[0] == undefined){
            res.render('pages/error');
                
        }else{
                result[0].f_start_date = dateFormat(result[0].f_start_date, "yyyy-mm-dd");
        result[0].f_end_date = dateFormat(result[0].f_end_date, "yyyy-mm-dd");
         
       
            res.render('pages/edit-female',{
                siteTitle: siteTitle,
                pageTitle: "Editing event : " + result[0].f_dog_name,
                item: result
            }) 
        } 
    })
})
})

//PAGE FOR EDIT PROFILE (POST METHOD)
app.post('/event/edit/male/:id', function(req, res){
    

    let query = "UPDATE woof.males SET "; 
        query += "m_email = '"+req.body.m_email+"', "; 
        query += "m_dog_name = '"+req.body.m_dog_name+"', ";
        query += "m_start_date = '"+dateFormat(req.body.m_start_date,"yyyy-mm-dd") +"' ,";
        query += "m_end_date = '"+dateFormat(req.body.m_end_date,"yyyy-mm-dd") +"' ,";
        query += "m_location = "+JSON.stringify(req.body.m_location)+", ";
        query += "m_fb = "+JSON.stringify(req.body.m_fb)+", ";
        query += "m_desc = "+JSON.stringify(req.body.m_desc)+", ";
        query += "m_password = '"+req.body.m_password+"' "; 
        query += "WHERE (m_id = "+req.params.id+");";
        
        con.query(query, function(err, result){
            if(err) throw err;
            res.redirect (baseURL);
        })
    
})

//PAGE FOR EDIT PROFILE (POST METHOD)
app.post('/event/edit/female/:id', function(req, res){
    

    let query = "UPDATE woof.females SET "; 
        query += "f_email = '"+req.body.f_email+"', "; 
        query += "f_dog_name = '"+req.body.f_dog_name+"', ";
        query += "f_start_date = '"+dateFormat(req.body.f_start_date,"yyyy-mm-dd") +"' ,";
        query += "f_end_date = '"+dateFormat(req.body.f_end_date,"yyyy-mm-dd") +"' ,";
        query += "f_location = "+JSON.stringify(req.body.f_location)+", ";
        query += "f_fb = "+JSON.stringify(req.body.f_fb)+", ";
        query += "f_desc = "+JSON.stringify(req.body.f_desc)+", ";
        query += "f_password = '"+req.body.f_password+"' "; 
        query += "WHERE (f_id = "+req.params.id+");";
        
        con.query(query, function(err, result){
            if(err) throw err;
            res.redirect ('http://localhost:8080/female/'+req.params.id+'');
        })
    
})

//FUNCTION FOR DELETE PROFILE (GET METHOD)
app.get('/event/delete/male/:id', function(req,res){
     con.query("DELETE FROM woof.males WHERE (m_id = "+req.params.id+");", function(err, result){
         if (err) throw err;
         res.redirect (baseURL);
     })
})

//FUNCTION FOR DELETE PROFILE (GET METHOD)
app.get('/event/delete/female/:id', function(req,res){
    con.query("DELETE FROM woof.females WHERE (f_id = "+req.params.id+");", function(err, result){
        if (err) throw err;
        res.redirect (femaleURL);
    })
})
//PAGE FOR CHANGE PHOTO (GET METHOD)
app.get('/event/change/male/:id', function(req, res){


    con.query("SELECT * FROM woof.males WHERE (m_id = "+req.params.id+");", function(err,result){
    res.render('pages/change-picture',{
        siteTitle: siteTitle,
        pageTitle: "Editing event : " + result[0].m_dog_name,
        item: result
    })
    console.log(req.params.id);
  })
})

//PAGE FOR CHANGE PHOTO (GET METHOD)
app.get('/event/change/female/:id', function(req, res){


    con.query("SELECT * FROM woof.females WHERE (f_id = "+req.params.id+");", function(err,result){
    res.render('pages/change-female',{
        siteTitle: siteTitle,
        pageTitle: "Editing event : " + result[0].f_dog_name,
        item: result
    })
    console.log(req.params.id);
  })
})


//PAGE FOR CHANGE PHOTO (POST METHOD)
app.post('/event/change/male/:id', function(req, res){
    upload(req, res, function(err){
        if (err) throw err;

        let picture =  (req.file === undefined) ? "'notimage.png' " : "'"+req.file.originalname+"'";

let query = "UPDATE woof.males SET ";  
    query += "m_image = "+picture+" ";
    query += "WHERE (m_id = "+req.params.id+");";
    
    con.query(query, function(err, result){
        if(err) throw err;
        res.redirect('http://localhost:8080/event/edit/male/'+req.params.id+'');
        
    })
    
})
})

//PAGE FOR CHANGE PHOTO (POST METHOD)
app.post('/event/change/female/:id', function(req, res){
    upload(req, res, function(err){
        if (err) throw err;

        let picture =  (req.file === undefined) ? "'notimage.png' " : "'"+req.file.originalname+"'";

let query = "UPDATE woof.females SET ";  
    query += "m_image = "+picture+" ";
    query += "WHERE (f_id = "+req.params.id+");";
    
    con.query(query, function(err, result){
        if(err) throw err;
        res.redirect('http://localhost:8080/event/edit/female/'+req.params.id+'');
        
    })
    
})
})

app.get('/login/male/:id', function (req,res){

 con.query("SELECT * FROM woof.males WHERE (m_id = "+req.params.id+");", function(err, result){

 if (err) throw err;
 console.log(result)
 res.render('pages/male-login', {
    message: '',
    item: result
     })
 })
})

app.post('/login/male/:id', function(req, res){

    con.query("SELECT * FROM woof.males WHERE (m_id = "+req.params.id+");", function(err, result){

    if(req.body.m_password === req.body.m_password1){
       res.redirect('http://localhost:8080/event/edit/male/'+req.params.id+'')
    }else {
        res.render('pages/male-login',{
            message: 'Password is not correct',
            item: result
             })
    }
})
})

app.get('/login/female/:id', function (req,res){

    con.query("SELECT * FROM woof.females WHERE (f_id = "+req.params.id+");", function(err, result){
   
    if (err) throw err;
    console.log(result)
    res.render('pages/female-login', {
       message: '',
       item: result
        })
    })
   })
   
   app.post('/login/female/:id', function(req, res){
   
       con.query("SELECT * FROM woof.females WHERE (f_id = "+req.params.id+");", function(err, result){
   
       if(req.body.f_password === req.body.f_password1){
          res.redirect('http://localhost:8080/event/edit/female/'+req.params.id+'')
       }else {
           res.render('pages/female-login',{
               message: 'Password is not correct',
               item: result
                })
       }
   })
   })


app.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.status(400);
    res.status(500);
    res.sendFile(__dirname + '/views/pages/error.ejs')
})
//PORT
app.listen(8080, function(){
    console.log('App start');
});