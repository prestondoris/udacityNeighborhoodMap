var map;
var mapDiv = document.getElementById('map');

function initMap() {
    map = new google.maps.Map(mapDiv, {
        center: {lat: 37.7749, lng: -122.4194},
        zoom: 10
    });
}
