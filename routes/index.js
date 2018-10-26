var express = require('express');
var router = express.Router();
var Service = require(`./models/service`);
var Account = require('./models/account.js');
var Widget = require('./models/widget');
var passport = require('passport');
const MongoClient = require("mongodb").MongoClient;

/* Logout handling */

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

/* Ping */

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

/* Auth Facebook */

router.get('/auth/facebook', passport.authenticate('facebook', {
    scope : ['public_profil', 'email']
}));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/profil',
        failureRedirect : '/'
    })
);

/* Login */

router.get('/login', Account.isAuthenticatedLogin, function(req, res) {
    res.render('login.twig', { user : req.user });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        req.login(user, function(err){
            if (err)
                return res.render('login.twig', { error : true });
            username = req.user ? req.user.username : "Anonymous";
            return res.redirect('/dashboard');
        });
    })(req, res, next);
});

/* Register */

router.get('/register', Account.isAuthenticatedLogin, function(req, res) {
    username = req.user ? req.user.username : "Anonymous";
    res.render('register.twig', { user : username });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username, email: req.body.email }), req.body.password, function(err, account) {
        if (err) {
            return res.render("register.twig", {error: true});
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/dashboard');
        });
    });
});

/* Index */

router.get('/', function(req, res){
    username = req.user ? req.user.username : "";
    res.render('index.twig', { user : username });
});

/* profil */
router.get('/profil', Account.isAuthenticated, function (req, res) {
    username = req.user ? req.user.username : "Anonymous";
    res.render('profil.twig', { user : username, email : req.user.email });
});

router.post('/profil', function(req, res) {
    if (req.body.password) {
        var oldPassword = req.body.oldPassword;
        var password = req.body.password;
        var confirmation = req.body.confirmation;

        console.log(confirmation);
        if (password !== confirmation)
            return res.render("profil.twig", {
                password_not_match: true,
                user: username,
                email: req.user.email
            });
        Account.findById(req.user._id, function (err, user){
            user.changePassword(oldPassword, password, function(err, user) {
                if (err) {
                    return res.render("profil.twig", {
                        oldpassword_false: true,
                        user: username,
                        email: req.user.email
                    });
                }
                user.save(function (err) {
                    if (err)
                        return res.render("profil.twig", {
                            password_error: true,
                            user: username,
                            email: req.user.email
                        });
                    return res.render("profil.twig", {
                        password_changed: true,
                        user: username,
                        email: req.user.email
                    });
                });
            });
        });
    }
    if (req.body.email) {
        Account.findById(req.user._id, function (err, user) {
            username = req.user ? req.user.username : "Anonymous";

            if (!user) {
                return res.render("profil.twig", {no_user: true, user: username, email: req.user.email});
            }

            var email = req.body.email;

            if (email) {
                user.email = email;
            }

            user.save(function (err) {
                if (err)
                    return res.render("profil.twig", {
                        email_exist: true,
                        user: username,
                        email: req.user.email
                    });
                return res.render("profil.twig", {email_changed: true, user: username, email: email});
            });
        });
    }
});

/* Dashboard */

