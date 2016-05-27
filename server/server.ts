import Hapi = require('hapi');
const Postit = require('./Postit'),
    Events = require('./Event'),
    server = new Hapi.Server();

server.connection({ port: (process.env.PORT || 5000) });
server.register([require('inert'), require('nes')], (err) => {
    (<any>server).subscription('/position/{id}');
    server.route({
        method: 'GET',
        path: '/{path?}',
        handler: function (request: any, reply: any) {
            console.log('Fetchstatic', (<any>request).params.path);
            let path = (<any>request).params.path;
            if (!path) {
                path = 'index.html';
            }
            reply.file('client/' + path)
        }
    });
    server.route(<any>{
        method: 'POST',
        path: '/position/{id}',
        config: {
            id: 'position',
            handler: (request: any, reply: any) => {

                var roomId = request.params.id ? request.params.id : 'general';
                console.log(`asdas:`+JSON.stringify(request.payload.position.log));
                (<any>server).publish(`/position/${roomId}`, { message: request.payload });
                return reply('message recieved');
            },
            description: 'Placement handler'
        }
    });
    server.route({
        method: 'GET',
        path: '/api/{path}/{id?}',
        handler: function (request: any, reply: any) {

            const params = request.params;
            const path = params.path;
            console.log('oath', params)
            if (path === 'postit') {
                Postit.getByEvent(params.id).then(function (data: any) {
                    reply(data);
                });
            } else if (path === 'event') {
                console.log('hej!', params, params.id);
                Events.getEvents(params.id).then(function (data: any) {
                    reply(data);
                });
            } else {
                reply('nejnejnej')
            }
        }
    });

    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });

});
module.exports = {};

