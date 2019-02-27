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

var Person = mongoose.model("People_Collection", personSchema);

exports.index = function(req,res){
    Person.find(function(err, person){
        if(err) return console.error(err);
        res.render("index", {
            title: "People List",
            people: person
        });
    });
}

//CREATE
exports.create = function(req,res){
    res.render("create", {
        title: "Add Person"
    });
}

exports.createPerson = function(req,res){
    var person = new Person({
        name: req.body.name,
        age: req.body.age,
        species: req.body.species
    });
    person.save(function(err, person){
        if(err) return console.error(err);
        console.log(person.name + " added");
    });
    res.redirect("/");
}

//EDIT
exports.edit = function(req,res){
    Person.findById(req.params.id, function(err, person){
        if(err) return console.error(err);
        res.render("edit", {
            title: "Edit Person",
            person: person,
        });
    });
}

exports.editPerson = function(req,res){
    Person.findById(req.params.id, function(err, person){
        if(err) return console.error(err);
        person.name = req.body.name;
        person.age = req.body.age;
        person.species = req.body.species;
        person.save(function(err, person){
            if(err) return console.error(err);
            console.log(person.name + " Updated");
        });
    });
    res.redirect("/");
}

exports.delete = function(req,res){
    Person.findByIdAndRemove(req.params.id, function(err,person){
        if(err) return console.error(err);
        res.redirect("/");
    });
}