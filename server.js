const path = require("path");
const http = require("http");
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, "statics")));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.post("/donor.htm", (req, res) => {
  req.body["latitude"] = parseFloat(req.body["latitude"]);
  req.body["longitude"] = parseFloat(req.body["longitude"]);
  req.body["amount"] = parseFloat(req.body["amount"]);
  console.log(req.body,'from /donor');
  addLocation(req.body);
  res.sendFile("donor.htm", { root: "statics" });
  checkReminder( req.body["latitude"],req.body["longitude"])
});
app.post("/distributors",(req,res)=>{
  console.log("did someone asked something?",req.body)
  let limit=30;
  let latitude=parseFloat( req['body']['lat']);
  let longitude=parseFloat(req['body']['lon'])
  let distance=parseFloat( req['body']["dist"]);
  read(latitude,longitude,distance,sendData)
  function sendData(x) {
    let  xs=x.slice(0,limit-1);
    res.send(xs)
  }
})
app.post("/delete", (req, res) => {
 console.log("delete req for",req["body"]);
 res.send();
 deleteById(req["body"]["id"])
});
app.post("/notify", (req, res) => {
  req.body["latmin"] = parseFloat(req.body["latmin"]);
  req.body["latmax"] = parseFloat(req.body["latmax"]);
  req.body["longmin"] = parseFloat(req.body["longmin"]);
  req.body["longmax"] = parseFloat(req.body["longmax"]);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("freefridge");
    
    dbo.collection("reminder").insertOne(req.body, function (err, res) {
      if (err) throw err;
      console.log("reminder updated",req.body);
      db.close();
    });
  });
  res.send()
 });
 
var MongoClient = require("mongodb").MongoClient;
ObjectID = require("mongodb").ObjectID;
var url =
  "mongodb+srv://lakki:Mproton.25@clusterp.kbs8v.mongodb.net/freefridge?authSource=admin";
function addLocation(locat) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("freefridge");
    dbo.collection("location").insertOne(locat, function (err, res) {
      if (err) throw err;
      console.log("Location updated");
      db.close();
    });
  });
}

function read(latitude, longitude, precisionLength,f=()=>{}) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("freefridge");

    let precisionlat = precisionLength / 111.32;
    precisionLong =precisionLength / ((400075 * Math.cos((latitude * 2 * Math.PI) / 360)) / 360);
    let latmin = latitude - precisionlat;
    let longmin = longitude - precisionLong;
    let latmax = latitude + precisionlat;
    let longmax = longitude + precisionLong;
    console.log(latmin,latmax,longmin,longmax)
    // var query={}
var query={$and:[{latitude:{$gt:latmin}},{latitude:{$lt:latmax}},{longitude:{$gt:longmin}},{longitude:{$lt:longmax}}]};
    dbo.collection("location").find(query).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
        f(result)
      });
  });
}
function deleteById(id) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("freefridge");
    var myquery = { _id: ObjectID(id) };
    dbo.collection("location").deleteOne(myquery, function (err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      db.close();
    });
  });
}
function checkReminder(latdonor,londonor) {
  MongoClient.connect(url,(err,db)=>{
    if (err) throw err;
    let dbo=db.db("freefridge")
    // let query={}
    let query={$and:[{latmin:{$lt:latdonor}},{longmin:{$lt:londonor}},{latmax:{$gt:latdonor}},{longmax:{$gt:londonor}}]};
    dbo.collection("reminder").find(query).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      console.log(typeof(result),'is result type with length',result.length)
      if(result.length>0){
        mail([result[0]['mail']])
       
        //deleting reminder now
        {MongoClient.connect(url, function (err, db) {
          if (err) throw err;
          var dbo = db.db("freefridge");
          var myquery = { _id: ObjectID(result[0]['_id']) };
          dbo.collection("reminder").deleteOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
          });
        });}
        
      console.log('mail fxn is called')
      }
      
    });
  })
}
function mail(reciver) { 
  console.log('mailing to ',reciver)
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'singh.adarsh.dev@gmail.com',
      pass: process.env.GPASS
    }
  });
  
  var mailOptions = {
    from: 'singh.adarsh.dev@gmail.com',
    to: reciver,
    subject: 'Free-fridge:Donor available',
    text: 'Someone is willing to donate their food within Your searched location.visit our website and repeat your search'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// checkReminder(11,11)
// mail({
//   _id: '601f9577226d30135c1333c3',
//   mail: '20bcs048@nith.ac.in',
//   latmin: 10.910168882500898,
//   latmax: 11.089831117499102,
//   longmin: 10.990833268507558,
//   longmax: 11.009166731492442
// })