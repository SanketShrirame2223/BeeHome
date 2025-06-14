const express=require("express");
const router = express.Router({mergeParams:true}); //to send params from parent to child mergeparams is set to true
const wrapAsync= require("../Utilities/wrapasync.js");
const ExpressError = require("../Utilities/expressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware..js")
const reviewController = require("../controller/c-review.js")





// Add Reviews
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.addReview));

//Delete route For Review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview
));


module.exports = router;