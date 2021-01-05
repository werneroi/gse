var originalGuestStatus = "";
scrollerPositionY = 0;
scrollerPositionX = 0;
var showOnlyFavs = false;
scrollLeftArray = [];
singleUserForList = [];
/* get the FOI selected Value */
var mySelect = ""
var fieldName = "";

function respondTo_eventClick(source, arg) { //RESPOND TO CLICKING AN EVENT ON THE CALENDARS
    console.clear();
    // console.log('eventClick: ', source + " ", JSON.stringify(arg.event.getResources()));    
    getYpos()

    document.getElementById("mainView").style.visibility = "hidden";
    document.getElementById("singleCal").style.visibility = "visible"
    /* PREVENT VISUAL UPDATE IN RESPNSE TO INCOMING UPDATES FROM FIREBASE*/
    allowUpdate = false;
    

    console.log("the clicked event is: ", JSON.stringify(arg.event));
    
    eventSingle = arg.event;
    console.log("eventSingle: ", eventSingle);

    originalGuestStatus = eventSingle.extendedProps.acceptGuest;
    
    if (eventSingle.extendedProps.description.split("/")[0] == "inviteRequest") {

        console.log("loading inviteRequest event");
        loadInviteEvent(eventSingle);
        
    }
    else if (eventSingle.extendedProps.description.split("/")[0] == "pending") {
        console.log("loading pending event");
        requestKey = eventSingle.extendedProps.description.split("/")[5];
        loadEventToConfirm(eventSingle);
       
    }
    else {
        console.log("loading event");
        loadEvent(eventSingle)
        
    }
}




function respondTo_EventDrop(arg) {
    tippInstance.disable()
    var eventObj = arg.event;
    if (eventObj.extendedProps.appId != currentUser.appId) {
        //console.log("Not your event, can't touch this.");

        arg.revert();
        return;
    }
    else {
        var eventEnding = moment(eventObj.end);
        //--check if the current time clicked is before the end of event, if so allow to click, else do nothing.
        var timeClickedDate = Date.parse(moment().format('YYYY-MM-DD'));
        let endDate = Date.parse(eventEnding.format('YYYY-MM-DD'));
        if (timeClickedDate > endDate) {
            //console.log("event is in the past");
            alert("You can not move an event in the past!");
            arg.revert();
            return;
        }
        else if (timeClickedDate == endDate) {
            var timeClickedTime = moment().format('HH:mm:ss');
            let endTime = eventEnding.format('HH:mm:ss');
            str1 = timeClickedTime.split(':');
            str2 = endTime.split(':');

            //console.log(timeClickedTime + " " + endTime);

            totalSecondsTimeClicked = parseInt(str1[0] * 3600 + str1[1] * 60 + str1[0]);
            totalSecondsEndtime = parseInt(str2[0] * 3600 + str2[1] * 60 + str2[0]);
            //console.log(totalSecondsTimeClicked + " " + totalSecondsEndtime);
            if (totalSecondsTimeClicked > totalSecondsEndtime) {
                //console.log("event is in the past");
                alert("You can not move an event in the past!");
                return;
            }
            else {
                //console.log("event is in the future");
            }
        }
        for (let index = 0; index < currentUser.calArray.length; index++) {
            var element = JSON.parse(currentUser.calArray[index]);
            console.log(element.id + " / " + eventObj.id);
            if (element.id == eventObj.id) {
                console.log("found event - ", element);
                console.log(eventObj.end);

                element.start = moment(eventObj.start);
                element.end = moment(eventObj.end);

                currentUser.calArray[index] = JSON.stringify(element);
                console.log(JSON.parse(currentUser.calArray[index]));
                break;
            }
        }

        // myCalendar.getEventById(arg.event.id).remove();
        myCalendarAlt.getEventById(arg.event.id).remove();

        // myCalendar.addEvent(eventObj);
        myCalendarAlt.addEvent(eventObj);
        tippInstance.enable()
        writeCalArrayTo_firbase();
    }
}


function loadEventToConfirm() {
    console.log("loadEventToConfirm", requestKey);        
    firebase.database().ref('/requests/' + requestKey).once('value').then(function (snapshot) {         
        eventi = JSON.parse(snapshot.val().origEvent);
        console.log(eventi.extendedProps.acceptGuest);

        eventSingle = eventi;

        reqEvent = JSON.parse(snapshot.val().requestedEvent);
        console.log(reqEvent);

        requestingUserId = snapshot.val().requestBy;


        makeCalConfirm();
        
        
        


        // calendarConfirm.addEvent(eventi);
        // calendarConfirm.addEvent(reqEvent);


        let myself = myFullName;
        console.log(myself);
        allUsersSnapShot.forEach(function (child) {

            if (child.key == reqEvent.extendedProps.description.split("/")[2]) {
                // autherName = child.val().name + " " + child.val().lastName;
                autherName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

            }
        });
        let bookedTitled = "requested by: " + autherName;
        console.log(bookedTitled);
        console.log(eventi.start + " " + reqEvent.start);
        console.log(eventi.end + " " + reqEvent.end);
        if (moment(eventi.start).isSame(moment(reqEvent.start)) && moment(eventi.end).isSame(moment(reqEvent.end))) {
            console.log("same time");
            event1 = {
                resourceId: currentUser.appId, 
                id: eventi.id, 
                title: bookedTitled, 
                start: eventi.start, 
                end: eventi.end, 
                backgroundColor: color_special, 
                extendedProps: {
                    acceptGuest: eventi.extendedProps.acceptGuest,
                    appId: currentUser.appId,
                    description: eventi.extendedProps.description,
                },
            };
            console.log("confirm new event 1: " ,event1)

            calendarConfirm.addEvent(event1);
            ccase = 1;
        }
        else if (moment(reqEvent.start).isAfter(moment(eventi.start)) && moment(eventi.end).isSame(moment(reqEvent.end))) {
            console.log("start later");
            let r1 = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "");
            event1 = { 
                resourceId: currentUser.appId, id: r1, title: myself, start: eventi.start, end: reqEvent.start, backgroundColor: color_normal_me,
                // editable: false,
                extendedProps: {
                    acceptGuest: eventi.extendedProps.acceptGuest,
                    appId: currentUser.appId,
                    description: 'open/' + currentUser.luid + '/' + r1
                },
            };
            event2 = {
                resourceId: currentUser.appId, id: eventi.id, title: bookedTitled, start: reqEvent.start, end: eventi.end, backgroundColor: color_special, extendedProps: {
                    acceptGuest: eventi.extendedProps.acceptGuest,
                    appId: currentUser.appId,
                    description: eventi.extendedProps.description,
                },
            };

            calendarConfirm.addEvent(event1);
            calendarConfirm.addEvent(event2);
            ccase = 2;
        }
        else if (moment(reqEvent.start).isAfter(moment(eventi.start)) && moment(reqEvent.end).isBefore(moment(eventi.end))) {
            console.log("start later end before");
            const tempEvent = eventi;
            let r2 = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "");
            event1 = {
                resourceId: currentUser.appId, id: r2, title: myself, start: eventi.start, end: reqEvent.start, backgroundColor: color_normal_me,
                // editable: false,
                // selectabele: false,
                extendedProps: {
                    acceptGuest: eventi.extendedProps.acceptGuest,
                    appId: currentUser.appId,
                    auther: myFullName,
                    description: 'open/' + currentUser.luid + '/' + r2
                    //   droppable: false
                },
            };
            event2 = {
                resourceId: currentUser.appId, id: eventi.id, title: bookedTitled, start: reqEvent.start, end: reqEvent.end, backgroundColor: color_special, extendedProps: {
                    acceptGuest: eventi.extendedProps.acceptGuest,
                    appId: currentUser.appId,
                    description: eventi.extendedProps.description,
                },
            };
            let r3 = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "")
            event3 = {
                resourceId: currentUser.appId, id: r3, title: myself, start: reqEvent.end, end: eventi.end, backgroundColor: color_normal_me,
                // editable: false,
                extendedProps: {
                    acceptGuest: eventi.extendedProps.acceptGuest,
                    appId: currentUser.appId,
                    auther: myFullName,
                    
                    description: 'open/' + currentUser.luid + '/' + r3
                },
            };

            calendarConfirm.addEvent(event1);
            calendarConfirm.addEvent(event2);
            calendarConfirm.addEvent(event3);
            ccase = 3;
        }
        else if (moment(eventi.start).isSame(moment(reqEvent.start)) && moment(reqEvent.end).isBefore(moment(eventi.end))) {
            console.log("start same end before");
            event1 = {
                resourceId: currentUser.appId, id: eventi.id, title: bookedTitled, start: eventi.start, end: reqEvent.end, backgroundColor: color_special, extendedProps: {
                    acceptGuest: eventi.extendedProps.acceptGuest,
                    appId: currentUser.appId,
                    description: eventi.extendedProps.description,
                    //   droppable: false
                },
            };
            let r4 = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "");
            event2 = {
                resourceId: currentUser.appId, id: r4, title: myself, start: reqEvent.end, end: eventi.end, backgroundColor: color_normal_me,
                editable: false,
                selectabele: false,
                extendedProps: {
                    acceptGuest: eventi.extendedProps.acceptGuest,
                    appId: currentUser.appId,
                    description: 'open/' + currentUser.luid + '/' + r4
                    //   droppable: false
                },
            };

            calendarConfirm.addEvent(event1);
            calendarConfirm.addEvent(event2);
            ccase = 4;

        }

        if(fromTippy == false){
            saveCalendarsViewState()
            sourceCal = "singleConfirm";
            showButtons()

            calendarConfirm.setOption("slotMaxTime", moment(eventi.end).format('HH:mm'));
            calendarConfirm.setOption("slotMinTime", moment(eventi.start).format('HH:mm'));
            // document.getElementById("calendarAlt").style.visibility = "hidden";
            // document.getElementById("calendarSingle").style.visibility = "visible";
            // document.getElementById("myList").style.visibility = "hidden";
            document.getElementById('deleteEvent').style.display = "inline-block";
            document.getElementById('label_AG_singlePage').style.display = "none";
            document.getElementById('acceptGuest_singlePage').style.display = "none";
            // document.getElementById('AddEventManually').style.display = "none";
            document.getElementById('label_AG').style.display = "none";
            document.getElementById('acceptGuest_default').style.display = "none";
            document.getElementById('trimB').style.display = "";
            document.getElementById('confirmB').style.display = "";
            document.getElementById('declineB').style.display = "";
            document.getElementById("backToCal").style.display = "";
        
            $(document).keyup(function (e) {
                if (e.key === "Escape") { // escape key maps to keycode `27`
                    if (textModalOpen == false) {
                        backToCal()
                    }
                }
            });
            calendarConfirm.render();
            calendarConfirm.gotoDate(moment(event1.start).format());
            document.getElementById('currentDate').innerHTML = calendarConfirm.view.title;    
        }        
    });
}


