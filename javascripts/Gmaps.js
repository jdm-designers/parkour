
// Since that geolocation navigator is stupid, you either have to have your whole javascript in that function or you have to save the location in local storage. If you save the coordinates as a variable, you get lucky sometimes and the script works but not all the time.

if ( typeof(Storage) !== "undefined") // see if local storage can be done.
{
    let UP = {lat: 1, lng: 2};
    localStorage.setItem("userposition", JSON.stringify(UP) );
}


var map; // This is for the google Maps related functions
var markers = [];
var infowindows = [];
let goButton = document.querySelector(".finish");

// on click ... delete the default "value"
var addressbarclicks = 0;
var addressbar = document.getElementById("address");
addressbar.onclick = function(){
    if (addressbarclicks == 0){ addressbar.value = '' };
    addressbarclicks += 1;
}

function addMarker(location, tag){ // This adds and displays a marker.
    let marker = new google.maps.Marker( 
        {
            position: location,
            map: map,
            tagger: tag
        }
    );
    return marker
};


function initialMapcenter(userlatitude, userlongitude){ // When the user first reaches the web page, center the map onto their location.
    var centralposition = {lat: userlatitude, lng: userlongitude};

    map = new google.maps.Map( 
        document.getElementById('map'), 
        {
        zoom: 12,
        center: centralposition//, mapTypeId: 'terrain' 
        } 
    );
};

function initMap() { // get or pick location to center on Map
    function geo_success(position){  // get user's location 
        userlatitude = position.coords.latitude;
        userlongitude = position.coords.longitude;
        localStorage.userposition = JSON.stringify(  {lat: userlatitude, lng: userlongitude} ) 

        initialMapcenter(userlatitude, userlongitude); 
    };
    function geo_error(){ // use phony location
        console.log('something went wrong.');

        userlatitude = 42.3807695;
        userlongitude = -71.1244957;
        localStorage.userposition = JSON.stringify(  {lat: userlatitude, lng: userlongitude}  );

        initialMapcenter(userlatitude, userlongitude); 
    }

    if ("geolocation" in navigator)
    {
        navigator.geolocation.getCurrentPosition( //geo_success, geo_error, geo_options
            geo_success, geo_error);
    }
    else
    {
        console.log('this browser sucks.')
        
        geo_error();
    }

    var geocoder = new google.maps.Geocoder();

    goButton.addEventListener( // set this button to "listen for clicks"
        'click', function(){ 
            // stop the user if the user they did not insert an address and a Date and a time.  Have a message box with an OK button.

            let F_address = document.getElementById("address").value;
            let F_parkdate = document.getElementById("parkdate").value;
            let F_parkstart = document.getElementById("parkstart").value;
            let F_parkend = document.getElementById("parkend").value;
            geocodeAddress(geocoder, map) }
    );
    
};

function geocodeAddress(geocoder, resultsMap) { // convert the address into longitude and latitude
    var address = document.getElementById('address').value;
    geocoder.geocode( 
        {'address': address}, function(results, status){
            if (status === 'OK') 
            {
                resultsMap.setCenter(results[0].geometry.location); // re-centers the map
                let newlocation = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() }; 

                //initialMapcenter(newlocation); // redefines the "map" variable and re-centers // this isn't allowed to be re-called.

                formFilled(newlocation);
                /*
                var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
                });
                */
            } 
            else 
            {
                //alert('Geocode was not successful for the following reason: ' + status);
                alert('I could not process this address. Reason:' + status); // Make this into a message box instead!

            }
        }
    );
};

function formFilled(pos){
    let F_address = document.getElementById("address").value;
    let F_parkdate = document.getElementById("parkdate").value;
    let F_parkstart = document.getElementById("parkstart").value;
    let F_parkend = document.getElementById("parkend").value;

    let latitude = pos.lat;
    let longitude = pos.lng;

    // if there are any markers, delete them. Or they just have to refresh the page.

    // add markers where all of the posted parking spots should be (near the address).
    let Pspots = [];
    for (i=1; i < 11; i++) // add 10 markers
    {
        if ( i % 2 == 0 )
        { var lat_adder = i*0.001 } // 'var' so that it escapes the IF statement
        if ( i % 2 == 1)
        { var lat_adder = -1*i*0.001 }
        if ( i < 5)
        { var long_adder = i*0.001 }
        if ( i > 4)
        { var long_adder = -1*i*0.001 }

        Pspots.push(
            {lat: latitude + lat_adder, lng: longitude + long_adder}
        );
    }
    for (i=0; i <10 ; i++)
    { 
        var newmarker = addMarker(Pspots[i], i) ;

        var contentString = `<h1>Name: Driveway ${i+1}</h2>`+
        `<p>Street: ${i+1} Ugly Ducklings Street`+
        `<br>Rate: \$2/hour`+
        `<br>Availability: ...`+  // Have this contain the same Date and Times the user already inserted.
        `<br>Host's Rating: ${i+1} out of 10`+
        `</p>`+
        `Image of driveway`;

        var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

        infowindows.push( infowindow );
        markers.push( newmarker );

        markers[i].addListener(
            'click', function(){ 
                console.log( this.tagger );
                infowindows[this.tagger].open( map, this ) // the FOR loop is not active here so the "i" counter isn't available.
            }
        );

    }
};


/* Thanks to the "addListener" this is no longer needed.
goButton.onclick = function(){
    let pos = JSON.parse( localStorage.userposition );
    formFilled(pos);
};
*/