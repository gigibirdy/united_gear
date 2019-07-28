var express = require("express"),
    router = express.Router(),
    Comment = require("../models/comments"),
    Gear = require("../models/gear")
//comments new
router.get("/index/:id/comments/new", isLoggedIn, function(req, res){
  Gear.findById(req.params.id, function(err, foundGear){
    if(err){console.log(err);
    } else{res.render("comments/new", {gear: foundGear});}
  });
});
//comments create
router.post("/index/:id", isLoggedIn, function(req, res){
  Gear.findById(req.params.id, function(err, foundGear){
    if(err) {console.log(err);
    } else {
      Comment.create(req.body.comment, function(err, foundComment){
        if(err){console.log(err);
        } else {
          foundComment.author.id = req.user._id;
          foundComment.author.username = req.user.username;
          foundComment.save();
          foundGear.comments.push(foundComment);
          foundGear.save();
          req.flash("success", "Thank you for your comments.")
          res.redirect("/index/" + foundGear._id);
          }
      });
      }
  });
});

//comments Edit
router.get("/index/:id/comments/:comment_id/edit", doesOwnTheComment, function(req, res){
  Gear.findById(req.params.id, function(err, foundGear){
    if(err) {console.log(err);
  } else {
    Comment.findById(req.params.comment_id,function(err, foundComment){
      if(err) {console.log(err);
    } else {
      res.render("comments/edit", {gear: foundGear, comment: foundComment});
    };
  });
  }
});
});

//comments update
router.put("/index/:id/comments/:comment_id", doesOwnTheComment, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
    if(err){res.redirect("back");
  } else {
    req.flash("success", "You have updated your comments.");
    res.redirect("/index/" + req.params.id);}
});
});

//comments Delete
router.delete("/index/:id/comments/:comment_id", doesOwnTheComment, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){res.redirect("back");
  } else {
    req.flash("success", "You have deleted your comments.");
    res.redirect("/index/" + req.params.id);
}
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

//middleware (check if there is the user is logged in and is the author of the comment)
function doesOwnTheComment (req, res, next){
  if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err) {res.render("back");
    } else {
      if(foundComment.author.id.equals(req.user._id)){
        next();
      } else {res.render("back");
    }
    }
  });
} else {res.redirect("/login");
}
};
module.exports = router;
