var one = {};
var two = {};
var three = {};
var four = {};

one.storename = "PetCo";
one.location = "Greenwich Village";
one.products = ["cat food", "dog food","toys"];

two.storename = "Kitten Kitech";
two.location = "Greenwich Village";
two.products = ["cat food"];

three.storename = "PetCo";
three.location = "Chelsea";
three.products = ["dog food","toys"];

four.storename = "City Pups";
four.location = "Chelsea";
four.products = ["toys"];

var allInfo = [one, two, three, four];

var dbName = 'pet';
var collName = 'ny';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient; // npm install mongodb


// //!!!!!get things into database--------------
// MongoClient.connect(url, function(err, db) {
//     if (err) {return console.dir(err);}
//     //I created a document called "meetings" inside the "aameetings" database
//     var collection = db.collection(collName);

//     // put the meetings data we have into the database
//     // collection.insert(finalObject);
    
//     // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
//     for (var i=0; i < allInfo.length; i++) {
//         collection.insert(allInfo[i]);
//         console.log((i + 1) + '/' + allInfo.length);
//     }
//     db.close();
// });

//!!!!!get stuff out--------------
MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    var collection = db.collection(collName);


    collection.aggregate(
        [
            ////grouping by location
            { $group : { _id : "$location" , storename: { $push : "$storename"}, products: { $push: "$products"}}},
            ////grouping by store
            { $group : { _id : "$storename", location: { $push : "$_id"}, products: { $push: "$products"}}}
            // { $unwind : "$product" }
        ]
    ).toArray(function(err, docs) {
        
        if (err) {console.log(err)}
        
        else {
            console.log(JSON.stringify(docs));
        }
        db.close();
        
    });

}); //MongoClient.connect