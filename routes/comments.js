var express                = require("express"),
	router                 = express.Router({mergeParams: true}),
	Campground             = require("../models/campground"),
	Comment                = require("../models/comment"),
	User                   = require("../models/user.js"),
	middleware	           = require("../middleware");

//////////////////
////COMMENT Routes
//////////////////

////NEW Comment Route
router.get("/new", middleware.isLoggedIn, (req,res) => {
	Campground.findById(req.params.id, (err, cg) =>{
		if(err){
			req.flash("error","We Cannot Find That Campground");
			res.redirect("back");
		}
		else {
			res.render("comments/new", {campground: cg});
		}
	})
});

////CREATE Comments Route
router.post("/", middleware.isLoggedIn, (req,res) => {
	Campground.findById(req.params.id, (err, cg) =>{
		if(err){
			req.flash("error","We Cannot Find That Campground");
			res.redirect("back");
		}
		else {
			Comment.create(req.body.comment, (err, newComment) =>{
				if(err){
					req.flash("error","We Cannot Create That Comment At This Time");
					res.redirect("back");
				}
				else{
					newComment.author.id = req.user._id;
					newComment.author.username = req.user.username;
					newComment.save();
					cg.comments.push(newComment);
					cg.save();
					req.flash("success", "Comment Created");
					res.redirect("/campgrounds/" + cg._id);
				}
			});
		}
	});
});


////EDIT Route
router.get("/:commentID/edit", middleware.checkCommentOwner, (req,res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if(err){
			req.flash("error","We Cannot Find That Campground");
			res.redirect("back");
		}
		else{
			Comment.findById(req.params.commentID, (err, comment) => {
				if(err){
					req.flash("error","We Cannot Find That Comment");
					res.redirect("back");
				}
				else {
					res.render("comments/edit", {campground: campground, comment: comment});
				}
			});
		}
	});
});


////Update Route
router.put("/:commentID", middleware.checkCommentOwner, (req,res) => {
	Comment.findByIdAndUpdate(req.params.commentID, req.body.comment, (err, comment) => {
		if(err){
			req.flash("error","We Cannot Find That Comment. It Was Not Updated");
			res.redirect("back");
		}
		else {
			req.flash("success", "Comment Updated");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


////Destroy Route
router.delete("/:commentID", middleware.checkCommentOwner, (req,res) => {
	Comment.findByIdAndRemove(req.params.commentID, (err) => {
		if(err){
			req.flash("error","We Cannot Find That Comment. It Was Not Deleted");
			res.redirect("back");
		}
		else {
			req.flash("success","Comment Deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

module.exports = router;
