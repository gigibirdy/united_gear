var dotenv = require("dotenv").config();
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  session = require("express-session"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  flash = require("connect-flash"),
  Gear = require("./models/gear"),
  Comment = require("./models/comments"),
  User = require("./models/user")

var indexRoutes = require("./routes/indexRoutes"),
    gearRoutes = require("./routes/gearRoutes"),
    commentRoutes = require("./routes/commentRoutes")

mongoose.connect("mongodb://localhost/united_gear", { useNewUrlParser: true, useFindAndModify: false });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
//passport configration
app.use(session({
  secret: "This is a secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
//requiring routes
app.use(indexRoutes);
app.use(gearRoutes);
app.use(commentRoutes);

app.listen(3001, function(){
  console.log("hello");
});
