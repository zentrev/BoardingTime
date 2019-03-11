var express = require("express");
var pug = require("pug");
var path = require("path");
var route = require("./route.js");
var bodyParser = require("body-parser");
var session = require('express-session');


var app = express();

app.set("view engine", "pug");
app.set("views", __dirname+"/view");
app.use(express.static(path.join(__dirname+"/public")));

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

// app.use(session({
//     secret: 'Working',
//     resave: true,
//     saveUninitialized: false
// }));

app.get("/createPost/:id", route.createPostPage);
app.post("/createPost/:id", urlencodedParser, route.createPost);

app.get("/editPost/:id", route.editPostPage);
app.post("/editPost/:id", urlencodedParser, route.editPost);

app.get("/deletePost/:id", route.deletePost);


app.listen(3000);