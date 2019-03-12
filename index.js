var express = require("express");
var pug = require("pug");
var path = require("path");
var route = require("./route.js");
var bodyParser = require("body-parser");
var expressSession = require('express-session');
var bCrypt = require("bcrypt-nodejs");


var app = express();

app.set("view engine", "pug");
app.set("views", __dirname+"/view");
app.use(express.static(path.join(__dirname+"/public")));

app.use(expressSession({
    secret: 'Working',
    saveUninitialized: false,
    resave: true,
    cookie: { secure: false }
}));

var urlencodedParser = bodyParser.urlencoded({
    extended: true
});


app.get("/", route.index);
app.get("/index", route.index);

app.get("/data", route.data);

app.get("/createUser", route.createUserPage);
app.post("/createUser", urlencodedParser, route.createUser);

app.get("/editUser/:id", route.editUserPage);
app.post("/editUser/:id", urlencodedParser, route.editUser);

app.get("/deleteUser/:page-:id", route.deleteUser);

app.get("/login", route.loginPage)
app.post("/login", urlencodedParser, route.login);

app.get("/private", route.checkAuth, function(req, res){
    res.render('private');
  });

app.get('/logout', function(req, res){
  req.session.destroy(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect('/');
    }
  });
});

app.get("/createPost/:id", route.createPostPage);
app.post("/createPost/:id", urlencodedParser, route.createPost);

app.get("/editPost/:id", route.editPostPage);
app.post("/editPost/:id", urlencodedParser, route.editPost);

app.get("/deletePost/:page-:id", route.deletePost);


app.listen(3000);