var mongoose = require("mongoose");
var bCrypt = require("bcrypt-nodejs");
var expressSession = require("express-session");
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
var User = mongoose.model("Users", userSchema);

var postSchema = mongoose.Schema({
    ownerID: String,
    ownerName: String,
    ownerAvatar: String,
    date: String,
    message: String,
});

var Post = mongoose.model("Post", postSchema);

function GetUser(id)
{
    return User.findById(id);
}

exports.index = function(req,res){
    console.log(req.session);

    User.find(function(err, user){
        if(err) return console.error(err);
        Post.find(function(err, post){
            if(err) return console.error(err);
            res.render("index", {
                title: "Database",
                user: user,
                post: post,
                session: req.session
            });
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
    bCrypt.hash(req.body.password, null, null, function(err, hash){
        user.password = hash;

        user.save(function(err, user){
            if(err) return console.error(err);
            console.log(user.userName + " added");
        });
    });
    res.redirect("/");
}

function ComparePassword(pass, hash){
    bCrypt.compare(pass, hash, function(err, res){
        console.log(pass, hash);
    });
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

        //Find user post and change data
        Post.find(
            { ownerID : user.id }
         ).exec(function(err, results) {
            for (var i in results){
                results[i].ownerName = req.body.userName;
                results[i].ownerAvatar = req.body.avatar;
                results[i].save(function(err, post){
                    if(err) return console.error(err);
                    console.log(post.date + " Updated");
                });
            }
        });
        
        user.userName = req.body.userName;
        user.password = req.body.password;
        user.isAdmin = req.body.isAdmin;
        user.avatar = req.body.avatar;
        user.email = req.body.email;
        user.age = req.body.age;
        user.save(function(err, user){
            if(err) return console.error(err);
            console.log(user.userName + " Updated");
        });
    });
    res.redirect("/");
}

exports.deleteUser = function(req,res){
    User.findById(req.params.id, function(err, user){
        if(err) return console.error(err);

        //Find user post and change data
        Post.find(
            { ownerID : user.id }
        ).exec(function(err, results) {
            for (var i in results){
                results[i].ownerName = "Redacted";
                results[i].ownerAvatar = "RedactedAvi";
                results[i].save(function(err, post){
                    if(err) return console.error(err);
                    console.log(post.date + " Updated");
                });
            }
        });
    });

    User.findByIdAndRemove(req.params.id, function(err, user){
        if(err) return console.error(err);
        res.redirect("/");
    });
}


exports.checkAuth = function(req, res, next) {
    if(req.session.user && req.session.user.isAuthenticated){
        console.log(req.session);
        next();
    }else{
        res.redirect('/');
    }
}

exports.loginPage = function(req, res){
        res.render("login", {
            title: "User List",
    });
}

exports.login = (req, res) =>{
    let tryLogin = {
        username:req.body.username,
        pass:req.body.password
    };
    User.findOne({userName: req.body.userName}, function(err, account){
        console.log(account);
        if(err) return console.log(err);
        if(account != null){
            let pHash = account.password;
            console.log("Here");
            if(bCrypt.compareSync(req.body.password, pHash)){
                console.log("login");
                req.session.user={
                    isAuthenticated: true,
                    userID: account.userID,
                    username: account.userName,
                    isAdmin: account.isAdmin
                };
                res.redirect('/private');
            }
            else{
                res.render('login',{
                    title: "Login",
                    errorMessage:"Invalid Password",
                    username:req.session.username
                });
            }
        }
       else{
        res.render('login',{
            title: "Login",
            errorMessage:"Account Not Found",
            username:req.session.username
        });
       }
    });
}


exports.createPostPage = function(req,res){
    User.findById(req.params.id, function(err, user){
        if(err) return console.error(err);
        res.render("createPost", {
            title: "Create Post",
            user: user,
        });
    });
}

exports.createPost = function(req,res){
    var post = new Post({
        ownerID: req.body.ownerID,
        ownerName: req.body.ownerName,
        ownerAvatar: req.body.ownerAvatar,
        date: req.body.date,
        message: req.body.message,
    });
    post.save(function(err, post){
        if(err) return console.error(err);
        console.log(GetUser(post.owner).userName + " Post");
    });
    res.redirect("/");
}

exports.editPostPage = function(req,res){
    Post.findById(req.params.id, function(err, post){
        if(err) return console.error(err);
        res.render("editPost", {
            title: "Edit Post",
            post: post,
        });
    });
}

exports.editPost = function(req,res){
    Post.findById(req.params.id, function(err, post){
        if(err) return console.error(err);
        post.ownerID = req.body.ownerID;
        post.ownerName = req.body.ownerName;
        post.ownerAvatar = req.body.ownerAvatar;
        post.date = req.body.date;
        post.message = req.body.message;
        
        post.save(function(err, post){
            if(err) return console.error(err);
            console.log(post.date + " Updated");
        });
    });
    res.redirect("/");
}

exports.deletePost = function(req,res){
    Post.findByIdAndRemove(req.params.id, function(err, post){
        if(err) return console.error(err);
        res.redirect("/");
    });
}
   
