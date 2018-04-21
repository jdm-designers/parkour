
// All non-Gmaps API necessary functions

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


