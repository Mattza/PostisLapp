import mongoose = require('mongoose');
import q = require('q');
mongoose.connect('mongodb://taco:tacos@ds035975.mlab.com:35975/postitlapp');


module.exports = {
    start: function () {
        var def = q.defer();
        const db = mongoose.connection;
        db.on('error', function (err: String) {
            def.reject(err)
        });
        db.once('open', function () {
            console.log('db open');
            def.resolve(db);
        });
        
        return def.promise;
    }
}