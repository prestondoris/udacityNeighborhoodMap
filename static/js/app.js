var map;
var mapDiv = document.getElementById('map');
var center = {lat: 37.8044, lng: -122.2711};


// Create the model for our data points.
var model = [];

// Create a Brewery constructor
function Brewery(obj) {
    var self=this;
    self.name = ko.observable(obj.name);
    self.visible = ko.observable(true);
}


var ViewModel = function() {
    var self = this;

    self.breweryList = ko.observableArray([]);
    self.input = ko.pureComputed({
        read: function() {
            return "";
        },
        write: function(value) {
            if(value == "") {
                for(var i=0; i<self.breweryList().length; i++) {
                    self.breweryList()[i].visible(true);
                }
            } else {
                for(var i=0; i<self.breweryList().length; i++) {
                    if(self.breweryList()[i].name().search(value) == -1) {
                        self.breweryList()[i].visible(false);
                    }
                }
            }
        }
    });

    self.enableMarker = function() {
        
    }

    self.disableMarker = function() {

    }

    // Connect to Foursquare to get a list of breweryies to populate our model
    // as well as out observableArray "breweryList"
    $.ajax({
        url:'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data: 'limit=22' +
                '&ll='+ center.lat +','+ center.lng +
                '&client_id=JAL1UGFNFEMLAWL4TZXUFQYTPHDDMUB3AND4OETDSEFFC1M4'+
                '&client_secret=M0UPWFB0MPWC5UR5H51K3WDUXZJACCIVYX4ENUNOAOLUYYSL'+
                '&v=20140806' +
                '&intent=browse'+
                '&radius=50000'+
                '&query=brewing,brewery',
        async: false,
        success: function(data) {
            for(var i=0; i<data.response.venues.length; i++) {
                var venue = {
                    name: data.response.venues[i].name,
                    address: data.response.venues[i].location.address+', '
                        +data.response.venues[i].location.city+' '
                        +data.response.venues[i].location.state+', '
                        +data.response.venues[i].location.postalCode,
                    lat: data.response.venues[i].location.lat,
                    lng: data.response.venues[i].location.lng,
                };
                model.push(venue);
                self.breweryList.push(new Brewery(venue));
            }
        },
        error: function(obj, string, status) {
            $('#error').text("There was an error loading the locations. Please try again.")
        }
    });
}

function initMap() {
    var styles = [
        {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#242f3e"
              }
            ]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#746855"
              }
            ]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#242f3e"
              }
            ]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
        },
        {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#d59563"
              }
            ]
        },
        {
            "featureType": "poi",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#d59563"
              }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#263c3f"
              }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#6b9a76"
              }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#38414e"
              }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#212a37"
              }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9ca5b3"
              }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#746855"
              }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#1f2835"
              }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#f3d19c"
              }
            ]
        },
        {
            "featureType": "road.local",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
        },
        {
            "featureType": "transit",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#2f3948"
              }
            ]
        },
        {
            "featureType": "transit.station",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#d59563"
              }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#17263c"
              }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#515c6d"
              }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#17263c"
              }
            ]
        }
    ]
    map = new google.maps.Map(mapDiv, {
        center: center,
        zoom: 10,
        styles: styles
    });

    // This will create a marker on the map for each location in the model. The
    // location marker will have an info window that opens on click to display
    // the name of the brewery.

    var defaultMarker = setMarkerColor('cccccc');
    for (var i=0; i<model.length; i++) {
        // create a marker for each location
        var locationTitle = model[i].name;
        var location = {
            lat: model[i].lat,
            lng: model[i].lng
        }
        var marker = new google.maps.Marker({
            position: location,
            map: map,
            icon: defaultMarker,
            animation: google.maps.Animation.DROP,
            title: locationTitle,
            id: i
        });

        // create an info window for each location
        var infoWindow = new google.maps.InfoWindow({
            content: locationTitle
        });
        marker.addListener('mouseover', (function(thisMarker, thisInfoWindow){
            return function() {
                thisInfoWindow.open(map, thisMarker);
                changeMarkerColor(thisMarker, '746855')
            }
        })(marker, infoWindow));
        marker.addListener('mouseout', (function(thisMarker, thisInfoWindow){
            return function() {
                thisInfoWindow.close();
                changeMarkerColor(thisMarker, 'cccccc')
            }
        })(marker, infoWindow));
    };
    return marker;
}

function changeMarkerColor(markerObj, color) {
    markerObj.setIcon(setMarkerColor(color));
}

function setMarkerColor(color) {
    var marker = new google.maps.MarkerImage(
            'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|'+ color,
            new google.maps.Size(20, 32),
            new google.maps.Point(0,0),
            new google.maps.Point(0,32));
    return marker;
}

ko.applyBindings(new ViewModel());
