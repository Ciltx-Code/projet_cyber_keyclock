const path = require('path');
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();
const memoryStore = new session.MemoryStore();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, '/view'));
app.use(express.static('static'));
app.use(session({
    secret: 'KWhjV<T=-*VW<;cC5Y6U-{F.ppK+])Ub',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));

const keycloak = new Keycloak({
    store: memoryStore,
});

keycloak.accessDenied = function(req, res) {
    res.render('403');
};

app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/',
}));

app.get('/', (req, res) => res.redirect('/home'));

const parseToken = raw => {
    if (!raw || typeof raw !== 'string') return null;

    try {
        raw = JSON.parse(raw);
        const token = raw.id_token ? raw.id_token : raw.access_token;
        const content = token.split('.')[1];

        //console.log("ID token");
        //console.log(raw.id_token);
        //console.log("Access token");
        //console.log(raw.access_token);
        
        return JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
    } catch (e) {
        console.error('Error while parsing token: ', e);
    }
};

app.get('/home', keycloak.protect(), (req, res, next) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    res.render('home', {
        user: embedded_params,
    });
});

app.get('/login', keycloak.protect(), (req, res) => {
    return res.redirect('home');
});

const notes = {
    'ue1' :
        {'Jean Dupont': 10, 'Paul Durand': 12, 'Jacques Martin': 18, 'Marie Dupuis': 12},
    'ue2' :
        {'Jean Dupont': 18, 'Paul Durand': 15, 'Jacques Martin': 12, 'Marie Dupuis': 10},
    'ue3' :
        {'Jean Dupont': 18, 'Paul Durand': 15, 'Jacques Martin': 12, 'Marie Dupuis': 10, 'Jeanne Dup':19, 'Pauline Dur': 20}
};
const validate = {
    'ue1' :
        {'Jean Dupont': true, 'Paul Durand': false, 'Jacques Martin': false, 'Marie Dupuis': false},
    'ue2' :
        {'Jean Dupont': true, 'Paul Durand': false, 'Jacques Martin': false, 'Marie Dupuis': false},
    'ue3' :
        {'Jean Dupont': true, 'Paul Durand': false, 'Jacques Martin': false, 'Marie Dupuis': false, 'Jeanne Dup': false, 'Pauline Dur': false}
};

app.get('/ue1', keycloak.enforcer(['ue1:read'], {
    resource_server_id: 'gestion_notes'
}), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    res.render('ue1', {
        user: embedded_params,
        notes: notes.ue1,
        validate: validate.ue1,
    });
});

app.get('/ue1/update', keycloak.enforcer(['ue1:write'], {
    resource_server_id: 'gestion_notes',
    response_mode: 'permissions'
}), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    if(req.query.note && req.query.student) {
        notes.ue1[req.query.student] = req.query.note;
        return res.redirect('/ue1');
    }

    res.render('update', {
        user: embedded_params,
        ue: req.query.ue,
        studentName: req.query.student,
        currentNote: notes.ue1[req.query.student],
        from: "/ue1"
    });
});

app.get('/ue1/validate', keycloak.enforcer(['ue1:validate'], {
    resource_server_id: 'gestion_notes',
}), (req, res) => {
    if(req.query.student) {
        validate.ue1[req.query.student] = true;
    }
    res.redirect('/ue1');
});

app.get('/ue2', keycloak.enforcer(['ue2:read'], {
    resource_server_id: 'gestion_notes'
}), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    res.render('ue2', {
        user: embedded_params,
        notes: notes.ue2,
        validate: validate.ue2,
    });
});

app.get('/ue2/update', keycloak.enforcer(['ue2:write'], {
    resource_server_id: 'gestion_notes'
}), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    if(req.query.note && req.query.student) {
        notes.ue2[req.query.student] = req.query.note;
        return res.redirect('/ue2');
    }

    res.render('update', {
        user: embedded_params,
        ue: req.query.ue,
        studentName: req.query.student,
        currentNote: notes.ue2[req.query.student],
        from: "/ue2"
    });
});

app.get('/ue2/validate', keycloak.enforcer(['ue2:validate'], {
    resource_server_id: 'gestion_notes'
}), (req, res) => {
    if(req.query.student) {
        validate.ue2[req.query.student] = true;
    }
    res.redirect('/ue2');
});


app.get('/ue3', keycloak.enforcer(['ue3:read'], {
    resource_server_id: 'gestion_notes'
}), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    res.render('ue3', {
        user: embedded_params,
        notes: notes.ue3,
        validate: validate.ue3,
    });
});

app.get('/ue3/update', keycloak.enforcer(['ue3:write'], {
    resource_server_id: 'gestion_notes'
}), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    if(req.query.note && req.query.student) {
        notes.ue3[req.query.student] = req.query.note;
        return res.redirect('/ue3');
    }

    res.render('update', {
        user: embedded_params,
        ue: req.query.ue,
        studentName: req.query.student,
        currentNote: notes.ue3[req.query.student],
        from: "/ue3"
    });
});

app.get('/ue3/validate', keycloak.enforcer(['ue3:validate'], {
    resource_server_id: 'gestion_notes'
}), (req, res) => {
    if(req.query.student) {
        validate.ue3[req.query.student] = true;
    }
    res.redirect('/ue3');
});

app.use((req, res, next) => {
    return res.status(404).end('Not Found');
});


app.use((err, req, res, next) => {
    return res.status(req.errorCode ? req.errorCode : 500).end(req.error ? req.error.toString() : 'Internal Server Error');
});

const server = app.listen(3000, '127.0.0.1', () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Application running at http://%s:%s', host, port);
});
