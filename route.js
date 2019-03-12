var mongoose = require("mongoose");
var bCrypt = require("bcrypt-nodejs");
var fs = require('fs');
var http = require('http');

var expressSession = require("express-session");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/data", {
    useNewUrlParser: true
});

var mdb = mongoose.connection;
mdb.on("error", console.error.bind(console, "connection error"));
mdb.once("open", function(callback){

});

var userSchema = mongoose.Schema({
    userName: String,
    password: String,
    isAdmin: String,
    avatar: String,
    email: String,
    age: String,
    postCount: String,
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
                title: "Posting Board",
                post: post.reverse(),
                session: req.session,
                user: JSON.stringify(user)
            });
        });
    });
}

exports.data = function(req,res){
    User.find(function(err, user){
        if(err) return console.error(err);
        Post.find(function(err, post){
            if(err) return console.error(err);
            res.render("data", {
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
    console.log(JSON.parse(fs.readFileSync('public/Face.json', 'utf8')));
    res.render("createUser", {
        title: "Add User",
        face: JSON.parse(fs.readFileSync('public/Face.json', 'utf8'))
    });
}

exports.createUser = function(req,res){
    var user = new User({
        userName: req.body.userName,
        password: req.body.password,
        isAdmin: false,
        avatar: "http://api.adorable.io/avatars/face/" + req.body.eyes +"/"+ req.body.nose + "/" + req.body.mouth +"/" + req.body.color.substring(1),
        email: req.body.email,
        age: req.body.age,
        postCount: 0
    });

    const file = fs.createWriteStream("./public/profiles/" + user.id + ".jpg");
    const request = http.get("http://api.adorable.io/avatars/face/" + req.body.eyes +"/"+ req.body.nose + "/" + req.body.mouth +"/" + req.body.color.substring(1), function(response) {
        response.pipe(file);
    });

    user.avatar = user.id + ".jpg";

    bCrypt.hash(req.body.password, null, null, function(err, hash){
        user.password = hash;

        user.save(function(err, user){
            if(err) return console.error(err);
            console.log(user.userName + " added");
        });
    });
    res.redirect("/index");
}

//EDIT
exports.editUserPage = function(req,res){
    User.findById(req.params.id, function(err, user){
        if(err) return console.error(err);
        res.render("editUser", {
            title: "Edit User",
            user: user,
            session: req.session,
            face: JSON.parse(fs.readFileSync('public/Face.json', 'utf8'))
        });
    });
}

exports.editUser = function(req,res){
    User.findById(req.params.id, function(err, user){
        if(err) return console.error(err);

        //Find user post and change data
        Post.find(
            { ownerID : user.id },
         ).exec(function(err, results) {
            for (var i in results){
                results[i].ownerName = req.body.userName;
                results[i].save(function(err, post){
                    if(err) return console.error(err);
                    console.log(post.date + " Updated");
                });
            }
        });

         const file = fs.WriteStream("./public/profiles/" + user.id + ".jpg");
         const request = http.get("http://api.adorable.io/avatars/face/" + req.body.eyes +"/"+ req.body.nose + "/" + req.body.mouth +"/" + req.body.color.substring(1), function(response) {
             response.pipe(file);
        });
        
        user.userName = req.body.userName;
        user.password = req.body.password;
        user.isAdmin = req.body.isAdmin;
        user.email = req.body.email;
        user.age = req.body.age;
        user.save(function(err, user){
            if(err) return console.error(err);
            console.log(user.userName + " Updated");
        });
    });
    res.redirect("/data");
}

exports.deleteUser = function(req,res){
    console.log(req.params);
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
        res.redirect("/" +  req.params.page);
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
                    userID: account.id,
                    userName: account.userName,
                    isAdmin: account.isAdmin
                };
                res.redirect('/index');
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
    User.findById(req.body.ownerID, function(err, user){
        user.postCount = parseInt(user.postCount) + 1;
        console.log(user.postCount);
        user.save(function(err, user){
            if(err) return console.log(err);
        });

        var post = new Post({
            ownerID: user.id,
            ownerName: user.userName,
            ownerAvatar: user.avatar,
            date: new Date(Date.now()).toLocaleString(),
            message: req.body.message,
        });
        post.save(function(err, post){
            if(err) return console.error(err);
        });
    });

    res.redirect("/index");
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
        if(post.ownerName != "Redacted")
        {
            User.findById(post.ownerID, function(err, user){
                if(err) return console.err(err);
                user.postCount = parseInt(user.postCount) - 1;
                user.save(function(err, user){
                    if(err) console.log(err);
                    console.log(user.postCount);
                });
            });
        }
        res.redirect("/data");
    });
}
   
