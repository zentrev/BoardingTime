var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/data", {
    useNewUrlParser: true
});

var mdb = mongoose.connection;
mdb.on("error", console.error.bind(console, "connection error"));
mdb.once("open", function(callback){

});

var personSchema = mongoose.Schema({
    name: String,
    age: String,
    species: String
});

var userSchema = mongoose.Schema({
    userName: String,
    password: String,
    isAdmin: String,
    avatar: String,
    email: String,
    age: String,
});

var PostSchema = mongoose.Schema({
    owner: String,
    date: String,
    message: String,
});

var User = mongoose.model("Users", userSchema);
var Post = mongoose.model("Post", PostSchema);

exports.index = function(req,res){
    User.find(function(err, user){
        if(err) return console.error(err);
        res.render("index", {
            title: "User List",
            user: user
        });
    });
}

//CREATE
exports.createUserPage = function(req,res){
    res.render("createUser", {
        title: "Add User"
    });
}

exports.createUser = function(req,res){
    var user = new User({
        userName: req.body.userName,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
        avatar: req.body.avatar,
        email: req.body.email,
        age: req.body.age,
    });
    user.save(function(err, user){
        if(err) return console.error(err);
        console.log(user.userName + " added");
    });
    res.redirect("/");
}

//EDIT
exports.editUserPage = function(req,res){
    User.findById(req.params.id, function(err, user){
        if(err) return console.error(err);
        res.render("editUser", {
            title: "Edit User",
            user: user,
        });
    });
}

exports.editUser = function(req,res){
    User.findById(req.params.id, function(err, user){
        if(err) return console.error(err);
        user.userName = req.body.userName;
        user.password = req.body.password;
        user.isAdmin = req.body.isAdmin;
        user.avatar = req.body.avatar;
        user.email = req.body.email;
        user.age = req.body.age;
        user.save(function(err, person){
            if(err) return console.error(err);
            console.log(user.userName + " Updated");
        });
    });
    res.redirect("/");
}

exports.deleteUser = function(req,res){
    User.findByIdAndRemove(req.params.id, function(err, user){
        if(err) return console.error(err);
        res.redirect("/");
    });
}

exports.login = function(req, res){
    res.render("login", {
        title: "User List",
    });
}

exports.loginUser = function(req, res){
    User.findById(req.params.id, function(err, user){
        
    });
}