function loadEvent() {

    sourceCal = "single";       

    if (eventSingle.extendedProps.description.split("/")[0] == "open") {
        console.log("loading open event");
        document.getElementById('inviteUserSingle').style.display = "";

    }
    else if (eventSingle.extendedProps.description.split("/")[0] == "deleted") {
        console.log("loading deleted event");
        document.getElementById('openEvent').style.display = "";
        

    }
    else if (eventSingle.extendedProps.description.split("/")[0] == "waiting") {
        console.log("loading waiting event into single")
        document.getElementById('inviteUserSingle').style.display = "none";        
        document.getElementById('deleteEvent').innerText = "Remove request";
    }

    else if (eventSingle.extendedProps.description.split("/")[0] == "booked") {
        console.log("loading booked event");
        document.getElementById('inviteUserSingle').style.display = "none";
    }


    //destroy the current calendar so there will be no old events and make a new one with the selected event
    calendarSingle.destroy();
    
    makeCalSingle();
    
    //deal with USER EVENTS
    if (eventSingle.extendedProps.appId == currentUser.appId) {

        document.getElementById("deleteEvent").style.display = "inline-block";
        document.getElementById("requestEv").style.display = "none";

        if (eventSingle.extendedProps.description.split("/")[0] == "open") {
            calendarSingle.setOption("slotMaxTime", "24:00:00");
            calendarSingle.setOption("slotMinTime", "00:00:00");
            document.getElementById('label_AG_singlePage').style.display = "none";//change to "" fr guest use
            document.getElementById('acceptGuest_singlePage').style.display = "none";//change to "" fr guest use
        }
        else {
            calendarSingle.setOption("slotMaxTime", moment(eventSingle.end).format('HH:mm'));
            calendarSingle.setOption("slotMinTime", moment(eventSingle.start).format('HH:mm'));
        }

        calendarSingle.setOption("scrollTime", moment(eventSingle.start).format('HH:mm:ss'));

        //since this is my event I can write into the public events so allow it
        document.getElementById("eventDetailsData_Public").disabled = false
        document.getElementById("eventDetailsData_Private").disabled = false
        document.getElementById("eventDetailsData_Private").style.display = "";

    }
    // deal with other side events
    else {
        document.getElementById("inviteUserSingle").style.display = "none";
        document.getElementById("requestEv").style.display = "inline-block";
        document.getElementById("deleteEvent").style.display = "none";
        // document.getElementById('acceptGuest_singlePage').style.display = "none";
        calendarSingle.setOption("slotMaxTime", moment(eventSingle.end).format('HH:mm'));
        calendarSingle.setOption("slotMinTime", moment(eventSingle.start).format('HH:mm'));

        document.getElementById("eventDetailsData_Public").disabled = true
        document.getElementById("eventDetailsData_Private").disabled = true
        document.getElementById("eventDetailsData_Private").style.display = "none";


        // event.display =  'background';
    }
    //if the event is in the past show it as a background event
    if (moment(eventSingle.end).isBefore(moment().format())) {
        console.log("event is in the past");
        document.getElementById("deleteEvent").style.display = "none";
        document.getElementById("requestEv").style.display = "none";
        // eventSingle.display = 'background';

    }

    calendarSingle.setOption("scrollTime", moment(eventSingle.start).format('HH:mm'));

    //populate events details
    console.log("load event details here ", eventSingle.id)
    firebase.database().ref("eventDetails/" + eventSingle.id).once('value').then(function (snapshot) {
        console.log("load event details here ", snapshot)
        if (snapshot.exists() == true) {
            //set hrer if is editable by comparing drescrption 2 tol luid
            document.getElementById("eventDetailsData_Private").value = snapshot.val().privateDetails;
            document.getElementById("eventDetailsData_Public").value = snapshot.val().publicDetails;
        }
    });
    
    calendarSingle.addEvent(eventSingle);
    calendarSingle.render();
    calendarSingle.gotoDate(moment(eventSingle.start).format());
    document.getElementById('currentDate').innerHTML = calendarSingle.view.title;

    //disable dragging
    var timeSlotArray = document.getElementsByClassName("fc-event-draggable");
    var timeSlot = timeSlotArray[timeSlotArray.length - 1];
    if (timeSlot !== undefined) {
        timeSlot.className = "fc-timegrid-event fc-v-event fc-event fc-event-resizable fc-event-start fc-event-end fc-event-today fc-event-future";
    }


    //handle the accept guest check option 
    document.getElementById('acceptGuest_default').style.display = "none";
    if (eventSingle.extendedProps.acceptGuest == true) {
        document.getElementById('acceptGuest_singlePage').checked = true;
    }
    else {
        document.getElementById('acceptGuest_singlePage').checked = false;
    }

    // listen for esc pressed to go back    
    $(document).keyup(function (e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            if (textModalOpen == false) {
                backToCal()
            }
        }
    });

}

function loadInviteEvent(origEvent) {
    console.log('loadInviteEvent: ', eventSingle.id);
    saveCalendarsViewState()

    sourceCal = "singleInvite";
    let header = document.getElementById('calendarSingle').getElementsByClassName('fc-col-header-cell-cushion')[0];
    console.log(header);

    for (var i = 0; i < eventsToConfirm.length; i++) {
        if (eventsToConfirm[i].id == eventSingle.id) {
            eventSingle = eventsToConfirm[i];
            break;
        }
    }

    eventSingle.backgroundColor = color_invite;
    eventSingle.title = origEvent.title


    //change visible states of elemetns
    showButtons()

    $(document).keyup(function (e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            if (textModalOpen == false) {
                backToCal()
            }
        }
    });


    // let  originaleventToDelete = JSON.parse(snapshot.val().origEvent);            
    // let requestEventToDelete = JSON.parse(snapshot.val().requestedEvent); 
    // eventi = eventSingle;
    // console.log(eventSingle.extendedProps.acceptGuest);

    // reqEvent = eventSingle;
    // console.log(reqEvent);

    // requestingUserId = snapshot.val().requestBy;


    makeCalConfirm();


    // document.getElementById("calendar").style.visibility = "hidden";
    // document.getElementById("calendarAlt").style.visibility = "hidden";
    // document.getElementById("calendarSingle").style.visibility = "visible";
    // document.getElementById("myList").style.visibility = "hidden";

    //The user event
    if (eventSingle.extendedProps.appId == currentUser.appId) {
        document.getElementById('trimB').style.display = "none";
        document.getElementById('confirmB').style.display = "none";
        document.getElementById('declineB').style.display = "none";
        document.getElementById('deleteEvent').style.display = "inline-block";
        document.getElementById("cancelInvite").style.display = "inline-block";
        calendarConfirm.setOption("scrollTime", moment(eventSingle.start).format('HH:mm:ss'));
        calendarConfirm.setOption("slotMaxTime", moment(eventSingle.end).format('HH:mm'));
        calendarConfirm.setOption("slotMinTime", moment(eventSingle.start).format('HH:mm'));


    }
    // the side who is invited
    else {
        calendarConfirm.setOption("slotMaxTime", moment(eventSingle.end).format('HH:mm'));
        calendarConfirm.setOption("slotMinTime", moment(eventSingle.start).format('HH:mm'));
        // calendarConfirm.setOption("editable",false); // NOT working :()
        document.getElementById('trimB').style.display = "none";
        // document.getElementById('trimB').innerText = "Edit invitation time"
        document.getElementById('confirmB').style.display = "";
        document.getElementById('confirmB').innerText = "Accept invitation"
        document.getElementById('declineB').style.display = "";
    }

    if (moment(eventSingle.end).isBefore(moment().format())) {
        console.log("event is in the past");
        // calendarSingle.setOption('selectable','false');
        eventSingle.setProp('display', 'background');
        //     event.setProp('display','background');
    }
    
    calendarConfirm.addEvent(eventSingle);
    // calendarConfirm.addEvent(reqEvent);
    calendarConfirm.render();
    calendarConfirm.gotoDate(moment(eventSingle.start).format());
    calendarConfirm.scrollTime = moment(eventSingle.start).format();
    calendarConfirm.setOption("scrollTime", moment(eventSingle.start).format('HH:mm'));
    document.getElementById('currentDate').innerHTML = calendarConfirm.view.title;
}

var onlyResourcesWithEventsCheck = false;

function showOnlyResourcesWithEvents() {
    console.log(onlyResourcesWithEventsCheck);

    event.stopPropagation();
    saveCalendarsViewState()
    //maintain the current views
    // initViewCalType = myCalendar.view.type;
    // initViewCalAltType = myCalendarAlt.view.type;
    // initViewCalAlt = myCalendarAlt.view
    // InitViewCal = myCalendar.view

    if (onlyResourcesWithEventsCheck == false) {
        onlyResourcesWithEventsCheck = true;
        console.log(myCalendar.getResources().length);
        myCalendar.setOption('filterResourcesWithEvents', 'true');
        //apply changes to myList 
        var usersWithResources = []
        for (i = 0; i < usersResourceList.length; i++) {
            console.log(usersResourceList[i]);
            // let tempU = myCalendar.getResourceById(usersResourceList[i].id)
            let tempU = myCalendarAlt.getResourceById(usersResourceList[i].id)
            let tempLength = tempU.getEvents();
            console.log(tempLength);
            if (tempLength.length > 0) {
                usersWithResources.push(usersResourceList[i]);
            }
        }
        populateUsersTablePC(usersWithResources);
    }
    else {
        onlyResourcesWithEventsCheck = false;
        // myCalendar.setOption('filterResourcesWithEvents', 'false');
        myCalendarAlt.setOption('filterResourcesWithEvents', 'false');
        console.log(myCalendarAlt.getResources().length);
        //   myCalendar.refetchResources();
        //   myCalendar.render();
        //   buildresources();
        // var mySelect = document.getElementById("foiSelector1");
        // var fieldName = mySelect.value;
        //   console.log(fieldName);
        //   console.log("call FOI filter ");
        console.log("called filterResourcesFOI from showOnltResourcesWithEvents");
        //   filterResourcesFOI(fieldName);
        populateUsersTablePC(usersResourceList);
        if (sourceCal == "cal") {
            document.getElementById("calendarAlt").style.visibility = 'hidden';
            // document.getElementById('myList').style.visibility = 'hidden';
        }

    }
}




