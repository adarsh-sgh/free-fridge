const path = require("path");
const http = require("http");
const express = require("express");

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
    precisionLong =
      precisionLength / ((400075 * Math.cos((latitude * 2 * Math.PI) / 360)) / 360);
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
