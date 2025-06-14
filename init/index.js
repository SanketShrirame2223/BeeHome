const mongoose= require("mongoose");
const initdata = require("./data.js");
const Listing=require("../models/listing.js");

main()
.then(()=>{
  console.log("connection set to DB")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/BeeHome');
}


//empty the collection and add data from a given file
const initDB=async()=>{
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj)=>({...obj, owner:"683874f0d25bc6f94c61db0b"}));
  await Listing.insertMany(initdata.data);
  console.log("data added");
};
initDB()
//thiss