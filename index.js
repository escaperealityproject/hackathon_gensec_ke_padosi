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
    // society: String,
    category: {
        tech: Boolean,
        economics: Boolean,
        cultural: Boolean,
        literary: Boolean
    },
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
    password: String,
    // intrests: {
    tech: Boolean,
    economics: Boolean,
    literary: Boolean,
    cultural: Boolean
    // }
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

//TEST--------------------------------------------------------------------------------------------
//
// passport.use(new LocalStrategy(new LocalStrategy({
//         usernameField: username,
//         passwordField: password,
//         passReqToCallback: true
//
//     },
//     function(username, password, done) {
//         // ...
//
//         // set the user's credentials
//         newUser.username = req.body.username;
//         newUser.rollNo = req.body.rollNo;
//         newUser.password = newUser.generateHash(password);
//
//         // ....
//
//     }
// )));

//TEST--------------------------------------------------------------------------------------------

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
    console.log(req.user);
    res.render("landing");
});

// REGISTER

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    req.body.option = req.body.option.map(item => (Array.isArray(item) && item[1]) || false);
    console.log(req.body);
    var tech, economics, cultural, literary;
    if (req.body.option[0] == false)
        tech = false;
    else
        tech = true;
    if (req.body.option[1] == false)
        economics = false;
    else
        economics = true;
    if (req.body.option[2] == false)
        literary = false;
    else
        literary = true;
    if (req.body.option[3] == false)
        cultural = false;
    else
        cultural = true;


    var newUser = new User({
        username: req.body.username,
        rollNo: req.body.rollNo,
        // interests: {
        tech: tech,
        economics: economics,
        literary: literary,
        cultural: cultural
        // }
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

app.post("/login", passport.authenticate("local", {
    successRedirect: "/user/",
    faliureRedirect: "/login"
}), function(req, res) {});

// LOGOUT
// app.post("/logout", function(req, res) {
//     req.logout();
//     console.log("Logged out Succesfully");
//     res.redirect("/");
// });

app.get("/logout", function(req, res) {
    req.logout();
    console.log("Logged out Succesfully");
    res.redirect("/");
});

// NEW BLOG

app.get("/blogs/new", function(req, res) {
    res.render('newBlog');
});
app.get("/blogs", function(req, res) {

    // BLOG

    Blog.find({}, function(err, blogs) {
        res.render('blog', {
            blogs: blogs
        });
    })
});

app.post("/blogs", function(req, res) {
    req.body.option = req.body.option.map(item => (Array.isArray(item) && item[1]) || false);
    console.log(req.body);
    var tech, economics, cultural, literary;
    if (req.body.option[0] == false)
        tech = false;
    else
        tech = true;
    if (req.body.option[1] == false)
        economics = false;
    else
        economics = true;
    if (req.body.option[2] == false)
        literary = false;
    else
        literary = true;
    if (req.body.option[3] == false)
        cultural = false;
    else
        cultural = true;


    Blog.create({
        society: req.body.society,
        title: req.body.title,
        hero_image: req.body.image,
        body: req.body.body,
        category: {
            tech: tech,
            economics: economics,
            literary: literary,
            cultural: cultural
        },
        up: 0
    }, function(err, newBlog) {
        if (err) {
            console.log("Error"),
                res.send('Error');
        } else {
            res.redirect("/");
        }
    });
});

// USER PAGE

app.get("/user", function(req, res) {
    if (req.user) {
        Blog.find({}, function(err, blogs) {
            res.render('user', {
                blogs: blogs,
                user: req.user
            });
        })
    } else {
        res.redirect("/login");
    }

});
// Society PAGE

app.get("/society/:name", function(req, res) {
    Blog.find({
        society: req.params.name
    }, function(err, blogs) {
        res.render('society', {
            blogs: blogs,
        });
    })
});

// app.get("/user/:id", function(req, res) {
//
//     res.render('user');
//     // User.findById(req.params.id, function(err, user) {
//     //     if (err)
//     //         console.log("Error at user page");
//     //     else
//     //         res.send("Name of user is" + req.user.rollNo);
//     //
//     // })
// })

// function find(req) {
//     if (req.user.tech == true && req.user.cultural == false)
//         Blog.find({
//             'category.tech': true
//         }, function(err, data) {
//             return data;
//         });
//     if (req.user.tech == false && req.user.cultural == true)
//         Blog.find({
//             'category.cultural': true
//         }, function(err, data) {
//             return data;
//         });
//     if (req.user.tech == true && req.user.cultural == true)
//         Blog.find({
//             $or: [{
//                 'category.tech': true
//             }, {
//                 'category.cultural': true
//             }]
//         }, function(err, data) {
//             return data;
//         });
//     if (req.user.tech == false && req.user.cultural == false)
//         Blog.find({
//             $or: [{
//                 'category.tech': false
//             }, {
//                 'category.cultural': false
//             }]
//         }, function(err, data) {
//             return data;
//         });
// }
//

// -----------------
// SERVER INITIALIZATION
// -----------------

app.listen(3000, function() {
    console.log("Server is Running");
    setInterval(function() {
        console.log("Server is Running");
    }, 5000);
});