router.get('/dashboard', Account.isAuthenticated, function(req, res) {
    username = req.user ? req.user.username : "Anonymous";
    youtuber = "pewdiepie";
    MongoClient.connect('mongodb://db:27017', function(err, db) {
        // MongoClient.connect('mongodb://127.0.0.1:27017', function(err, db) {
        if (err) throw err;
        console.log(req.user)
        var query = {user_id : req.user._id};
        var dbo = db.db("dashboard");
        var promise1 = new Promise(function(resolve, reject) {
            Service.insertService(req, {name:"Google Maps"});
            Service.insertService(req, {name:"Weather"});
            Service.insertService(req, {name:"Cinema"});
            Service.insertService(req, {name:"Chuck Norris Fact"});
            Service.insertService(req, {name:"Youtube Video"});
            Service.insertService(req, {name:"Youtube Counter"});
        });
        promise1.then(function() {
            dbo.collection('services').find({name:"Google Maps"}).toArray(function(err, result) {
                if (err)
                    throw err
                Widget.insertWidget(req, {name: "google_maps", description: "Affichage de maps", user_id: req.user._id, service_uid:result[0]._id});
            });
            dbo.collection('services').find({name:"Chuck Norris Fact"}).toArray(function(err, result) {
                if (err)
                    throw err
                Widget.insertWidget(req, {name: "chuck_norris_fact", description: "Blague Chuck Norris", user_id: req.user._id, service_uid:result[0]._id});
            });
        });

        dbo.collection("widgets").find(query).toArray(function(err, result) {
            if (err)
                throw err;
            if (!Array.isArray(result) || result.length === 0)
                return res.render('dashboard.twig', { user : username, weather_town : "Unknown"});
            db.close();
            var cinema = "popular";
            var town = "Unknown";
            var youtuber = "pewdiepie";
            var youtuber1 = "t-series";
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                if (result[i].name === "city_temperature") {
                    town = result[i].param;
                }
                if (result[i].name === "cinema_news") {
                    cinema = result[i].param;
                }
                if (result[i].name === "youtuber") {
                    youtuber = result[i].param;
                }
                if (result[i].name === "youtuber1") {
                    youtuber1 = result[i].param;
                }
            }
            paramJson = {town: town, movieChoice: cinema};
            Widget.getApi(req, paramJson, function (response) {
                if (response == null)
                    return res.render('dashboard.twig', { user : username, weather_town : town});
                return res.render('dashboard.twig', { user : username, weather_town : town, current_degrees: response.degrees + '°C', current_humidity: response.humidity + " %", movies_array: response.movieList, chuck_norris: response.chuck_norris, youtuber: youtuber, youtuber1: youtuber1});
            });
        });
    });
});

/* compare */
router.get('/compare', Account.isAuthenticated, function (req, res) {
    username = req.user ? req.user.username : "Anonymous";
    res.render('compare.twig', { user : username});
});

router.post('/compare', function(req, res, next) {
    Account.findById(req.user._id, function (err, user) {
        username = req.user ? req.user.username : "Anonymous";
        var youtuber = req.body.youtuber;
        var youtuber1 = req.body.youtuber1;
        valService = {name: "Youtuber Counter"};
        Service.insertService(req, valService);
        query = {name: "Youtuber Counter"};
        MongoClient.connect('mongodb://db:27017', function(err, db) {
            // MongoClient.connect('mongodb://127.0.0.1:27017', function (err, db) {
            dbo = db.db('dashboard');
            dbo.collection('services').find(query).toArray(function (err, result) {
                var pos = user.widget_id.indexOf(result[0]._id);
                if (pos !== 0)
                    user.widget_id.push(result[0]._id);
                val = {
                    name: "youtuber",
                    service_uid: result[0]._id,
                    description: "Affichage du youtuber",
                    param: youtuber,
                    user_id: req.user._id
                };
                val1 = {
                    name: "youtuber1",
                    service_uid: result[0]._id,
                    description: "Affichage du youtuber",
                    param: youtuber1,
                    user_id: req.user._id
                };
                Widget.insertWidget(req, val);
                Widget.insertWidget(req, val1);
                user.save(function (err) {
                    if (err)
                        return res.render("compare.twig");
                });
                return res.redirect('/dashboard')
            });
        });
    });
});

/* Weather */

router.get('/weather', Account.isAuthenticated, function (req, res) {
    username = req.user ? req.user.username : "Anonymous";
    res.render('weather.twig', { user : username});
});

router.post('/weather', function(req, res, next) {
    Account.findById(req.user._id, function (err, user) {
        username = req.user ? req.user.username : "Anonymous";
        var town = req.body.town;

        if (town) {
            valService = {name: "Weather"};
            Service.insertService(req, valService);
            query = {name: "Weather"};
            MongoClient.connect('mongodb://db:27017', function(err, db) {
            // MongoClient.connect('mongodb://127.0.0.1:27017', function (err, db) {
                dbo = db.db('dashboard');
                dbo.collection('services').find(query).toArray(function (err, result) {
                    var pos = user.widget_id.indexOf(result[0]._id);
                    if (pos !== 0)
                        user.widget_id.push(result[0]._id);
                    valTemp = {
                        name: "city_temperature",
                        service_uid: result[0]._id,
                        description: "Affichage de la température pour la ville",
                        param: town,
                        user_id: req.user._id
                    };
                    valHumidity = {
                        name: "city_humidity",
                        service_uid: result[0]._id,
                        description: "Affichage de l'humidité pour la ville",
                        param: town,
                        user_id: req.user._id
                    };
                    Widget.insertWidget(req, valTemp);
                    Widget.insertWidget(req, valHumidity);
                    user.save(function (err) {
                        if (err)
                            return res.render("weather.twig");
                    });
                    return res.redirect('/dashboard')
                });
            });
        }
    });
});

