module.exports = function(app, passport, fs, upload) {
    // Home Page
    app.get('/', function(req, res) {
	    console.log("Am Here");
        res.render(('index'));
    });

    // Login Page
    app.get('/login', function(req, res) {
       res.render(('login'), {message: req.flash('loginMessage')});
    });

    // Process the login form
    app.post('/login', passport.authenticate('oauth2'));

    // Photos page
    app.get('/photos',   passport.authenticate('oauth2', { failureRedirect: '/login' }), function(req, res) {
        res.render('photos', {
            rows: arrayOfN(fs.readdirSync('/images/' + req.user), 4),
            message: req.flash('uploadMessage'),
            user: req.user // get the user out of session and pass to template
        });
    });

    app.post('/photos', isLoggedIn, upload.single('file'), function (req, res) {
        if (!fs.existsSync('./images/' + req.user)){
            fs.mkdirSync('./images/' + req.user);
        }

        var tempPath = req.files.file.path,
            targetPath = path.resolve('./images/' + req.user + '/' + req.files.file.name);
        if (arrayIncludes(['.png', '.jpg', '.gif'], path.extname(req.files.file.name).toLowerCase())) {
            fs.rename(tempPath, targetPath, function(err) {
                if (err) throw err;
                res.flash('uploadMessage', 'Upload successful');
            });
        } else {
            res.flash('uploadMessage', 'Upload was not png, jpg or gif');
        }

        res.redirect('/photos')
    });

    // Logout
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


function arrayOfN(elements, n) {
    var toReturn = [];
    elements.reverse();

    while(elements.length > 0) {
        var row = [];
        for (var j = 0; j < n; j++) {
            if (elements.length === 0)
                break;
            else {
                row.push(elements.pop());
            }
        }
        toReturn.push(row);
    }

    return toReturn;
}

function arrayIncludes(array, toCheck) {
    for(var elem in array){
        if(elem === toCheck)
            return true;
    }

    return false;
}
