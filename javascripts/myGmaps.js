

// ====== Set up ==== 

// Since that geolocation navigator is stupid, you either have to have your whole javascript in that function or you have to save the location in local storage. If you save the coordinates as a variable, you get lucky sometimes and the script works but not all the time.

if ( typeof(Storage) !== "undefined") // see if local storage can be done.
{    
    if (localStorage.tagger) // what if some other student has this same localstorage name???
    {
        // don't set up any storage
        // my initializer google maps functions searches user's location everytime anyway.
        var initial_tagger = Number(localStorage.tagger); // global variable
    }
    else
    {
        localStorage.setItem("bookedspots", JSON.stringify( [] ) );
        var initial_tagger = 0; // global variable
        localStorage.setItem("tagger", initial_tagger) ;  // number of markers generated since local storage was initially set up. this makes for a unique identifier
        let UP = {lat: 1, lng: 2};
        localStorage.setItem("userposition", JSON.stringify(UP) );
    }
}
else
{
    alert("Sorry, this site needs local storage");
}

// Set up important global variables

var map; 
var zbase = 5; 
var markers = []; 
var Pspots = [];
var Nphonyspots = 10;
var infowindows = [];

let goButton = document.querySelector(".form");
var driverprofile = document.querySelector("#driverprofile");
/*
var init_wrapper_width = document.getElementsByClassName("wrap")[0].style.width;
var init_side_menu_innerHTML = document.querySelector("div.side_menu").innerHTML;
let init_side_switch = document.querySelector("div.side_switch");
var init_side_switch_left = init_side_switch.style.left;
var init_side_switch_zIndex = init_side_switch.style.zIndex;
*/
let side_menu = document.querySelector("div.side_menu");
var init_side_menu_innerHTML = side_menu.innerHTML;
let side_menu_style = window.getComputedStyle(side_menu);
var init_side_menu_flexBasis = side_menu_style.flexBasis;

let side_switch = document.querySelector("div.side_switch");
side_switch.style.left = init_side_menu_flexBasis;
// side_switch_style.left = init_side_menu_flexBasis; this can't be done... Error: "Uncaught DOMException: Failed to set the 'left' property on 'CSSStyleDeclaration': These styles are computed, and therefore the 'left' property is read-only.""
var init_side_switch_left = init_side_menu_flexBasis;

var profileopen = false;


//======= Code that needs Google Maps API ===========


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

function geo_success(position){  // get user's location 
    userlatitude = position.coords.latitude;
    userlongitude = position.coords.longitude;
    localStorage.userposition = JSON.stringify(  {lat: userlatitude, lng: userlongitude} ) 

    initialMapcenter(userlatitude, userlongitude); 
};

function geo_error(){ // use phony location
    console.log('something went wrong with getting position. So, using phony central location.');

    userlatitude = 42.3807695;
    userlongitude = -71.1244957;
    localStorage.userposition = JSON.stringify(  {lat: userlatitude, lng: userlongitude}  );

    initialMapcenter(userlatitude, userlongitude); 
};

var geo_options = { // this is the "PositionOptions" interface/object
    enableHighAccuracy: false, // this is the default //  "Is a Boolean that indicates the application would like to receive the best possible results. If true and if the device is able to provide a more accurate position, it will do so. Note that this can result in slower response times or increased power consumption (with a GPS chip on a mobile device for example). On the other hand, if false, the device can take the liberty to save resources by responding more quickly and/or using less power. Default: false."
    maximumAge: 100000, // "Is a positive long value indicating the maximum age in milliseconds of a possible cached position that is acceptable to return. If set to 0, it means that the device cannot use a cached position and must attempt to retrieve the real current position. If set to Infinity the device must return a cached position regardless of its age. Default: 0."
    timeout: 2000 // default is Infinity // "Is a positive long value representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position. The default value is Infinity, meaning that getCurrentPosition() won't return until the position is available."
}

function initMap() { // get or pick location to center on Map


    //  I have a hunch that something in here is causing the slow-white background
    if ("geolocation" in navigator)
    {
        navigator.geolocation.getCurrentPosition( geo_success, geo_error, geo_options ); //geo_success, geo_error, geo_options
    }
    else
    {
        console.log('this browser sucks.')
        
        geo_error();
    }
    
    /* 
    //======= So instead, I just do use the phony location every time.====
    userlatitude = 42.3807695;
    userlongitude = -71.1244957;
    localStorage.userposition = JSON.stringify(  {lat: userlatitude, lng: userlongitude}  );

    initialMapcenter(userlatitude, userlongitude); 
    //=========
    */
    
    var geocoder = new google.maps.Geocoder();

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
    
                } 
                else 
                {
                    //alert('Geocode was not successful for the following reason: ' + status);
                    //alert('I could not process this address. Reason:' + status); // Make this into a message box instead!
                    message = `<h3>Problem with Address</h3>`+
                    `<p>I could not process this address.<br>Reason: `+status+`</p>`
                    messagebox(message, "body");
    
                }
            }
        );
    };

    goButton.addEventListener( // set this button to "listen for clicks"
        'click', function(){ 
            let boxescheck = document.getElementsByClassName("popbox");
            if (boxescheck.length == 0)
            {
                // stop the user if the user they did not insert an address and a Date and a time.  Have a message box with an OK button.!
                let F_address = document.getElementById("address").value;
                let F_parkdate = document.getElementById("parkdate").value;
                let F_parkstart = document.getElementById("parkstart").value;
                let F_parkend = document.getElementById("parkend").value;
                if (F_address == "" || F_parkdate == "" || F_parkstart == "" || F_parkend == "")
                { // then show message box
                    mymessage = `<h3>You're Not Done!</h3><p>Please fill out ALL information before clicking the "Go" button.</p>`
                    messagebox(mymessage, "body");
                }
                else
                {   
                    geocodeAddress(geocoder, map);
                }
            }
        }

    );
    
};


