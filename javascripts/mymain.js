


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
datechoose.defaultValue = today;

let parkstartchoose = document.querySelector("#parkstart");
let preTtext = ''; 
if ( ( new Date().getHours() + 1 )% 24 < 10){ preTtext = '0'}
parkstartchoose.value = preTtext+String(  (new Date().getHours() + 1) % 24  )+":00";//String(  ( new Date().getHours() + 1 ) % 12 )+":00";



// All non-Gmaps API necessary functions


function messagebox(text, selector_Pelement){
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

    okbutton = document.querySelector("div.popbox  button.close"); //"div.popbox > center > button.close" // check out "css combinators"
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

        box.innerHTML = text+`<br><div class="rowincolumn"> <button class="choice" id="No_${ID}">No</button> <button class="choice" id="Yes_${ID}">Yes</button> </div>`;

        let nobutton = document.querySelector("#No_"+ID);
        nobutton.addEventListener(
            'click', function(){ 
                parenttag.removeChild( box ); 
            }  );
        let yesbutton = document.querySelector("#Yes_"+ID);

        return yesbutton
    }
}

function anybox(insiderHTML, selector_Pelement, ID, selector_return=null){

    let parenttag = document.querySelector(selector_Pelement);
    let box_node = document.createElement("div");
    box_node.className = "popbox" ;  // the z-index is already set.
    parenttag.appendChild( box_node ); // when you append child, it pushes this one to the beginning but only from element-wise perspective.

    let boxes = document.getElementsByClassName("popbox");
    let box = boxes[0];

    box.id = ID;
    box.innerHTML = insiderHTML;

    if (selector_return != null)
    {
        return document.querySelector( selector_return ); 
    }
}

function anybox2(insiderHTML, selector_Pelement, ID, selector_return1, selector_return2){

    let parenttag = document.querySelector(selector_Pelement);
    let box_node = document.createElement("div");
    box_node.className = "popbox" ;  // the z-index is already set.
    parenttag.appendChild( box_node ); // when you append child, it pushes this one to the beginning but only from element-wise perspective.

    let boxes = document.getElementsByClassName("popbox");
    let box = boxes[0];

    box.id = ID;
    box.innerHTML = insiderHTML;
    
    return [ document.querySelector( selector_return1 ), document.querySelector( selector_return2 ) ] ; 
}

