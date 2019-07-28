var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    passport = require("passport")

//root route
router.get("/", function(req, res){
  res.render("gears/landing");
});

//register form route
router.get("/register", function(req, res){
  res.render("register");
});

//sign up logic route
router.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, newUser){
    if(err){req.flash("error", err.message);
            return res.render("register");
    }else {
      passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to United Gear!")
        res.redirect("/index");
      });
    }
  });
});

//show login form
router.get("/login", function(req, res){
  res.render("login");
});

//login logic route
router.post("/login", passport.authenticate("local",
  {
    successRedirect: "/index",
    failurRedirect: "/login"
  }), function(req, res){
});

//(logout logic routes
router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "Your have logged out.")
  res.redirect("/index");
});


module.exports = router;
