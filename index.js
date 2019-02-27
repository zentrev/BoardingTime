var express = require("express");
var pug = require("pug");
var path = require("path");
var route = require("./route.js");
var bodyParser = require("body-parser");

var app = express();

app.set("view engine", "pug");
app.set("views", __dirname+"/view");
app.use(express.static(path.join(__dirname+"/public")));

var urlencodedParser = bodyParser.urlencoded({
    extended: true
})

app.get("/", route.index);

app.get("/create", route.create);
app.post("/create", urlencodedParser, route.createUser);

app.get("/edit/:id", route.edit);
app.post("/edit/:id", urlencodedParser, route.editUser);

app.get("/delete/:id", route.delete);

app.listen(3000);