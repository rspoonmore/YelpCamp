var express                = require("express"),
	router                 = express.Router(),
	passport               = require("passport"),
	LocalStrategy          = require("passport-local"),
	passportLocalMongoose  = require("passport-local-mongoose"),
	Campground             = require("../models/campground"),
	Comment                = require("../models/comment"),
	User                   = require("../models/user.js"),
	middleware	           = require("../middleware");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.use((req,res,next) => {
	res.locals.currentUser = req.user;
	next()
})

//////////////////
////AUTH Routes
//////////////////



////REGISTER User Route
router.get("/register", (req,res) =>{
	res.render("users/register");
})

////CREATE User Route
router.post("/register", (req,res) => {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, (err, user) => {
		if(err){
			req.flash("error", err.message);
			res.render("users/register");
		}
		else{
			passport.authenticate("local")(req, res, () => {
				req.flash("success", "Welcome To YelpCamp " + req.body.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

////LOGIN Form Route
router.get("/login", (req,res) => {
	res.render("users/login");
});

////LOGIN Post Route
router.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}), (req,res) => {	
});

////LOGOUT Route
router.get("/logout", (req,res) => {
	req.logout();
	req.flash("success", "Logged You Out");
	res.redirect("/campgrounds");
});

module.exports = router;