//---------- BUTTONS ACTIONS -----------//


function toggleSelf() {
    console.log("toggleSelf");
    initCalsDisplay = false;   
    event.stopPropagation();
    saveCalendarsViewState()


    // var allResources = myCalendar.getResources();
    var allResources = myCalendarAlt.getResources();
    console.log("setYpos")
    //Show only myself and my events
    if (toggleSelfCheck === false) {
        toggleSelfCheck = true;
        document.getElementById("icon_toggleSelf").className = "fa fa-user fa-fw"
        
        filterResourcesFOI(fieldName);

    }
    else {
        //Show all users according to selected field of interest
        toggleSelfCheck = false;
        // document.getElementById('toggleSelf').innerText = "Show Self"
        document.getElementById("icon_toggleSelf").className = "fa fa-users fa-fw"        
        filterResourcesFOI(fieldName);
        
    }

    console.log("setYpos1")
    setYpos()
    
    // populateUsersTablePC(usersResourceList);
}


function toggleFavs(id) {

    console.log("Toggle Fav",id);
    event.stopPropagation();

    var tempFavIcon = "";

    // let tempString = 'fav '+ id;
    let tempStringAlt = 'toggleFavorite1 ' + id;
    // tempFavIcon = document.getElementById(tempString.replace(/ /g, ''));        
    tempFavIconAlt = document.getElementById(tempStringAlt.replace(/ /g, ''));
    console.log("//" + tempFavIconAlt);


    if (tempFavIconAlt.className == "openStar fa fa-star-o") { //not a fav yet
        // tempFavIcon.className = "fullStar fa fa-star";
        tempFavIconAlt.className = "fullStar fa fa-star";
        if (typeof myFavArray === 'undefined' || myFavArray === null) {
            myFavArray = [];
        }
        myFavArray = myFavArray.concat(id);
        // populateUsersTablePC(usersResourceList);
    }
    else { //already a fav
        console.log("remove from favs : ", id)
        // tempFavIcon.className = "openStar fa fa-star-o";
        tempFavIconAlt.className = "openStar fa fa-star-o";
        const index = myFavArray.indexOf(id);
        if (index > -1) {
            myFavArray.splice(index, 1);

        }
        // populateUsersTablePC(usersResourceList);

        //in case I am in a favs show only, then I need to remove from the listDisplayremove from the list
        // if (showOnlyFavs == true) {
        //     var mySelect = document.getElementById("foiSelector1");
        //     var fieldName = mySelect.value;
        //     console.log("called filterResourcesFOI from toggleAllFavs");
        //     // filterResourcesFOI(fieldName);

        // }
        // buildFavs();

    }
    //--write Favs to seperate firebase database
    firebase.database().ref('/favs/' + currentUser.appId).update({
        myFavArray: myFavArray
    });
}


function toggleAllFavs() {

    console.log('!!!!!!!!!toggleAllFavs')
    
    event.stopPropagation();
    saveCalendarsViewState()

    /* deal with userList */
    

    // var allResources = myCalendarAlt.getResources();
    // var allEventsAlt = myCalendarAlt.getEvents();

    if (showOnlyFavs == false) { //show here only Favs
        showOnlyFavs = true;

        allEvents = []
        let allUsersRow = document.getElementsByClassName("openStar")
        for (let i = 0; i < allUsersRow.length; i++){
            allUsersRow[i].parentElement.style.display ="none"
        }
        /* make sure the fav array has only unique values */
        var uniq = [ ...new Set(myFavArray) ];
        /* get the events of the favs */
        for (var i = 0; i < uniq.length; i++){
            console.log ("found fav: ", myFavArray[i])
            var resourceA = myCalendarAlt.getResourceById(uniq[i]);
            console.log(resourceA)
            var events = resourceA.getEvents();
            console.log(events)
            allEvents = allEvents.concat(events);


        }
        console.log("allevents: ",allEvents);
        updateEventsOnCals()
        
        // initCalsDisplay = false;
        // filterResourcesFOI(fieldName);
        // buildFavs();
        // populateUsersTablePC(usersResourceList)
        // document.getElementById("btn_toggleFavs").innerText = "Show all Users"

    }
    else { //show all users
        showOnlyFavs = false;
        let allUsersRow = document.getElementsByClassName("openStar")
        for (let i = 0; i < allUsersRow.length; i++){
            allUsersRow[i].parentElement.style.display =""
        }

        restoreAllEvents()
        
    //     document.getElementById("btn_toggleFavs").innerText = "Show Favorites"
    //     initCalsDisplay = false;
    //     filterResourcesFOI(fieldName);
    //     buildFavs();
    //     populateUsersTablePC(usersResourceList);

    }
    setYpos()
}


function saveCalendarsViewState(){
    console.log("saveCalendarsViewState")
    
    initViewCalAltType = myCalendarAlt.view.type;
    initViewCalAlt = myCalendarAlt.view    

    /* get the FOI selected Value */
    mySelect = document.getElementById("foiSelector1");
    fieldName = mySelect.value;

    /* STORE THE X AND Y VALUES OF THE CALENDARS */
    getYpos()
}

/* Solo a user = show his icon as a full eye and his events, hide all others */

function toggleSelect(id) {
    console.log("toggleSelect ", id);
    // console.log("singleUserForList: ",singleUserForList)
    event.stopPropagation();

    saveCalendarsViewState()
    // singleUserForList = [];
    
    
    /* avoid initilating calendars */
    initCalsDisplay = false;
    
    /* Get all the events from Cal */
    // var allResources = myCalendar.getResources();
    var allResources = myCalendarAlt.getResources();
    console.log(allResources.length);
    

    /* remove all the events from Alt cal */
    var tempAllEvents = myCalendarAlt.getEvents();
    

    /*Get the selected userId to solo */
    let tempSelectIcon = document.getElementById('toggleUserSelection' + id);
    // console.log(tempSelectIcon)
    
    /* Check if the user is in solo mode or regular mode*/
    if (tempSelectIcon.className == "fa fa-eye-slash") { //not selected yet
        console.log("not selected")

        /* Change the icon on the list control, this indicated if there is already a solo or not*/

        /* If the icon is an open an eye, there is no one solo so change the icon and reset the tempEvetnsArray*/
        if (document.getElementById("toggleAllUserSelection").className == "fa fa-eye"){
            document.getElementById("toggleAllUserSelection").className = "fa fa-eye-slash"
            tempEventsFromResources = []
        }
                
        /* get the selected user from the users list */
        for (var i = 0; i < usersResourceList.length; i++) {
            if (usersResourceList[i].id == id) {
                console.log('found user', usersResourceList[i])

                /* Add the user to the solo List */
                singleUserForList.push(usersResourceList[i]);
                break;                
            }
        }

        console.log("singleUserForList: ",singleUserForList)
        
        /* change the user list appearance */        
        tempSelectIcon.className = "fa fa-eye";
        
        /* Call the filter function to rebuild the cals with the solo events*/
        filterResourcesFOI(fieldName);
        
        setYpos()
        
        // setSelectedIcon(id);
    }
    else { //show all users

        console.log("back from selected - show all users")
        /* change the user list appearance */
        tempSelectIcon.className = "fa fa-eye-slash";

        /* remove all the user resources from the tempEventList*/
        for (var i = 0; i < usersResourceList.length; i++) {
            if (usersResourceList[i].id == id) {
                console.log('found user to remove from solo', usersResourceList[i])

                /* Remove the user from the solo List */
                singleUserForList.splice(singleUserForList.indexOf(usersResourceList[i]),1);                
                break;                
            }
        }

        console.log("singleUserForList: ",singleUserForList.length)

        /* change the control eye icon if the tempEventarray is Empty! */
        if(singleUserForList.length == 0){
            document.getElementById("toggleAllUserSelection").className = "fa fa-eye"
        }
                  
        console.log("call FOI filter ");
        filterResourcesFOI(fieldName);
        // populateUsersTablePC(usersResourceList)
        
        setYpos()
    }
}

function toggleAllUserSelection(){
    
    console.log('toggleAllUserSelection');
    
    event.stopPropagation();
    saveCalendarsViewState()

    /* Set the icon back to full eye*/
    document.getElementById("toggleAllUserSelection").className = "fa fa-eye"
    /* Restore all the icons and remove users from singleList */
    for (var i = 0; i < singleUserForList.length; i++){
        let tempSelectIcon = document.getElementById('toggleUserSelection' + singleUserForList[i].id);
        tempSelectIcon.className = "fa fa-eye-slash"        
    }
    singleUserForList = [];
    filterResourcesFOI(fieldName);
    setYpos()
}

