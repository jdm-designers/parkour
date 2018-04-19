
// Since that geolocation navigator is stupid, you either have to have your whole javascript in that function or you have to save the location in local storage. If you save the coordinates as a variable, you get lucky sometimes and the script works but not all the time.

// TO DO: !'s 

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

// Set up important global variables
var map; 
//var zbase = 5; 
var markers = []; 
var Pspots = [];
var Nphonyspots = 10;
var infowindows = [];
let goButton = document.querySelector(".form");
let driverprofile = document.querySelector("#driverprofile");
var profileopen = false;


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

 
function messagebox(text, selector_Pelement){
    // check if there's already a message box. If so, do nothing.
    // add text and ok button
    // display message box
    // query for the ok button
    // add eventlistener to button

    let parenttag = document.querySelector(selector_Pelement);
    let box_node = document.createElement("div");
    box_node.className = "popbox" ;  // the z-index is already set.
    parenttag.appendChild( box_node ); // when you append child, it pushes this one to the beginning but only from element-wise perspective.

    let boxes = document.getElementsByClassName("popbox");
    let box = boxes[0];

    box.innerHTML = text+`<br><center><button class="close">OK</button></center>`;

    okbutton = document.querySelector("div.popbox > center > button.close");
    okbutton.addEventListener(
        'click', function(){ 
            parenttag.removeChild( box );
        }  
    );
}



function choicebox(text, selector_Pelement, ID){ 
    let boxcheck = document.getElementById("box_"+ID);
    if (boxcheck == null)
    {              
        var parenttag = document.querySelector(selector_Pelement);
        let box_node = document.createElement("div");
        box_node.id = "box_"+ID ; 
        box_node.className = "popbox" ; 
        parenttag.appendChild( box_node );

        var box = document.getElementById("box_"+ID);

        box.innerHTML = text+`<br><div class="rowincolumn"> <button class="choice" id="back_${ID}">Back</button> <button class="choice" id="cancel_${ID}">Cancel</button> </div>`;

        let backbutton = document.querySelector("#back_"+ID);
        backbutton.addEventListener(
            'click', function(){ 
                parenttag.removeChild( box ); 
            }  );
        let cancelbutton = document.querySelector("#cancel_"+ID);

        return cancelbutton
    }
}



function bookingbox(text, bookedspot){ // they have just clicked the "BOOK" button
    //let boxcheck = document.getElementById("box_"+1);
    //if (boxcheck == null)
    let boxescheck = document.getElementsByClassName("popbox");
    if (boxescheck.length == 0)
    {
        var thisbookingtag = bookedspot.tagger ; 
        let bookedspots = JSON.parse( localStorage.bookedspots );
        var alreadybooked = false;
        for (i=0 ; i< bookedspots.length ; i++)
        {
            if (thisbookingtag == bookedspots[i].tagger)
            {
                alreadybooked = true;
            }
        }
        if (alreadybooked == false)
        {
            bookedspots.push( bookedspot );       
            localStorage.bookedspots = JSON.stringify( bookedspots );

            let cancelbutton1 = choicebox(text, "body", 1);

            cancelbutton1.addEventListener(
                'click', function(){ // open other window
                    let boxcheck2 = document.getElementById("box_"+2);
                    if (boxcheck2 == null)
                    {
                        let text2 = `<h3>Are you sure want to cancel?</h3><p>If you cancel, you'll be charged a $1.00 fee.</p>`;
                        let cancelbutton2 = choicebox(text2, "body", 2); 
                        
                        cancelbutton2.addEventListener( // show one message box but close all other boxes.
                            'click', function(){
                                let bodytag = document.querySelector("body");
                                let box1 = document.getElementById("box_"+1);
                                let box2 = document.getElementById("box_"+2);
                                if (box1 != null){ bodytag.removeChild( box1 ) } // this IF statement is because they could reach the "back" button before clicking this "cancel" button
                                if (box2 != null){ bodytag.removeChild( box2 ) }

                                let textcancelled = `<p>You have cancelled this reservation.  A fee has been charged to your account.</p>`
                                messagebox(textcancelled, "body");

                                // delete this spot from local storage, so that later when they look at the profile, the profile will be rendered without this spot booked.
                                let bookedspots = JSON.parse( localStorage.bookedspots );
                                for (i=0 ; i< bookedspots.length ; i++)
                                {
                                    let checktag = bookedspots[i].tagger ; 
                                    if (checktag == thisbookingtag) 
                                    {
                                        bookedspots.splice( i ,1 ); // remove 1 element starting at index #ident
                                        localStorage.bookedspots = JSON.stringify( bookedspots ) ;
                                    }
                                }  // If the FOR loop never finds the correct tag, then the user must have clicked the profile and deleted it there before clicking this 2nd "cancel" button.                 
                            }
                        );
                    }
                    else
                    {
                        // do nothing because they reached the "cancel" button of Box #1 even though they are on Box #2 right now.
                    }
                }
            );
        }
        else
        {
            let text = `<h3>Check your profile</h3><p>You have already booked this spot before.</p>`;
            messagebox(text, "body");        
        }        
    }
    
}


