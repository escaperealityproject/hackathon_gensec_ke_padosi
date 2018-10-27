var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose');


// -----------------
// APP CONFIG
// -----------------

mongoose.connect("mongodb://localhost/ccs_oct_18_hack");

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));

// -----------------
// MONGOOSE BLOG CONFIG
// -----------------

var blogSchema = new mongoose.Schema({
    society: String,
    title: String,
    hero_image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
})
var Blog = mongoose.model("Blog", blogSchema);

// -----------------
// MONGOOSE USER CONFIG
// -----------------

var UserSchema = new mongoose.Schema({
    username: String,
    rollno: Number,
    password: String
});

UserSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User", UserSchema);

// -----------------
// PASSPORT CONFIG
// -----------------

app.use(require("express-session")({
    secret: "Gensec ke padosi",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/admin");
};

// -----------------
// ROUTES
// -----------------

app.get("/", function(req, res) {
    res.send("landing page is working");
});
app.get("/login", function(req, res) {
    res.send("login page is working");
});
app.get("/register", function(req, res) {
    res.send("Register page is working");
});
app.get("/logout", function(req, res) {
    res.send("logout page is working");
});




// -----------------
// SERVER INITIALIZATION
// -----------------

app.listen(3000, function() {
    console.log("Server is Running");
    setInterval(function() {
        console.log("Server is Running");
    }, 5000);
});