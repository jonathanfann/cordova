var express = require('express'),
    request = require('request'),
    secrets = require('./config/index.js'),
    SpotifyWebApi = require('spotify-web-api-node'),
    nunjucks = require('nunjucks'),
    path = require('path'),
    app = express(),
    moment = require('moment'),
    momentDurationFormatSetup = require('moment-duration-format');
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'html');

function setupNunjucks(expressApp) {
    var env = nunjucks.configure(path.join(__dirname, 'static'), {
        autoescape: true,
        express: app
    });
    env.addFilter('formatMilliseconds', function(ms) {
        return moment.duration(ms, 'milliseconds').format("mm:ss");
    });
}

setupNunjucks(app);


var spotifyApi = new SpotifyWebApi(
    {
      clientId: secrets.client_id,
      clientSecret: secrets.client_secret,
      redirectUri: 'https://localhost:8888/callback'
    }
);

var tokenExpires = null;
var getToken = function() {
    spotifyApi.clientCredentialsGrant()
    .then(function(data) {
        tokenExpires = data.body['expires_in'];
        console.log('The access token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
        let accessToken = data.body['access_token'];
        res.redirect('/landing');
    }, function(err) {
        console.log('Something went wrong when retrieving an access token', err.message);
    });
}

app.get('/', function (req, res) {
    if (!tokenExpires) {
        getToken();
    }
})

app.get('/landing', function (req, res) {
    if (!tokenExpires) {
        getToken();
    }
    res.render('index.html', { searched: false });
})

app.post('/search-artist/', function(req, res) {
    if (!tokenExpires) {
        getToken();
    }
    res.redirect('/search-artist/' + req.body.artistname);
});

app.get('/search-artist/:artist', function (req, res) {
    spotifyApi.searchArtists(req.params.artist).then(
        function(data) {
            console.log(data.body);
            console.log(data.body.artists);
            res.render('index.html', { artists: data.body.artists, searched: true, query: req.params.artist });
        }
    );
})

app.get('/artist/:id', function (req, res) {
    spotifyApi.getArtistAlbums(req.params.id).then(
      function(data) {
        console.log('Artist albums', data.body);
        res.render('artist.html', { body: data.body, params: req.params });
      },
      function(err) {
        console.error(err);
      }
    );
})

app.get('/album/:id', function (req, res) {
    spotifyApi.getAlbum(req.params.id).then(function(album) {
        spotifyApi.getAlbumTracks(req.params.id, { limit: 50 })
          .then(function(data) {
              console.log(data.body, req.params, album);
            res.render('drilldown.html', { body: data.body, params: req.params, album: album, data_type: 'album' });
          }, function(err) {
            console.error('Something went wrong!', err);
          });
    })

})

// app.get('/album/:id', function(req, res) {
//     spotifyApi.getAlbum(req.params.id).then(function(album) {
//         spotifyApi.getAlbumTracks(req.params.id, {
//                 limit: 50
//             })
//             .then(function(data) {
//                 console.log(data.body, req.params, album);
//                 return data.body.tracks.map(function(t) {
//                     return t.id;
//                 });
//             })
//             .then(function(trackIds) {
//                 return spotifyApi.getTracks(trackIds);
//             })
//             .then(function(data) {
//                 console.log(data.body);
//                 res.render('drilldown.html', {
//                     body: data.body,
//                     params: req.params,
//                     album: album,
//                     data_type: 'album'
//                 });
//             })
//     }, function(err) {
//         console.error('Something went wrong!', err);
//     });
//
// })

// app.get('/track/:id', function (req, res) {
//     /* Get Audio Features for a Track */
//     spotifyApi.getAudioFeaturesForTrack(req.params.id)
//         .then(function(data) {
//             console.log(data.body, req.params, album);
//           res.render('drilldown.html', { body: data.body, params: req.params, album: album, data_type: 'song' });
//         }, function(err) {
//           console.error('Something went wrong!', err);
//         });
// })



app.listen(8888);
console.log('listenin\' at 8888 so get hoppin on that browser');
