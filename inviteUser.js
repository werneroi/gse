



// RESPOND TO CLICKING INVITE USER, FROM SINGLECALENDAR
function inviteUserSingle(){    
    console.log("inviteUserSingle: ", eventSingle.id);
    openInviteUserModal(eventSingle.id);
}

// RESPOND TO CLICKING INVITE USER, TIPPY OR FROM SINGLEPAGE BUTTON
function openInviteUserModal(eventId){
    var elem = document.getElementsByClassName('selectr-container selectr-desktop has-selected');

    //remove TIPPY 
    tippInstance.hide();  


    textModalOpen = true;
    console.log("inviteUser ",eventId);
    let event = myCalendarAlt.getEventById(eventId);
    console.log("this is the event: " + event);
    eventToInvite = event;
    eventSingle = event;
    modalInvite = document.getElementById("inviteUser");  
    span = document.getElementById("closeTextInvite");
    var headerInviteString = "You are inviting an event on " + moment(event.start).format('dddd') + " " + moment(event.start).format('DD.MM.YYYY') + " starting at: " + moment(event.start).format('HH:mm') + " ending at: " + moment(event.end).format('HH:mm');
    // selector= [];
    // buildUsersSelector();

    document.getElementById('inviteTextAreaHeader').innerHTML = headerInviteString;

    //dealing with the email part of the invitation
    var timerid;
    $("#emailToInvite").on("input", function(e) {
        selector.setValue('value-1');  
        inviteSource = "email";
        var value = $(this).val();
            if ($(this).data("lastval") != value) {

                $(this).data("lastval", value);
                clearTimeout(timerid);

                timerid = setTimeout(function() {                
                    console.log(value);
                    document.getElementById('emailToInvite').style.color = 'black';
                    document.getElementsByClassName('selectr-container selectr-desktop has-selected')[0].style.color = 'lightgrey';// selector.reset();
                });
                
            };
    });
     
    modalInvite.style.display = "block";
  
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        textModalOpen = false;
        modalInvite.style.display = "none";
    }
  
    // When the user clicks anywhere outside of the modalInvite, close it
    window.onclick = function(event) {
        if (event.target == modalInvite) {
        // modal.style.display = "none";
        }
    }

    //close on pressing esc
    $(document).keyup(function(e) {
        console.log(textModalOpen);
        
        if (e.key === "Escape") { // escape key maps to keycode `27`
            if(textModalOpen == true){
                textModalOpen = false;
                modalInvite.style.display = "none";
            }            
       }
   });

}
var inviteSource = "user";

