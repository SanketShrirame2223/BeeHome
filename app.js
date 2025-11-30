if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./Utilities/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratagy = require("passport-local");
const User = require("./models/user.js");
const MongoStore = require("connect-mongo"); //for session on mongo
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["self"],
        scriptSrc: [
          "self",
          "unsafe-inline",
          "unsafe-eval",
          "https://api.mapbox.com",
          "https://cdnjs.cloudflare.com",
          "blob:"
        ],
        styleSrc: [
          "self",
          "unsafe-inline",
          "https://api.mapbox.com",
          "https://fonts.googleapis.com"
        ],
        imgSrc: [
          "self",
          "data:",
          "blob:",
          "https://api.mapbox.com",
          "https://events.mapbox.com"
        ],
        connectSrc: [
          "self",
          "https://api.mapbox.com",
          "https://*.tiles.mapbox.com",
          "https://events.mapbox.com"
        ],
        fontSrc: ["self", "https:", "data:"],
        objectSrc: ["none"],
        workerSrc: ["self", "blob:"],  // ✅ allow Web Workers
        childSrc: ["self", "blob:"],   // ✅ fallback for old browsers
        baseUri: ["self"],
        frameAncestors: ["none"]
      },
    },
  })
);



//routing
const listingRouter = require("./routes/r-listing.js");
const reviewRouter = require("./routes/r-review.js");
const userRouter = require("./routes/r-user.js");

app.set("view engine", "ejs"); //for ejs
app.set("views", path.join(__dirname, "views")); //for view folder
app.use(express.urlencoded({ extended: true })); //to pars data
app.use(methodOverride("_method")); //for method-override
app.engine("ejs", ejsMate); //for ejs-mate
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connection set to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("error in mongo session store", err);
});

// for session
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in mili sec
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //for security
  },
};

app.use(session(sessionOptions)); // check cookie connect.sid if present session is working
app.use(flash());

app.use(passport.initialize()); //passport
app.use(passport.session()); //passport
passport.use(new LocalStratagy(User.authenticate())); //to login or signup user //passport-local

passport.serializeUser(User.serializeUser()); //passport-local  - to store info of user into session
passport.deserializeUser(User.deserializeUser()); //passport-local - to unstore info of user from seassion

// middleware for local store for flash and user
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// //demo user
// app.get("/demouser",async(req,res)=>{
// let fakeUser = new User({
//   email:"stuaadent",
//   username:"aaaa"
// });
// let registeredUser = await User.register(fakeUser, "helloworld") ; //helloworld is password
// res.send(registeredUser);
// })

app.use("/listings", listingRouter); //listing route
app.use("/listings/:id/reviews", reviewRouter); //review route
app.use("/", userRouter);

// //home route
// app.get("/",(req,res)=>{
//   res.send("done")
// });

//404 route
app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

//Error route
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("listening....");
});

//add data maunally

// app.get("/testListing",async (req,res)=>{
// let sampleListing= new Listing({
//   title:"My home",
//   description:"by the beach",
//   price:1200,
//   location:"pune",
//   country:"India"
// })
// await sampleListing.save();
// console.log("done");
// res.send("doneeeee");

// })
