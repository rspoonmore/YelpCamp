var express                = require("express"),
	router                 = express.Router(),
	Campground             = require("../models/campground.js"),
	Comment                = require("../models/comment.js"),
	User                   = require("../models/user.js"),
	middleware	           = require("../middleware");

router.use((req,res,next) => {
	res.locals.currentUser = req.user;
	next()
})

//////////////////
////AUTH Routes
//////////////////


////INDEX Route
router.get("/", (req,res)=>{
	Campground.find({}, (err,campgrounds) =>{
		if(err){
			req.flash("error", "Could Not Find Any Campgrounds");
			res.redirect("back");
		}
		else{
			res.render("campgrounds/index", {campgrounds: campgrounds});
		}
	});
});

////NEW Route
router.get("/new", middleware.isLoggedIn, (req,res) => {
    res.render("campgrounds/new");
});

////CREATE Route
router.post("/", middleware.isLoggedIn, (req,res) =>{
	var newCampground = new Campground(req.body.Campground);
	var author = {id: req.user._id, username: req.user.username};
	newCampground.createdUser = author;
    Campground.create(newCampground, (err,newCG) => {
		if(err){
			req.flash("error", "We Could Not Create This Campground At This Time");
			res.redirect("back");
		}
		else{
			req.flash("success", "New Campground Created");
			res.redirect("/campgrounds");
		}
	});
});

////SHOW Route
router.get("/:id", (req,res) =>{
	Campground.findById(req.params.id).populate("comments").exec((err, foundCG) =>{
		if(err){
			req.flash("error", "We Could Not Find That Campground");
			res.redirect("back");
		}
		else {
			res.render("campgrounds/show", {campground: foundCG})
		}
	});
})


////EDIT Route
router.get("/:id/edit", middleware.checkCampgroundOwner, (req,res) =>{
	Campground.findById(req.params.id, (err, campground) => {
		if(err){
			req.flash("error", "We Could Not Find That Campground");
			res.redirect("back");
		}
		else {
			res.render("campgrounds/edit", {campground: campground});
		}
	})
});

////UPDATE Route
router.put("/:id", middleware.checkCampgroundOwner, (req,res) => {
	Campground.findByIdAndUpdate(req.params.id, req.body.Campground, (err, campground) => {
		req.flash("success","Campground Successfully Updated");
		res.redirect("/campgrounds/"+req.params.id);
	});
});

////DESTROY Route
router.delete("/:id", middleware.checkCampgroundOwner, (req,res) => {
	
	Campground.findById(req.params.id, (err, campground) => {
		if(err) {
			req.flash("error", "We Could Not Find That Campground It Was Not Deleted");
			res.redirect("back");
		}
		else{
			if (campground.comments.length > 0) {
				campground.comments.forEach((comment) => {
					Comment.findByIdAndRemove(comment._id, (err) => {
						if(err){
							req.flash("error", "We Could Not Find The Comments For This Campground. It Was Not Deleted");
							res.redirect("back");
						}
					})
				})
			}
		}
	});
	Campground.findByIdAndRemove(req.params.id, (err) => {
		req.flash("success","Campground Has Been Deleted");
		res.redirect("/campgrounds");
	});
});

module.exports = router;