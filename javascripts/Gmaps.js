
// Since that geolocation navigator is stupid, you either have to have your whole javascript in that function or you have to save the location in local storage. If you save the coordinates as a variable, you get lucky sometimes and the script works but not all the time.

if ( typeof(Storage) !== "undefined") // see if local storage can be done.
{
    let UP = {lat: 1, lng: 2};
    localStorage.setItem("userposition", JSON.stringify(UP) );
}


var map; // This is for the google Maps functions
//var markers = [];

function addMarker(location){ // This adds and displays a marker.
    let marker = new google.maps.Marker( 
        {
            position: location,
            map: map
        }
    );
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

function initMap() {
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
    
};

let goButton = document.querySelector(".finish")

function formFilled(){ // Ideally, the address that they inserted would be converted into latitude and longitude, that seems really hard.
    let F_address = document.getElementById("address");
    let F_parkdate = document.getElementById("parkdate");
    let F_parkstart = document.getElementById("parkstart");
    let F_parkend = document.getElementById("parkend");

    let pos = JSON.parse( localStorage.userposition );
    let latitude = pos.lat;
    let longitude = pos.lng;
    console.log(latitude);

    // if there are any markers, delete them. Or they just have to refresh the page.

    // add markers where all of the posted parking spots should be (near the address).
    let Pspots = [];
    for (i=0; i < 10; i++)
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
    { addMarker(Pspots[i]) }
};


goButton.onclick = function(){
    formFilled();
};