function renderProfile(){

    var wrapper = document.getElementsByClassName("wrap")[0];

    if (profileopen == false)
    {
        profileopen = true;

        wrapper.style.width = "100%";
    }
    else
    {
        // just re-render everything below.
        old_profilepage = document.getElementsByClassName("profile")[0];
        wrapper.removeChild( old_profilepage ); 
    }

    var profilepage = document.createElement("div");
    profilepage.className = "profile";

    let bookedspots = JSON.parse( localStorage.bookedspots );

    if (bookedspots.length == 0)
    {
        var bookedsections = `<h3>You haven't booked anything yet!</h3> `;
    }
    else
    {
        var bookedsections = ""; 
        for (i=0 ; i < bookedspots.length ; i++)
        {
            let bookedsection = `<div class="bookedsection" id="reservation_${i}">`+
            `<img onclick="X_reservation(${i})" id="x_close" src="https://jdm-designers.github.io/parkour/images/close_grey.png" />`+
            `<p>Date:  ${bookedspots[i].date} <br>Owner:  ${bookedspots[i].owner} <br>Address:  ${bookedspots[i].address} <br>Time:   ${bookedspots[i].time_start} - ${bookedspots[i].time_end}</p>`+
            `</div>`;  // IDs are based on indices now.
            bookedsections = bookedsections+" "+bookedsection ;
        }
            
    }

    let backbutton_id = "back_profile";
    let insideprofile = `<div class="profile_top"> <h1 class="profile_top">Hello, Nicki Minaj!</h1> </div>`+
    `<div class="profile_bottom">`+
    `<h1 style="text-align: left">Your Upcoming Reservations</h1>`+
    `<div class="reservations"> ${bookedsections} </div>`+
    `<button class="close" id="${backbutton_id}">Back</button>`+ // hard-coded the ID
    `</div>`;
    profilepage.innerHTML = insideprofile;

    wrapper.appendChild( profilepage );

    let backbutton = document.getElementById(backbutton_id);
    backbutton.addEventListener(
        'click', function(){
            wrapper.removeChild( profilepage );
            wrapper.style.width = "auto";
            profileopen = false;
        }
    );
    /*
    topdiv.style.borderBottom = "2px solid black"
    */
}


// On click, open the driver profile page
driverprofile.addEventListener('click', renderProfile);


function X_reservation(ind){ // This is when they click the X button in the Profile. delete from local storage and re-render the profile page.
    var partial_ID = "profile_cancel";
    let profile_cancel_box = document.getElementById("box_"+partial_ID);
    if (profile_cancel_box == null)
    {
        parentelement = "div.profile";

        let text = `<h3>Are you sure want to cancel?</h3><p>If you cancel, you'll be charged a $1.00 fee.</p>`;
        profile_cancelbutton = choicebox(text, parentelement, partial_ID);

        profile_cancelbutton.addEventListener( // show one message box but close all other boxes.
            'click', function(){
                /*  There's no need to do this since the profile will be re-rendered anyway.
                let parenttag = document.querySelector(".reservations");
                let box = document.getElementById("reservation_"+ind);
                parenttag.removeChild( box );
                */

                let textcancelled = `<p>You have cancelled this reservation.  A fee has been charged to your account.</p>`
                
                let bookedspots = JSON.parse( localStorage.bookedspots );
                bookedspots.splice( ind ,1 ); // remove 1 element starting at index #ind

                localStorage.bookedspots = JSON.stringify( bookedspots ) ;
                renderProfile();

                messagebox(textcancelled, parentelement);
            }
        );
    }
}



//======= Code that needs Google Maps API ===========



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
        console.log('something went wrong with getting position. So, using phony central location.');

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


/* Thanks to the "addListener" this is no longer needed.
goButton.onclick = function(){
    let pos = JSON.parse( localStorage.userposition );
    formFilled(pos);
};
*/
