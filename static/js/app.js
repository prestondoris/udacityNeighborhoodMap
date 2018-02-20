var map;
var mapDiv = document.getElementById('map');
var center = {lat: 37.8044, lng: -122.2711};


// Create the model for our data points.
var model = [];

// Create a Brewery constructor
function Brewery(obj) {
    var self=this;
    self.name = ko.observable(obj.name);
}


var ViewModel = function() {
    var self = this;

    self.breweryList = ko.observableArray([]);

    // Connect to Foursquare to get a list of breweryies to populate our model
    // as well as out observableArray "breweryList"
    $.ajax({
        url:'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data: 'limit=20' +
                '&ll='+ center.lat +','+ center.lng +
                '&client_id=JAL1UGFNFEMLAWL4TZXUFQYTPHDDMUB3AND4OETDSEFFC1M4'+
                '&client_secret=M0UPWFB0MPWC5UR5H51K3WDUXZJACCIVYX4ENUNOAOLUYYSL'+
                '&v=20140806' +
                '&m=foursquare'+
                '&query=brewery',
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
                self.breweryList.push(venue.name);
            }
        },
        error: function(obj, string, status) {
            $('#error').text("There was an error loading the locations. Please try again.")
        }
    });

    self.filterResults = function() {
        return true;
    }
}

function initMap() {
    map = new google.maps.Map(mapDiv, {
        center: center,
        zoom: 11
    });

    // This will create a marker on the map for each location in the model. The
    // location marker will have an info window that opens on click to display
    // the name of the brewery.
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
            }
        })(marker, infoWindow));
        marker.addListener('mouseout', (function(thisMarker, thisInfoWindow){
            return function() {
                thisInfoWindow.close();
            }
        })(marker, infoWindow));
    }
}

ko.applyBindings(new ViewModel());
