const Listing = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken }); //start service

module.exports.index = async(req,res)=>{
   const allListings=await Listing.find({}); 
   res.render("listing/index.ejs",{allListings})
   }

   module.exports.renderNewFOrm = (req, res) => {
  
   res.render("listing/new.ejs");
 };

 module.exports.showListing = async(req,res)=>{
    let {id}=req.params;

    const listing = await Listing.findById(id).populate({path:"reviews", populate:{path:"author"}}).populate("owner");
    
    if(!listing){
   req.flash("error","Listing does not exist!");

    }

    res.render("listing/show.ejs", {listing})
   };

   module.exports.createListing = async (req, res,next) => {

   let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send();

    let url = req.file.path;
    let filename = req.file.filename;
 const newListing = new Listing(req.body.listing);  //to make new listing
 newListing.owner =req.user._id   ; //pasport by default saves the data
 newListing.image = {url,filename};
 newListing.geometry =response.body.features[0].geometry;

   let savedListing = await newListing.save();
   console.log(savedListing);
   req.flash("success","New Listing Created!");
   res.redirect("/listings");
   };

   module.exports.editListing = async (req, res) => {
   let { id } = req.params;
   const listing = await Listing.findById(id);
   let originalImageUrl=listing.image.url;
originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
   res.render("listing/edit.ejs", { listing, originalImageUrl });
 };

 module.exports.updateListing = async (req, res) => {
   
   
  let { id } = req.params;

    // Update the listing with new data
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
if(typeof req.file !== "undefined"){
     let url = req.file.path;
    let filename = req.file.filename;
    listing.image={url,filename};
    await listing.save(); 
  
  }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  };

  module.exports.destroyListing = async (req, res) => {
   let { id } = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success","Listing Deleted!");

   res.redirect("/listings");
 };