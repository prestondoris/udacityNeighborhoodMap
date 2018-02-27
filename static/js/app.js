var map;
var mapDiv = document.getElementById('map');
var center = {lat: 37.8044, lng: -122.2711};

// Create the model for our data points.
var model = [];

// Connect to Foursquare to get a list of breweryies to populate our model
function populateModel() {
    var success = true;
    $.ajax({
        url:'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data: 'limit=22' +
                '&ll='+ center.lat +','+ center.lng +
                '&client_id=JAL1UGFNFEMLAWL4TZXUFQYTPHDDMUB3AND4OETDSEFFC1M4'+
                '&client_secret='+
                    'M0UPWFB0MPWC5UR5H51K3WDUXZJACCIVYX4ENUNOAOLUYYSL'+
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
            success = true;
            initMap.createMarker();
            ko.applyBindings(new ViewModel(success));
        },
        error: function(obj, string, status) {
            success = false;
            ko.applyBindings(new ViewModel(success));
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


var ViewModel = function(success) {
        var self = this;

        self.breweryList = ko.observableArray([]);
        self.showAside = ko.observable(true);
        self.hideAside = ko.observable(false);
        self.hide = ko.observable(false);
        self.inputHide = ko.observable(false);
        self.error = ko.observable(false);
        self.errorMessage = ko.observable();
        if(!success) {
            self.error(true);
            self.errorMessage('There was an error loading the locations.'+
                                        'Please try again later.');
            self.hideAside(true);
            self.inputHide(true);
            self.showAside(false);
        }


        for(var i=0; i<model.length; i++) {
            self.breweryList.push(new Brewery(model[i]));
        }

        // This will filter the results in the list of items in breweryList
        self.input = ko.pureComputed({
            read: function() {
                return "";
            },
            write: function(value) {
                var id;
                if(value === "") {
                    for(var i=0; i<self.breweryList().length; i++) {
                        self.breweryList()[i].visible(true);
                        id = self.breweryList()[i].id();
                        initMap.marker[id-1].setMap(initMap.map);
                    }
                } else {
                    for(var j=0; j<self.breweryList().length; j++) {
                        if(self.breweryList()[j].name().search(value) == -1) {
                            self.breweryList()[j].visible(false);
                            id = self.breweryList()[j].id();
                            initMap.marker[id-1].setMap(null);
                        }
                    }
                }
            }
        });

        self.newVenue = function(item) {
            populateModel(item.value);
        };

        self.toggleAsideDetails = function() {
            if(self.showAside() === false) {
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
        };

        self.enableMarker = function(item) {
            // get the id of the item in the breweryList observable array
            var id = item.id() - 1;
            initMap.markers[id].setIcon(initMap.setMarker('ffa600'));
        };

        self.disableMarker = function(item) {
            var id = item.id() - 1;
            initMap.markers[id].setIcon(initMap.setMarker('2ccd89'));
        };

        self.showInfoWindow = function(item) {
            var id = item.id()-1;
            var info = initMap.getModelInfo(model[id]);
            initMap.setInfoWindow(info, initMap.markers[id]);
            initMap.showInfoWindow(initMap.markers[id], info.location);
        };


};

function googleMapsError() {
    alert('There was an error loading the Map. We apologize for this. Please try this again later.');
};

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
        ];
        map = new google.maps.Map(mapDiv, {
            center: center,
            zoom: 10,
            styles: styles
        });
        this.map = map;
        this.infoWindow = new google.maps.InfoWindow();
        populateModel();
    },

    // After init() is ran, this variable is set equal to the map created in
    // init that way KO will have access to the map object.
    map: {},

    // This is a blank array of markers that is populated by createMarker().
    // By setting it as a key in our initMap object, it will allow KO to access
    // the all of the markers on the list
    markers: [],

    // after init() is ran, this variable is set equal to the instance of the
    // info window that was created in init().
    infoWindow: {},

    // This will create a marker on the map for each location in the model. The
    // location marker will have an info window that opens on click to display
    // the name of the brewery.
    createMarker: function() {
        var highlightedMarker = this.setMarker('ffa600');
        var defaultMarker = this.setMarker('2ccd89');

        for (var i=0; i<model.length; i++) {
            // create a marker for each location
            var item = initMap.getModelInfo(model[i]);

            var marker = new google.maps.Marker({
                position: item.location,
                map: map,
                icon: defaultMarker,
                animation: google.maps.Animation.DROP,
                title: item.title,
                id: i
            });
            this.markers.push(marker);

            marker.addListener('click', (function(thisItem, thisMarker) {
                return function() {
                    initMap.setInfoWindow(thisItem, thisMarker);
                    initMap.showInfoWindow(thisMarker, thisItem.location);
                    this.setIcon(highlightedMarker);
                };
            })(item, marker));

            marker.addListener('mouseover', function(){
                this.setIcon(highlightedMarker);
            });
            marker.addListener('mouseout', function(){
                this.setIcon(defaultMarker);
            });
        }
    },

    getModelInfo: function(modelItem) {
        var title = modelItem.name;
        var location = {
            lat: modelItem.lat,
            lng: modelItem.lng
        };
        var formatedAddress = ''+modelItem.address+'<br>'+
            modelItem.city+', '+modelItem.state+' '+modelItem.zip;
        var url = modelItem.url;

        return {
            name: title,
            location: location,
            address: formatedAddress,
            url: url
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

    // This function will set the content and ability to close the info window
    setInfoWindow: function(modelInfo, marker) {
        var defaultMarker = this.setMarker('2ccd89');
        if(this.infoWindow.marker != marker) {
            this.infoWindow.setContent('');
            this.infoWindow.marker = marker;
            this.infoWindow.setContent('<div><h3>' + modelInfo.name +'</h3><hr><p>' +
                                modelInfo.address + '</p><a href="' + modelInfo.url +
                                '" target="_blank">' + modelInfo.url + '</a></div>');
            this.infoWindow.addListener('closeclick', function(){
                initMap.closeInfoWindow(this, marker);
                marker.setIcon(defaultMarker);
            });
        }
    },

    // Display the info window
    showInfoWindow: function(theMarker, theLocation) {
        this.infoWindow.open(map, theMarker);
        initMap.toggleFocusMarker(theLocation, 13);
    },

    // Close the info window
    closeInfoWindow: function(theWindow, theMarker) {
        theWindow.close();
        initMap.toggleFocusMarker(center,10);
    },

    // This will focus the marker on the specific marker
    toggleFocusMarker: function(location,zoom) {
        map.setCenter(location);
        map.setZoom(zoom);
    }
};