var listDisplay = false;
function showAsList() {

    myCalendarAlt.changeView('listMonth');
    listDisplay = true;
    myCalendarAlt.refetchEvents();

    return;
    // const el = document.getElementsByClassName('fc-list-table ');
    // console.log(el);
    // for(i = 0; i < el.length; i++){
    //     console.log(el[i]);
    //     console.log(el[i].scrollTop);
    // }
    // console.log(el[0]);
    // get scroll position in px

    // console.log("showAsList :", sourceCal + " " + myCalendarAlt.getOption('scrollTime'));
    if (listDisplay === false) {
        listDisplay = true;
        document.getElementById('list').innerText = "show as calendar"
        // myCalendar.changeView('listWeek');
        if (myCalendarAlt.view.type.includes('Day')) {
            myCalendarAlt.changeView('listDay');
        }
        else if (myCalendarAlt.view.type.includes('Week')) {
            myCalendarAlt.changeView('listWeek');
        }
        else if (myCalendarAlt.view.type.includes('Month')) {
            myCalendarAlt.changeView('listMonth');
        }

        // if (sourceCal == "cal") {
        //     toggleDisplay();
        // }
        console.log("should call change of alt list colors here");
        myCalendarAlt.refetchEvents();
        // makeCalAlt()
    }
    else {
        listDisplay = false;
        document.getElementById('list').innerText = "show as events list"
        if (sourceCal == "alt") {
            if (myCalendarAlt.view.type.includes('Day')) {
                myCalendarAlt.changeView('timeGridDay');
            }
            else if (myCalendarAlt.view.type.includes('Week')) {
                myCalendarAlt.changeView('timeGridWeek');
            }
            else if (myCalendarAlt.view.type.includes('Month')) {
                myCalendarAlt.changeView('dayGridMonth');
            }
        }
        else {
        }
    }
}

function toggleDisplay() {
    console.log('toggleDisplay', sourceCal + " and : " + toggleDisplay_check)
    let currentView = myCalendarAlt.view.type
    console.log(myCalendarAlt.view.type)

    /* SHOW GRID CAL */
    if (toggleDisplay_check == true) {
        // console.log("show alt")
        toggleDisplay_check = false;
        sourceCal = "cal";
        // document.getElementById('toggleDisplay').innerText = "Show Alt";
        document.getElementById('calendarAlt').style.visibility = 'visible';
        viewDay = "timeGridDay"
        viewWeek = "timeGridWeek"
        viewMonth = "dayGridMonth"

        if(currentView == "timeGridDay"){
            myCalendarAlt.changeView(viewDay)
        }
        else if(currentView == "timelineWeek"){
            myCalendarAlt.changeView(viewWeek)
        }
        else if(currentView == "timelineMonth"){
            myCalendarAlt.changeView(viewMonth)
        }

        //check if list is on or off
        // if (displayUsersList == true) {
        //     document.getElementById('myList').style.visibility = 'visible';
        // }
        // else {
        //     document.getElementById('myList').style.visibility = 'hidden';
        // }

        // changeCalAltWidth(); 
        document.getElementById("calendar").style.visibility = "hidden";

    }
    else {
        
        /* SWITCH TO TIMELINE VIEW */
        toggleDisplay_check = true;
        sourceCal = "alt";

        // document.getElementById('toggleDisplay').innerText = "Show Cal";
        /* SWITCH CAL DISPLAY */
        viewDay = "timelineDay"
        viewWeek = "timelineWeek"
        viewMonth = "timelineMonth"
        
        
        if(currentView == "timelineDay"){           
            myCalendarAlt.changeView(viewDay)
        }
        else if(currentView == "timeGridWeek"){            
            myCalendarAlt.changeView(viewWeek)
        }
        else if(currentView == "dayGridMonth"){
            myCalendarAlt.changeView(viewMonth)
        }

        
        // document.getElementById("calendar").style.visibility = "visible";
        // document.getElementById('calendarAlt').style.visibility = 'hidden';
        // if (displayUsersList == true) {
        //     document.getElementById('myList').style.visibility = 'visible';
        // }
        // else {
        //     document.getElementById('myList').style.visibility = 'hidden';
        // }
        // changeCalAltWidth(); 
    }
}



function setSelectedIcon(id) {
    let tempSelectIcon = document.getElementById('toggleUserSelection' + id);
    tempSelectIcon.className = "fa fa-eye";
}

var showOnlyFavs = false;

function toggleAllSelected() {
    // var allResources = myCalendar.getResources();
    var allEventsAlt = myCalendarAlt.getEvents();
    event.stopPropagation();

    if (showOnlyFavs == false) { //show here only Favs
        showOnlyFavs = true;
        // document.getElementById('btn_toggleFavs').innerHTML = ('Show All Users');

        // for (e in allResources) {
        //     allResources[e].remove();
        // }
        for (k in allEventsAlt) {
            allEventsAlt[k].remove();
        }

        var filteredResources = [];
        for (f in myFavArray) {
            let key = myFavArray[f];

            for (var i = 0; i < usersResourceList.length; i++) {
                if (usersResourceList[i].id == key) {
                    console.log('found user', usersResourceList[i])
                    myCalendarAlt.addResource(usersResourceList[i]);

                    var resourceA = myCalendarAlt.getResourceById(key);
                    console.log(resourceA);

                    filteredResources = filteredResources.concat(resourceA.getEvents());
                    // filteredResources.push(resourceA.getEvents()); 
                    console.log(filteredResources);
                    break;
                }
            }
        }

        console.log(filteredResources);
        resetCalAlt(filteredResources);
        buildFavs();
    }
    else { //show all users
        showOnlyFavs = false;
        // document.getElementById('btn_toggleFavs').innerHTML = ('Show Favorites');

        //Show all users according to selected field of interest
        // for (e in allResources) {
        //     allResources[e].remove();
        // };
        // for (e in usersResourceList) {
        //     myCalendar.addResource(usersResourceList[e]);
        // };

        var mySelect = document.getElementById("foiSelector1");
        var fieldName = mySelect.value;
        console.log("call FOI filter ");
        filterResourcesFOI(fieldName);

        buildFavs();
    }

}


function respondToDateClick(info) {
    console.log('++Open add event manually from calendar' + info.dateStr);
    /* on month - go to date */
    console.log(myCalendarAlt.view.type)
    // if(myCalendarAlt.view.type == "dayGridMonth"){
    //     /* go to date and show day */
    // }
    openAddEventManually(info);
}


function populateChatIcons() {
    console.log("updatearray: ", typeof (updatesArray));
    console.log(updatesArray);
    for (i in updatesArray) {
        console.log(updatesArray[i].key)
        console.log(updatesArray[i].sender)
        console.log('chatModalOpen', chatModalOpen)
        //if the chat window is closed
        if (chatModalOpen == false) {
            console.log("chat modal is closed")
            let elem = document.getElementById("chatIcon" + updatesArray[i].sender)
            if (elem != null) {
                elem.className = "chatIconOn fa fa-comment";
                console.log("found chatIcon: ", elem)
            }

        }
        else if (updatesArray[i].sender != filteredUserInfo.appId) {
            console.log("chat modal is open with: ", filteredUserInfo.appId)
            let elem = document.getElementById("chatIcon" + updatesArray[i].sender)
            if (elem != null) {
                elem.className = "chatIconOn fa fa-comment";
                console.log("found chatIcon: ", elem)
            }
        }
    }
}

chatModalOpen = false
modalChat = "";
modalSpan = "";


function openChat(id) {
    console.log("openChat: ",id)
    tippInstance.disable();
    let emptyHtml = ""
    document.getElementById("messages").innerHTML += emptyHtml;
    if (chatModalOpen == true) {
        closeChatModal()
    }
    event.stopPropagation();
    chatModalOpen = true
    allowInit = false;
    chatUserId = id;
    calSource = 'singleUserPage';
    findUser(id);

    //delete the message in updates so, there is no notification for new ones
    for (i in updatesArray) {
        console.log(updatesArray[i].key)
        console.log(updatesArray[i].sender)
        //set the icon color to neutral
        let elem = document.getElementById("chatIcon" + updatesArray[i].sender)
        elem.className = "chatIcon fa fa-comment";
        console.log("found chatIcon: ", elem)

        if (updatesArray[i].key == filteredUserInfo.appId) {
            firebase.database().ref("updates/" + currentUser.appId + "/" + filteredUserInfo.appId).remove();
        }
    }

    modalChat = document.getElementById("singleUserModal");
    console.log("modalChat: ",modalChat);
    // modalSpan = document.getElementsByClassName("closeSingleUser")[0];
    // chatBody

    document.getElementById('chatPannel').style.maxHeight = 1000 + "px"
    var objDiv = document.getElementById("chatBody");
    objDiv.scrollTop = objDiv.scrollHeight;

    modalChat.style.display = "flex";

    // When the user clicks on <span> (x), close the modal
    // modalSpan.onclick = function() {
    //     closeChatModal()  
    // }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modalChat) {
            // modal.style.display = "none";
        }
    }

    $(document).keyup(function (e) {
        console.log(textModalOpen);

        if (e.key === "Escape") { // escape key maps to keycode `27`
            closeChatModal()
        }
    });

    // span = document.getElementById("closeSingleUser");
    // // When the user clicks on <span> (x), close the modal
    // span.onclick = function () {
    //     console.log("close chat")
    //     event.stopPropagation();
    //     closeChatModal()
    // }

    // tippInstance.show();

}

function closeChatModal() {
    tippInstance.enable();
    console.log("close chat modal")
    event.stopPropagation();
    modalChat = document.getElementById("singleUserModal");
    modalChat.style.display = "none";
    chatModalOpen = false
    messagesIdArray = [];
    //delete the message in updates so, there is no notification for new ones 
    for (i in updatesArray) {
        console.log(updatesArray[i].key)
        console.log(updatesArray[i].sender)
        //set the icon color to neutral
        let elem = document.getElementById("chatIcon" + updatesArray[i].key)
        elem.className = "chatIcon fa fa-comment";
        if (updatesArray[i].key == filteredUserInfo.appId) {
            firebase.database().ref("updates/" + currentUser.appId + "/" + filteredUserInfo.appId).remove();
        }
    }
}

