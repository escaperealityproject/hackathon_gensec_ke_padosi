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
    up: Number,
    // category: {
    //     tech: boolean,
    //     echonomics: boolean
    // },
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
    rollNo: Number,
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
    res.redirect("/login");
};

// -----------------
// ROUTES
// -----------------


// LANDING

app.get("/", function(req, res) {
    res.send("landing page is working");
});

// REGISTER

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username,
        rollNo: req.body.rollNo
    });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.send("error");
        }
        passport.authenticate("login")(req, res, function() {
            console.log("Registered Succesfully");
            res.redirect("/");
        })
    })
});

//LOGIN
app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/logout", function(req, res) {
    req.logout();
    console.log("Logged out Succesfully");
    res.redirect("/blogs");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    faliureRedirect: "/login"
}), function(req, res) {});

// LOGOUT
app.get("/logout", function(req, res) {
    res.send("logout page is working");
});

// NEW BLOG

app.get("/blogs/new", function(req, res) {
    res.render('newBlog');
});

app.post("/blogs", function(req, res) {
    Blog.create({
        title: req.body.title,
        hero_image: req.body.image,
        body: req.body.body
    }, function(err, newBlog) {
        if (err) {
            console.log("Error"),
                res.redirect('/admin/blogs/new');
        } else {
            res.redirect("/blogs/" + newBlog._id);
        }
    });
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