function cancelInvite(eventId){
    console.log("cancelInvite")
    Confirm.open('confirm004', {
        title: 'Alert',
        message: 'Are you sure you want to cancel the invitation?\nThis will erease the invitation for the for the other person and will leave your time open.',
        onok: () => {
            console.log("confirmAccept ", message);
            confirm004()
        },
        oncancel: () => {
            tippInstance.enable()
            return
        }
    })

    function confirm004(){
        saveCalendarsViewState()
        tippInstance.destroy();
        eventSingle = myCalendarAlt.getEventById(eventId);
        console.log(eventSingle.id);
        
        newEvent = {
            resourceId: currentUser.appId,
            title: myFullName,
            start: moment(eventSingle.start).format(),
            end: moment(eventSingle.end).format(),
            id: eventSingle.id,                              
            // backgroundColor: color_normal_me,
            extendedProps:{
            acceptGuest : false,
            appId: currentUser.appId,          
            description: "open/" + currentUser.luid,                   
            }
        };
        // myCalendar.getEventById(eventSingle.id).remove();
        myCalendarAlt.getEventById(eventSingle.id).remove();
        // myCalendar.addEvent(newEvent);
        myCalendarAlt.addEvent(newEvent);

        
        updateEventToGoogle(newEvent)
        

        /* UPDATE MY CALENDAR OF THE OPEN EVENT */
        for (var i = 0; i <currentUser.calArray.length; i++) {
            let tempEve = JSON.parse(currentUser.calArray[i]);
            console.log("checking: ",tempEve.id + " with:" ,newEvent.id);
            if(tempEve.id == newEvent.id){
                console.log("found an event to delete: ",tempEve.id);
                currentUser.calArray.splice(i,1);
                currentUser.calArray.push(JSON.stringify(newEvent));
                allowUpdate = false;
                writeCalArrayTo_firbase(newEvent);
                break;
            }
        }

        /* send email and message to the invitee */
        let inviteeId = eventSingle.extendedProps.description.split("/")[2];
        let originalEventId = eventSingle.extendedProps.description.split("/")[3];
        console.log("inviteeId: ",inviteeId)
        firebase.database().ref('/users/' + inviteeId).once('value').then(function (snapshot) {
            //send Email to the other side
            userEmail = snapshot.val().email;
            nameTosend = snapshot.val().name;
            userToInviteAppId = snapshot.val().appId;
            
            console.log(nameTosend + ' ' + userEmail);
            //open Text
            let textAreaField = document.getElementById("textAreaField");
            let eventDate = moment(eventSingle.start).format("dddd, MMMM Do YYYY, h:mm:ss a");

            let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " has canceled the invitation for an event on " + eventDate +
                ". The request has been updated in your calendar";

            if (textAreaField.value.length > 0) {
                mailBody += "\n \n A message was sent as well: \n" + textAreaField.value;
                textAreaField.value = "";
            }
            console.log(mailBody);
            if (sendEmails == true) {
                Email.send({
                    Host: "smtp.ipage.com",
                    Username: "roi@roiwerner.com",
                    Password: "Roki868686",
                    To: userEmail,
                    From: "<roi@roiwerner.com>",
                    Subject: "Session deleted",
                    Body: mailBody,
                }).then(
                    message => alert("mail sent successfully")
                );
            }

            console.log("Send to InBox cancel invitation message");
            inBoxText_InviteCancel = myFullName + " has canceled the invitation for an event on " + eventDate +
            ". The invitation was deleted from your calendar"
            console.log("inviteText: ", inBoxText_InviteCancel)
            firebase.database().ref("inBox/" + userToInviteAppId + "/new/" + eventSingle.id).set({
                "sender": currentUser.luid,
                "message": inBoxText_InviteCancel,
                "status": "invitation canceled",
                "state": "off",
                "eventId": originalEventId,                        
                "timestamp": firebase.database.ServerValue.TIMESTAMP
            });
            firebase.database().ref("inBox/" + userToInviteAppId + "/all/" + eventSingle.id).set({
                "sender": currentUser.luid,
                "message": inBoxText_InviteCancel,
                "status": "invitation canceled",
                "state": "off",
                "eventId": originalEventId,                        
                "timestamp": firebase.database.ServerValue.TIMESTAMP,
                "eventTs": moment(eventSingle.start).valueOf(),
            });                    
        })
    }
}
var fromTippy = false
function acceptlInviteFromTippy(eventId){
    tippInstance.disable()
    console.log("acceot Invite from tippy with: ",eventId)
    eventSingle = myCalendarAlt.getEventById(eventId);
    fromTippy = true
    confirmEvent()
}



function declinelInviteFromTippy(eventId) {
    getYpos()
    eventSingle = myCalendarAlt.getEventById(eventId);
    tippInstance.destroy()
    fromTippy = true
    decline()
}

function cancelInviteFromTippy(eventId){
    getYpos()
    tippInstance.hide();
    console.log("cancel this invite: ",eventId);
    cancelInvite(eventId);
}

function cancelInviteFromButton(){
    cancelInvite(eventSingle.id);
    backToCal();
}

function activateSelectUser(){
    inviteSource = "user";
    document.getElementsByClassName('selectr-container selectr-desktop has-selected')[0].style.color = 'black';// selector.reset();
    // document.getElementById('emailToInvite').style.color = 'lightgrey';

}

