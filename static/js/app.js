var map;
var mapDiv = document.getElementById('map');
var center = {lat: 37.8044, lng: -122.2711};

var model = ko.observableArray([]);
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
    async: true,
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
        }
    }
});

var ViewModel = function() {

}

function initMap() {
    map = new google.maps.Map(mapDiv, {
        center: center,
        zoom: 11
    });
}





ko.applyBindings(new ViewModel);
