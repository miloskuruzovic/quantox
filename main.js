var app = angular.module("localApp", ["ngRoute", 'google-maps']);

app.config(function($routeProvider){
	$routeProvider
	.when("/", {
		templateUrl: "views/routes.html",
		controller: "RouteController"
	})
	.when("/detailed/:id", {
		templateUrl: "views/detailed.html",
		controller: "DetailedController"
	})
	.when("/test", {
		templateUrl: "views/test.html"
	})
	.otherwise({
		redirectTo: "/"
	})
});

app.controller('RouteController', function  ($scope) {
	$scope.appTitle = "Find a Route";
	$scope.appHeadline = "List of routes";

	$scope.saved = localStorage.getItem('routes');
	console.log($scope);

	$scope.routes = (localStorage.getItem('routes')!==null) ? JSON.parse($scope.saved) : [ {origin: 'Park Suma Zvezdara', destination: 'Gospodara Vucica', done: false}, {origin: 'Kosovska', destination: 'Nemanjina', done: false} ];
	localStorage.setItem('routes', JSON.stringify($scope.routes));

	navigator.geolocation.getCurrentPosition(function(position){
      $scope.$apply(function(){
        $scope.routeOrigin = position.coords.latitude + ", " + position.coords.longitude;
      },function error(msg){
        alert('Please enable your GPS position future.');  
      },{
        enableHighAccuracy: true,
        maximumAge:0}
        );
    });

	$scope.addRoute = function() {
		$scope.routes.push({
			origin: $scope.routeOrigin,
			destination: $scope.routeDestination,
			done: false
		});
		$scope.routeOrigin = ''; 
		$scope.routeDestination = '';
		localStorage.setItem('routes', JSON.stringify($scope.routes));
	};

	$scope.archive = function() {
		var oldRoutes = $scope.routes;
		$scope.routes = [];
		angular.forEach(oldRoutes, function(route){
			if (!route.done)
				$scope.routes.push(route);
		});
		localStorage.setItem('routes', JSON.stringify($scope.routes));
	};
});

app.controller('DetailedController', function($scope, $http, $routeParams) {
  
  var id = $routeParams.id;

  /*
  var routes = JSON.parse(localStorage.getItem('routes'));
  var route = routes[id];
  console.log(routes);
  console.log(route);
*/
  $scope.route = JSON.parse(localStorage.getItem('routes'))[id];

  $scope.map = {
    control: {},
    center: {
        latitude: 44.800114, 
        longitude: 20.448991
    },
    draggable: true,
    zoom: 12,
  };

/*  $scope.marker = {
    center: {
        latitude: 44.800114,
        longitude: 20.448991
    }
  };
*/
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var directionsService = new google.maps.DirectionsService();
  var geocoder = new google.maps.Geocoder();

  $scope.directions = {
    origin: "Please enable geolocation.",
    destination: "Gospodara Vucica 245, Beograd",
    showList: false
  }

  $scope.init = function () {
    var request = {
      origin: $scope.route.origin,
      destination: $scope.route.destination,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        console.log(response);
        directionsDisplay.setDirections(response);
        directionsDisplay.setMap($scope.map.control.getGMap());
        directionsDisplay.setPanel(document.getElementById('directionsList'));
        $scope.directions.showList = true;
      } else {
        alert('Google route unsuccesfull!');
      }
    });
  }
});