function activateEmail(){
    inviteSource = "email";
    document.getElementsByClassName('selectr-container selectr-desktop has-selected')[0].style.color = 'lightgrey';// selector.reset();
    // document.getElementById('emailToInvite').style.color = 'black';

}

var selector = [];
function buildUsersSelector(){
    // console.log("++++ buildUsersSelector ++++ ")
    
    selector = new Selectr(document.getElementById("selectUser"));  
    selector.on('selectr.select', function(option) {
        // console.log("selector slecetd: ",selector.getValue())
        //check if this is open from invite or list
    });    
}

function populateUsersSelector(){
    console.log("++++ buildUsersSelector ++++ ",usersResourceList.length)
    selector.removeAll();
    
    // let filtered = usersResourceList.filter((a,i)=>i%2===1);
    usersResourceList.forEach(function(item)
    {               
        if(item.id != currentUser.appId){
            selector.add({
                value: item.id,
                text: item.title
            });            
        }        
    });
}





function ValidateEmail(inputText)
{
var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(inputText.match(mailformat))
    {

        return true;
    }
    else
    {
        alert("You have entered an invalid email address!");
        return false;
    }
}

function clearTextInvite(){
    console.log("clearText");
    let textAreaField = document.getElementById("inviteTextAreaField");
    console.log(textAreaField.value);
    textAreaField.value = "";
}



//====================== reciever side =================

function loadInvitedEvent(eventId){
    console.log("loadInvitedEvent",eventId);
    let currEvent = myCalendarAlt.getEventById(eventId);
    console.log(currEvent);
    makeCalSingle();
    //open SIngle calendar
    sourceCal = "singleConfirm";
    document.getElementById("toggleSelf").style.display = "none";
    // document.getElementById("toggleDisplay").style.display = "none";
    // document.getElementById("toggleResources").style.display = "none";
    document.getElementById('AddEventManually').style.display = "none";
    // document.getElementById('openEventsToConfirm').style.display = "none";
    // document.getElementById('btn_day').disabled = true;
    // document.getElementById('btn_week').disabled = true;
    // document.getElementById('btn_month').disabled = true;     
    // document.getElementById("calendar").style.visibility = "hidden"; 
    document.getElementById("calendarAlt").style.visibility = "hidden";
    // document.getElementById("calendarSingle").style.visibility = "visible";

    document.getElementById('deleteEvent').style.display = "inline-block";
    document.getElementById('label_AG_singlePage').style.display = "none";
    document.getElementById('acceptGuest_singlePage').style.display = "none";
    document.getElementById('AddEventManually').style.display = "none";
    document.getElementById('label_AG').style.display = "none";
    document.getElementById('acceptGuest_default').style.display = "none";
    document.getElementById('trimB').style.display = ""; 
    document.getElementById('confirmB').style.display = ""; 
    document.getElementById('declineB').style.display = "";
    document.getElementById("backToCal").style.display = "";

    $(document).keyup(function(e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            if (textModalOpen == false){
                backToCal()
            }
        }
    });

    let elements =calendarSingle.getEvents();
    for (e in elements){ 
        let element = elements[e];
        element.remove();
    } 

    
    calendarSingle.setOption("slotMaxTime", moment(eventSingle.end).format('HH:mm'));
    calendarSingle.setOption("slotMinTime", moment(eventSingle.start).format('HH:mm'));

    calendarSingle.addEvent(currEvent);
    calendarSingle.render();
    calendarSingle.gotoDate(moment(currEvent.start).format());
}


// function loadInvitedEvent(eventId){

//     sourceCal = "singleConfirm";


