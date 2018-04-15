
// Since that geolocation navigator is stupid, you either have to have your whole javascript in that function or you have to save the location in local storage. If you save the coordinates as a variable, you get lucky sometimes and the script works but not all the time.

// TO DO: !'s 

if ( typeof(Storage) !== "undefined") // see if local storage can be done.
{
    let UP = {lat: 1, lng: 2};
    localStorage.setItem("userposition", JSON.stringify(UP) );
}

// Set up important variables
var map; // This is for the google Maps related functions
var markers = [];
var Pspots = [];
var Nphonyspots = 10;
var infowindows = [];
let goButton = document.querySelector(".form");


// on click ... delete the default "value" in the address box
var addressbarclicks = 0;
var addressbar = document.getElementById("address");
addressbar.onclick = function(){
    if (addressbarclicks == 0){ addressbar.value = '' };
    addressbarclicks += 1;
}

// find today's real date and put that as the "min" value of the input parkstart tag
let today = new Date().toISOString().split('T')[0]; // get only yyyy-mm-dd
let datechoose = document.getElementById("parkdate");
datechoose.min = today;

 
function messagebox(text){
    // check if there's already a message box. If so, do nothing.
    // add text and ok button
    // display message box
    // query for the ok button
    // add eventlistener to button

    let boxcheck = document.getElementsByClassName("msgbox");
    if (boxcheck.length == 0)
    {
        let bodytag = document.querySelector("body");
        let box_node = document.createElement("div");
        box_node.className = "msgbox" ; 
        bodytag.appendChild( box_node );

        let box = document.getElementsByClassName("msgbox")[0];

        box.innerHTML = text+`<br><center><button class="close">OK</button></center>`;
        box.style.display = "block";

        okbutton = document.querySelector("button.close");
        okbutton.addEventListener(
            'click', function(){ 
                box.style.display = "none" ;
                bodytag.removeChild( box );
            }  
        );
    }
}


function bookingbox(text, ID){
    function thebox(text, ID){ 
        let boxcheck = document.getElementById("box_"+ID);
        if (boxcheck == null)
        {              
            let bodytag = document.querySelector("body");
            let box_node = document.createElement("div");
            box_node.id = "box_"+ID ; 
            box_node.className = "msgbox" ; 
            box_node.setAttribute('z-index', 5+ID);
            bodytag.appendChild( box_node );
            console.log( box_node );

            let box = document.getElementById("box_"+ID);

            box.innerHTML = text+`<br><div class="rowincolumn"> <button class="choice" id="back_`+ID+`">Back</button> <button class="choice" id="cancel_`+ID+`">Cancel</button> </div>`;
            box.style.display = "block";

            let backbutton = document.querySelector("#back_"+ID);
            backbutton.addEventListener(
                'click', function(){ 
                    box.style.display = "none";
                    bodytag.removeChild( box ); 
                }  );
            let cancelbutton = document.querySelector("#cancel_"+ID);

            return cancelbutton
        }
    }

    if (ID == 1)
    {
        let boxcheck = document.getElementById("box_"+ID);
        if (boxcheck == null)
        {
            let cancelbutton = thebox(text, ID);
            cancelbutton.addEventListener(
                'click', function(){ // open other window
                let text2 = `<h3>Are you sure want to cancel?</h3><p>If you cancel, you'll be charged a $1.00 fee.</p>`;
                let cb2 = thebox(text2, 2); 
                // do nothing with the button for now.
                }
            );
        }
    }
    else 
    {
        // do nothing as of now.
        // go to next page, I think.
    }
    
}


function bookingtext(address, date, tstart, tfinal){
    let text = `stuff`;

}


//======= Code that needs Google Maps API ===========



function addMarker(location, tag, parkaddress, parkdate, parkstart, parkend){ // This adds and displays a marker.
    let marker = new google.maps.Marker( 
        {
            position: location,
            map: map,
            tagger: tag,
            address: parkaddress,
            date: parkdate,
            time_start: parkstart,
            time_end: parkend,
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
    };

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
            // stop the user if the user they did not insert an address and a Date and a time.  Have a message box with an OK button.!
            let F_address = document.getElementById("address").value;
            let F_parkdate = document.getElementById("parkdate").value;
            let F_parkstart = document.getElementById("parkstart").value;
            let F_parkend = document.getElementById("parkend").value;
            if (F_address == "" || F_parkdate == "" || F_parkstart == "" || F_parkend == "")
            { // then show message box
                mymessage = `<h3>You're Not Done!</h3><p>Please fill out ALL information before clicking the "Go" button.</p>`
                messagebox(mymessage);
            }
            else
            {   
                let boxcheck = document.getElementsByClassName("msgbox");
                console.log(boxcheck);
                if (boxcheck.length == 0)
                {
                    geocodeAddress(geocoder, map);
                }
            }

            }
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
                //alert('I could not process this address. Reason:' + status); // Make this into a message box instead!
                message = `<h3>Problem with Address</h3>`+
                `<p>I could not process this address.<br>Reason: `+status+`</p>`
                messagebox(message);

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
    //for (i=markers.length; i < markers.length +10 ; i++)  Can't do this because markers.length keeps increases within the FOR loop
    let i_begin = markers.length;
    let i_end = markers.length + Nphonyspots;
    for (i = i_begin ; i < i_end ; i++)
    { 
        let parkaddress = (i-i_begin+1)+" Ugly Ducklings Street"
        var newmarker = addMarker(Pspots[i], i, parkaddress, human_date, F_parkstart, F_parkend) ;

        var mycontent = `<div class="iwindow">`+
        `<h1>Name: Driveway ${i+1}</h2>`+
        `<p class="iwindow">Street:  ${i-i_begin+1} Ugly Ducklings Street`+
        `<br>Rate:  \$2/hour`+
        `<br>Date:  `+human_date+  // Have this contain the same Date and Times the user already inserted.
        `<br>Availability:  `+F_parkstart+` - `+F_parkend+
        `<br>Host's Rating:  ${i-i_begin+1} out of 10`+
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
                infowindows[this.tagger].open( map, this ) // "this" refers to the marker object // the FOR loop is not active here so the "i" counter isn't available.

                var Paddress = this.address;
                var Pdate = this.date;
                var Pstart = this.time_start;
                var Pend = this.time_end;
                bookbuttons = document.getElementsByClassName("book");
                bookbutton = bookbuttons[bookbuttons.length-1];
                bookbutton.addEventListener( 'click', function(){ let textstuff = `<h3>You're all set!</h3><p>You've booked a parking spot at ${Paddress} on ${Pdate} from ${Pstart} to ${Pend}.</p><p>However, you can cancel this reservation.</p>`; bookingbox(textstuff, 1) });

            }
        );
    } // end of FOR loop

    /*
    let bookbuttons = document.getElementsByClassName("book");
    let l_end = bookbuttons.length;
    for (i=0 ; i=l_end ; i++)
    {
        bookbuttons[i].addEventListener( 'click', function(){ let textstuff = `stuff`; bookingbox(textstuff, "msgbox") });
    }
    */
};


/* Thanks to the "addListener" this is no longer needed.
goButton.onclick = function(){
    let pos = JSON.parse( localStorage.userposition );
    formFilled(pos);
};
*/