function buildTippyEvents() {
    console.log('buildTippyEvents');
    document.getElementById("eventToConfirmList").innerHTML = "";
    if (eventsToConfirm.length == 0) {
        document.getElementById("eventToConfirmList").innerHTML = "No Events waiting";
        return;
    }
    for (var I = 0; I < eventsToConfirm.length; I++) {
        // console.log(eventsToConfirm[I].title + " " + eventsToConfirm[I].id);
        let statusString = "Request: "
        allUsersSnapShot.forEach(function (child) {
            if (child.key == eventsToConfirm[I].extendedProps.description.split("/")[1]) {
                // requestorName = child.val().name + " " + child.val().lastName;
                requestorName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

            }
            if (eventsToConfirm[I].extendedProps.description.split("/")[0] == "inviteRequest") {
                statusString = "Invite: ";
            }

        });

        // console.log(requestor);                
        // var requestorName = usersResourceList.find(x => x.id === requestor).title;                                                            
        let myString = statusString + moment(eventsToConfirm[I].start).format('DD/MM/YY HH:mm') + ' ' + requestorName;
        let idString = '"' + eventsToConfirm[I].id + '"';
        nameList = "<li onclick = 'loadFromList(" + idString + ")' style='cursor: pointer'>" + myString + "</li>";
        document.getElementById("eventToConfirmList").innerHTML += nameList;
    }
    tippyInstance.setContent(document.getElementById('eventToConfirmList').innerHTML);
}
function loadFromInBox(index) {

    console.log("load from in box ", index);
    //in case chat window is open, close it
    document.getElementById("singleUserModal").style.display = "none";

    document.getElementById("mainView").style.visibility = "hidden";
    document.getElementById("singleCal").style.visibility = "visible"
    // close the inBox
    closeInBox()
    let messageStatus = inBoxContentArray[index].status;
    if (messageStatus == "inviteRequest") {
        console.log("load  message invite");
        eventSingle = myCalendarAlt.getEventById(inBoxContentArray[index].eventId);
        loadInviteEvent(eventSingle);
    }
    else if (messageStatus == "inviteAccept") {
        console.log("load  message inviteAccept");
        eventSingle = myCalendarAlt.getEventById(inBoxContentArray[index].eventId);
        loadEvent(eventSingle);
    }
    else if (messageStatus == "request") {
        console.log("load  message request");
        eventSingle = myCalendarAlt.getEventById(inBoxContentArray[index].eventId);
        requestKey = eventSingle.extendedProps.description.split("/")[5];
        loadEventToConfirm(eventSingle);
    }
    else if (messageStatus == "approve") {
        eventSingle = myCalendarAlt.getEventById(inBoxContentArray[index].eventId);
        console.log("load  message approve: ", eventSingle.id);

        loadEvent(eventSingle);
    }
    else if (messageStatus == "meeting deleted") {
        eventSingle = myCalendarAlt.getEventById(inBoxContentArray[index].eventId);
        console.log("load  message meeting deleted: ", eventSingle.id);
        /* this is a delted event maybe I need to keep the time in memory*/
        loadEvent(eventSingle);
    }
    else if (messageStatus == "chat") {
        //openChat with the user 
        id = inBoxContentArray[index].sender
        openChat(id)
    }
    else {
        eventSingle = myCalendarAlt.getEventById(inBoxContentArray[index].eventId);
        loadEvent();
    }


}
function loadFromList(eventId) {
    console.log(eventId);

    //close the chat window if open
    var modal = document.getElementById("singleUserModal");
    modal.style.display = "none";

    document.getElementById("mainView").style.visibility = "hidden";
    document.getElementById("singleCal").style.visibility = "visible"


    for (var i = 0; i < eventsToConfirm.length; i++) {
        if (eventsToConfirm[i].id == eventId) {
            eventSingle = eventsToConfirm[i];
            break;
        }
    }
    console.log("eventSingle: ", eventSingle.id)
    tippyInstance.hide();
    if (requestKey = eventSingle.extendedProps.description.split("/")[0] == "inviteRequest") {
        console.log("load invite handle");
        loadInviteEvent();
    }
    else {
        requestKey = eventSingle.extendedProps.description.split("/")[5];
        loadEventToConfirm();
    }
}

// respond to text modal buttons

var confirmed = true;
var requestingUserId = "";

function confirmEventFromTippy(eventId){
    alert("not set yet");
    return;
    getYpos()
    tippInstance.disable()
    document.getElementById("mainView").style.visibility = "hidden";
    document.getElementById("singleCal").style.visibility = "visible"
    fromTippy = true
    console.log("conifrm request from tippy with: ",eventId)
    eventSingle = myCalendarAlt.getEventById(eventId);
    requestKey = eventSingle.extendedProps.description.split("/")[5];
    loadEventToConfirm()        
}

function declinelRequestFromTippy(eventId) {
    getYpos()
    eventSingle = myCalendarAlt.getEventById(eventId);
    tippInstance.destroy()
    fromTippy = true
    decline()
}

function confirmEvent() {
    console.log("confirm");
    confirmed = true;
    //open Text modal
    openTextModal();
}

function decline() {
    console.log("decline");
    confirmed = false;
    textModalOpen = true;
    openTextModal();

}

var textModalOpen = false;

function openTextModal(message) {
    console.log('openTextModal');
    // console.log(typeof(message),message);
    textModalOpen = true;
    var origianlEvent = eventSingle;
    var requestedEve = eventSingle

    if(fromTippy == false){
        var requestedEvents = calendarConfirm.getEvents();
        requestedEve = [];

        
        console.log(requestedEvents);

        if (requestedEvents.length == 1) {
            requestedEve = requestedEvents[0];

        }
        else {
            requestedEve = requestedEvents[1];
        }
    }
    
    console.log(requestedEve.id);
    allUsersSnapShot.forEach(function (child) {
        if (child.key == requestedEve.extendedProps.description.split("/")[2]) {
            // autherName = child.val().name + " " + child.val().lastName;
            autherName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

        }
    });
    let headerString = "You are confirming an event on " + moment(requestedEve.start).format('dddd') + " " + moment(requestedEve.start).format('DD.MM.YYYY') + " starting at: " + moment(requestedEve.start).format('HH:mm') + " ending at: " + moment(requestedEve.end).format('HH:mm') + "\nWith " + autherName;
    document.getElementById('btn_TextModalSubmit').innerText = "Confirm";

    if (requestedEve.extendedProps.description.split("/")[0] == "inviteRequest") {
        headerString = "You are accepting an invitation for an event on</br> " + moment(requestedEve.start).format('dddd') + " " + moment(requestedEve.start).format('DD.MM.YYYY') + " starting at: " + moment(requestedEve.start).format('HH:mm') + " ending at: " + moment(requestedEve.end).format('HH:mm') + "<br/>From " + autherName;
        document.getElementById('btn_TextModalSubmit').innerText = "Accept";
    }

    if (confirmed == false) {
        headerString = "You are declining an event on " + moment(requestedEve.start).format('dddd') + " " + moment(requestedEve.start).format('DD.MM.YYYY') + " starting at: " + moment(requestedEve.start).format('HH:mm') + " ending at: " + moment(requestedEve.end).format('HH:mm') + "\n Requested by: " + autherName;
        document.getElementById('btn_TextModalSubmit').innerText = "Decline";
    }

    document.getElementById('textAreaHeader').innerHTML = headerString;


    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        textModalOpen = false;
        modal.style.display = "none";
        tippInstance.enable()
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            // modal.style.display = "none";
        }
    }
    $(document).keyup(function (e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            if (textModalOpen == false) {
                textModalOpen = false;
                modal.style.display = "none";
                tippInstance.enable()
            }
        }
    });    
}

var isTrimmed = false;
var event1Trimmed = false;
var event2Trimmed = false;
var event3Trimmed = false;


function trimEvent() {
    isTrimmed = true;
    console.log("trim ", ccase);
    let mainElements = document.getElementById('calendarSingle')
    let eventsArry = mainElements.getElementsByClassName("fc-timegrid-event fc-v-event fc-event fc-event-start fc-event-end fc-event-future")
    // let eventsArry1 = mainElements.getElementsByClassName("fc-v-event")
    console.log("how many events? :",eventsArry.length)
    let trimB = document.getElementById('trimB');
    trimB.innerHTML = "Undo trim";
    trimB.setAttribute('onclick', 'undoTrim()');

    if (ccase == 0) {

    }
    else if (ccase == 1) { //same time
        // eventt1.remove();
        // event1="";

    }
    else if (ccase == 2) { //start later                
        eventsArry[0].style.display = 'none';                
        event1Trimmed = true;
        // event1=[];
    }
    else if (ccase == 3) { //start later end early
        console.log("events; ",eventsArry[0])
        eventsArry[2].style.display = 'none';
        eventsArry[0].style.display = 'none';        
        event1Trimmed = true;
        event3Trimmed = true;
    }
    else { //end early        
        eventsArry[1].style.display = 'none';        
        event2Trimmed = true;        
    }
}

function undoTrim() {
    isTrimmed = false;
    event1Trimmed = false;
    event2Trimmed = false;
    event3Trimmed = false;

    let mainElements = document.getElementById('calendarSingle')
    let eventsArry = mainElements.getElementsByClassName("fc-timegrid-event fc-v-event fc-event fc-event-start fc-event-end fc-event-future")
    for(var i = 0; i <eventsArry.length; i++){
        eventsArry[i].style.display = '';
    }

    let trimB = document.getElementById('trimB');
    trimB.innerHTML = "Trim";
    trimB.setAttribute('onclick', 'trimEvent()');
    // if (ccase == 0) {

    // }
    // else if (ccase == 1) { //same time
    //     // eventt1.remove();
    //     // event1="";

    // }
    // else if (ccase == 2) { //start later
    //     // var eventTodelete = calendarConfirm.getEventById('1');
    //     // eventTodelete.remove();
    //     // event1=[];
    //     calendarConfirm.addEvent(event1);
    // }
    // else if (ccase == 3) { //start later end early

    //     // var eventTodelete = calendar.getEventById('1');
    //     // eventTodelete.remove();
    //     // var eventTodelete = calendar.getEventById('3');
    //     // eventTodelete.remove();
    //     // event1 = [];
    //     // event3 = [];
    //     eventsArry[2].style.display = '';
    //     eventsArry[0].style.display = '';

    //     // calendarConfirm.addEvent(event1);
    //     // calendarConfirm.addEvent(event3);

    // }
    // else { //end early
    //     // var eventTodelete = calendarConfirm.getEventById('2');
    //     // eventTodelete.remove();
    //     // event2=[];
    //     calendarConfirm.addEvent(event2);

    // }
}

