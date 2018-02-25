var map;
var mapDiv = document.getElementById('map');
var center = {lat: 37.8044, lng: -122.2711};

// Create the model for our data points.
var model = [];
function populateModel() {
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
        async: true,
        success: function(data) {
            for(var i=0; i<data.response.venues.length; i++) {
                var venue = {
                    name: data.response.venues[i].name,
                    address: data.response.venues[i].location.address,
                    city: data.response.venues[i].location.city,
                    state: data.response.venues[i].location.state,
                    zip: data.response.venues[i].location.postalCode,
                    lat: data.response.venues[i].location.lat,
                    lng: data.response.venues[i].location.lng,
                    url: data.response.venues[i].url,
                    id: i+1
                };
                model.push(venue);
            }
            initMap.init();
            ko.applyBindings(new ViewModel());
        },
        error: function(obj, string, status) {
            $('#error').text("There was an error loading the locations. Please try again later.")
        }
    });
}


// Create a Brewery constructor
function Brewery(obj) {
    var self=this;
    self.name = ko.observable(obj.name);
    self.visible = ko.observable(true);
    self.id = ko.observable(obj.id);
    self.lat = obj.lat;
    self.lng = obj.lng;
}


var ViewModel = function() {
    var self = this;

    self.breweryList = ko.observableArray([]);
    self.showAside = ko.observable(true);
    self.hideAside = ko.observable(false);
    self.hide = ko.observable(false);
    self.inputHide = ko.observable(false);

    for(var i=0; i<model.length; i++) {
        self.breweryList.push(new Brewery(model[i]));
    }

    // This will filter the results in the list of items in breweryList
    self.input = ko.pureComputed({
        read: function() {
            return "";
        },
        write: function(value) {
            if(value == "") {
                for(var i=0; i<self.breweryList().length; i++) {
                    self.breweryList()[i].visible(true);
                    var id = self.breweryList()[i].id();
                    initMap.marker[id-1].setMap(initMap.map);
                }
            } else {
                for(var i=0; i<self.breweryList().length; i++) {
                    if(self.breweryList()[i].name().search(value) == -1) {
                        self.breweryList()[i].visible(false);
                        var id = self.breweryList()[i].id();
                        initMap.marker[id-1].setMap(null);
                    }
                }
            }
        }
    });

    self.newVenue = function(item) {
        populateModel(item.value);
    }

    self.toggleAsideDetails = function() {
        if(self.showAside() == false) {
            self.hide(false);
            self.inputHide(false);
            self.hideAside(false);
            self.showAside(true);
        } else {
            self.hide(true);
            self.inputHide(true);
            self.hideAside(true);
            self.showAside(false);
        }
    }

    self.enableMarker = function(item, event) {
        // get the id of the item in the breweryList observable array
        var id = item.id();
        if(event.type == 'mouseover') {
            initMap.marker[id-1].setIcon(initMap.setMarker('ffa600'));
        } else if(event.type == 'click') {
            var location = {
                lat: item.lat,
                lng: item.lng
            };
            var id = item.id();
            initMap.showInfoWindow(initMap.infoWindow[id-1], initMap.marker[id-1], location);
            initMap.marker[id-1].setIcon(initMap.setMarker('ffa600'));
        }
    }

    self.disableMarker = function(item) {
        var id = item.id();
        initMap.marker[id-1].setIcon(initMap.setMarker('2ccd89'));
    }

    // Connect to Foursquare to get a list of breweryies to populate our model
    // as well as out observableArray "breweryList"

}

var initMap = {

    // This init function will initialize the map and render it on the page.
    init: function() {
        var styles = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    }
]
        map = new google.maps.Map(mapDiv, {
            center: center,
            zoom: 10,
            styles: styles
        });
        this.map = map;
        initMap.createMarker();
    },

    // After init() is ran, this variable is set equal to the map created in
    // init that way KO will have access to the map object.
    map: {},

    // This is a blank array of markers that is populated by createMarker().
    // By setting it as a key in our initMap object, it will allow KO to access
    // the all of the markers on the list
    marker: [],

    infoWindow: [],

    // This will create a marker on the map for each location in the model. The
    // location marker will have an info window that opens on click to display
    // the name of the brewery.
    createMarker: function() {
        var self=this;
        var userFocus = false;
        var defaultMarker = this.setMarker('2ccd89');
        var highlightedMarker = this.setMarker('ffa600');

        for (var i=0; i<model.length; i++) {
            // create a marker for each location
            var title = model[i].name;
            var location = {
                lat: model[i].lat,
                lng: model[i].lng
            }
            var formatedAddress = ''+model[i].address+'<br>'
                +model[i].city+', '+model[i].state+' '+model[i].zip;
            var url = model[i].url;


            this.marker[i] = new google.maps.Marker({
                position: location,
                map: map,
                icon: defaultMarker,
                animation: google.maps.Animation.DROP,
                title: title,
                id: i
            });

            // create an info window for each location
            var theWindow = new google.maps.InfoWindow({

                content: '<div><h3>'+title+'</h3><hr><p>'+formatedAddress+
                    '</p><a href="'+url+'" target="_blank">'+url+'</a></div>'
            });


            // Add click event to marker. This functionality will allow the
            // info window to stay open after a click, but close when the user
            // clicks the close button on the info window
            initMap.setInfoWindowProperties(theWindow, this.marker[i], location, userFocus);
            this.infoWindow.push(theWindow);
        };
    },

    // This will set marker style and color for items on the map.
    setMarker: function(color) {
        var marker = new google.maps.MarkerImage(
                'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|'+ color,
                new google.maps.Size(20, 32),
                new google.maps.Point(0,0),
                new google.maps.Point(0,32));
        return marker;
    },

    setInfoWindowProperties: function(theWindow, theMarker, theLocation, userFocus) {
        var highlightedMarker = this.setMarker('ffa600');
        var defaultMarker = this.setMarker('2ccd89');

        theMarker.addListener('click', function() {
            initMap.showInfoWindow(theWindow, theMarker, theLocation);
            this.setIcon(highlightedMarker);

            theWindow.addListener('closeclick', function(){
                initMap.closeInfoWindow(this, theMarker);
                theMarker.setIcon(defaultMarker);
                userFocus = false;
            });
            userFocus = true;
        });

        theMarker.addListener('mouseover', function(){
            if(!userFocus) {
                theWindow.open(map, this);
                theMarker.setIcon(highlightedMarker);
            }
        });
        theMarker.addListener('mouseout', function(){
            if(!userFocus) {
                theWindow.close();
                theMarker.setIcon(defaultMarker);
            }
        });
    },


    showInfoWindow: function(theWindow, theMarker, theLocation) {
        theWindow.open(map, theMarker);
        initMap.toggleFocusMarker(theLocation, 13);
    },


    closeInfoWindow: function(theWindow, theMarker) {
        theWindow.close();
        initMap.toggleFocusMarker(center,10);
    },

    // This will focus the marker on the specific marker
    toggleFocusMarker: function(location,zoom) {
        map.setCenter(location);
        map.setZoom(zoom);
    }
}
