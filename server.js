
// var client_id = secrets.client_id,
//     client_secret = secrets.client_secret,
//     redirect_uri = 'http://localhost:8888/callback',
//     authorization_code,
//     access_token;
// var spotify_auth_url = 'https://accounts.spotify.com/authorize?client_id=' +
//                         client_id +
//                         '&response_type=code&redirect_uri=' +
//                         redirect_uri;

// function hehePeepee(done) {
//     request.get(spotify_auth_url, function(err, res) {
//         done(err, res);
//     });
// }
//
// app.get('/', function (req, res) {
//     hehePeepee(function(err, data) {
//         console.log(err);
//         console.log(data);
//         res.send(data.body);
//     });
// })
//
//
// var token = function () {
//     if (authorization_code != null) {
//         request.post('https://accounts.spotify.com/api/token', {
//             'auth': {
//                 'grant_type': authorization_code
//             }
//         })
//     } else {
//         console.log('aint set the auth code');
//     }
// };
//
// app.get('/callback', function (req, res) {
//     access_token = req.query.code;
//     token();
//     console.log('aw yeah that callback tho');
//     res.send('yay' + access_token);
// })

var express = require('express'),
    request = require('request'),
    secrets = require('./config/index.js'),
    SpotifyWebApi = require('spotify-web-api-node'),
    nunjucks = require('nunjucks'),
    path = require("path"),
    app = express();

app.set('view engine', 'html');
nunjucks.configure(path.join(__dirname, 'static'), {
    autoescape: true,
    express: app
});

var spotifyApi = new SpotifyWebApi(
    {
      clientId: secrets.client_id,
      clientSecret: secrets.client_secret,
      redirectUri: 'https://localhost:8888/callback'
    }
);

app.get('/', function (req, res) {
    spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
      let accessToken = data.body['access_token'];
      res.redirect('/landing');
    }, function(err) {
      console.log('Something went wrong when retrieving an access token', err.message);
    });

})

app.get('/landing', function (req, res) {
    res.render('index.html');
})

app.get('/elvis', function (req, res) {
    spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
      function(data) {
        console.log('Artist albums', data.body);
        res.send(data.body);
      },
      function(err) {
        console.error(err);
      }
    );
})


app.listen(8888);
console.log('listenin\' at 8888 so get hoppin on that browser');
