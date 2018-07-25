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
