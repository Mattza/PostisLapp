var postisApp = angular.module('postisApp', ['ngRoute', 'ngResource', 'ngAnimate', 'ngMaterial'])
    .config(['$routeProvider', '$locationProvider', '$mdThemingProvider', function ($routeProvider: any, $locationProvider: any, $mdThemingProvider: any) {
          $mdThemingProvider.theme('default')
     .primaryPalette('blue')
     .accentPalette('red');
        $routeProvider
            .when('/', {
                templateUrl: 'main.html',
                controller: 'mainCtrl',
                controllerAs: 'main',
                resolve: {
                    // I will cause a 1 second delay
                    // delay: function($q:any, $timeout:any) {
                    //   var delay = $q.defer();
                    //   $timeout(delay.resolve, 1000);
                    //   return delay.promise;
                    // }
                }
            })
            .when('/present/:eventId', {
                templateUrl: 'present.html',
                controller: 'presentCtrl',
                controllerAs: 'present'
            })
            .when('/create/:eventId', {
                templateUrl: 'create.html',
                controller: 'createCtrl',
                controllerAs: 'create'
            })
            .when('/server/:eventId', {
                templateUrl: 'server.html',
                controller: 'serverCtrl',
                controllerAs: 'server'
            })
    }]);

postisApp.service('eventService', ['$resource', function ($resource: any) {
    var resource = $resource('api/event/:eventId')
    return {
        query: function () {
            return resource.query();
        },
        get: function (eventId: number) {
            return resource.get({ eventId: eventId });
        }
    }
}]);
postisApp.service('postisService', ['$resource', function ($resource: any) {
    var resource = $resource('api/postit/:eventId');
    var localPostis: any = {};
    return {
        query: function () {
            return resource.query();
        },
        get: function (eventId: number) {
            return resource.query({ eventId: eventId });
        },
        getLocal: function (eventId: number): Array<postis.IPostis> {
            if (!localPostis[eventId]) {
                localPostis[eventId] = [];
            }
            return localPostis[eventId];
        },
        createLocal: function (eventId: string, postis: postis.IPostis) {
            localPostis[eventId].push(postis);
        },

    }
}]);
postisApp.service('socketService', function () {
    var data = { position: 'Init' };
    return {
        data,
    }
})

postisApp.controller('mainCtrl', ['eventService','$location', function (eventService: any,$location:ng.ILocationService) {
    this.events = eventService.query();
    this.gotoEventAsCreator = function (event:any) {
        $location.path('/create/'+event._id);
        
    }
    this.gotoEventAsServer = function (event:any) {
        $location.path('/server/'+event._id);
    }
}]);

postisApp.controller('createCtrl', ['$routeParams', 'postisService', function ($routeParams: any, postisService: any) {
    var wm = this;
    wm.localPostis = postisService.getLocal($routeParams.eventId);
    wm.currentPostis = <postis.IPostis>{};
    wm.colorOptions = [
        { "hex": "red", "text": "Röd" },
        { "hex": "yellow", "text": "Gul" },
        {"hex": "green", "text": "Grön" }
        
    ];
        
    wm.changedColor = function () {
        wm.currentPostis.color = wm.colorpicker;
        console.log(wm.colorpicker);
    }
    wm.createLocal = postisService.createLocal;
}])


postisApp.controller('presentCtrl', ['$scope', 'postisService', '$routeParams', function ($scope: ng.IScope, postisService: any, $routeParams: any) {
    var wm = this;
    wm.placing = false;

    var client = new (<any>window).nes.Client('ws://192.168.19.116:5000');
    client.onConnect = function () {
        console.log('Service Connected');
    }

    wm.localPostis = [];
    client.connect(function (err: string) {
        if (err) {
            console.error('Socketconnection error', err);
        }
    });

    wm.diffX = 0;
    wm.diffY = 0;

    var oldAlpha = 0, oldBeta = 0;
    var positionDelta = function () {
        return {
            diffX: (alpha - oldAlpha),
            diffY: (beta - oldBeta),
            log: { alpha, oldAlpha, beta, oldBeta }
        }
    }
    var intervalSend = function () {
        client.request({
            method: 'POST',
            path: '/position/1',
            payload: {
                position: positionDelta()
            }
        }, function (err: any, res: any) {
            console.log(arguments);
        });
    }
    var theInterval: any = 'taco';
    wm.startPlacing = function () {
        oldAlpha = alpha;
        oldBeta = beta;
        theInterval = setInterval(intervalSend, 20);
        wm.placing = true;
    }
    wm.endPlacing = function () {
        wm.positionDelta = positionDelta();
        clearInterval(theInterval);
        wm.placing = false;
    }

    var alpha = 0, beta = 0;
    window.addEventListener("deviceorientation", function (e: any) {
        if (e.alpha && e.beta) {
            alpha = e.alpha > 180 ? e.alpha - 360 : e.alpha;
            beta = e.beta;
        }
    }, false);
    var sendMsg = function (msg: any) {
        client.request({
            method: 'POST',
            path: '/position/1',
            payload: {
                message: msg
            }
        }, function (err: any, res: any) {
            console.log(arguments);
        });
    }




}]);


postisApp.controller('serverCtrl', ['$scope', 'eventService', 'postisService', '$routeParams', 'socketService', function ($scope: ng.IScope, eventService: any, postisService: any, $routeParams: any, socketService: any) {
    var wm = this;
    this.event = eventService.get($routeParams.eventId);
    this.postis = postisService.get($routeParams.eventId);
    var client = new (<any>window).nes.Client('ws://localhost:5000')
    client.onConnect = function () {
        console.log('Service Connected');
        client.subscribe('/position/1', function (msg: { message: { position: { diffX: number; diffY: number } } }) {
            var position = msg.message.position;

            var left = getBetweenZeroToHero(50 + position.diffX - 7.5, 83);
            var top = getBetweenZeroToHero(50 + position.diffY * 5 + 5, 85);
            console.log('X,PosX', left, position.diffX);
            // console.log('X,Y', left, top);
            wm.placingStyle = {
                left: left + '%',
                top: top + '%'
            }

            $scope.$apply();

        }, function (a: string) { console.log(a) });
    };
    client.connect(function (err: string) {
        if (err) {
            console.error('Socketconnection error', err);
        }
    });
    var getBetweenZeroToHero = function (number: number, hero: number): number {
        if (number > hero) {
            return hero;
        }
        if (number < 0) {
            return 0;
        }
        return number;
    }
}]);
