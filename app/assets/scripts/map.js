// Global Marker Wrappers and Map
var globalMarkers = null;
var markersDisplayedOnMap = null;
var globalMap = null;
var markerCluster = null;


// Geographic bounds centered according to incident report locations
var geographicBounds = null;

// Initial map center coordinates
INITIAL_CENTER_LAT = 39.952;
INITIAL_CENTER_LONG = -75.195;
initial_coords = new google.maps.LatLng(INITIAL_CENTER_LAT, INITIAL_CENTER_LONG);

// Bounds for the Date Slider. End date is current date.
var MIN_DATE;
var startDate;
var endDate = new Date();

// Take a list of markers and a map, put them on the map, set the
// minimum date, and set the location bounds
function storeMarkerState(markers, map, minDate, bounds, oms) {
    globalMarkers = markers;
    markersDisplayedOnMap = markers;
    globalMap = map;
    markerCluster = new MarkerClusterer(map, markers, {gridSize: 50, maxZoom: 15, minimumClusterSize: 15, imagePath: 'static/images/clusterer/m'});
    for (mw = 0; mw < globalMarkers.length; mw++)
    {
        (globalMarkers[mw]).setMap(globalMap);
        oms.addMarker(globalMarkers[mw]);

    }
    MIN_DATE = minDate;
    startDate = minDate;
    geographicBounds = bounds;
    map.fitBounds(bounds);
}

// Use Google geocoder to update geolocation given an address through
// the address search box
function update_center() {
    geocoder = new google.maps.Geocoder();
    address = $("#address").val();
    if (geocoder) {
        geocoder.geocode( { 'address': address},
        function(results, status) {
            if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                $('#address_error').modal('show');
            }
            else if (status != google.maps.GeocoderStatus.OK) {
                $('#geocode_error').modal('show');
            }
            else {
                globalMap.setCenter(results[0].geometry.location);
            }
            /*$('.close.icon').on('click', function() {
                $(this).parent().hide();
            });*/
        });
    }
}

// Heavily inspired by https://jsfiddle.net/mi3afzal/ogsvzacz/2/
// Adds a "geolocate" button to the map.
function addLocationButton(map) {
	var controlDiv = document.createElement('div');

	var firstChild = document.createElement('button');
	firstChild.style.backgroundColor = '#fff';
	firstChild.style.border = 'none';
	firstChild.style.outline = 'none';
	firstChild.style.width = '28px';
	firstChild.style.height = '28px';
	firstChild.style.borderRadius = '2px';
	firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
	firstChild.style.cursor = 'pointer';
	firstChild.style.marginRight = '10px';
	firstChild.style.padding = '0px';
	firstChild.title = 'Your Location';
	controlDiv.appendChild(firstChild);

	var secondChild = document.createElement('div');
	secondChild.style.margin = '5px';
	secondChild.style.width = '18px';
	secondChild.style.height = '18px';
	secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
	secondChild.style.backgroundSize = '180px 18px';
	secondChild.style.backgroundPosition = '0px 0px';
	secondChild.style.backgroundRepeat = 'no-repeat';
	secondChild.id = 'you_location_img';
	firstChild.appendChild(secondChild);

	google.maps.event.addListener(map, 'dragend', function() {
		$('#you_location_img').css('background-position', '0px 0px');
	});

	firstChild.addEventListener('click', function() {
		var imgX = '0';
		var animationInterval = setInterval(function(){
			if(imgX == '-18') imgX = '0';
			else imgX = '-18';
			$('#you_location_img').css('background-position', imgX+'px 0px');
		}, 500);
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				map.setCenter(latlng);
				clearInterval(animationInterval);
				$('#you_location_img').css('background-position', '-144px 0px');
			});
		}
		else{
			clearInterval(animationInterval);
			$('#you_location_img').css('background-position', '0px 0px');
		}
	});

	controlDiv.index = 1;
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}

