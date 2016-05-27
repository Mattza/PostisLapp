

import q = require('q');
import mongoose = require('mongoose');
export 
const PostitSchema = new mongoose.Schema({
    text: String,
    color: String,
    position: { top: Number, left: Number },
    isShown: Boolean,
    creator: String,
    eventId: String
});
const Postit = mongoose.model<any>('Postit', PostitSchema);

let db: mongoose.Connection;

module.exports = {
    init: function (db: mongoose.Connection) {
        this.db = db;
    },
    getByEvent: function (eventId: string) {
        var def = q.defer();
        console.log('find',eventId);
        Postit.find({ 'eventId': eventId },function (err: any, data: any) {
            if (err) {
                def.reject(err);
            } else {
                def.resolve(data);
            }

        });
        return def.promise;
    },
    save: function (postit: postis.IPostis) {
        
        let def = q.defer();
        if (!postit.text || !postit.creator || !postit.eventId) {
            setTimeout(function () {
                def.reject('Fel i validering');
            }, 1);
        } else {
            new Postit(postit).save(function (err: string, postit: any) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(postit);
                }
            });
        }
        return def.promise;
    }
}