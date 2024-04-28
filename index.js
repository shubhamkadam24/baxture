"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var express_1 = require("express");
dotenv.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
var users = [];
app.use(express_1.default.json());
// Error handling middleware
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
// Get all users
app.get('/api/users', function (req, res) {
    res.json(users);
});
// Get a specific user
app.get('/api/users/:userId', function (req, res) {
    var userId = req.params.userId;
    var user = users.find(function (u) { return u.id === userId; });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
    }
    else {
        res.json(user);
    }
});
// Create a new user
app.post('/api/users', function (req, res) {
    var newUser = req.body;
    newUser.id = Math.random().toString(36).substr(2, 9); // Generate random id
    users.push(newUser);
    res.status(201).json(newUser);
});
// Update an existing user
app.put('/api/users/:userId', function (req, res) {
    var userId = req.params.userId;
    var updatedUser = req.body;
    var index = users.findIndex(function (u) { return u.id === userId; });
    if (index === -1) {
        res.status(404).json({ error: 'User not found' });
    }
    else {
        users[index] = __assign(__assign({}, users[index]), updatedUser);
        res.json(users[index]);
    }
});
// Delete a user
app.delete('/api/users/:userId', function (req, res) {
    var userId = req.params.userId;
    users = users.filter(function (u) { return u.id !== userId; });
    res.sendStatus(204);
});
app.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
