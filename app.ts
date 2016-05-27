const q = require('q');
const db = require('./server/database').start();

db.then(function(db:any){
    require('./server/server');
    require('./server/postit').init(db);
    require('./server/event').init(db);
});
