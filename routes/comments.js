var express = require("express");
// Merge campground and comment parameters
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Render new comment form
router.get("/new", middleware.isLoggedIn, (req, res) => {
  // Get campground data and send it to template
  Campground.findById(req.params.id, (err, campground) => {
      if(err || !campground) {
        console.log(err);
        req.flash("error", "Campground not found");
        res.redirect("/campgrounds");
      } else {
        res.render("comments/new", {campground: campground});
      }
  });
});

// Create a new comment
router.post("/", middleware.isLoggedIn, (req, res) => {
  // Ensure campground exists
  Campground.findById(req.params.id, (err, campground) => {
      if(err) {
        console.log(err);
        req.flash("error", "Campground not found");
        req.redirect("/campgrounds");
      } else {
        Comment.create(req.body.comment, (err, comment) => {
          if(err) {
            req.flash("error", "Something went wrong");
            console.log(err);
          } else {
            // Add username and id to comment
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;

            // Save comment
            comment.save();

            // Add comment to campground
            campground.comments.push(comment);
            campground.save();
            req.flash("success", "Successfully added comment");
            res.redirect("/campgrounds/" + campground._id);
          }
        })
      }
  });
});

// Show form for editing comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
  // User is logged in and owns comment
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if(err) {
      res.redirect("/campgrounds/" + req.params.id);
    } else {
      res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
    }
  })
});

// Update comment with given data
router.put("/:comment_id", middleware.checkCommentOwnership, (req,res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if(err) {
      res.redirect("/campgrounds/" + req.params.id);
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// Delete a comment
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if(err) {
      res.redirect("/campgrounds" + req.params.id);
    } else {
      req.flash("success", "Comment successfully deleted");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;
