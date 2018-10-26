var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MongoClient = require("mongodb").MongoClient;

var getJSON = require('get-json');
var openWeatherMapApiKey = "e4da0c54723866781051130c9ee01896";
var TheMovieDBApiKey = "8a52383aab10c7bbae381aabd30ed3a9";


var Widget = new Schema({
    name: {
        type: String,
    },
    service_uid: {
        type: Object
    },
    description: {
        type: String
    },
    param: {
        type: String
    },
    user_id: {
        type: Object,
    }
});

/* -> Find if occurence exist
*  -> If exist -> update with id
*  -> If not exist -> insert data
*/

function insertWidget(req, data) {
    MongoClient.connect('mongodb://db:27017', function(err, db) {
    // MongoClient.connect('mongodb://127.0.0.1:27017', function (err, db) {
        if (err)
            throw err;
        var dbo = db.db('dashboard');
        var query = {name: data.name, user_id : data.user_id};
        dbo.collection('widgets').find(query).toArray(function(err, result) {
            if (err)
                throw err;
            // here we must create because it not exist
            if (result.length === 0) {
                dbo.collection("widgets").insertOne(data, function (err, res) {
                    if (err)
                        throw err
                });
            }
            else {
                // here we update
                dbo.collection("widgets").updateOne(query, {$set: {param: data.param}}, function (err, res) {
                    if (err)
                        throw err
                });
            }
        });
    });
}

/*
    Weather Service
    Weather Api return temp of chosen city -- change parsing to get other information
 */

function getWeather(req, town) {
    return new Promise(function (resolve, reject) {
        getJSON('http://api.openweathermap.org/data/2.5/weather?q=' + town + ',fr&apikey=' + openWeatherMapApiKey)
            .then(function (response) {
                resolve(response)
            }).catch(function (err) {
                resolve(null)
        })
    })
}

function getMovies(req, choice) {
    return new Promise(function (resolve) {
        getJSON('https://api.themoviedb.org/3/movie/' + choice + '?api_key=' + TheMovieDBApiKey, function (err, result) {
            console.log(result)
            if (err) {
                resolve(null);
            }
            if (result.length === 0)
                resolve(null);
            movieList = [];
            var i = 0;
            var j = 10;
            if (result.length < 10)
                j = result.length;
            for (; i < j; i++) {
                movieList.push({name : result.results[i].title, release_date:result.results[i].release_date, popularity: result.results[i].popularity, poster_path: "http://image.tmdb.org/t/p/w780" + result.results[i].poster_path });
            }
            resolve(movieList);
        })
    });
}

function getChuckNorris(req) {
    return new Promise(function (resolve, reject) {
        getJSON('https://api.chucknorris.io/jokes/random')
            .then(function (response) {
                resolve(response)
            }).catch(function (err) {
            resolve(null)
        })
    })
}

function getApi(req, paramJson, callback) {
    var json = {movieList: [], degrees:"?", humidity:"?", chuck_norris: ""};
    var promise1 = getMovies(req, paramJson.movieChoice);
    promise1.then(function(response) {
        console.log(response)
        if (response == null)
            json.movieList = [];
        else
            json.movieList = response;
        var promise2 = getWeather(req, paramJson.town);
        promise2.then(function (response) {
            if (response == null) {
                json.degrees = "?";
                json.humidity = "?";
            } else {
                json.degrees = (response.main.temp - 273).toFixed(1).toString();
                json.humidity = response.main.humidity;
            }
            var promise3 = getChuckNorris(req);
            promise3.then(function (response) {
                if (response != null)
                    json.chuck_norris = response.value;
                callback(json);
            })
        });
    });
}

module.exports = mongoose.model('Widget', Widget);
module.exports.insertWidget = insertWidget;
module.exports.getApi = getApi;
