// Define Dependencies
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

// Config the dotenv
dotenv.config();


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_STRING, {
    useNewURLParser: true,
    useUnifiedTopology: true
})


// Define App
const app = express();

// User Model
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    goals: [{
        title: String,
        description: String,
        date: Date,
        completed: Boolean
    }]
});

// Model the User Schema
const User = mongoose.model('User', UserSchema);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Home Route
app.get('/', function(req, res) {
    res.json({"Welcome":"to the Goals API"});
});

// User Registration
app.post('/api/signUp', (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            res.json(err);
        } else {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err) {
                    res.json(err);
                } else {
                    User.create({
                        email: req.body.email,
                        password: hash,
                        goals: []
                    });
                    res.json({"msg":"User Created"});
                }
            })
        };
    });
});

// User Login
app.post('/api/login', (req, res) => {
    User.findOne({ "email": req.body.email }, (err, userFromDB) => {
        if (err) {
            res.json(err);
        } else {
            if (userFromDB) {
                bcrypt.compare(req.body.password, userFromDB.password, (err, response) => {
                   if (err) {
                       res.json(err);
                   } else {
                       res.json(response);
                   }
                });
            } else {
                res.json({"msg": "User not found"});
            }
        };
    });
});

// Add Goal
app.post('/api/addGoal/:email', function(req, res) {
    User.findOne({ "email": req.params.email }, (err, userFromDB) => {
        if (err) {
            res.json(err);
        } else {
            userFromDB['goals'].push({
                title: req.body.title,
                description: req.body.description,
                date: Date.now(),
                completed: false
            });
            userFromDB.save();
            res.json({"msg": "Goal Added"});
        }
    });
});

// Get All Goals
app.get('/api/getGoals/:email', function(req, res) {
    User.findOne({ "email": req.params.email }, (err, userFromDB) => {
        if (err) {
            res.json(err);
        } else {
            res.json(userFromDB.goals);
        }
    });
});

// Get One Goal
app.get('/getOneGoal/:email/:goalId', function(req, res) {
    User.findOne({ "email": req.params.email }, function(err, userFromDB) {
        if (err) {
            res.json(err);
        } else {
            res.json(userFromDB.goals[req.params.goalId]);
        };
    });
});

// Update Goal
app.put('/api/updateGoal/:email/:goalId', function(req, res) {
    User.findOne({ "email": req.params.email }, (err, userFromDB) => {
        if (err) {
            res.json(err);
        } else {
            userFromDB.goals[req.params.goalId].title = req.body.title;
            userFromDB.goals[req.params.goalId].description = req.body.description;
            userFromDB.goals[req.params.goalId].completed = req.body.completed;
            userFromDB.save();
            res.json({"msg": "Goal Updated"});
        }
    });
}); 

// Delete Goal
app.delete('/api/deleteGoal/:email/:goalId', function(req, res) {
    User.findOne({ "email": req.params.email }, function(err, userFromDB) {
        if (err) {
            res.json(err);
        } else {
            userFromDB.goals.splice(req.params.goalId, 1);
            userFromDB.save();
            res.json({"msg": "Goal Deleted"});
        }
    });
});

app.listen(8080, () => {
    console.log("Port listening on 8080.");
});