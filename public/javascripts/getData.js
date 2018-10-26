var request = require('request');
var cheerio = require('cheerio');

url = 'https://www.facebook.com/search/str/Valentin/users-named';

request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);

        var title, release, rating;
        var json = { username : "", profil_link : "", picture_link : ""};

        $("._glj").filter(function() {
            var data = $(this);

            username = data.children
        })

    }
});
