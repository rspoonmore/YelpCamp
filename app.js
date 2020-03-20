var express                = require("express"),
	app                    = express(),
	flash                  = require("connect-flash"),
	bodyParser             = require("body-parser"),
	mongoose               = require("mongoose"),
	passport               = require("passport"),
	LocalStrategy          = require("passport-local"),
	passportLocalMongoose  = require("passport-local-mongoose"),
	methodOverride         = require("method-override"),
	Campground             = require("./models/campground"),
	Comment                = require("./models/comment"),
	User                   = require("./models/user.js"),
	seedDB                 = require("./seeds.js");

// Add Routes
var commentRoutes    = require("./routes/comments.js"),
	campgroundRoutes = require("./routes/campgrounds.js"),
	userRoutes       = require("./routes/index.js");

mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost/yelpcamp", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
	secret: "This user is now authorized to interact with the site",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
	res.locals.currentUser = req.user;
	res.locals.errorMessage = req.flash("error");
	res.locals.successMessage = req.flash("success");
	next()
})

// seedDB();

Campground.find({}, (err, cgs) => {
	if(err){
		console.log("Error finding Campgrounds: " + err);
	}
	else {
		console.log("Campgrounds Loaded");
	}
})



app.get("/", (req,res) => {
    res.render("homepage");
});

//Require Routes
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(userRoutes);


app.listen(process.env.PORT || 3000, process.env.IP, () =>{
    console.log("YelpCamp is listening");
});