function cancel() {
    let r = confirm("Cacnel - you will be redirected to the calendar and can choose to confirm at another time");
    if (r == true) {
        backToCal();
        // window.location.href = "../gse5/publicCalendar.html";
    }
}

function confirmButton_textBox() {

    getYpos()
    console.log("confirmButton_textBox");
    if (sourceCal == "singleConfirm") {
        console.log(currentUser.luid);
        submitConfirm();
    }
    else if (sourceCal == "singleInvite") {
        submitAcceptInvite();
    }
    else {
        if(eventSingle.extendedProps.description.split("/")[0] == "inviteRequest"){
            submitAcceptInvite();

        }
        else if(eventSingle.extendedProps.description.split("/")[0] == "pending"){
            submitConfirm();
        }
        else{
            console.log("send a new event request");
            var modal = document.getElementById("textArea");
            modal.style.display = "none";
            sendRequestEvent();
        }
        
    }

}

function closeModalPC() {
    modal.style.display = "none";
}

function clearTextPC() {
    console.log("clearText");
    let textAreaField = document.getElementById("textAreaField");
    console.log(textAreaField.value);
    textAreaField.value = "";
}

var textTosend = "";
function submitConfirm() {

    console.log("submitConfirm");
    var modal = document.getElementById("textArea");
    modal.style.display = "none";
    //the confirmed bool is checking if this is pressed on after accept or decline as they use the same text window
    if (confirmed == true) {
        sendConfirmation();
    }
    else {
        sendDecline();
    }

}
function submitAcceptInvite() {

    console.log("submit Accept Invite");
    var modal = document.getElementById("textArea");
    modal.style.display = "none";
    //the confirmed bool is checking if this is pressed on after accept or decline as they use the same text window
    if (confirmed == true) {
        sendAcceptInvite();
    }
    else {
        sendDecline();
    }

}

function clearText() {
    console.log("clearText");
    let textAreaField = document.getElementById("textAreaField");
    console.log(textAreaField.value);
    textAreaField.value = "";
}



function sendAcceptInvite() {
    console.log("sendAcceptInvite to: ", eventSingle.extendedProps.appId);


    //get original user email

    allUsersSnapShot.forEach(function (snapshot) {
        if (snapshot.val().appId == eventSingle.extendedProps.appId) {
            console.log("found user here", snapshot.val().name + "  " + snapshot.val().appId);
            userEmail = snapshot.val().email;
            nameTosend = snapshot.val().name;
            userToInviteAppId = snapshot.val().appId;
            requestingUserId = snapshot.key;


            //open Text
            let textAreaField = document.getElementById("textAreaField");

            let mailBody = "Hello " + nameTosend + ".\n " + myFullName + " accepted your invitation request\n" +
                "for " + moment(eventSingle.start).format('dddd') + " " + moment(eventSingle.start).format('DD.MM.YYYY') + " starting at: " + moment(eventSingle.start).format('HH:mm') + " ending at: " + moment(eventSingle.end).format('HH:mm')
            "The request has been updated in your calendar";

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
                    Subject: "Invitattion accepted",
                    Body: mailBody,
                }).then(
                    message => alert("mail sent successfully")
                );
            }

            console.log("Send to InBox");
            firebase.database().ref("inBox/" + userToInviteAppId + "/new/" + eventSingle.id).set({
                "sender": currentUser.luid,
                "message": mailBody,
                "status": "inviteAccept",
                "eventId": eventSingle.id,
                "timestamp": firebase.database.ServerValue.TIMESTAMP
            });
            firebase.database().ref("inBox/" + userToInviteAppId + "/all/" + eventSingle.id).update({
                "sender": currentUser.luid,
                "message": mailBody,
                "status": "inviteAccept",
                "eventId": eventSingle.id,
                "timestamp": firebase.database.ServerValue.TIMESTAMP,
                "eventTs": moment(eventSingle.start).valueOf(),
            });
            
            //remove the relevant message from the inbox since an action was taken
            deleteInBoxList(eventSingle.id)

            //--update the reqested event on the origianl side

            var tempArray = snapshot.val().calArray
            // console.log(tempArray);

            
            var r = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "")
            for (e in tempArray) {
                let element = JSON.parse(tempArray[e])
                // console.log("element id: " + element.id + " : " + eventSingle.id);
                if (element.id == eventSingle.id) {
                    element.resourceId = eventSingle.extendedProps.appId;
                    element.title = "Invitation accecpted by " + myFullName;
                    element.extendedProps.description = "booked/" + eventSingle.extendedProps.description.split("/")[1] + "/" + currentUser.luid + "/" + eventSingle.id + "/" + r; //send the event id that current user will have
                    tempArray[e] = JSON.stringify(element);
                    // console.log("tempArray ", tempArray);

                    allowInit = false;
                    firebase.database().ref('/users/' + requestingUserId).update({
                        calArray: tempArray
                    });
                    break;
                }
            }

            /*--update the event on the currentUser based on the split choice */

            //handle events to confirm if the invitation is saved to it
            for (var i = 0; i < eventsToConfirm.length; i++) {
                if (eventsToConfirm[i].id == eventi.id) {
                    eventsToConfirm.splice(i, 1);
                    break;
                }
            }
            console.log('call buildTippyEvents');
            buildTippyEvents();

            console.log(currentUser.luid);
            var tempUserArray = [];

            // firebase.database().ref('/users/'+currentUser.luid).once('value').then(function(snap){
            newEvent = {
                resourceId: currentUser.appId,
                id: r,
                title: eventSingle.title.replace("Invited by ","Invition Confirmed with "),
                start: eventSingle.start,
                end: eventSingle.end,
                allDay: false,                

                extendedProps: {
                    description: "booked/" + eventSingle.extendedProps.description.split("/")[1] + "/" + currentUser.luid + "/" + eventSingle.id + "/" + r,
                    appId: currentUser.appId,
                    acceptGuest: false
                }
            }

            // myCalendar.getEventById(eventSingle.id).remove();
            myCalendarAlt.getEventById(eventSingle.id).remove();
            currentUser.calArray.push(JSON.stringify(newEvent));
            myCalendarAlt.addEvent(newEvent);
            // myCalendar.addEvent(newEvent);

            // allowInit = false;
            writeCalArrayTo_firbase(newEvent);
            
            /* here I need to delete the invitation becasue it is with an old id from the invite
            then save it as a new event with the new details */
            deleteEventToGoogle(eventSingle.id)
            addEventToGoogle(newEvent)
        }
    });
    tippInstance.enable()
    backToCal();
}


function requestEvent() {
    textModalOpen = true;
    openTextModalPC();
}

var textModalOpen = false;

function openTextModalPC(message) {
    console.log(sourceCal);
    textModalOpen = true;
    let headerString = "";

    var requestedEvents = calendarSingle.getEvents();
    var requestedEve = [];
    var origianlEvent = eventSingle;

    if (requestedEvents.length == 1) {
        requestedEve = requestedEvents[0];

    }
    else {
        requestedEve = requestedEvents[1];
    }
    headerString = "You are requesting an event on </br>" + moment(requestedEve.start).format('dddd') + " " + moment(requestedEve.start).format('DD.MM.YYYY') + " starting at: " + moment(requestedEve.start).format('HH:mm') + " ending at: " + moment(requestedEve.end).format('HH:mm') + "</br>From " + eventSingle.title;
    document.getElementById('btn_TextModalSubmit').innerText = "Send Request";
    document.getElementById('textAreaHeader').innerHTML = headerString;
    // var modal = document.getElementById("textArea");  
    // var span = document.getElementsByClassName("closeText")[0]; 
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        textModalOpen = false;
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            // modal.style.display = "none";
        }
    }


    $(document).keyup(function (e) {
        console.log(textModalOpen);
        if (e.key === "Escape") { // escape key maps to keycode `27`
            if (textModalOpen == true) {
                textModalOpen = false;
                modal.style.display = "none";
            }
        }
    });

}

function clearTextPC() {
    console.log("clearText");
    let textAreaField = document.getElementById("textAreaField");
    console.log(textAreaField.value);
    textAreaField.value = "";
}

function closeModalPC() {
    modal.style.display = "none";
}



