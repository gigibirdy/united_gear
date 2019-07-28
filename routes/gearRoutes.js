var express = require("express"),
    router = express.Router(),
    multer = require("multer");
    storage = multer.diskStorage({
      filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname);
      }
    });
    imageFilter = function(req, file, cb){
      if(!file.originalname.match(/\.(jpeg|jpg|png|gif)$/i)){
        return cb(new Error('This website accpets jpeg, jpg, png or gif image files only.'), false);
      }
      cb(null, true);
    };
    upload = multer({storage: storage, fileFilter: imageFilter});
    cloudinary = require("cloudinary");
    cloudinary.config({
      cloud_name: '',
      api_key: '',
      api_secret: ''
    });
    Gear = require("../models/gear")

//index route
router.get("/index", function(req, res){
  Gear.find({}, function(err, allGears){
    if(err) {
      console.log(err);
    } else {res.render("gears/index", {gears: allGears});
  }
});
});

//new route
router.get("/index/new", isLoggedIn, function(req, res){
  res.render("gears/new");
});

//create route
router.post("/index", isLoggedIn, upload.single('img'), function(req, res){
  cloudinary.uploader.upload(req.file.path, function(result){
  var newBrand = req.body.brand;
  var newImg = result.secure_url;
  var newGen = req.body.gender;
  var newSize = req.body.size;
  var newCondition = req.body.condition;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var shipVia = req.body.shipVia;
  var location = req.body.location;
  var newGear = {brand: newBrand, img: newImg, gender: newGen, size: newSize, condition: newCondition, author: author, shipVia: shipVia, location: location};
  Gear.create(newGear, function(err, newlyCreated){
    if(err){console.log(err);
    } else {
      req.flash("success", "Awesome! You have created a new gear.");
      res.redirect("/index");}
    });
  });
});
//show route
router.get("/index/:id", function(req, res){
  Gear.findById(req.params.id).populate("comments").exec(function(err, foundGear){
    if(err){console.log(err);
    } else {res.render("gears/show", {gear: foundGear});
  }
  });
});

//edit route
router.get("/index/:id/edit", doesOwnTheGear, function(req, res){
  Gear.findById(req.params.id, function(err, foundGear){
    if(err){res.redirect("/index/" + foundGear._id);
  } else {
    res.render("gears/edit", {gear: foundGear});}
  });
});


//update route
router.put("/index/:id", doesOwnTheGear, function(req, res){
  Gear.findByIdAndUpdate(req.params.id, req.body.gear, function(err, foundGear){
    if(err) {res.redirect("/index");
  } else {
    req.flash("success", "You have updated your gear.");
    res.redirect("/index/" + req.params.id);
  }
  });
});

//Delete
router.delete("/index/:id", doesOwnTheGear, function(req, res){
  Gear.findByIdAndRemove(req.params.id, function(err){
    if (err){res.redirect("/index");
  } else {
    req.flash("success", "You have deleted your gear.");
    res.redirect("/index");}
});
});
//middleware
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    next();
  } else {
    req.flash("error", "Please login");
    res.redirect("/login");}
};

function doesOwnTheGear(req, res, next){
    if(req.isAuthenticated()){
      Gear.findById(req.params.id, function(err, foundGear){
      if(err) {
        res.redirect("back");
      } else {
        if(foundGear.author.id.equals(req.user._id)){
          next();
        } else {res.redirect("/login");
        }
      }
      });
    } else {res.redirect("/login");}
};

//Like Route
router.post("/index/:id/like", isLoggedIn, function (req, res) {
    Gear.findById(req.params.id, function (err, foundGear) {
        if (err) {
            console.log(err);
            return res.redirect("/index");
        }
        var foundUserLike = foundGear.likes.some(function (like) {
            return like.equals(req.user._id);
        });
        if (foundUserLike) {
            foundGear.likes.pull(req.user._id);
        } else {
            foundGear.likes.push(req.user);
        }
        foundGear.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/index");
            }
            return res.redirect("/index/" + foundGear._id);
        });
    });
});

//middleware (check if the user is logged in)
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  } else {
    req.flash("error", "Please login");
    res.redirect("/login");}
};

module.exports = router;
