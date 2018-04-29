


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

    if (rightsideopen == false)
    {
        open_RightSide(true);
    }
    else
    {
        let profilepage = document.querySelector("div.profile");
        if (profilepage != null)
        {
            // just re-render everything below.
            let old_profilepage = document.getElementsByClassName("profile")[0];
            wrapper.removeChild( old_profilepage ); 
        }
        else // must be the Parkour page that is open
        {
            let parkourpage = document.querySelector('div.parkour');
            wrapper.removeChild( parkourpage );
        }
        
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
    let backer_buttons = document.querySelectorAll("#"+backbutton_id);
    for (i= 0 ; i< backer_buttons.length ; i++)
    {
        backer_buttons[i].addEventListener( 
            'click', function(){
                open_RightSide(false, profilepage); 
            }
        );
    }
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


function open_RightSide(boole, rightside_page=null){
    var wrapper = document.getElementsByClassName("wrap")[0];
    var side_menu = document.getElementsByClassName("side_menu")[0];
    var side_switch = document.getElementsByClassName("side_switch")[0];

    if (boole == false)
    {
        wrapper.removeChild( rightside_page );
        //side_switch.style.zIndex = init_side_switch_zIndex;
        //side_switch.style.display = "auto";
        side_switch.style.display = "";
        //side_menu.style.flexBasis = "";
        //side_menu.style.width = '';
        side_menu.style.flexGrow = "1";
        //wrapper.style.width = init_wrapper_width;
        wrapper.style.width = 'auto';
        rightsideopen = false;
    }
    else
    {
        //side_menu.style.flexBasis = init_wrapper_width;
        //side_menu.style.width = init_wrapper_width;
        side_menu.style.flexGrow = "0";
        wrapper.style.width = "100%";
        side_switch.style.display = "none";
        rightsideopen = true;
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
if (bodydisplay == 'flex')// this will only happen if screen size is small ... according to my stylesheet
{
    open_side(false);
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
    if (rightsideopen == true)
    {
        let profilepage = document.querySelector("div.profile");
        if (profilepage != null)
        {
            open_RightSide(false, profilepage);
        }
        else // must be the Parkour page
        {
            let parkourpage = document.querySelector("div.parkour");
            open_RightSide(false, parkourpage);
        }
        
    }
}


function renderParkour(){
    
    let profilepage = document.querySelector("div.profile");
    if (profilepage != null)
    {
        open_RightSide(false, profilepage);
    }

    if ( rightsideopen == false )
    {
        open_RightSide(true);
    }

    var parkourpage = document.querySelector("div.parkour");
    if (parkourpage == null)
    {
        let wrapper = document.getElementsByClassName("wrap")[0];

        parkourpage = document.createElement("div");
        parkourpage.className = "parkour";

        let backbutton_id = "back_parkour";
        insideparkour = `<div class="parkour_top">`+
        `<button class="X" id="${backbutton_id}">x</button> <h1 class="Parkour">Parkour</h1>`+
        `<center><h2>By Janet Ho, Maurice Wilson, Dhruv Suri</h3></center>`+
        `</div>`+
        `<div class="parkour_bottom">`+
        `<h3>Problem</h3>`+problem_text+
        `<h3>Design Process</h3>`+process_text+
        `<h3>The Foreseeable Impact</h3>`+impact_text+
        `<button class="close" id="${backbutton_id}">Back</button>`+ // hard-coded the ID
        `</div>`;       
        
        parkourpage.innerHTML = insideparkour;

        wrapper.appendChild( parkourpage );

        let backer_buttons = document.querySelectorAll("#"+backbutton_id);
        for (i= 0 ; i< backer_buttons.length ; i++)
        {
            backer_buttons[i].addEventListener( 
                'click', function(){
                    open_RightSide(false, parkourpage); 
                }
            );
        }
    }
}

var problem_text = `<p>In today’s day and age, parking in metropolitan cities has increasingly become an issue. People attempting to find a space in a busy neighborhood will drive around for minutes on end until a meter opens up, or finally give in to paying exorbitant parking fees in large garages. According to some of the users we surveyed, parking has become such a source of anxiety and headache that they would rather not own a car and just use ride sharing apps forever. Owning a car has become increasingly more and more expensive as the costs to keep it not only include upkeep but also hundreds of dollars per month for parking. And while public transportation and ride sharing continue to be options for daily commuters, we don’t believe that they serve as a permanent solution to this parking problem as they are oftentimes unreliable, slow, and even more costly in the long run.</p>
<p>Our team endeavored to create a solution for current car owners who want to drive their cars and not worry about finding parking. We wanted to utilize free private parking spaces that people have empty and encourage them to rent them out by the hour. In essence, we wanted to create a platform that would connect drivers with cars to owners who had extra parking spaces during the day. The solution we envisioned would be quick and easy to use and would allow drivers to book their spaces as far in advance as possible and pay meter-equivalent prices. In addition, it would be an easy source of income for the hosts who have empty parking spaces.  If successfully, we believe our solution would further turn our society into a resource-sharing economy. Because of the two sided nature of our solution, our target population would be drivers who own cars and commute frequently into busy areas and parking space owners who live in busy metropolitan areas.</p>`;

var process_text = `<p>Our design process began by thinking about the personal needs of the team and those of the people around us. We realized that, as car owners, all of us found parking to be a big issue. We decided to survey and interview a variety of different demographics that were all car owners and decided that the parking nightmare was an almost universal issue that people faced. After that, we decided to interview people who owned parking spaces and found out that they were really receptive to the idea of renting their spaces out by the hour and making easy money.</p>
<p>From there, we looked at a various successful apps, namely Uber and Airbnb and analyzed what made their apps easy to use and effective. We incorporated many components into our first interface like a map feature and a calendar features and through many iterative user testing processes decided to keep them. One big design change was splitting the driver user experience and host user experience into different interfaces. We decided that it was confusing for both actions to be on the same app and instead created a website where parking spot owners can add their spot and manage it.</p>`;

var impact_text = `<p>We hope that Parkour’s impact will be vast and help solve a common headache many people hate dealing with. While our current prototype doesn’t allow people to book recurrent reservations, we hope that in the future, our app can be utilized to allow people to book their spaces months in advance if they drive to work everyday. We also believe that hosts who have free parking spaces will benefit greatly from doing little to no work and receive a small but steady income from renting out their spot. All in all, we believe our solution generates net positive social utility on all ends.</p>`;