function bookingbox(text, bookedspot){ // they have just clicked the "BOOK" button
    //let boxcheck = document.getElementById("box_"+1);
    //if (boxcheck == null)
    let boxescheck = document.getElementsByClassName("popbox");
    if (boxescheck.length == 0)
    {
        var thisbookingtag = bookedspot.tagger ; 
        var bookedspots = JSON.parse( localStorage.bookedspots );
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
            //bookedspots.push( bookedspot );       
            //localStorage.bookedspots = JSON.stringify( bookedspots );

            let yesbutton1 = choicebox(text, "body", 1);

            yesbutton1.addEventListener(
                'click', function(){ // open other window

                    // solidify that this is a new booked spot.
                    bookedspots.push( bookedspot );       
                    localStorage.bookedspots = JSON.stringify( bookedspots );

                    // delete previous choicebox
                    var parent = document.querySelector("body");
                    let box1 = document.getElementById("box_"+1);
                    parent.removeChild(box1);

                    let text2 = `<button class="X" id="congrats">x</button>`+
                    `<h3>You're all set!</h3><p>You've booked a parking spot at ${bookedspot.address} on ${bookedspot.date} from ${bookedspot.time_start} to ${bookedspot.time_end} at the rate of $2/hour.  The fee has been charged to your credit card in your profile.</p><p>To cancel your reservation, go to your profile page.</p>`+
                    `<br><center><button class="close" id="profile">Profile</button></center>`;

                    let bothbuttons = anybox2(text2, "body","box_congrats","button#profile", "button.X#congrats");

                    bothbuttons[1].addEventListener(
                        'click', function(){
                            let box2 = document.querySelector("#box_congrats");
                            parent.removeChild(box2);
                        }
                    );

                    bothbuttons[0].addEventListener(
                        'click', function(){
                            let box2 = document.querySelector("#box_congrats");
                            parent.removeChild(box2);

                            if (SM_open==false){
                                open_side(true);
                            }
                            renderProfile();
                        }
                    );                  
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
    var side_menu = document.getElementsByClassName("side_menu")[0];
    var side_switch = document.getElementsByClassName("side_switch")[0];

    if (profileopen == false)
    {
        profileopen = true;

        //side_menu.style.flexBasis = init_wrapper_width;
        //side_menu.style.width = init_wrapper_width;
        side_menu.style.flexGrow = "0";
        wrapper.style.width = "100%";
        side_switch.style.display = "none";
    }
    else
    {
        // just re-render everything below.
        let old_profilepage = document.getElementsByClassName("profile")[0];
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
    let insideprofile = `<div class="profile_top">`+
    `<button class="X" id="${backbutton_id}">x</button> <h1 class="profile_top">Hello, Leonardo DiCaprio!</h1>`+
    `<div class="profile_info">   <div>Email: TitanicBoy@college.harvard.edu</div> <div>Payment method: Visa card ending in 9876</div> <button id="edit_profile">Edit Profile Info</button>   </div>`+
    `</div>`+
    `<div class="profile_bottom">`+
    `<h1 style="text-align: left">Your Upcoming Reservations</h1>`+
    `<div class="reservations"> ${bookedsections} </div>`+
    `<button class="close" id="${backbutton_id}">Back</button>`+ // hard-coded the ID
    `</div>`;
    profilepage.innerHTML = insideprofile;

    wrapper.appendChild( profilepage );

    //let backbutton = document.getElementById(backbutton_id);
    let backer_buttons = document.querySelectorAll("#back_profile");
    for (i= 0 ; i< backer_buttons.length ; i++)
    {
        backer_buttons[i].addEventListener( 
            'click', function(){
                closeprofile(profilepage, wrapper, side_menu, side_switch); 
            }
        );
    }
}

function closeprofile(profile_page, wrapper, side_menu, side_switch){

    wrapper.removeChild( profile_page );
    //side_switch.style.zIndex = init_side_switch_zIndex;
    //side_switch.style.display = "auto";
    side_switch.style.display = "";
    //side_menu.style.flexBasis = "";
    //side_menu.style.width = '';
    side_menu.style.flexGrow = "1";
    //wrapper.style.width = init_wrapper_width;
    wrapper.style.width = 'auto';
    profileopen = false;
}

// On click, open the driver profile page
driverprofile.addEventListener('click', renderProfile); // doesn't seem to work for divs
/*
driverprofile.onclick = function(){
    renderProfile();
}
*/

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

function open_side(boole){
    //let wrapper = document.querySelector("div.wrap");
    let side_menu = document.querySelector("div.side_menu");
    let side_switch = document.querySelector("div.side_switch");
    if ( boole == false)
    {   
        /*
        side_menu.style.flexShrink = '1';
        wrapper.style.width = "10px";
        side_switch.style.left = "6px";
        */
        side_menu.innerHTML = '';
        //side_menu.style.flexShrink = "0"; // using the ".style" receieves and changes the inline HTML
        side_menu.style.flexGrow = "0";
        side_menu.style.flexBasis = "10px";
        side_switch.style.left = "10px";
        side_switch.setAttribute("onclick", "open_side(true)");
        side_switch.innerHTML = "&#10095;";
        SM_open = false;
    }
    if ( boole == true)
    {
        /*
        side_menu.style.flexShrink = '0';
        wrapper.style.width = init_wrapper_width;
        side_switch.style.left = init_side_switch_left;
        */
       side_switch.style.left = init_side_switch_left;
       //side_menu.style.flexShrink = '0';
       side_menu.style.flexGrow = '1';
       side_menu.style.flexBasis = init_side_menu_flexBasis;

       side_menu.innerHTML = init_side_menu_innerHTML;
       driverprofile = document.querySelector("#driverprofile"); 
       driverprofile.addEventListener('click', renderProfile);
       
       side_switch.setAttribute("onclick", "open_side(false)");
       side_switch.innerHTML = "&#10094;";
       SM_open = true;
    }
}


function home(){
    // close all "popbox"s
    // close profile page
    let boxes = document.getElementsByClassName("popbox");
    if (boxes.length > 0)
    {
        for (i = 0 ; i < boxes.length ; i++)
        {
            boxes[i].remove();
        }
    }
    if (profileopen == true)
    {
        let wrapper = document.getElementsByClassName("wrap")[0];
        let side_menu = document.getElementsByClassName("side_menu")[0];
        let side_switch = document.getElementsByClassName("side_switch")[0];
        let profilepage = document.querySelector("div.profile");
        closeprofile(profilepage, wrapper, side_menu, side_switch);
    }
}