//     document.getElementById("toggleSelf").style.display = "none";
//     document.getElementById("toggleDisplay").style.display = "none";
//     document.getElementById("toggleResources").style.display = "none";
//     document.getElementById('AddEventManually').style.display = "none";
//     document.getElementById('openEventsToConfirm').style.display = "none";
//     document.getElementById('btn_day').disabled = true;
//     document.getElementById('btn_week').disabled = true;
//     document.getElementById('btn_month').disabled = true;
//     document.getElementById('label_AG_singlePage').style.display = "none";
//     document.getElementById('acceptGuest_singlePage').style.display = "none"; 


    
//     $(document).keyup(function(e) {
//         if (e.key === "Escape") { // escape key maps to keycode `27`
//             if (textModalOpen == false){
//                 backToCal()
//             }
//         }
//     });


//     console.log("loadInvitedEvent",eventId);
//     let currEvent = myCalendar.getEventById(eventId);


//     // requestKey = eventSingle.extendedProps.description.split(":")[0];
//     // console.log("loadEventToConfirm" ,requestKey);
//     // firebase.database().ref('/requests/'+requestKey).once('value').then(function(snapshot){            
//         // let  originaleventToDelete = JSON.parse(snapshot.val().origEvent);            
//         // let requestEventToDelete = JSON.parse(snapshot.val().requestedEvent); 
//         eventi = currEvent;
//         console.log(eventi.extendedProps.acceptGuest);

//         reqEvent = currEvent;
//         console.log(reqEvent);

//         requestingUserId = currEvent.extendedProps.appId;
        

//         makeCalConfirm();
//         calendarConfirm.setOption("slotMaxTime", moment(eventi.end).format('HH:mm'));
//         calendarConfirm.setOption("slotMinTime", moment(eventi.start).format('HH:mm'));

//         document.getElementById("calendar").style.visibility = "hidden"; 
//         document.getElementById("calendarAlt").style.visibility = "hidden";
//         document.getElementById("calendarSingle").style.visibility = "visible";

//         document.getElementById('deleteEvent').style.display = "inline-block";
//         document.getElementById('label_AG_singlePage').style.display = "none";
//         document.getElementById('acceptGuest_singlePage').style.display = "none";
//         document.getElementById('AddEventManually').style.display = "none";
//         document.getElementById('label_AG').style.display = "none";
//         document.getElementById('acceptGuest_default').style.display = "none";
//         document.getElementById('trimB').style.display = ""; 
//         document.getElementById('confirmB').style.display = ""; 
//         document.getElementById('declineB').style.display = "";
//         document.getElementById("backToCal").style.display = "";

        
//         // calendarConfirm.addEvent(eventi);
//         // calendarConfirm.addEvent(reqEvent);
        

//         let myself = currentUser.name + " " + currentUser.lastName;
//         console.log(myself);
//         let bookedTitled = "requested by: " + reqEvent.extendedProps.auther;
//         console.log(bookedTitled);

//         if (eventi.start == reqEvent.start && eventi.end == reqEvent.end){
//             console.log("same time");
//             event1= {resourceId:currentUser.appId, id:1 , title: bookedTitled, start: eventi.start, end: eventi.end, backgroundColor: 'red',extendedProps:{
//               acceptGuest : eventi.extendedProps.acceptGuest,
//               appId: currentUser.appId,
//               auther: currentUser.name + " " +currentUser.lastName,
//               requestby: requestingUserId,
//               status: 'booked'
    
//             //   droppable: false
//             },};
            
//             calendarConfirm.addEvent(event1);
//             ccase = 1;
            
//           }
//           else if (eventi.start < reqEvent.start && eventi.end == reqEvent.end){
//             console.log("start later");
    
//             event1= {resourceId:currentUser.appId, id:1 , title: myself, start: eventi.start, end: reqEvent.start, backgroundColor: color_normal_me, extendedProps:{
//               acceptGuest : eventi.extendedProps.acceptGuest,
//               appId: currentUser.appId,
//               auther: currentUser.name,
//               status: 'open'
//             //   droppable: false
//             },
          