function sendDecline() {

    console.log("sendDecline");
    if (eventSingle.extendedProps.description.split("/")[0] == "inviteRequest") {

        console.log("decline an invitation from another user");
        let OriginalUser = eventSingle.extendedProps.description.split("/")[1];
        // console.log(OriginalUser);


        allUsersSnapShot.forEach(function (child) {
            // console.log(child.key);
            if (child.key == OriginalUser) {
                // let OriginalId = child.key                
                // var localUsersArray = allUsersSnapShot.toJSON();

                // get the original user email
                firebase.database().ref('/users/' + OriginalUser).once('value').then(function (snapshot) {
                    {
                        console.log("got user: "+snapshot.val().name);
                        if (snapshot.val().appId == eventSingle.extendedProps.appId) {
                            console.log("found matching user to delete invite from: ", child.val().email);
                            userEmail = snapshot.val().email;
                            nameTosend = snapshot.val().name;
                            var userToInviteAppId = snapshot.val().appId;


                            let mailBody = "Hello " + nameTosend + ".\n " + myFullName + " has declined your invitation\n" +
                                +"for : " + moment(eventSingle.start).format('dddd') + " " + moment(eventSingle.start).format('DD.MM.YYYY') + " starting at: " + moment(eventSingle.start).format('HH:mm') + " ending at: " + moment(eventSingle.end).format('HH:mm')
                            "The invitation has been deleted from your calendar";
                            console.log(mailBody);

                            //open Text
                            let textAreaField = document.getElementById("textAreaField");
                            if (textAreaField.value.length > 0) {
                                mailBody += "\n \n A message was sent as well: \n" + textAreaField.value;
                                textAreaField.value = "";
                            }
                            // send an email to the origianl user
                            if (sendEmails == true) {
                                Email.send({
                                    Host: "smtp.ipage.com",
                                    Username: "roi@roiwerner.com",
                                    Password: "Roki868686",
                                    To: userEmail,
                                    From: "<roi@roiwerner.com>",
                                    Subject: "Invitation declined",
                                    Body: mailBody,
                                }).then(
                                    message => alert("mail sent successfully")
                                );
                            }


                            console.log("Send to InBox");
                            firebase.database().ref("inBox/" + userToInviteAppId+"/new/").push().set({
                                "sender": currentUser.luid,
                                "message": mailBody,
                                "status": "decline Invitation",
                                "eventId": eventSingle.id,
                                "timestamp": firebase.database.ServerValue.TIMESTAMP
                            });
                            firebase.database().ref("inBox/" + userToInviteAppId + "/all/").push().update({
                                "sender": currentUser.luid,
                                "message": mailBody,
                                "status": "decline Invitation",
                                "eventId": eventSingle.id,
                                "timestamp": firebase.database.ServerValue.TIMESTAMP,
                                "eventTs": moment(eventSingle.start).valueOf(),
                            });                            

                            deleteInBoxList(eventSingle.id)

                            // delete the event from the origianl user cal on fb
                            var tempArray = snapshot.val().calArray
                            for (e in tempArray) {
                                let element = JSON.parse(tempArray[e])
                                // console.log(element);
                                if (element.id == eventSingle.id) {
                                    console.log("event to delete found ", element.id + " " + snapshot.key);
                                    element.title = "invitation declined by: "+myFullName
                                    element.extendedProps.description = "deleted/" + snapshot.key;
                                    tempArray[e] = JSON.stringify(element)
                                    // tempArray.splice(e, 1);
                                    // console.log(tempArray);

                                    for (var i = 0; i < eventsToConfirm.length; i++) {
                                        if (eventsToConfirm[i].id == eventSingle.id) {
                                            eventsToConfirm.splice(i, 1);
                                            break;
                                        }
                                    }

                                    // allowUpdate = false;
                                    
                                    firebase.database().ref('/users/' + OriginalUser).update({
                                        calArray: tempArray
                                    });     
                                                                        
                                    firebase.database().ref('calUpdates/' + currentUser.luid).update(
                                    {
                                        "sender": currentUser.appId,
                                        "event": eventSingle.id,
                                        "timestamp": firebase.database.ServerValue.TIMESTAMP
                                    });

                                    break;
                                }

                            }
                            /* DELETE THE EVENT FROM CURRENT USER */
                            console.log("hello 1")
                            myCalendarAlt.getEventById(eventSingle.id).remove()
                            fromTippy = false
                            // for (var i = 0; i < currentUser.calArray.length ; i++){
                                
                            //     let tempEve = JSON.parse(currentUser.calArray[i])
                            //     console.log("hello 2 ",tempEve.id)
                            //     if( tempEve.id == eventSingle.id){
                            //         console.log("should remove my event here")
                            //         currentUser.calArray.splice(i,1)
                                    
                            //         deleteEventToGoogle(eventSingle.id)
                            //         writeCalArrayTo_firbase(element.id)
                            //         // break;
                            //     }
                            // }                            
                            tippInstance.enable()
                            backToCal();
                        }
                    }
                });
            }
        });
        
    }

    else {
        //get requesting user email

        firebase.database().ref('/users/' + requestingUserId).once('value').then(function (snapshot) {
            console.log(requestingUserId);

            userEmail = snapshot.val().email;
            nameTosend = snapshot.val().name;
            userToNotifyAppId = snapshot.val().appId;
            console.log(userEmail);



            let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " has declined your session request\n" +
                "The request has been deleted from your calendar";
            console.log(mailBody);

            //open Text
            let textAreaField = document.getElementById("textAreaField");
            if (textAreaField.value.length > 0) {
                mailBody += "\n \n A message was sent as well: \n" + textAreaField.value;
                textAreaField.value = "";
            }
            if (sendEmails == true) {
                Email.send({
                    Host: "smtp.ipage.com",
                    Username: "roi@roiwerner.com",
                    Password: "Roki868686",
                    To: userEmail,
                    From: "<roi@roiwerner.com>",
                    Subject: "Session request not approved",
                    Body: mailBody,
                }).then(
                    message => alert("mail sent successfully")
                );
            }

            console.log("Send to InBox");
            firebase.database().ref("inBox/" + userToNotifyAppId + "/new/" + eventi.id).set({
                "sender": currentUser.luid,
                "message": mailBody,
                "status": "decline",
                "eventId": eventi.id,
                "timestamp": firebase.database.ServerValue.TIMESTAMP
            });
            firebase.database().ref("inBox/" + userToNotifyAppId + "/all/" + eventi.id).update({
                "sender": currentUser.luid,
                "message": mailBody,
                "status": "decline",
                "eventId": eventi.id,
                "timestamp": firebase.database.ServerValue.TIMESTAMP,
                "eventTs": moment(eventSingle.start).valueOf(),
            });
            // console.log("call false in read")
            // firebase.database().ref("/inBox/" + userToNotifyAppId + "/read").update({
            //     'state': false,
            //     "timestamp": firebase.database.ServerValue.TIMESTAMP,
            // });


            //delete the reqested event from firebase

            for (var i = 0; i < eventsToConfirm.length; i++) {
                if (eventsToConfirm[i].id == eventi.id) {
                    eventsToConfirm.splice(i, 1);
                    break;
                }
            }
            console.log('call buildTippyEvents');
            buildTippyEvents();


            var tempArray = snapshot.val().calArray
            for (e in tempArray) {
                let element = JSON.parse(tempArray[e])
                // console.log(element);
                if (element.id == reqEvent.id) {
                    console.log("event to delete found ", element.id + " " + snapshot.key);
                    tempArray.splice(e, 1);
                    // console.log(tempArray);

                    firebase.database().ref('/users/' + requestingUserId).update({
                        calArray: tempArray
                    });
                    break;
                }
            }

            // set the event back to open state on user cal




            console.log(currentUser.luid);
            var tempUserArray = [];

            firebase.database().ref('/users/' + currentUser.luid).once('value').then(function (snap) {
                tempUserArray = snap.val().calArray;

                for (e in tempUserArray) {
                    let element = JSON.parse(tempUserArray[e]);

                    if (element.id == eventi.id) {
                        console.log("found element: ", element);
                        tempUserArray.splice(e, 1);
                        // origEvent.extendedProps.description = "";
                        element.title = myFullName;
                        element.extendedProps.description = 'open/' + currentUser.luid + '/' + eventi.id;
                        element.editable = true;
                        element.resizable = true;

                        console.log(element);
                        // console.log(origEvent);
                        // origEvent.setExtendedProp('description', "");                
                        tempUserArray.push(JSON.stringify(element));

                        // console.log("tempUserArray ", tempUserArray);

                        // myCalendar.getEventById(eventi.id).remove();
                        myCalendarAlt.getEventById(eventi.id).remove();
                        myCalendarAlt.addEvent(element);
                        // myCalendar.addEvent(element);

                        // -- update the current user in firebase
                        firebase.database().ref('/users/' + currentUser.luid).update({
                            calArray: tempUserArray
                        }, function (error, committed, snapshot) {
                            if (error) {
                                console.error(error);
                            }

                        });


                        /* update google if needed*/
                        if(googleSync == true){
                            updateEventToGoogle(element)
                        }
                        break;
                    }
                }

            });

            //delete the request from 'requests'
            firebase.database().ref('/requests/' + requestKey).remove();

        });
        backToCal();
    }
    //   window.location.href = "../gse5/publicCalendar.html";

}




function respondToRepeatEvent() {
    console.log('respondToRepeatEvent');
}

var displayUsersList = false


function toggleUsersList() {
    console.log('---------toggleUsersList: ', sourceCal);
    //check list accoridons



    if (displayUsersList == true) {
        console.log("HIDE LIST")
        displayUsersList = false;

        //hide the users list on calAlt:
        document.getElementById('myList').style.display = 'none';
        document.getElementById('btn_toggleList').innerText = "Show Users List";
        document.getElementById('myList').style.visibility = "hidden";

        // if (sourceCal == "cal") {
        //     console.log('toggleUsersList: 1 cal hide list');
        //     document.getElementById("calendar").style.visibility = "visible";
        //     document.getElementById("calendarAlt").style.visibility = "hidden";
        //     document.getElementById('myList').style.visibility = "hidden";
        //     // changeCalAltWidth();
        // }
        // else {
        //     console.log('toggleUsersList: 2  calAlt hide list');
        //     document.getElementById("calendar").style.visibility = "hidden";
        //     document.getElementById("calendarAlt").style.visibility = "visible";
        //     document.getElementById('myList').style.visibility = "hidden";
        //     // changeCalAltWidth();

        // }
        //change the size of the altcal
        // changeCalAltWidth();
        //hide the resource list from the cal
        //get the current view
        // initViewCalType = myCalendar.view.type;
    }
    else if (displayUsersList == false) {

        console.log("SHOW LIST")
        displayUsersList = true;

        document.getElementById('btn_toggleList').innerText = "Hide Users List";

        document.getElementById('myList').style.display = '';



        // get the current view
        // initViewCalType = myCalendar.view.type;
        populateUsersTablePC(usersResourceList);

        document.getElementById("myList").style.visibility = "visible";

        // if (sourceCal == "cal") {
        //     console.log('toggleUsersList: 3 cal display show list');
        //     document.getElementById("calendar").style.visibility = "visible";
        //     document.getElementById("calendarAlt").style.visibility = "hidden";
        // }
        // else {
        //     console.log('toggleUsersList: 4 cal alt display show list');
        //     document.getElementById("calendar").style.visibility = "hidden";
        //     document.getElementById("calendarAlt").style.visibility = "visible";
        //     document.getElementById('myList').style.visibility = "visible";

        // }
        // changeCalAltWidth();
    }
}

inBoxModalOpen = false;

