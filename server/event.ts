/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/mongoose/mongoose.d.ts" />
import q = require('q');
import mongoose = require('mongoose');
interface IEvent extends mongoose.Document {
    eventName: string,
    creator: string,
   
}
const EventSchema = new mongoose.Schema({
    eventName: String,
    creator: String,
});
const Event = mongoose.model<IEvent>('Event', EventSchema);

let db: mongoose.Connection;

module.exports = {
    init: function (db: mongoose.Connection) {
        this.db = db;
    },
    getEvents: function (eventId:string) {

        var def = q.defer();
        console.log('eventId',eventId);
        var callBack = function (err: any, data: any) {
            err?def.reject(err):def.resolve(data);
        }
        if(eventId){
            Event.findOne({ '_id': eventId },callBack);
        }else{
            Event.find(callBack);
        }
        return def.promise;
    },
    save: function (event: any) {

        let def = q.defer();
   
            new Event(event).save(function (err: string, event: any) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(event);
                }
            });

        
        return def.promise;
    }
}