//           };
//             event2= {resourceId:currentUser.appId, id:2 , title: bookedTitled, start: reqEvent.start, end: eventi.end, backgroundColor: 'red',extendedProps:{
//               acceptGuest : eventi.extendedProps.acceptGuest,
//               appId: currentUser.appId,
//               auther: currentUser.name + " " +currentUser.lastName ,
//               requestby: requestingUserId,
//               status: 'booked'
//             //   droppable: false
//             },};
                                
//             calendarConfirm.addEvent(event1);                    
//             calendarConfirm.addEvent(event2);                                                           
//             ccase = 2;
            
//           }
//           else if (eventi.start < reqEvent.start && eventi.end > reqEvent.end){
//             console.log("start later end before");
//             const tempEvent = eventi;
    
//             event1= {resourceId:currentUser.appId, id:1 , title: myself, start: eventi.start, end: reqEvent.start, backgroundColor: color_normal_me, extendedProps:{
//               acceptGuest : eventi.extendedProps.acceptGuest,
//               appId: currentUser.appId,
//               auther: currentUser.name + " " +currentUser.lastName,
//               status: 'open'
//             //   droppable: false
//             },};
//             event2= {resourceId:currentUser.appId, id:2 , title: bookedTitled, start: reqEvent.start, end: reqEvent.end,backgroundColor: 'red',extendedProps:{
//               acceptGuest : eventi.extendedProps.acceptGuest,
//               appId: currentUser.appId,
//               auther: currentUser.name + " " +currentUser.lastName,
//               requestby: requestingUserId,
//               status: 'booked'
//             //   droppable: false
//             },};
//             event3= {resourceId:currentUser.appId, id:3 , title: myself, start: reqEvent.end, end: eventi.end, backgroundColor: color_normal_me, extendedProps:{
//               acceptGuest : eventi.extendedProps.acceptGuest,
//               appId: currentUser.appId,
//               auther: currentUser.name + " " +currentUser.lastName,
//               status: 'open'
//             //   droppable: false
//             },};
                                
//             calendarConfirm.addEvent(event1);                    
//             calendarConfirm.addEvent(event2);                                                           
//             calendarConfirm.addEvent(event3);
//             ccase =3;
    
            
//           }
//           else if (eventi.start == reqEvent.start && eventi.end > reqEvent.end){
//             console.log("start same end before");
//             event1= {resourceId:currentUser.appId, id:1 , title: bookedTitled, start: eventi.start, end: reqEvent.end, backgroundColor: 'red',extendedProps:{
//               acceptGuest : eventi.extendedProps.acceptGuest,
//               appId: currentUser.appId,
//               auther: currentUser.name + " " + currentUser.lastName,
//               requestby: requestingUserId,
//               status: 'booked'
//             //   droppable: false
//             },};
//             event2= {resourceId:currentUser.appId, id:2 , title: myself, start: reqEvent.end, end: eventi.end,backgroundColor: color_normal_me, extendedProps:{
//               acceptGuest : eventi.extendedProps.acceptGuest,
//               appId: currentUser.appId,
//               auther: currentUser.name + " " + currentUser.lastName,  
//               status: 'open'      
//             //   droppable: false
//             },};
                                
//             calendarConfirm.addEvent(event1);                    
//             calendarConfirm.addEvent(event2);                     
//             ccase =4;
            
//           }

//         calendarConfirm.render();
//         calendarConfirm.gotoDate(moment(eventSingle.start).format());



//     // });    
// }

