const express = require('express'),
    nunjucks = require('nunjucks'),
    app = express(),
    path = require('path'),
    fs = require('fs'),
    static = 'static',
    globalz = require('nunjucks/src/globals');

globalz.currentYearFromDate = new Date().getFullYear();

app.set('view engine', 'html');

function setupNunjucks(expressApp) {
    var env = nunjucks.configure(path.join(__dirname, 'static'), {
        autoescape: true,
        express: app
    });
}

setupNunjucks(app);

app.get('/', function(req, res) {
    res.render('index.html');
});

app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.get('/:route', function(req, res) {
    var file = path.join(__dirname, static, req.params.route + '.html');
    if (fs.existsSync(file)) {
        res.render(req.params.route + '.html');
    } else {
        res.render('404.html');
    }
});

app.listen(8888);
console.log('running on port 8888');
