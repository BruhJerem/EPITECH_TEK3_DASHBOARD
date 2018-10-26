
# Githubed Dashboard  
The Dashboard is an Epitech student project. It was be realised in three weeks.  
Here is the full documentation of the project.  
  
## Summary  
1. Database  
2. Registration / Identification  
3. Services  
4. Widgets  
5. Technical documentation  
  
## 1. Database  
Here is the global architecture of or database.  
  
| USER         | SERVICES | WIDGETS     |  
|--------------|----------|-------------|  
| e-mail       | name     | name        |  
| password     | id       | uid         |  
| username     |          | Service_id  |  
| widget_id    |          | description |  
| widget_param |          |             |  
  
USER table contain all the personal informations including his chosen widget in the Dashboard.  
  
SERVICES table contain the service name and his ID, this ID is used to match the service name with all his widget.  
  
WIDGETS table contain every information about one widget like his name, is UID his service_id to match the corresponding service and a short description.  
  
## 2. Registration / identification  
Before using our Dashboard, you have to create an accourt on our service.  
To perform that you have to go to ```/register```. Here you will be able to chose a name enter an e-mail and a password. Those informations will be your connection id for the ```/login``` route.  
  
In the ```/login``` page you have to fill the two boxes with your personal credits.  
One for your Username and on for your password.  
  
Don't worry about your credentials it will be encrypted using MD5 hash into our Database.

If you want to change your credentials you can go to your profile section in the top right corner of the page. just click on your name then profile. Here you can set a new e-mail address.
  
## 3. Services & Widgets  
In the Dashboard you can use different Services. Here is the full list with their respective widget.  
  
| WEATHER     | CINEMA      | GOOGLE | YOUTUBE   | CHUCK NORRIS FACT |
|-------------|-------------|--------|-----------|-------------------|
| temperature | popular     | maps   | youtuber  | chuck_norris_fact |
| humidity    | top rated   |        | youtuber1 |                   |
|             | upcoming    |        | yt_video  |                   |
|             | now playing |        |           |                   |
  
WEATHER service is used for collecting weather data of a specific french city, you can use it to get temperature and humidity.  
To collect weather data we use the [OpenWeatherMap Api](https://openweathermap.org/api)  
  
CINEMA service is used for collecting some movie information like popular movies, upcoming movies ..  
To collect cinema data we use the [TMDB Api](https://www.themoviedb.org/documentation/api)  
  
GOOGLE service is used for collecting Google maps information.
To collect Google maps data we use the [Google Maps Api](https://developers.google.com/maps/documentation/javascript/tutorial)

YOUTUBE service is used for colleting subscriber of the youtuber.
To collect youtube data we use the [Youtuber API](https://developers.google.com/youtube/)

CHUCK NORRIS FACT service is used to tell jokes about Chuck Norris.
To collect Chuck Norris data we use the [CHUCKNORRIS API](https://api.chucknorris.io/)
  
## 4. Widgets details  
  
Here is the full description of all our widget.  
WEATHER :  
  
- temperature : In the ```/weather``` menu you can enter the name of a french city and it will display the city temperature on the ```/dashboard``` page.   
- humidity : In the ```/weather``` menu you can enter the name of a french city and it will display the city humidity on the ```/dashboard``` page.   
  
CINEMA :  
  
- popular : in the ```/cinema``` menu you can choose popular to display on the ```/dashboard``` main page ten actual popular movies in the world (sorted by popularity)(you can click on the movie name to show the movie's poster).  
- top rated : in the ```/cinema``` menu you can choose top rated to display on the ```/dashboard``` main page ten most popular movies in the entire cinema history (sorted by popularity)(you can click on the movie name to show the movie's poster).  
- upcoming : in the ```/cinema``` menu you can choose upcoming to display on the ```/dashboard``` main page ten most fresh movies in the world (sorted by popularity)(you can click on the movie name to show the movie's poster).  
- now playing : in the ```/cinema``` menu you can choose now playing to display on the ```/dashboard``` main page ten actually playing movies in your country (sorted by popularity)(you can click on the movie name to show the movie's poster).  
  
GOOGLE :  
  
- maps : on your ```/dashboard``` page you have a maps that can be use to locate a point of interest in the world. just type in the name of the POI and it will be displayed on your map.

YOUTUBE :

- youtuber : on your ```/compare``` page you can choose the correspondant youtuber you choose to compare with youtuber1
- youtuber1 : on your ```/compare``` page you can choose the correspondant youtuber you choose to compare with youtuber
- yt_video : on your ```/dashboard``` page you can watch the best video on earth

CHUCK NORRIS FACT :

- chuck_norris_fact : on your ```/dashboard``` page you can watch the jokes that are random about Chuck Norris

## 5. Technical documentation  
  
Get started  
    : Our project run using Docker. To start the Dashboard on your computer you first have to start the docker daemon then run the two following commands.
1. docker-compose build  
    > this will build the entire project, download all required images and dependencies.  
2. docker-compose up  
	> this will start the server & start mongo DB instance.  
    once done you can open your favorite browser and access this address ```localhost:8080```

Adding a Service
    : All services work using API, you can add whatever you want, just find a cool Api that return a JSON file and add it to the ```widget.js``` file.
    Here is the template that you can use.
```javascript
    function name(req, param) {
        return new Promise(function (resolve, reject) {
            getJSON("Api Url")
                .then(function (response) {
                    resolve(response)
                }).catch(function (err) {
                    resolve(null)
            })
        })
    }
    ```
    