function respondTo_eventInviteThroughURL(eventId){
    console.clear();
    console.log("loadInvitedEvent",eventId);
    let currEvent = myCalendarAlt.getEventById(eventId);
    // console.log('eventClick: ',source + " " ,JSON.stringify(arg.event.getResources()));
    
    // return;
    // console.log("the clicked event is: ", JSON.stringify(arg.event));
    document.getElementById("toggleSelf").style.display = "none";
    // document.getElementById("toggleDisplay").style.display = "none";
    // document.getElementById("toggleResources").style.display = "none";
    document.getElementById('AddEventManually').style.display = "none";
    // document.getElementById('openEventsToConfirm').style.display = "none";
    // document.getElementById('btn_day').disabled = true;
    // document.getElementById('btn_week').disabled = true;
    // document.getElementById('btn_month').disabled = true;
    document.getElementById('deleteEvent').style.display = "none";
    document.getElementById('label_AG_singlePage').style.display = "none";
    document.getElementById('acceptGuest_singlePage').style.display = "none";
    document.getElementById('confirmB').style.display = ""; 
    document.getElementById('declineB').style.display = "";
    document.getElementById("backToCal").style.display = "";
    document.getElementById('label_AG').style.display = "none";
    document.getElementById('acceptGuest_default').style.display = "none";
    

    eventSingle = currEvent;
    let elements =calendarSingle.getEvents();
    for (e in elements){ 
        let element = elements[e];
        element.remove();
    }    

    // if(eventSingle.extendedProps.status == "pending"){        
    //     console.log("loading pending event");
    //     loadEventToConfirm();
    //     return;        
    // }

    // else if(eventSingle.extendedProps.status == "waiting"){        
    //     console.log("loading waiting event");
    // }

    // else if(eventSingle.extendedProps.status == "booked"){        
    //     console.log("loading booked event");
    // }
    
    calendarSingle.addEvent("eventSingle: ",eventSingle);
    sourceCal = "single";
    // if(eventSingle.extendedProps.appId == currentUser.appId){
    //     document.getElementById("deleteEvent").style.display = "inline-block";
    //     document.getElementById('label_AG_singlePage').style.display = "";
    //     document.getElementById('acceptGuest_singlePage').style.display = "";
    //     calendarSingle.setOption("scrollTime", moment(eventSingle.start).format('HH:mm'));
    //     calendarSingle.setOption("slotMaxTime", "24:00:00");
    //     calendarSingle.setOption("slotMinTime", "00:00:00");
    //     document.getElementById('label_AG_singlePage').style.display = "";
    //     document.getElementById('acceptGuest_singlePage').style.display = ""; 

        
    // }
    // else{
    //     document.getElementById("requestEv").style.display = "inline-block";
    //     document.getElementById('label_AG_singlePage').style.display = "none";
    //     document.getElementById('acceptGuest_singlePage').style.display = "none";
        calendarSingle.setOption("slotMaxTime", moment(eventSingle.end).format('HH:mm'));
        calendarSingle.setOption("slotMinTime", moment(eventSingle.start).format('HH:mm'));
        // event.display =  'background';
    // }

    // document.getElementById("calendar").style.visibility = "hidden"; 
    document.getElementById("calendarAlt").style.visibility = "hidden";
    // document.getElementById("calendarSingle").style.visibility = "visible";
    
    

    calendarSingle.addEvent(eventSingle);
    calendarSingle.render();
    calendarSingle.gotoDate(moment(eventSingle.start).format());

    //disable dragging
    var timeSlotArray =document.getElementsByClassName("fc-event-draggable");
    var timeSlot = timeSlotArray[timeSlotArray.length-1];
    if(timeSlot !== undefined){
        timeSlot.className = "fc-timegrid-event fc-v-event fc-event fc-event-resizable fc-event-start fc-event-end fc-event-today fc-event-future";
    }
    
    

    document.getElementById('acceptGuest_default').style.display = "none";
    if (eventSingle.extendedProps.acceptGuest == true){          
        document.getElementById('acceptGuest_singlePage').checked = true;
    }
    else{          
        document.getElementById('acceptGuest_singlePage').checked = false;
    }

    // listen for esc pressed to go back
    
    $(document).keyup(function(e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            if (textModalOpen == false){
                backToCal()
            }
        }
    });
    
}