var middlewareObj = {},
	Campground    = require("../models/campground.js"),
	Comment       = require("../models/comment.js"),
	User          = require("../models/user.js");

middlewareObj.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You Need To Be Logged In To Do That");
	res.redirect("/login");
}

middlewareObj.checkCampgroundOwner = (req, res, next) => {
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err, campground) => {
			if(err){
				req.flash("error", "Campground Not Found");
				res.redirect("back");
			}
			else{
				if(campground.createdUser.id.equals(req.user._id)){
					next()
				}
				else{
					req.flash("error", "You Do Not Have Permission To Do That");
					res.redirect("back");
				}
			}
		});
	}
	else {
		req.flash("error", "You Need To Be Logged In To Do That");
		res.redirect("back");
	}
};


middlewareObj.checkCommentOwner = (req, res, next) => {
	if(req.isAuthenticated()){
		Comment.findById(req.params.commentID, (err,comment) => {
			if(err){
				res.redirect("back");
			}
			else{
				if(comment.author.id.equals(req.user._id)){
					next()
				}
				else{
					res.redirect("back");
				}
			}
		});
	}
	else {
		res.redirect("back");
	}
};

module.exports = middlewareObj