/* Cinema */

router.get('/cinema', Account.isAuthenticated, function (req, res, next) {
    username = req.user ? req.user.username : "Anonymous";
   res.render('cinema.twig', {user:username});
});

router.post('/cinema', function (req, res, next) {
    Account.findById(req.user._id, function (err, user) {
        username = req.user ? req.user.username : "Anonymous";
        console.log(req.body)
        var cinema = req.body.selectLg;
        valService = {name: "Cinema"};
        Service.insertService(req, valService);
        query = {name: "Cinema"};
        MongoClient.connect('mongodb://db:27017', function(err, db) {
        // MongoClient.connect('mongodb://127.0.0.1:27017', function (err, db) {
            dbo = db.db('dashboard');
            dbo.collection('services').find(query).toArray(function (err, result) {
                var pos = user.widget_id
                if (pos.length == 0)
                    user.widget_id.push(result[0]._id);
                valWidget = {
                    name: "cinema_news",
                    service_uid: result[0]._id,
                    description: "Affichage des films de cinéma",
                    param: cinema,
                    user_id: req.user._id
                };
                Widget.insertWidget(req, valWidget);
                user.save(function (err) {
                    if (err)
                        return res.render("cinema.twig");
                });
                return res.redirect('/dashboard')
            });
        });
    });
});

/* about.json */

router.get('/about.json', function (req, res, next) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    ip = ip.split(":").pop()
    // consume response object
    host_ip = ip.toLocaleString();
    current_time = Math.floor(new Date() / 1000)
    var testJson = {
        "client": host_ip,
        "server":
            {
                "current_time": current_time,
                "services":
                    [
                        { "name": "Weather", "widgets":
                                [
                                    {
                                        "name": "city_temperature",
                                        "description": "Affichage de la temperature pour une ville",
                                        "params":
                                            [
                                                {"name": "city", "type": "string"},
                                            ],
                                    },
                                    {
                                        "name": "city_humidity",
                                        "description": "Affichage de l'humidité pour une ville",
                                        "params":
                                            [
                                                {"name": "city", "type": "string"},
                                            ],
                                    }
                                ]
                        },
                        { "name": "Cinema", "widgets":
                                [
                                    {
                                        "name": "cinema_news",
                                        "description": "Affichage des derniers films",
                                        "params":
                                            [
                                                {"name": "selectLg", "type": "string"},
                                            ],
                                    },
                                ]
                        },
                        { "name": "Google Maps", "widgets":
                                [
                                    {
                                        "name": "google_maps",
                                        "description": "Affichage de la maps",
                                    },
                                ]
                        },
                        { "name": "Chuck Norris Fact", "widgets":
                                [
                                    {
                                        "name": "chuck_norris_fact",
                                        "description": "Affichage d'une blague Chuck Norris",
                                    },
                                ]
                        },
                        { "name": "Youtube Video", "widgets":
                                [
                                    {
                                        "name": "youtube",
                                        "description": "Affichage d'une vidéo youtube",
                                    },
                                ]
                        },
                        { "name": "Youtube Comparaison", "widgets":
                                [
                                    {
                                        "name": "comparaison",
                                        "description": "Affichage des abonnées youtuber",
                                        "params":
                                            [
                                                {"name": "youtuber", "type": "string"},
                                                {"name" : "youtuber1", "type" : "string"}
                                            ],
                                    },
                                ]
                        }]

            },
    };
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(testJson, null, 3));
});

module.exports = router;