function getInboxContent(){

    var query = firebase.database().ref("/inBox/" + currentUser.appId + "/all").orderByChild("timestamp");

// Get results in ascending (result) and descending (reverseResults) order
    query.once('value', function(snap) {
        var results = [];
        snap.forEach(function(ss) {
            results.push(ss.val());
        });
        
        var reverseResults = results.reverse();
        console.log(reverseResults)
        inBoxContentArray = reverseResults
        
        if (inBoxModalOpen == true){
            populateInBox();
        }

        // document.getElementById('openInBox').innerText = "Inbox " + (snapshot.numChildren());
        let badgeCount = inBoxContentArray.lenght
        if(badgeCount == 0 || badgeCount == 'undefined' || badgeCount == undefined){
            badgeCount = 0
        }
        document.getElementById('badgeNum').innerText = badgeCount;
    });
    


    // firebase.database().ref("/inBox/" + currentUser.appId + "/all").orderByChild("timestamp").once("value", function (snapshot) {
    //     console.log("+++++++++ loading inBox content", snapshot.numChildren());

    //     inBoxContent = snapshot.exportVal();
    //     inBoxContentArray = snapshotToArray(snapshot)
    //     inBoxContentArray.sort((a, b) => a - b);
    //     console.log("count in box 3",inBoxContentArray.length)
    //     document.getElementById('openInBox').innerText = "Inbox " + (snapshot.numChildren());
    //     document.getElementById('openInBox').style.background = 'white';

    //     //populate the table with the messages
    //     if (inBoxModalOpen == true){
    //         populateInBox();
    //     }
    // });

}
function openInBox() {
    // set the bool value so I know Inbox modal is open
    inBoxModalOpen = true;
    //clear the table from previous content

    getInboxContent()
    
    // populateInBox();
    //open Inbox modal
    modalInBox = document.getElementById("inBox_Modal");
    console.log("modal: ", modalInBox);
    var span = document.getElementsByClassName("closeInBoxModal")[0];


    modalInBox.style.display = "block";
    document.getElementById('openInBox').style.background = 'white';

    // When the user clicks on <span> (x), close the modalInBox
    span.onclick = function () {
        console.log("close");
        closeInBox()
    }

    // When the user clicks anywhere outside of the modalInBox, close it
    window.onclick = function (event) {
        if (event.target == modalInBox) {
            closeInBox()
        }
    }

    $(document).keyup(function (e) {
        console.log(addeventModalOpen);
        if (e.key === "Escape") { // escape key maps to keycode `27`
            if (addeventModalOpen == true) {
                addeventModalOpen = false;
            }
            closeInBox()
        }
    });    
}

function populateInBox() {
    console.log("populateInBox", inBoxContentArray.length)
    document.getElementById("tableBody").innerHTML = "";
    let innerKey = '';
    if (inBoxContentArray.length > 0) {
        for (i = 0; i < inBoxContentArray.length; i++) {
            let messageArray = inBoxContentArray[i];
            //get the key of each message
            const keys = Object.keys(messageArray);
            keys.forEach((key, index) => { 
                // console.log("key; ",key);           
                if(key == "eventId"){
                    // console.log(messageArray[key])
                   innerKey = '"' + messageArray[key] + '"';                        
                }
            })
            // console.log(typeof messageArray)
            if (messageArray.key == 'read') {

            }
            else {
                // console.log("messageArray: ",messageArray);
                let tempMessage = messageArray;
                //get time message was saved on the server
                var messageTime = messageArray.timestamp;
                //add info into a table as a row
                let idString = '"' + i + '"';
                var str = "<tr><td><i id='list_trash' class='fa fa-trash'onclick='deleteInBoxList(" + innerKey + ")'></i></td><td style = 'cursor : pointer' onclick = 'loadFromInBox(" + idString + ")'>" + messageArray.status + "</td><td>" + messageArray.message + "</td><td>" + moment(messageTime).format('HH:mm DD/MM/YY') + "</td></tr>";
                document.getElementById("tableBody").innerHTML += str;
            }
        }
    }
    else {
        console.log("No messages");
    }
}


function closeInBox() {
    console.log("closeInBox")
    modalInBox.style.display = "none";
    inBoxModalOpen = false;
}

function deleteInBoxList(messageId) {
    console.log("delete from Inbox List: ", messageId);
    console.log("inBoxModalOpen : ",inBoxModalOpen)
    if(inBoxModalOpen == true){
        Confirm.open('confirm011', {
            title: 'Alert',
            message: 'Are you sure you want to delete this message?',
            onok: () => {
                console.log("confirmAccept ", message);
                confirm011()
            },
            oncancel: () => {
                return
            }
        })
    }
    else{
        confirm011()
    }

    function confirm011(){
        firebase.database().ref("/inBox/" + currentUser.appId + "/all/" + messageId).remove()
        console.log("count in box 4: ",inBoxContentArray.length)
        for (var i = 0; i < inBoxContentArray.length;i++){
            console.log (inBoxContentArray[i])
            console.log (messageId)
            if(inBoxContentArray[i].eventId == messageId){
                inBoxContentArray.splice(i,1)
            }
        }        
        if (inBoxModalOpen == true) {
            openInBox();
        }
        else{
            getInboxContent()
        }
        
    }
        
}
function deleteInBoxMessage_remote(messageId){
    firebase.database().ref("/inBox/" + currentUser.appId + "/all/" + messageId).remove()
    if (inBoxModalOpen == true) {
        openInBox();
    }
}

function emptyInBox() {
    Confirm.open('confirm010', {
        title: 'Alert',
        message: 'Are you sure you want to delete all the messages in your inBox? This action cannot be undone',
        onok: () => {
            console.log("confirmAccept ", message);
            confirm010()
        },
        oncancel: () => {
            return
        }
    })

    function confirm010(){
        console.log("delete all inbox");
        return firebase.database().ref("/inBox/" + currentUser.appId + "/all/").remove()                      // changes here
            .then(() => {
                inBoxContentArray = [];
                document.getElementById('openInBox').innerText = "Inbox ";
                closeInBox();
            })
            .catch(error => {
                res.send(error);
            });

            /* CLOSE THE*/
            // closeInBox()
    }  
}

function filterStatus(){

}

let eventDateOrder = false
function filterEventDate(){

    var query = firebase.database().ref("/inBox/" + currentUser.appId + "/all").orderByChild("eventTs");
    eventDateOrder = !eventDateOrder
    query.once('value', function(snap) {
        var results = [];
        snap.forEach(function(ss) {
            results.push(ss.val());
        });
        
        if(eventDateOrder == true)//descending orderByChild
        {
            inBoxContentArray = results                    
        }
        else{
            inBoxContentArray = results.reverse();              
        }

        if (inBoxModalOpen == true){
            populateInBox();
        }
        
    });
}

let messageOrder = false
function filterMessageDate(){
    var query = firebase.database().ref("/inBox/" + currentUser.appId + "/all").orderByChild("timestamp");
    messageOrder = !messageOrder
    query.once('value', function(snap) {
        var results = [];
        snap.forEach(function(ss) {
            results.push(ss.val());
        });
        
        if(messageOrder == true)//descending orderByChild
        {
            inBoxContentArray = results                    
        }
        else{
            inBoxContentArray = results.reverse();              
        }

        if (inBoxModalOpen == true){
            populateInBox();
        }
        
    });


}


showConfirmedEvents = false
function toggleConfirmed() {
    console.log("toggleConfirmed");
    //show only confirmed events
    if (showConfirmedEvents == false) {
        showConfirmedEvents = true
        // toggleSelfCheck = true
        document.getElementById('toggleConfirmed').innerText = "Show All Users"
        console.log("called filterResourcesFOI from toggleSelf");
        var mySelect = document.getElementById("foiSelector1");
        var fieldName = mySelect.value;
        console.log("call FOI filter ");
        filterResourcesFOI(fieldName);
    }
    //show all events
    else {
        showConfirmedEvents = false
        // toggleSelfCheck = false
        document.getElementById('toggleConfirmed').innerText = "Show confirmed events"
        console.log("called filterResourcesFOI from toggleSelf");
        var mySelect = document.getElementById("foiSelector1");
        var fieldName = mySelect.value;
        console.log("call FOI filter ");
        filterResourcesFOI(fieldName);
    }


}


function removeSingleEvent(eventId) {
    //what does this apply to ? This should be just for responding to confirm no?
    let answer = confirm("Are you sure you want to delete this event?")
    if (answer == false) {
        return;
    }
    console.log("removeSingleEvent: ", eventId)
    //delete the current eventId
    let eventToRemove = calendarSingle.getEventById(eventId)
    eventToRemove.remove();

    //remove from all calenders


}



function customConfirm(){
    var confirmDemo = new gModal({
        title: 'Delete?',
        body: 'Are you sure you want to delete this message?',
        buttons: [
          {
            content: "Cancel",
            classes: "gmodal-button-red",
            bindKey: false, /* no key! */
            callback: function(modal){
              console.log("cancel");              
              modal.hide();
            }
          },{
            content: "Confirm",
            classes: "gmodal-button-green",
            bindKey: false, /* no key! */
            callback: function(modal){
              console.log("delete message");
              modal.hide();
              //remove the current message from the Inbox on firebase
                firebase.database().ref("/inBox/" + currentUser.appId + "/all/" + messageId).remove()                      // changes here
                .then(() => {
                    if (inBoxModalOpen == true) {
                        openInBox();
                    }
                })
                .catch(error => {
                    res.send(error);
                });
              
            }
          }
          ,{
            content: "never ask me again",
            classes: "gmodal-button-green",
            bindKey: false, /* no key! */
            callback: function(modal){
              console.log("will hide forever");
            //   modal.hide();
            }
          }
        ],
        close: {
          closable: false,
        }
    })

    confirmDemo.show() 
}


function eventTransform(eventData)
{
    // console.log("found: ",eventData.extendedProps.appId)
    // console.log("found: ",eventData.extendedProps.description.split("/")[0])
    if(eventData.extendedProps.appId == currentUser.appId){
        if(eventData.extendedProps.description.split("/")[0] != "open"){
            eventData.editable = false
            // console.log("return false")
        }
        else{
            // console.log("return true")
            eventData.editable = true
        }
        // console.log("eventTransform",eventData.title);
        // eventData.backgroundColor = '#666666'; 
        // eventData.title = "name changed";
    }
    else{
        eventData.editable = false
        console.log("return false 1")
    }
    return eventData; 
      
}