function formFilled(pos){
    let F_address = document.getElementById("address").value;
    let F_parkdate = document.getElementById("parkdate").value;
    let F_parkstart = document.getElementById("parkstart").value;
    let F_parkend = document.getElementById("parkend").value;

    let y_m_d = F_parkdate.split("-");
    let year = y_m_d[0];
    let month = y_m_d[1];
    let day = y_m_d[2];
    let human_date =  new Date(year,month,day).toDateString();

    F_parkstart = timestring(F_parkstart);
    F_parkend = timestring(F_parkend);

    let latitude = pos.lat;
    let longitude = pos.lng;

    // if there are any markers, delete them. Or they just have to refresh the page.... For now, they just have to refresh the page.

    // add markers where all of the posted parking spots should be (near the address).!
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

    var tag = Number(localStorage.tagger) ; // JSON.parse would work too. Without either of these, the number is a string and thus the adding and subtracting would fail.

    //for (i=markers.length; i < markers.length +10 ; i++)  Can't do this because markers.length keeps increases within the FOR loop
    let i_begin = markers.length;
    let i_end = markers.length + Nphonyspots;
    for (i = i_begin ; i < i_end ; i++)  // this loop iterates "Nphonyspots" times.
    { 
        let parkaddress = (i-i_begin+1)+" Ugly Ducklings Street" ;
        tag += 1;
        let owner_name = "Driveway "+tag ;
        var newmarker = addMarker(Pspots[i], tag, owner_name, parkaddress, human_date, F_parkstart, F_parkend) ;

        var mycontent = `<div class="iwindow">`+
        `<h1>Name: ${owner_name}</h2>`+
        `<p class="iwindow">Street:   ${parkaddress}`+
        `<br>Rate:   \$2/hour`+
        `<br>Date:   `+human_date+  // Have this contain the same Date and Times the user already inserted.
        `<br>Availability:   `+F_parkstart+` - `+F_parkend+
        `<br>Host's Rating:   ${i-i_begin+1} out of 10`+
        `</p>`+
        `<div class="rowincolumn">  <p>Image of driveway</p> <button class="book">Book</button>  </div>`+
        `</div>`;

        var infowindow = new google.maps.InfoWindow({
            content: mycontent
          });

        infowindows.push( infowindow );
        markers.push( newmarker );

        markers[i].addListener(
            'click', function(){ 
                //let ind  = (this.tagger-1) % Nphonyspots ;
                let ind = this.tagger-initial_tagger-1;
                infowindows[ind].open( map, this ) // "this" refers to the marker object // the FOR loop is not active here so the "i" counter isn't available. // since tagger can be more than Nphonyspots I needed to divide by 10 and then find the remainder, and then subtract by 1 to make it an index.

                var objecttag = this.tagger ;
                var owner_name = this.owner;
                var Paddress = this.address;
                var Pdate = this.date;
                var Pstart = this.time_start;
                var Pend = this.time_end;
                bookbuttons = document.getElementsByClassName("book");
                bookbutton = bookbuttons[bookbuttons.length-1];
                bookbutton.addEventListener( 
                    'click', function(){ 
                        let textstuff = `<h3>You're all set!</h3><p>You've booked a parking spot at ${Paddress} on ${Pdate} from ${Pstart} to ${Pend}.</p><p>However, you can cancel this reservation.</p><p>This reservation is now in your profile.</p>`;    

                        let bookedspot= {
                            tagger: objecttag,
                            owner: owner_name,
                            address: Paddress,
                            date: Pdate,
                            time_start: Pstart,
                            time_end: Pend
                        };
                        bookingbox(textstuff, bookedspot);
                    }
                );

            }
        );
    } // end of FOR loop
    localStorage.tagger = tag ; 
};

function timestring(militarytime){
    // Example: militartime = "14:00"
    let halfday = 'AM';
    if ( Number( militarytime.split(":")[0] ) > 11 ){ halfday = 'PM' } // because it cannot be 24.

    var time_str;
    switch( Number( militarytime.split(":")[0] ) )
    {
        default:
            time_str = String( Number( militarytime.split(":")[0] ) % 12 )+":"+militarytime.split(":")[1]+` ${halfday}` ;   
            break;
        case 12:
            time_str = "12:00 PM";  
            break;

        case 0:
            time_str = "12:00 AM";  
    }
    return time_str
}

function addMarker(location, tag, name, parkaddress, parkdate, parkstart, parkend){ // This adds and displays a marker.
    let marker = new google.maps.Marker( 
        {
            position: location,
            map: map,
            tagger: tag,
            owner: name,
            address: parkaddress,
            date: parkdate,
            time_start: parkstart,
            time_end: parkend
        }
    );
        
    return marker
};


/* Thanks to the "addListener" this is no longer needed.
goButton.onclick = function(){
    let pos = JSON.parse( localStorage.userposition );
    formFilled(pos);
};
*/
