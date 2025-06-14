const express=require("express");
const router = express.Router();
const wrapAsync= require("../Utilities/wrapasync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware..js");
const listingController = require("../controller/c-listing.js");
const multer  = require('multer');
const {storage}= require("../cloudConfig.js");
const upload = multer({storage}) ;//to set multer storage loaction

router.route("/")
.get(wrapAsync(listingController.index)
)
.post(isLoggedIn,upload.single('listing[image]'),validateListing,
   wrapAsync(listingController.createListing)
 );

 
 //New Route
 router.get("/new",isLoggedIn, listingController.renderNewFOrm);


 router.route("/:id")
 .get(wrapAsync(listingController.showListing)
 )
 .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,
   wrapAsync( listingController.updateListing)
)
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing)
 );

 
    
 

 
  
 
 
  
 
 
 //Edit Route
 
 router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editListing)
 );
 
 
 

  
 module.exports = router;