function addCenterButton(map) {
    var centerDiv = document.createElement('div');

    var centerButton = document.createElement('button');
    centerButton.style.backgroundColor = '#fff';
    centerButton.style.border = 'none';
    centerButton.style.outline = 'none';
    centerButton.style.width = '28px';
    centerButton.style.height = '28px';
    centerButton.style.borderRadius = '2px';
    centerButton.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    centerButton.style.cursor = 'pointer';
    centerButton.style.marginBottom = '10px';
    centerButton.style.marginRight = '10px';
    centerButton.style.padding = '0px';
    centerButton.style.textAlign = 'center';
    centerButton.innerHTML = '  <i class="reply icon"></i>';
    centerButton.value = 'Reports Center';
    centerButton.title = 'Reports Center';
    centerButton.id = 'centerButton';
    centerDiv.appendChild(centerButton);

    centerButton.addEventListener('click', function() {
        map.fitBounds(geographicBounds);
    });
    centerDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerDiv);
}

// Get address submit event and checkbox change events
$(document).ready(function() {
    $('#addressForm').on('submit', function (event) {
        update_center();
        return false;
    });
    $('#licenseForm').on('submit', function (event) {
        filterMarkers();
        return false;
    });
    $('#automobile').prop('checked', true);
    $('#pedestrian').prop('checked', true);
    $('#bicycle').prop('checked', true);
    $('#other').prop('checked', true);
    $('#automobile').on('change', function(event) {
        filterMarkers();
    });
    $('#bicycle').on('change', function(event) {
        filterMarkers();
    });
    $('#pedestrian').on('change', function(event) {
        filterMarkers();
    });
    $('#other').on('change', function(event) {
        filterMarkers();
    });
});

function getNextDate(startDate) {
    startDate.setDate(startDate.getDate()+1);
    return startDate;
}

function initializeDateRange() {
  $('#start-date').calendar({
    type: 'date',
    endCalendar: $('#end-date'),
    popupOptions: {
      position: 'right center',
      lastResort: 'right center',
      prefer: 'right',
      hideOnScroll: false
    },
    onChange: function (date, text, mode) {
      startDate = date;
      filterMarkers();
    }
  });

  $('#end-date').calendar({
    type: 'date',
    startCalendar: $('#start-date'),
    popupOptions: {
      position: 'right center',
      lastResort: 'right center',
      prefer: 'right',
      hideOnScroll: false
    },
    onChange: function (date, text, mode) {
      endDate = date;
      filterMarkers();
    }
  });

  // initializes the dates for the calendar
  $('#start-date').calendar('set date', startDate);
  $('#end-date').calendar('set date', endDate);
}

function withinRectangleBounds(marker, bounds) {
    return bounds === null || bounds.contains(marker.getPosition());
}

function withinPolygonBounds(marker, vertices) {
    return vertices === null || google.maps.geometry.poly.containsLocation(marker.getPosition(), polygon);
}

function withinDateRange(marker) {
    time = marker.incidentDate.getTime();
    return time >= startDate.getTime() && time < endDate.getTime();
}

function fitsVehicleType(marker) {
    return (marker.automobileNum > 0 && $('#automobile').is(':checked')) ||
           (marker.pedestrianNum > 0 && $('#pedestrian').is(':checked')) ||
           (marker.bicycleNum > 0 && $('#bicycle').is(':checked')) ||
           (marker.otherNum > 0 && $('#other').is(':checked'));
}

function fitsLicenseSearch(marker) {
    var licenseSearch = $('#license').val();
    return marker.licensePlates.includes(licenseSearch);
}

function filterMarkers() {
    markersDisplayedOnMap = [];
    var bounds = (rectangle === null) ? null : rectangle.getBounds();
    var vertices = (polygon === null) ? null : polygon.getPath();
    for (mw = 0; mw < globalMarkers.length; mw++) {
        var marker = globalMarkers[mw];
        if (withinRectangleBounds(marker, bounds) && withinPolygonBounds(marker, vertices) &&
                withinDateRange(marker) && fitsVehicleType(marker) && fitsLicenseSearch(marker)) {
            marker.setMap(globalMap);
            markersDisplayedOnMap.push(marker);
        } else {
            marker.setMap(null);
        }
    }
    markerCluster.clearMarkers();
    markerCluster.addMarkers(markersDisplayedOnMap);
}

function resetDates() {
    startDate = MIN_DATE;
    endDate = new Date();
    $('#start-date').calendar('set date', startDate);
    $('#end-date').calendar('set date', endDate);
    filterMarkers();
}
