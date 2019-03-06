var mongoose = require("mongoose");
var bCrypt = require("bcrypt-nodejs");
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

exports.loginPage = function(req, res){
        res.render("login", {
            title: "User List",
    });
}

exports.login = function(req, res){
    User.findOne(
        {userName: req.body.userName},
        {password: req.body.password}
        ).exec(function(err, _user){
        if(err) return console.log(err);
        console.log(_user);
        User.findById(_user.id, function(err, user){
            if(err) return console.log(err);
            if(user.userName === req.body.userName && user.password === req.body.password){
                console.log("Logged in");
            }
        })
    });
    res.redirect("/");
}

userSchema.statics.authenticate = function(userName, password, callback){
    User.findOne({userName: userName}).exec(function(err, user){
        if(err) {
            return callback(err)
        }
        else if(!user){
            var err = new Error("User not found");
            err.status = 401;
            return callback(err);
        }
        bCrypt.compare(password, user.password, function(err, result){
            if(result === true){
                return callback(null, user);
            }
            else{
                return callback();
            }
        })
    });
}

userSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
  });