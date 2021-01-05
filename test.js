myCalendar = FullCalendar;
myCalendarAlt = FullCalendar;
calendarConfirm = FullCalendar;
calendarSingle = FullCalendar;
useGuest = false;
userListSelector = "";
var tempEventsFromResources = [];
var myDayView = "timeGridDay";
var myWeekView = "timeGridWeek";
var myMonthView = "dayGridMonth";
var viewDay = "timeGridDay";
var viewWeek = "timeGridWeek";
var viewMonth = "dayGridMonth";



var modal = "";
var span = "";
var sendEmails = false; //allow all emails to be sent
var sourceCal = "alt";


var toggleSelfCheck = false;
var calResources = [];
var allEventsCal = [];

// in the invite user toggle between email and user
document.addEventListener('click', function (e) {
    e = e || window.event;
    var target = e.target || e.srcElement,
        text = target.textContent || target.innerText;
    //   console.log(e.srcElement); 

    if (e.srcElement.className == "selectr-label") {
        activateSelectUser();
    }
    if (e.srcElement.id == "emailToInvite") {
        activateEmail()
    }

}, false);






document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("singleUserModal").style.display = "none";
    document.getElementById("calendar").style.visibility = "hidden";    
    document.getElementById('label_AG_singlePage').style.display = "none";
    document.getElementById('acceptGuest_singlePage').style.display = "none";
    document.getElementById('trimB').style.display = "none";
    document.getElementById('confirmB').style.display = "none";
    document.getElementById('declineB').style.display = "none";
    document.getElementById("cancelInvite").style.display = "none";

    modal = document.getElementById("textArea");
    span = document.getElementsByClassName("closeText")[0];

    document.getElementById("myList").style.display = "";
    buildCalSelector()
    buildUsersSelector();

    // const button = document.querySelector('#openEventsToConfirm');
    // tippy(button, {
    //     content: 'My tooltip!',
    //     trigger: 'click',
    //     allowHTML: true,
    //     interactive: true,
    // });
    // tippyInstance = button._tippy;

    dragElement(document.getElementById("inBox_Modal"));

    userListSelector = new Selectr(document.getElementById("userList_selectUser"), {
        placeholder: "Find a user...",
        clearable: true,
    })
    


    var acc = document.getElementsByClassName("userlistAccordion");
    var i;

    //set user list accorions listeners
    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function callClick() {
            // console.log(document.getElementById("chatExpend").innerHTML);
            console.log("this: ", this)
            if (this.classList.value == "userlistAccordion activeSign") {
                console.log("contract")
                this.classList = "userlistAccordion"
                var panel = this.nextElementSibling;
                console.log(panel)
                panel.style.maxHeight = null;
                if (this.id == "userListWithEvents") {
                    userListWeventsState = "closed"
                }
                else if (this.id == "userListWithNoEvents") {
                    userListNoEventsState = "closed"
                }
            }
            else {
                console.log("expend")
                this.classList = "userlistAccordion activeSign"
                var panel = this.nextElementSibling;
                panel.style.maxHeight = '-webkit-fill-available';
                // panel.style.maxHeight = 300 + "px";
                // panel.style.maxHeight = panel.scrollHeight + 5 + "px";
                if (this.id == "userListWithEvents") {
                    userListWeventsState = "open"
                }
                else if (this.id == "userListWithNoEvents") {
                    userListNoEventsState = "open"
                }
            }
        });
    }

    // window.addEventListener("scroll", (event) => {
    //     console.log("scroller")
    //     let scroll = this.scrollX;
    //     console.log(scroll)
    // });

    // for (i = 0; i < scrollPosi.length; i++) {

    //     console.log(scrollPosi[i].scrollLeft);
    //     scrollPosi[i].scrollLeft = 1600;
    //     console.log(scrollPosi[i].scrollLeft);
    //     console.log("index is: ", kar);
    //     scrollPos[i].addEventListener('scroll', function (event) {
    //         console.log("index inside is: ", kar);
    //         // console.log("scrolling from: "+ i + " " ,event.srcElement.scrollLeft);

    //     });
    //     kar = kar + 1;

    // }


    // scrollArray.addEventListener("scroll", function(){ 
    //     console.log("x: ",this.scrollerPositionX)
    // })
    // for(each in scrollArray){

    // }

});

function buildFOISelector() {
    console.log("buildFOISelector");
    console.log(currentUser.name + " " + currentUser.appId + " " + currentUser.userStatus);
    if (currentUser.userStatus == "guest") {
        useGuest = true;

    }
    foiList = [];

    //get the foi list for all from firebase
    firebase.database().ref('/foi/').once('value').then(function (snapshot) {
        // console.log(snapshot);
        var a = snapshot.exists();


        if (a == true) {
            foiList = snapshot.val()
            var dynamicSelect = document.getElementById("foiSelector1");
            foiList.forEach(function (item) {
                if (useGuest == true) {
                    //this is a guest - open all foi
                    var newOption = document.createElement("option");
                    newOption.text = item;//item.whateverProperty
                    dynamicSelect.appendChild(newOption);
                }
                else {
                    if (currentUser.fieldsOfinterest.includes(item)) {
                        var newOption = document.createElement("option");
                        newOption.text = item;//item.whateverProperty
                        dynamicSelect.appendChild(newOption);
                    }
                }
                //check if the foi is in the user foiList

            });
            foiSelector = new Selectr(dynamicSelect, {
                multiple: false,
                // selectedValue: currentUser.foiList[0]
            });
            var mySelect = document.getElementById("foiSelector1");
            mySelect.onchange = (event) => {
                var fieldName = event.target.value;
                console.log("foi change:", fieldName);

                if (fieldName == "All_as_geusts") {

                }
                else {
                    //TODO: find solution to call here not on every change or add a bool
                    console.log("called filterResourcesFOI from buildFoiSelector");
                    filterResourcesFOI(fieldName);
                }
                //check if the resource only flag is on
                if (onlyResourcesWithEventsCheck == true) {
                    onlyResourcesWithEventsCheck = false;
                    showOnlyResourcesWithEvents();
                }
                else {
                    populateUsersTablePC(usersResourceList);
                }

            }
        }
    });
}

function buildLangSelecorPC() {
    console.log("language filter is currently not operational there for is disabled");
    return;
    var dynamicSelect = document.getElementById("langSelector");
    let filtered = countriesList.filter((a, i) => i % 2 === 1);
    filtered.forEach(function (item) {
        var newOption = document.createElement("option");
        newOption.text = item.toString();//item.whateverProperty
        dynamicSelect.add(newOption);
    });

    console.log(currentUser.mainLanguage);
    langSelector = new Selectr(dynamicSelect, {
        multiple: false,
        customClass: 'langSelectr',
        width: 100,
        placeeholder: 'Choose Language'
        // selectedValue: currentUser.mainLanguage
    });
}

function buildFavs() {

    // build the fav array on load after initCallback
    console.log("buildFavs", myFavArray.length)

    console.log("show current date")
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;

    if (listDisplay === false) {
        return;
    }
    for (var i = 0; i < myFavArray.length; i++) {
        let tempString = 'fav' + myFavArray[i];
        // console.log(tempString);
        let element = document.getElementById(tempString);
        // console.log(elemen);
        element.className = "fullStar fa fa-star";
        
    }

    

}


var listenTomouse = true;
var wlistener = [];


function stopListen() {
    listenTomouse = false;
    window.removeEventListener('mousemove', reportMouse)
    listenTomouse = true;

}

function updateConnection() {

    if (listenTomouse == true) {
        window.addEventListener('mousemove', reportMouse)
    }
    // console.log('idle');
    timerRun = setTimeout(updateConnection, 60000);
    var activityRef = firebase.database().ref("status/" + currentUser.appId);
    activityRef.update({
        status: "idle"
    });
}


function reportMouse() {
    console.log('active');
    stopListen()
    clearInterval(timerRun);
    timerRun = setTimeout(updateConnection, 60000);
    var activityRef = firebase.database().ref("status/" + currentUser.appId);
    activityRef.update({
        status: "online"
    });
};

function InitCal() {

    console.log('InitCal');

    // manage online presence
    var activityRef = firebase.database().ref("status/" + currentUser.appId);
    activityRef.update({
        status: "online"
    });
    activityRef.onDisconnect().update({
        status: "offline"
    });

    let timerRun = setTimeout(updateConnection, 60000);




    //show user name in topnav
    document.getElementById('myself').innerHTML = myFullName.charAt(0);;
    
    console.log("called filterResourcesFOI from initCal");
    makeCalSingle();

    // makeMainCal()
    filterResourcesFOI('hypnosis');
    // buildresources();
    passedInit = true;
}


allEvents = [];
initViewCalType = 'timelineWeek';
initViewCal = ""



function filterCountry() {

}

scrollerPosHorz = "";
scrollerForX = [];
initViewCalAltType = 'timeGridWeek';
initViewCalAlt = ""
firstDayValue = moment().format('e')





function makeCalAlt() {
    console.log("makecalAlt", allEvents.length);

    // var initView = 'timeGridWeek';
    console.log(typeof (myCalendarAlt.view));
    calResources = usersResourceList;
        

    var canSelect = true;
    if (useGuest == true) {
        canSelect = false;
    }
    var calendarEl = document.getElementById('calendarAlt');
    myCalendarAlt = new FullCalendar.Calendar(calendarEl, {

        // Calendar Option
        handleWindowResize: true,
        initialView: initViewCalAltType,
        allDaySlot: false,
        eventResizableFromStart: true,
        firstDay: firstDayValue,
        
        businessHours: {
            // days of week. an array of zero-based day of week integers (0=Sunday)
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Thursday

            startTime: '00:00', // a start time (10am in this example)
            endTime: '24:00', // an end time (6pm in this example)
        },

        now: moment().format(),
        nowIndicator: true,
        selectable: canSelect,
        selectMinDistance: 20,
        slotDuration: ('00:30:00'),

        // slotDuration:15,


        aspectRatio: 1.8,
        scrollTime: moment().format("HH:mm:ss"), // undo default 6am scrollTime
        headerToolbar: {
            left: 'today prev,next',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth'
            // right: 'timeGridDay,timeGridWeek,dayGridMonth'
        },
        resources: calResources,
        events: allEvents,
        dayMaxEventRows: true,
        showNonCurrentDates: false,
        eventContent: { domNodes: [] },
        eventContent: function (arg) {
            if(listDisplay == true) {
                let italicEl = document.createElement('p')
                italicEl.innerHTML = arg.event.title;
                let arrayOfDomNodes = [italicEl]
                return { domNodes: arrayOfDomNodes }

            }
            else{
                let italicEl = document.createElement('p')
                italicEl.innerHTML = moment(arg.event.start).format('HH:mm') + " - " + moment(arg.event.end).format('HH:mm') + '<br/>' + arg.event.title;
                let arrayOfDomNodes = [italicEl]
                return { domNodes: arrayOfDomNodes }
            }


        },
        resources: usersResourceList,

        dateClick: function (info) {

            respondToDateClick(info);
        },
        datesSet: function (dateInfo) {
            // console.log('dateInfo.start');
        },
        eventDidMount: function (arg) {
            // console.log("call eventMount from Alt ",myCalendarAlt.view);
            if (listDisplay == true) {
                eventMountingFromList(arg);
                addEventTippyMouse(arg);
            }

            else if (myCalendarAlt.view.type != 'dayGridMonth') {
                // eventMount(arg);
                eventMounting(arg);
                addEventTippyMouse(arg);
            }
            else {
                // console.log("load events on month from alt");
                eventMountingMonth(arg);
                addEventTippyMouse(arg);
            }

        },

        eventDataTransform: function (eventData) {
            /* THIS IS THE PLACE TO DO CHANGES ON EVENTS ON CALS*/
            // console.log("call eventDataTransform from calendar");
            return eventTransform(eventData);
        },
        // resourceLabelDidMount: function(arg){
        //   arg.el.style.backgroundColor = 'orange';
        // //   console.log(arg.resource);
        //   arg.el.addEventListener("click", function () { console.log('clicked:' + arg.resource.id); });
        // }, 

        eventClick: function (arg) {
            respondTo_eventClick(toggleDisplay_check, arg);
        },

        select: function (info) {
            console.log("select_______________");
            respondTo_EventSelect(info);
        },

        eventDrop: function (arg) { // called when an event (already on the calendar) is moved        
            console.log('eventDrop', arg.event);
            respondTo_EventDrop(arg);
        },

        eventResize: function (info) {
            console.log("Resize event: ", info);
            respondTo_EventResize(info);
            
            // allowTippy = true;
        },

        eventResizeStart: function (info) {
            allowTippy = false;
        },
        // eventMouseEnter: function(arg){
        //     addEventTippyMouse(arg);
        // },

    });
    myCalendarAlt.render();
    let myElem = document.getElementById("calendarAlt")
    if (listDisplay == false){
        let scrollPosi1 = myElem.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
        scrollPosi1[0].setAttribute('id', 'orizEl')
    }
}

initCalsDisplay = true;

function makeCalSingle() {
    console.log("makeCalSingle");
    let calendarEl = document.getElementById('calendarSingle')
    calendarSingle = new FullCalendar.Calendar(calendarEl, {

        dayHeaderFormat: { weekday: 'long', month: 'numeric', day: 'numeric', year: 'numeric', omitCommas: true },

        displayEventTime: true,
        initialView: 'timeGridDay',
        // initialView:'resourceTimeline',
        allDaySlot: false,
        // allDay:false,
        // editable: false,
        selectable: false,
        // dragScroll:false,
        // editable: editable,
        // droppable: false, 
        eventResizableFromStart: true,
        slotDuration: ('00:30:00'),
        dayMaxEventRows: true,
        // scrollTime: (scrollT), 
        eventContent: { domNodes: [] },
        eventContent: function (arg) {
            let italicEl = document.createElement('p')
            italicEl.innerHTML = moment(arg.event.start).format('HH:mm') + " - " + moment(arg.event.end).format('HH:mm') + '<br/>' + arg.event.title;
            if (arg.event.extendedProps.appId == currentUser.appId) {

                // calendarSingle.setOption('selectable', 'false');
                // console.log(calendarSingle);
                var stringId = "\"" + arg.event.id + "\""
                italicEl.innerHTML += "<i class='singlePageTrash fa fa-trash' onclick = 'removeSingleEvent(" + stringId + ")' aria-hidden='true' ></i>" //+ arg.el.innerHTML   



            }
            //   let id = arg.event.getResources().id;
            //   italicEl.innerHTML += "<i class='chatIcon fa fa-comment' onclick='openChat(&#039" + id + "&#039)'></i><i class='fa fa-star-o' id='toggleAllFavSelection' onclick='toggleAllFavsSelection(&#039" + id  +"&#039)'></i></div>";
            let arrayOfDomNodes = [italicEl]
            return { domNodes: arrayOfDomNodes }
        },

        // resources: usersResourceList,             
        events: [
            {

            }
        ],
        eventDidMount: function (arg) {
            console.log("call eventMount from single");
            eventMounting(arg);
            let event = arg.event;

            //check if it is a user event
            if (arg.event.extendedProps.appId == currentUser.appId) {
                calendarSingle.setOption('selectable', 'false');
                if (moment(arg.event.start).isBefore(moment().format())) {
                    console.log("event is in the past");
                    event.setProp('display', 'background');
                    document.getElementById("inviteUserSingle").style.display ="none"
                }                               
            }
            else {

                if (moment(arg.event.start).isBefore(moment().format())) {
                    console.log("event is in the past");
                    calendarSingle.setOption('selectable', 'false');
                    event.setProp('display', 'background');
                }
                else {
                    calendarSingle.setOption('selectable', 'true');
                }
                arg.event.setProp('display', 'background');

            }            
        },

        select: function (info) {
            if (moment(info.end).isBefore(moment().format())) {
                console.log("event is in the past");
                // info.destroy();
                return;
            }

            if (calendarSingle.getEvents()[0].extendedProps.appId == currentUser.appId) {
                return;
            }
            console.log(calendarSingle.getEvents().length);
            if (calendarSingle.getEvents().length > 1) {
                calendarSingle.getEvents()[1].remove();
            }
            var eventObj = info.event;
            var eventEnding = moment(info.startStr);
            console.log(eventEnding);

            // var allowGuest = false;
            // var bgColor = color_toBook;
            // let r = Math.random().toString(36).substring(2);
            var r = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "")

            calendarSingle.addEvent({
                resourceId: currentUser.appId,
                id: r,
                title: myFullName,
                start: moment(info.start).format(),
                end: moment(info.end).format(),
                editable: true,
                eventResizableFromStart: true,
                extendedProps: {
                    description: "open/" + currentUser.luid,
                    acceptGuest: false,
                    appId: currentUser.appId,
                    // auther: myFullName,
                    // droppable: false
                }
            })

            temporaryEvent = calendarSingle.getEventById(r);
            console.log("created this temporaryEvent: ", temporaryEvent);
        },


        eventResize: function (info) {
            console.log("Single eventResize: ")
            if (info.event.extendedProps.appId == currentUser.appId) {
                respondTo_EventResize(info);
            }
            else {
                info.revert()
            }


        }
    });
}

function makeCalConfirm() {
    var calendarEl = document.getElementById('calendarSingle');
    calendarConfirm = new FullCalendar.Calendar(calendarEl, {

        initialView: 'timeGridDay',

        dayHeaderFormat: { weekday: 'long', month: 'numeric', day: 'numeric', year: 'numeric', omitCommas: true },

        allDaySlot: false,
        selectable: false,
        editable: false,
        //   droppable: false, 
        eventResizableFromStart: false,
        slotDuration: ('00:15:00'),
        //   slotMinTime: moment(eventi.start).format('HH:mm:ss'),
        //   slotMaxTime: moment(eventi.end).format('HH:mm:ss'),
        // height: (window.innerHeight)/2,

        eventDidMount: function (arg) {
            // myCalendarAlt.setOption('editable',false);
            console.log("call eventMount from confirm");
            //   eventMounting(arg);            
        },
        eventContent: { domNodes: [] },

        eventContent: function (arg) {
            let italicEl = document.createElement('p')
            italicEl.innerHTML = moment(arg.event.start).format('HH:mm') + " - " + moment(arg.event.end).format('HH:mm') + '<br/>' + arg.event.title;
            let arrayOfDomNodes = [italicEl]
            return { domNodes: arrayOfDomNodes }
        },

        events: [
        ]

    });
    var timeSlotArray = document.getElementsByClassName("fc-event-draggable");
    var timeSlot = timeSlotArray[timeSlotArray.length - 1];
}

var eventi = []; //originaleventToConfirm
var reqEvent = [];    // requestEventToConfirm

var event1 = [];
var event2 = [];
var event3 = [];
var eventi = [];
var reqEvent = [];
var requestKey = "";


passedInit = false;
allowUpdate = true;
updateNeeded = false; //variable to let me know if I need to update, only when the system is not accepting update_size
// in case I am on a single screen! so it will not push me out

function UpdateCalendars() {
    updateNeeded = true; //called with everytime an update arrives
    console.log('Update passedInit: ', passedInit, " allowUpdate: ", allowUpdate, " source: ", sourceCal);


    if (typeof (eventSingle) !== "undefined") {
        let descTitle = eventSingle.extendedProps.description.split("/")[0]
        console.log("got this description title at pos 0: ", descTitle)
    }


    if (passedInit == true) { //allow on load
        if (sourceCal != "single" && allowUpdate == true) { //checking if allwoed to update
            console.log("should update the cals");
            saveCalendarsViewState()
            filterResourcesFOI(fieldName);
        }
        //check here if the current event I am dealing with is the one changed...
        else if (sourceCal == "single") {

            allowUpdate = true;
        }
        else if (sourceCal == "singleInvite") {
            // console.log("checking events in a singleInvite cal with: ",eventSingle.id)
            // // get the other side of the eventSingle

            // let descTitle = eventSingle.extendedProps.description.split("/")[0]
            // console.log("got this desc title: ",descTitle)
            // if(descTitle == "open"){
            //     console.log("open")
            // }
            // else if(descTitle == "booked"){
            //     console.log("booked")
            // }
            // else if(descTitle == "pending"){
            //     console.log("pending")
            // }
            // else if(descTitle == "waiting"){
            //     console.log("waiting")
            // }
            // else{
            //     console.log("other")
            // }
            // let descUserFirst = eventSingle.extendedProps.description.split("/")[1]
            // let descUserSecond = eventSingle.extendedProps.description.split("/")[2]

            // console.log(currentUser.calArray.length)
            // for (i = 0; i < currentUser.calArray.length; i++){
            //     let tempEvent = JSON.parse(currentUser.calArray[i])
            //     console.log(JSON.parse(currentUser.calArray[i]).id)
            //     console.log("checking now: ",tempEvent)
            //     console.log("checking now: ",tempEvent.id)
            //     if(tempEvent.id == eventSingle.id){
            //         console.log("found a matching event record ")
            //         if( tempEvent === eventSingle){
            //             console.log("no chance")
            //         }
            //         else{
            //             console.log("there is a change")
            //         }
            //     }
            // }
            allowUpdate = true;
        }
        else {
            console.log("Update calendar found: other")
            allowUpdate = true;
        }
    }
    setYpos()
}



function buildresources() {
    console.log("buildresources");
    usersResourceList = [];
    allUsersSnapShot.forEach(function (child) {

        //create a list of all users with out myself!
        let userFullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);
        usersResourceList.push({

            id: child.val().appId,
            title: userFullName,
        })
    });
}

function filterResourcesFOI(currentField) {
    console.log("FilterResourcesFOI with: ", currentField);
    
    
    eventsToConfirm = [];
    console.log("singleUserForList: ", singleUserForList)
    //most cases call this
    console.log("Filter ACCORING TO: toggleSelfCheck: " + toggleSelfCheck + " singleUserForList.length:  ", singleUserForList.length)
    if (toggleSelfCheck == false && showConfirmedEvents == false) {
        console.log("Filter case 1")
        /* Check if the Solo array has value */
        if (singleUserForList.length > 0) {
            console.log("Filter case 1-1")
            console.log("single user out"), allEvents.length;

            tempEventsFromResources = [];
            var localUsersArray = allUsersSnapShot.toJSON();
            allUsersSnapShot.forEach(function (child) {
                //Check if the user is in the singleUserForList
                for (var i = 0; i < singleUserForList.length; i++) {
                    if (singleUserForList[i].id == child.val().appId) {
                        console.log("Filter case 1-1-1")
                        console.log("found a user from singleList")




                        var tempFieldsArray = child.val().fieldsOfinterest;

                        if (tempFieldsArray === undefined) {
                            //  console.log("field array not defined");

                        }
                        else {
                            /*check for Favorits option: */
                            if (showOnlyFavs == true) {
                                console.log("Filter case 1-2")
                                if (myFavArray.includes(child.val().appId)) { //check only for users with favs
                                    // console.log("found a user in favs");

                                    //check if the user has the current field of interest 
                                    if (Object.values(tempFieldsArray).includes(currentField)) {

                                        if (child.val().calArray) {
                                            for (var i = 0; i < child.val().calArray.length; i++) {

                                                //add the event to array later pass to calendars
                                                let tempEvent = JSON.parse(child.val().calArray[i]);
                                                tempEvent.resourceId = child.val().appId;
                                                // console.log("guest? ",tempEvent.extendedProps.acceptGuest);
                                                if (useGuest == true) {
                                                    if (tempEvent.extendedProps.acceptGuest == true) {
                                                        tempEventsFromResources.push(tempEvent);
                                                    }
                                                    else {
                                                        continue;
                                                    }
                                                }
                                                else {
                                                    tempEventsFromResources.push(tempEvent);
                                                }

                                                if (child.val().appId == currentUser.appId) {
                                                    if (tempEvent.extendedProps.description.split("/")[0] == "pending") {
                                                        //check that date hasnt pass
                                                        if (moment(tempEvent.start).isAfter()) {
                                                            eventsToConfirm.push(tempEvent);
                                                        }
                                                    }
                                                }
                                                if (tempEvent.extendedProps.description.split("/")[0] == "inviteRequest") {
                                                    let invitee = tempEvent.extendedProps.description.split("/")[2];
                                                    if (invitee == currentUser.luid) {
                                                        //check that date hasnt pass
                                                        if (moment(tempEvent.start).isAfter()) {
                                                            eventsToConfirm.push(tempEvent);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else { //check all users
                                console.log("Filter case 1-3")
                                //check if the current user has the same filed of interest             
                                if (Object.values(tempFieldsArray).includes(currentField)) {

                                    if (child.val().calArray) {
                                        for (var i = 0; i < child.val().calArray.length; i++) {
                                            // console.log("checking events now");

                                            //add the event to array later pass to clendars
                                            let tempEvent = JSON.parse(child.val().calArray[i]);
                                            tempEvent.resourceId = child.val().appId;
                                            //   tempEventsFromResources.push(tempEvent);

                                            //check if I need to show only open event for join manually
                                            if (joinEventManuallyBool == true) {
                                                if (child.val().appId != currentUser.appId) {
                                                    // console.log("found events in manual ",tempEvent.extendedProps.description.split("/")[0])
                                                    if (tempEvent.extendedProps.description.split("/")[0] == "open") {
                                                        if (moment(tempEvent.start).isAfter()) {
                                                            // eventsToConfirm.push(tempEvent);
                                                            tempEventsFromResources.push(tempEvent);
                                                        }
                                                    }
                                                }
                                            }


                                            else {
                                                //add  event to the events to conifrm list for quick access
                                                if (child.val().appId == currentUser.appId) {
                                                    if (tempEvent.extendedProps.description.split("/")[0] == "pending") {
                                                        //check that date hasnt pass
                                                        if (moment(tempEvent.start).isAfter()) {
                                                            eventsToConfirm.push(tempEvent);
                                                        }
                                                    }
                                                }

                                                //add invitations to the events to conifrm list for quick access
                                                else if (tempEvent.extendedProps.description.split("/")[0] == "inviteRequest") {
                                                    let invitee = tempEvent.extendedProps.description.split("/")[2];
                                                    if (invitee == currentUser.luid) {
                                                        //check that date hasnt pass
                                                        if (moment(tempEvent.start).isAfter()) {
                                                            eventsToConfirm.push(tempEvent);
                                                        }
                                                    }
                                                }

                                                if (tempEvent.extendedProps.description.split("/")[0] == "deleted") {

                                                }
                                                else {
                                                    tempEventsFromResources.push(tempEvent);
                                                }



                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                }

                console.log("this is the events to put: ",tempEventsFromResources);
                populateUsersSelector();

                allEvents = tempEventsFromResources;
                updateEventsOnCals()

                console.log("setYpos")
                setYpos()                
            });
        }
        /* No solo array */
        else {
            // console.log("Filter case 1-2")
            usersResourceList = [];
            tempEventsFromResources = [];
            var localUsersArray = allUsersSnapShot.toJSON();
            firebase.database().ref('/users/').once('value').then(function (snapshot) {

                allUsersSnapShot = snapshot; 
                allUsersSnapShot.forEach(function (child) 
                {
                    // console.log(child.val().name)
                    var tempFieldsArray = child.val().fieldsOfinterest;

                    if (tempFieldsArray === undefined) {
                        //  console.log("field array not defined");

                    }
                    else {
                        /*check for Favorits option: */
                        if (showOnlyFavs == true) {
                            // console.log("Filter case 2-1")
                            // console.log("Filter resources with favs: ",myFavArray);
                            // console.log(child.val().appId);
                            if (myFavArray.includes(child.val().appId)) { //check only for users with favs
                                // console.log("found a user in favs");

                                //check if the user has the current field of interest 
                                if (Object.values(tempFieldsArray).includes(currentField)) {
                                    // console.log("found a user with the same FOI");  
                                    let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

                                    usersResourceList.push({

                                        id: child.val().appId,
                                        title: fullName,
                                    })

                                    if (child.val().calArray) {
                                        for (var i = 0; i < child.val().calArray.length; i++) {

                                            //add the event to array later pass to calendars
                                            let tempEvent = JSON.parse(child.val().calArray[i]);
                                            tempEvent.resourceId = child.val().appId;
                                            // console.log("guest? ",tempEvent.extendedProps.acceptGuest);
                                            if (useGuest == true) {
                                                if (tempEvent.extendedProps.acceptGuest == true) {
                                                    tempEventsFromResources.push(tempEvent);
                                                }
                                                else {
                                                    continue;
                                                }
                                            }
                                            else {
                                                if (tempEvent.extendedProps.description.split("/")[0] == "deleted") {

                                                }
                                                else {
                                                    tempEventsFromResources.push(tempEvent);
                                                }
                                            }

                                            if (child.val().appId == currentUser.appId) {
                                                if (tempEvent.extendedProps.description.split("/")[0] == "pending") {
                                                    // tempEvent.editable = false;
                                                    //check that date hasnt pass
                                                    if (moment(tempEvent.start).isAfter()) {
                                                        eventsToConfirm.push(tempEvent);
                                                    }
                                                }
                                            }
                                            if (tempEvent.extendedProps.description.split("/")[0] == "inviteRequest") {
                                                // console.log("found event: ",tempEvent.extendedProps.appId);
                                                // console.log("found event: ",tempEvent.extendedProps.description);
                                                let invitee = tempEvent.extendedProps.description.split("/")[2];
                                                if (invitee == currentUser.luid) {
                                                    //check that date hasnt pass
                                                    if (moment(tempEvent.start).isAfter()) {
                                                        eventsToConfirm.push(tempEvent);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else { //check all users
                            // console.log("Filter case 1-2-2")

                            //check if the current user has the same filed of interest  
                            let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

                            if (Object.values(tempFieldsArray).includes(currentField)) {
                                usersResourceList.push({
                                    id: child.val().appId,
                                    title: fullName,
                                })

                                if (child.val().calArray) {
                                    // console.log("child array " + child.val().calArray.length)
                                    for (var i = 0; i < child.val().calArray.length; i++) {
                                        // console.log("child checking events now - ",child.val().calArray[i]);

                                        //add the event to array later pass to clendars
                                        let tempEvent = JSON.parse(child.val().calArray[i]);

                                        tempEvent.resourceId = child.val().appId;
                                        //   tempEventsFromResources.push(tempEvent);

                                        //check if I need to show only open event for join manually
                                        if (joinEventManuallyBool == true) {
                                            console.log("join event manally")

                                            if (child.val().appId != currentUser.appId) {
                                                // console.log("found events in manual ",tempEvent.extendedProps.description.split("/")[0])
                                                if (tempEvent.extendedProps.description.split("/")[0] == "open") {
                                                    if (moment(tempEvent.start).isAfter()) {
                                                        // eventsToConfirm.push(tempEvent);
                                                        tempEventsFromResources.push(tempEvent);
                                                    }
                                                }
                                            }
                                        }


                                        else {
                                            //add  event to the events to conifrm list for quick access
                                            
                                            if (child.val().appId == currentUser.appId) {
                                                console.log("look here: ", tempEvent.extendedProps.description.split("/")[0])
                                                if (tempEvent.extendedProps.description.split("/")[0] == "pending") {
                                                    // tempEvent.editable = false;
                                                    //check that date hasnt pass
                                                    if (moment(tempEvent.start).isAfter()) {
                                                        eventsToConfirm.push(tempEvent);
                                                    }
                                                }
                                            }

                                            //add invitations to the events to conifrm list for quick access
                                            else if (tempEvent.extendedProps.description.split("/")[0] == "inviteRequest") {
                                                // console.log("found event: ",tempEvent.extendedProps.appId);
                                                // console.log("found event: ",tempEvent.extendedProps.description);
                                                let invitee = tempEvent.extendedProps.description.split("/")[2];
                                                if (invitee == currentUser.luid) {
                                                    //check that date hasnt pass
                                                    if (moment(tempEvent.start).isAfter()) {
                                                        eventsToConfirm.push(tempEvent);
                                                    }
                                                }
                                            }

                                            // console.log("can accept guest: ",tempEvent.extendedProps.description.split("/")[0] + " " + tempEvent.extendedProps.acceptGuest);
                                            // if (useGuest == true) {
                                            //     if (tempEvent.extendedProps.acceptGuest == true) {
                                            //         tempEventsFromResources.push(tempEvent);
                                            //     }
                                            //     else {
                                            //         continue;
                                            //     }
                                            // }



                                            // else {
                                            // if (tempEvent.extendedProps.description.split("/")[0] == "deleted") {
                                            //     if (tempEvent.extendedProps.description.split("/")[1] == currentUser.luid) {
                                            //         tempEventsFromResources.push(tempEvent);
                                            //     }
                                            // }
                                            if (tempEvent.extendedProps.description.split("/")[0] == "waiting") {
                                                if (tempEvent.extendedProps.description.split("/")[2] == currentUser.luid) {
                                                    tempEventsFromResources.push(tempEvent);
                                                }
                                            }
                                            else {
                                                tempEventsFromResources.push(tempEvent);
                                            }
                                            // tempEventsFromResources.push(tempEvent);
                                            // }
                                        }
                                        
                                    }
                                }
                            }

                        }
                    }
                });
                console.log("this is the events to put: ",tempEventsFromResources);
                populateUsersSelector();

                allEvents = tempEventsFromResources;
                updateEventsOnCals()

                console.log("setYpos")
                setYpos()
            })

            // buildUsersList();
            // buildUsersSelector();
            
        }

    }
    /* in case show self is on set the user as the only 
     for conifrmed events only it also need only the user so I do it here */
    
    else //if(toggleSelfCheck == true)
    {

        usersResourceList.push({
            id: currentUser.appId,
            title: myFullName,
        })
        tempEventsFromResources = [];

        if (currentUser.calArray) {
            for (var i = 0; i < currentUser.calArray.length; i++) {

                //add the event to array later pass to clendars
                let tempEvent = JSON.parse(currentUser.calArray[i]);
                tempEvent.resourceId = currentUser.appId;
                //insert to tempEvent array all events
                if (showConfirmedEvents == false) {
                    tempEventsFromResources.push(tempEvent);
                }
                //insert to tempEvent array only confirmed events
                else {
                    console.log("what is here: ", tempEvent.extendedProps.description.split("/")[0])
                    if (tempEvent.extendedProps.description.split("/")[0] == "booked") {
                        tempEventsFromResources.push(tempEvent);
                    }
                }


                //Add tippy info
                if (currentUser.appId == currentUser.appId) {
                    if (tempEvent.extendedProps.description.split("/")[0] == "pending") {
                        // tempEvent.editable = false;
                        //check that date hasnt pass
                        if (moment(tempEvent.start).isAfter()) {
                            eventsToConfirm.push(tempEvent);
                        }
                    }
                }
                else {
                    if (tempEvent.extendedProps.description.split("/")[0] == "inviteRequest") {
                        console.log("found event: ", tempEvent.extendedProps.appId);
                        console.log("found event: ", tempEvent.extendedProps.description);
                        let invitee = tempEvent.extendedProps.description.split("/")[2];
                        if (invitee == currentUser.luid) {
                            //check that date hasnt pass
                            if (moment(tempEvent.start).isAfter()) {
                                eventsToConfirm.push(tempEvent);
                            }
                        }
                    }
                }
                // allEvents.push(tempEvent);
            }
            console.log("this is the events to put: ",tempEventsFromResources);
                populateUsersSelector();
                allEvents = tempEventsFromResources;
                updateEventsOnCals()
                console.log("setYpos")
                setYpos()
        }
    }

    //if guest add personal events that were not loaded from resources
    if (currentUser.userStatus == "guest") {
        if (currentUser.calArray) {
            for (var i = 0; i < currentUser.calArray.length; i++) {

                //add the event to array later pass to clendars
                let tempEvent = JSON.parse(currentUser.calArray[i]);
                tempEvent.resourceId = currentUser.appId;
                tempEventsFromResources.push(tempEvent);
            }
        }
    }

    
}

function buildCalSelector(){

    document.getElementById('calSelector').value = "Week"
    document.getElementById('calSelector').onchange = function () {
        let selectedCal = document.getElementById('calSelector').value;
        console.log("now selected",selectedCal)
        sourceCal = "alt"
        if(selectedCal == "Day"){
            console.log("1")
            listDisplay = false;
            day()
        }   
        else if(selectedCal == "Week"){
            console.log("2")
            listDisplay = false;
            week()
        } 
        else if(selectedCal == "Month"){
            console.log("3")
            listDisplay = false;
            month()
        } 
        else if(selectedCal == "List"){
            console.log("4")
            listDisplay = true;
            showAsList()
        } 
        else if(selectedCal == "Timeline Day"){
            sourceCal = "cal"
            console.log("5")
            myCalendarAlt.changeView("timelineDay")
            myCalendarAlt.today()
        } 
        else if(selectedCal == "Timeline Week"){
            sourceCal = "cal"
            console.log("5")
            myCalendarAlt.changeView("timelineWeek")
            myCalendarAlt.today()
        } 
        else if(selectedCal == "Timeline Month"){
            sourceCal = "cal"
            console.log("5")
            myCalendarAlt.changeView("timelineMonth")
            myCalendarAlt.today()
        } 
    }


    
        // console.log("++++ buildUsersSelector ++++ ")
        
        // calSelector = new Selectr(document.getElementById("calSelector"));  
        
        // calSelector.on('selectr.select', function(option) {
        //     // console.log("selector slecetd: ",selector.getValue())
        //     //check if this is open from invite or list
        // });     
}

function updateEventsOnCals(){
    console.log('call updateEventsOnCals');
    if (eventsToConfirm.length > 0) {
        // document.getElementById("openEventsToConfirm").style.background = 'red';
    }
    else {
        // document.getElementById("openEventsToConfirm").style.background = 'white';
    }
    // allEvents = tempEventsFromResources;

    console.log('call buildTippyEvents');
    buildTippyEvents();
    // console.log("Adding this now: ", tempEventsFromResources.length);
    // myCalendar.addEventSource(tempEventsFromResources);

    if (initCalsDisplay == true) {
        console.log("No BOOM")
        makeCalAlt();

        let scrollPosi = document.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
    }
    else {
        console.log("BOOOOOOOOOOMMMMM")
        myCalendarAlt.destroy();
        makeCalAlt();

    }
    // toggleUsersList();
    
    
    // if (displayUsersList == false) {
    //     displayUsersList = true;
    //     toggleUsersList();
    // }


    // handle resize

    // if (sourceCal == "cal") {
    //     // document.getElementById('calendarAlt').style.visibility = 'hidden';
    //     document.getElementById("myList").style.visibility = 'hidden';
    //     changeCalAltWidth();
    // }
    // else {
    //     // document.getElementById('calendarAlt').style.visibility = 'visible';
    //     document.getElementById("myList").style.visibility = 'visible';
    // }
    //MAKE CHANGES IF GUEST
    if (useGuest == true) {
        console.log("should change bg topnav");
        document.getElementById('topnav').setAttribute("style", "background:" + '#999999');
        document.getElementById('AddEventManually').style.display = "none";
        document.getElementById('label_AG').style.display = "none";
        document.getElementById('acceptGuest_default').style.display = "none";
    }





    //GOOGLE EVENTS HANDLE
    // if (googleEventToUpdateArray.length > 0) {
    //     console.log("FOUND GOOGLE EVENTS TO HANDLE!" ,googleEventToUpdateArray.length
    //     for (let i = googleEventToUpdateArray.length - 1; i >= 0; i--) {
    //         let tempEventToGoogleUpdate = myCalendarAlt.getEventById(googleEventToUpdateArray[i])
    //         updateEventToGoogle(tempEventToGoogleUpdate)
    //         googleEventToUpdateArray.splice(i, 1);            
    //     }        
    // }

    //mainain the current date range of the calendars
    if (initViewCalAlt == "") {
        //   console.log("found empty view")  
        initViewCalAlt = myCalendarAlt.view;
    }
    // if (initViewCal == "") {
    //     initViewCal = myCalendar.view;
    // }


    myCalendarAlt.gotoDate(initViewCalAlt.activeStart)
    // myCalendar.gotoDate(initViewCal.activeStart)

    setYpos()
    // InitViewCal = myCalendar.view
    $('#loading').hide();
}

function changeCalAltWidth() {
    console.log("----------- changeCalWidth ", displayUsersList)


    if (displayUsersList == true) {
        // var element = document.getElementById('topnav');
        // var positionInfo = element.getBoundingClientRect();
        // // var height = positionInfo.height;
        // var width_body = (positionInfo.width - 250);
        // console.log(width_body);
        // var calendarArea = document.getElementById('calendarAlt');
        // calendarArea.setAttribute("style", "width:" + width_body + "px");


        // document.getElementById('myList').style.visibility = 'visible';        
        // // document.getElementById('calendarAlt').setAttribute("style", "width:" + 60 + "vw");
        // myCalendarAlt.updateSize();
            

    }
    else {
        // document.getElementById('myList').style.visibility = 'hidden';
        
        //     document.getElementById('calendarAlt').setAttribute("style", "width:" + 100 + "vw");
        //     myCalendarAlt.updateSize();           
    }

    return;
    // if (displayUsersList == true) { //change the calendarAlt size based on the calendar list size

    //     console.log("from sourceCal: ", sourceCal);
    //     //get the length of the page
    //     var element = document.getElementById('topnav');
    //     var positionInfo = element.getBoundingClientRect();
    //     var height = positionInfo.height;
    //     var width_body = positionInfo.width;
    //     console.log(width_body);
    //     console.log(window.innerWidth);
    //     //make sure calendar is showing list first
    //     //check current calnedar view and make sure to switch it to resources
    //     var element = document.getElementsByClassName('fc-datagrid-cell-frame')[0];
    //     // console.log(element.clientWidth);
    //     var calendarArea = document.getElementById('calendarAlt');
    //     var newwidth = width_body - element.clientWidth;
    //     calendarArea.setAttribute("style", "left:" + element.clientWidth + "px");
    //     calendarArea.setAttribute("style", "width:" + newwidth + "px");

    //     myCalendarAlt.updateSize();
    //     document.getElementById("myList").setAttribute("style", "width:" + element.clientWidth + "px");
    // }
    // else { //no list so fill the screen  (or the parent div?)
    //     console.log("!!!!!!!! no list found should show full screen");
    //     var element = document.getElementById('topnav');
    //     var positionInfo = element.getBoundingClientRect();
    //     var height = positionInfo.height;
    //     var width_body = positionInfo.width;
    //     console.log(width_body);
    //     var calendarArea = document.getElementById('calendarAlt');
    //     calendarArea.setAttribute("style", "width:" + width_body + "px");
    //     var timegridBody = document.getElementsByClassName('fc-timegrid-body');
    //     console.log(timegridBody.length);
    //     timegridBody[0].setAttribute("style", "width:" + width_body + "px");
    //     // calendarArea.setAttribute("style","left:"+0+"px");
    //     myCalendarAlt.updateSize();
    // }



}

function eventMount(arg) {
    console.log(arg.event.title);
    arg.event.setProp('title', "false");
    arg.event.setProp('backgroundColor', '#666666');
    arg.event.setProp('editable', false);
    console.log(arg.event.title);
    if (moment(arg.event.end).isBefore(moment().format())) {
        // problem = setprop is fucked and over rides previous decleration  
        console.log("PASSSSSSTTTTT")

    }
    // arg.event.title = "hello";


}

function eventMounting(arg) {


    // console.log("event found on mount: ",arg.event.id + " " + arg.event.extendedProps.appId + " " + arg.event.extendedProps.description.split("/")[0]);
    //USER CREATED EVENTS
    if (arg.event.extendedProps.appId == currentUser.appId) {
        // console.log("found My EVENT: ",arg.event.id + " " + arg.event.extendedProps.appId + " " + arg.event.extendedProps.description.split("/")[0]);

        if (arg.event.extendedProps.description.split("/")[0] == "open") {

            //   arg.event.setProp("title" , autherName); 
            if (arg.event.extendedProps.acceptGuest == true) {
                arg.el.style.backgroundColor = color_guest_me;
            }
            else {
                arg.el.style.backgroundColor = color_normal_me;
            }
            arg.el.classList.add("openEvent")

        }

        else if (arg.event.extendedProps.description.split("/")[0] == "inviteRequest") {

            arg.el.style.backgroundColor = color_special;
            let invitee = arg.event.extendedProps.description.split("/")[2];
            // console.log("invitee: ",invitee);
            allUsersSnapShot.forEach(function (child) {
                if (child.key == invitee) {
                    let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

                    var inviteeName = fullName;
                    arg.event.setProp("title", "Waiting acceptence from: " + inviteeName);

                }
            });
            arg.el.classList.add("inviteRequestEvent")
        }


        else if (arg.event.extendedProps.description.split("/")[0] == "waiting") {
            arg.el.style.backgroundColor = color_toBook;
            arg.el.classList.add("waitingEvent")
            //   allUsersSnapShot.forEach(function(child) {
            //       if (child.key == arg.event.extendedProps.description.split("/")[2]){
            //           requestorName = child.val().name + " " + child.val().lastName;
            //       }

            //   });                                    
            arg.event.setProp("editable", false);

        }

        else if (arg.event.extendedProps.description.split("/")[0] == "pending") {
            arg.el.style.backgroundColor = color_toBook;
            arg.el.classList.add("pendingEvent")
            //   allUsersSnapShot.forEach(function(child) {
            //       if (child.key == arg.event.extendedProps.description.split("/")[2]){
            //           requestorName = child.val().name + " " + child.val().lastName;
            //       }

            //   }); 
            //   let ventObj = arg.event;
            //   ventObj.setProp("title" , "Waiting for your approval from: " + requestorName);
            // ventObj.setProp("editable" , false);                                                                                  

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "booked") {
            arg.el.style.backgroundColor = color_booked;
            arg.el.classList.add("bookedEvent")
            let newtitle = arg.event.title.replace('requested by: ', "");
            if (arg.event.title.includes('requested by')) {
                arg.event.setProp("title", "Confirmed with: " + newtitle);
            }
        }

        else if (arg.event.extendedProps.description.split("/")[0] == "deleted") {
            console.log("event found on mount: ", arg.event.extendedProps.description.split("/")[2] + " " + arg.event.extendedProps.description.split("/")[0]);
            arg.el.style.backgroundColor = color_deleted;
            arg.el.classList.add("deletedEvent")
            console.log("found allusers: ", allUsersSnapShot)
            allUsersSnapShot.forEach(function (child) {
                // console.log("found user key: ", child.key)
                if (child.key == arg.event.extendedProps.description.split("/")[2]) {
                    console.log("found a user with delete")
                    let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);
                    arg.event.setProp("title", "Deleted by: " + fullName);

                }
            });
        }
    }

    //OTHER USERS EVENTS
    else {
        // console.log("found others: ",arg.event.id + " " + arg.event.extendedProps.appId + " " + arg.event.extendedProps.description.split("/")[0]);

        if (arg.event.extendedProps.description.split("/")[0] == "open") {
            let ventObj = arg.event;
            arg.el.classList.add("openOtherEvent")
            arg.el.style.backgroundColor = color_main;
        }
        else if (arg.event.extendedProps.description.split("/")[0] == "inviteRequest") {
            allUsersSnapShot.forEach(function (child) {
                if (child.key == arg.event.extendedProps.description.split("/")[1]) {
                    let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

                    OriginalUser = fullName;
                    arg.event.setProp("title", "Invited by " + OriginalUser);
                }
            });
            // let invitee = arg.event.extendedProps.description.split("/")[2];
            if (arg.event.extendedProps.description.split("/")[2] == currentUser.luid) {

                arg.el.style.backgroundColor = color_invite;
                // addEventTippyMouse(arg);
            }
            else {
                arg.event.setProp('display', 'none');
            }
            arg.el.classList.add("inviteRequestOtherEvent")

        }

        else if (arg.event.extendedProps.description.split("/")[0] == "waiting") {

            arg.event.setProp('display', 'none');
            arg.el.classList.add("waitingOtherEvent")

        }

        else if (arg.event.extendedProps.description.split("/")[0] == "pending") {
            arg.event.setProp('display', 'none');
            arg.el.classList.add("pendingOtherEvent")

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "booked") {
            arg.event.setProp('display', 'none');
            arg.el.classList.add("bookedOtherEvent")

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "deleted") {
            arg.el.style.backgroundColor = color_deleted;
            arg.event.setProp('display', 'none');
        }
    }
    /* set events in the past to be transperant */
    if (moment(arg.event.end).isBefore(moment().format())) {
        arg.el.style.opacity = "0.5";        
    }
}

function eventMountingFromList(arg) {
    console.log("eventMount From List");

    // console.log("found: ",arg.event.id + " " + arg.event.extendedProps.appId + " " + arg.event.extendedProps.description.split("/")[0]);
    //USER CREATED EVENTS
    var dotEl = arg.el.getElementsByClassName('fc-event-dot')[0];
    if (arg.event.extendedProps.appId == currentUser.appId) {
        // console.log("found My EVENT: ",arg.event.id + " " + arg.event.extendedProps.appId + " " + arg.event.extendedProps.description.split("/")[0]);
        if (arg.event.extendedProps.description.split("/")[0] == "open") {

            var dotEl = arg.el.getElementsByClassName('fc-list-event-dot')[0];
            if (dotEl) {
                dotEl.style.borderColor = color_normal_me;
            }
            arg.el.style.backgroundColor = 'white';
            arg.el.classList.add("openEvent_List")

        }

        else if (arg.event.extendedProps.description.split("/")[0] == "inviteRequest") {

            var dotEl = arg.el.getElementsByClassName('fc-list-event-dot')[0];
            if (dotEl) {
                dotEl.style.borderColor = color_invite;
            }
            arg.el.style.backgroundColor = 'white';

            let invitee = arg.event.extendedProps.description.split("/")[2];
            // console.log("invitee: ",invitee);
            allUsersSnapShot.forEach(function (child) {
                if (child.key == invitee) {
                    let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

                    var inviteeName = fullName;
                    arg.event.setProp("title", "Waiting acceptence from: " + inviteeName);

                }
            });
            // console.log(requestor);                
            arg.el.classList.add("inviteRequestEvent_List")
        }


        else if (arg.event.extendedProps.description.split("/")[0] == "waiting") {
            if (dotEl) {
                dotEl.style.backgroundColor = color_toBook;
            }
            arg.el.style.backgroundColor = 'white';

            //   allUsersSnapShot.forEach(function(child) {
            //       if (child.key == arg.event.extendedProps.description.split("/")[2]){
            //           requestorName = child.val().name + " " + child.val().lastName;
            //       }

            //   });                                    
            arg.event.setProp("editable", false);
            arg.el.classList.add("waitingEvent_List")

        }

        else if (arg.event.extendedProps.description.split("/")[0] == "pending") {
            if (dotEl) {
                dotEl.style.backgroundColor = color_toBook;
            }
            arg.el.style.backgroundColor = 'white';
            arg.el.classList.add("pendingEvent_List")
        }
        else if (arg.event.extendedProps.description.split("/")[0] == "booked") {
            var dotEl = arg.el.getElementsByClassName('fc-list-event-dot')[0];
            if (dotEl) {
                dotEl.style.borderColor = color_booked;
            }
            arg.el.style.backgroundColor = 'white !important';

            let newtitle = arg.event.title.replace('requested by: ', "");
            if (arg.event.title.includes('requested by')) {
                arg.event.setProp("title", "Confirmed with: " + newtitle);
            }
            arg.el.classList.add("bookedEvent_List")
        }

        else if (arg.event.extendedProps.description.split("/")[0] == "deleted") {
            var dotEl = arg.el.getElementsByClassName('fc-list-event-dot')[0];
            if (dotEl) {
                dotEl.style.borderColor = color_deleted;
            }
            arg.el.style.backgroundColor = 'white';
            arg.el.classList.add("deletedEvent_List")
        }


    }

    //OTHER USERS EVENTS
    else {
        // console.log("found others: ",arg.event.id + " " + arg.event.extendedProps.appId + " " + arg.event.extendedProps.description.split("/")[0]);

        if (arg.event.extendedProps.description.split("/")[0] == "open") {
            let ventObj = arg.event;
            // ventObj.setProp("title" , child.val().name + " " + child.val().lastName);
            ventObj.setProp("editable", false);
            // if (arg.event.extendedProps.acceptGuest == true) {
            //     if (dotEl) {
            //         dotEl.style.backgroundColor = color_guest;
            //     }

            //     // addEventTippyMouse(arg); 
            // }
            // else {
            //     if (useGuest == true) {
            //         arg.event.setProp('display', 'none');
            //     }
            //     else {
            //         if (dotEl) {
            //             dotEl.style.backgroundColor = color_main;
            //         }
            //         // addEventTippyMouse(arg); 
            //     }
            // }
            var dotEl = arg.el.getElementsByClassName('fc-list-event-dot')[0];
            if (dotEl) {
                console.log("should change dot color")
                dotEl.style.borderColor = color_main;
            }
            // if (dotEl) {
            //     dotEl.style.backgroundColor =  color_main;
            //     dotEl.style.border
            // }
            arg.el.classList.add("openOtherEvent_List")

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "inviteRequest") {
            allUsersSnapShot.forEach(function (child) {
                if (child.key == arg.event.extendedProps.description.split("/")[1]) {
                    let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

                    OriginalUser = fullName;
                    arg.event.setProp("title", "Invited by " + OriginalUser);
                }
            });
            // let invitee = arg.event.extendedProps.description.split("/")[2];
            if (arg.event.extendedProps.description.split("/")[2] == currentUser.luid) {

                if (dotEl) {
                    dotEl.style.backgroundColor = color_invite;
                }
                // addEventTippyMouse(arg);
            }
            else {
                arg.event.setProp('display', 'none');
            }
            arg.el.classList.add("inviteRequestOtherEvent_List")
        }

        else if (arg.event.extendedProps.description.split("/")[0] == "waiting") {

            arg.event.setProp('display', 'none');
            arg.el.classList.add("waitingOtherEvent_List")
        }

        else if (arg.event.extendedProps.description.split("/")[0] == "pending") {
            arg.event.setProp('display', 'none');
            arg.el.classList.add("pendingOtherEvent_List")

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "booked") {
            arg.event.setProp('display', 'none');
            arg.el.classList.add("bookedOtherEvent_List")

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "deleted") {
            arg.event.setProp('display', 'none');
        }
    }
    if (moment(arg.event.end).isBefore(moment().format())) {
        // problem = setprop is fucked and over rides previous decleration  
        // console.log("PPPPPPPASSSSSSTTTTT")
        // arg.event.setProp("editable" , false);

    }

}

function eventMountingMonth(arg) {
    //   console.log("eventMount ");

    //console.log(arg.el.innerHtml)
    console.log(arg.el.innerHTML)
    //USER CREATED EVENTS

    if (arg.event.extendedProps.appId == currentUser.appId) {

        if (arg.event.extendedProps.description.split("/")[0] == "open") {            
            arg.el.innerHTML = "<i style = 'color: " + color_normal_me + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML
        }

        else if (arg.event.extendedProps.description.split("/")[0] == "inviteRequest") {              
            arg.el.innerHTML = "<i style = 'color: " + color_special + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML            
        }
        
    


        else if (arg.event.extendedProps.description.split("/")[0] == "waiting") {
            arg.el.innerHTML = "<i style = 'color: " + color_toBook + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML                 
        }

        else if (arg.event.extendedProps.description.split("/")[0] == "pending") {
            arg.el.innerHTML = "<i style = 'color: " + color_toBook + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML
        }
        else if (arg.event.extendedProps.description.split("/")[0] == "booked") {
            arg.el.innerHTML = "<i style = 'color: " + color_booked + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML                                                    
        }


    }

    // //OTHER USERS EVENTS
    else {
        if (arg.event.extendedProps.description.split("/")[0] == "open") {
            let ventObj = arg.event;
            // ventObj.setProp("title" , child.val().name + " " + child.val().lastName);
            // ventObj.setProp("editable" , false);                 
            if (arg.event.extendedProps.acceptGuest == true) {
                arg.el.innerHTML = "<i style = 'color: " + color_guest + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML

                // arg.el.style.backgroundColor = color_guest;
            }
            else {
                if (useGuest == true) {
                    arg.event.setProp('display', 'none');
                }
                else {
                    arg.el.innerHTML = "<i style = 'color: " + color_main + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML

                    // arg.el.style.backgroundColor = color_main;
                }
            }

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "inviteRequest") {
            arg.el.innerHTML = "<i style = 'color: " + color_invite + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML
            // allUsersSnapShot.forEach(function (child) {
            //     // console.log("child: ",child.key + " ad "  +arg.event.extendedProps.description.split("/")[1])
            //     if (child.key == arg.event.extendedProps.description.split("/")[1]) {
            //         let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);
            //         console.log("name", fullName)
            //         OriginalUser = "Invited by " + fullName;
                    
            //         // arg.event.setProp('title', 'OriginalUser');
            //     } 
            // });
    //         // let invitee = arg.event.extendedProps.description.split("/")[2];
    //         if (arg.event.extendedProps.description.split("/")[2] == currentUser.luid) {
    //             arg.el.innerHTML = "<i style = 'color: " + color_invite + "' class='monthDot fa fa-circle' aria-hidden='true' ></i>" + arg.el.innerHTML

    //             // arg.el.style.backgroundColor = color_invite;
    //         }
    //         else {
    //             arg.event.setProp('display', 'none');
    //         }

    //     }

    //     else if (arg.event.extendedProps.description.split("/")[0] == "waiting") {
    //         arg.event.setProp('display', 'none');

    //     }

    //     else if (arg.event.extendedProps.description.split("/")[0] == "pending") {
    //         arg.event.setProp('display', 'none');

    //     }
    //     else if (arg.event.extendedProps.description.split("/")[0] == "booked") {
    //         arg.event.setProp('display', 'none');

        }
    }
    // if (moment(arg.event.end).isBefore(moment().format())) {
    //     // problem = setprop is fucked and over rides previous decleration  
    //     // console.log("PPPPPPPASSSSSSTTTTT")
    //     // arg.event.setProp("editable" , false);

    // }

}


function addEventTippyMouse(arg) {
    // console.log("mounting tippy: ",arg.event.id + " " + arg.event.extendedProps.appId)
    // let r = Math.random().toString(36).substring(2);
    // var r = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "")

    allUsersSnapShot.forEach(function (child) {
        if (child.key == arg.event.extendedProps.description.split("/")[1]) {
            let fullName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

            autherName = fullName;
        }
    });

    const template = document.getElementById('template');
    document.getElementById('tip_title').innerHTML = arg.event.title;
    document.getElementById('tip_date').innerHTML = moment(arg.event.start).format('dddd DD.MM.YYYY');
    document.getElementById('tip_start').innerHTML = moment(arg.event.start).format('HH:mm') + "-" + moment(arg.event.end).format('HH:mm');
    document.getElementById('tip_cancelInvite').style.display = 'none';
    document.getElementById('tip_acceptInvite').style.display = 'none';
    document.getElementById('tip_declineInvite').style.display = 'none';
    document.getElementById('tip_open').style.display = 'none';
    //   document.getElementById('tip_chat').style.display = 'none';

    if (moment(arg.event.start).isBefore(moment().format())) {

        // console.log("PPPPPPPASSSSSSTTTTT in tippy")
        document.getElementById('tip_trash').style.display = 'none';
        document.getElementById('tip_invite').style.display = 'none';        
        document.getElementById('tip_chat').style.display = 'none';
        // document.getElementById('tip_chat').style.display = 'inline-block';
        // let currentInviteStringValue = 'openChat("' + arg.event.extendedProps.appId + '")';
        // document.getElementById('tip_chat').setAttribute('onclick', currentInviteStringValue);

        // if (arg.event.extendedProps.appId == currentUser.appId) {
        //     document.getElementById('tip_chat').style.display = 'none';
        // }

    }
    //Add the tippy information to the USER created events
    else if (arg.event.extendedProps.appId == currentUser.appId) {
        // console.log("add trash");

        //Set the tippy header
        let elem = document.getElementById('tip_trash');
        document.getElementById('tip_trash').style.display = '';
        let currentStringValue = "deleteFromTippy('" + arg.event.id + "')";
        // console.log(currentStringValue);
        elem.setAttribute('onclick', currentStringValue);
        if (arg.event.extendedProps.description.split("/")[0] == "open") {
            let elem_invite = document.getElementById('tip_invite');
            document.getElementById('tip_invite').style.display = '';
            let currentInviteStringValue = 'openInviteUserModal("' + arg.event.id + '")';
            elem_invite.setAttribute('onclick', currentInviteStringValue);
            document.getElementById('tip_chat').style.display = 'none';

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "waiting") {
            document.getElementById('tip_invite').style.display = 'none';
            document.getElementById('tip_trash').style.display = '';
            document.getElementById('tip_chat').style.display = '';
            let invitee = arg.event.extendedProps.description.split("/")[2];
            if (invitee == currentUser.luid) {
                //the current user is the invitee so take the other user info for chat
                invitee = arg.event.extendedProps.description.split("/")[1];
                allUsersSnapShot.forEach(function (child) {
                    if (child.key == invitee) {
                        // console.log("this is the id: ",child.val().appId);
                        let currentInviteStringValue = 'openChat("' + child.val().appId + '")';
                        document.getElementById('tip_chat').setAttribute('onclick', currentInviteStringValue);
                    }
                });
            }

        }
        else if (arg.event.extendedProps.description.split("/")[0] == "pending") {
            document.getElementById('tip_invite').style.display = 'none';
            document.getElementById('tip_trash').style.display = '';
            document.getElementById('tip_chat').style.display = '';
            let invitee = arg.event.extendedProps.description.split("/")[2];
            // console.log("invitee: ",invitee);
            if (invitee == currentUser.luid) {
                //the current user is the invitee so take the other user info for chat
                invitee = arg.event.extendedProps.description.split("/")[1];
                allUsersSnapShot.forEach(function (child) {
                    if (child.key == invitee) {
                        // console.log("this is the id: ",child.val().appId);
                        let currentInviteStringValue = 'openChat("' + child.val().appId + '")';
                        document.getElementById('tip_chat').setAttribute('onclick', currentInviteStringValue);
                    }
                });
            }
            else {
                allUsersSnapShot.forEach(function (child) {
                    if (child.key == invitee) {
                        // console.log("this is the id: ",child.val().appId);
                        let currentInviteStringValue = 'openChat("' + child.val().appId + '")';
                        document.getElementById('tip_chat').setAttribute('onclick', currentInviteStringValue);
                    }
                });

                document.getElementById('tip_acceptInvite').style.display = '';            
                let currentConfirmrequestStringValue = 'confirmEventFromTippy("' + arg.event.id + '")';
                let elem_confirmRequest = document.getElementById('tip_acceptInvite');            
                elem_confirmRequest.setAttribute('onclick', currentConfirmrequestStringValue);
                
                document.getElementById('tip_declineInvite').style.display = '';
                let currentRequestDeclineStringValue = 'declinelRequestFromTippy("' + arg.event.id + '")';
                let elem_declineInvite = document.getElementById('tip_declineInvite');            
                elem_declineInvite.setAttribute('onclick', currentRequestDeclineStringValue);
            }
            

        }

        else if (arg.event.extendedProps.description.split("/")[0] == "booked") {
            document.getElementById('tip_invite').style.display = 'none';
            document.getElementById('tip_trash').style.display = '';
            document.getElementById('tip_chat').style.display = 'inline-block';

            //check if the user is the creator or the invitee of the event
            let invitee = arg.event.extendedProps.description.split("/")[2];
            // console.log("invitee: ",invitee);
            if (invitee == currentUser.luid) {
                //the current user is the invitee so take the other user info for chat
                invitee = arg.event.extendedProps.description.split("/")[1];
                allUsersSnapShot.forEach(function (child) {
                    if (child.key == invitee) {
                        // console.log("this is the id: ",child.val().appId);
                        let currentInviteStringValue = 'openChat("' + child.val().appId + '")';
                        document.getElementById('tip_chat').setAttribute('onclick', currentInviteStringValue);
                    }
                });
            }
            else {
                allUsersSnapShot.forEach(function (child) {
                    if (child.key == invitee) {
                        // console.log("this is the id: ",child.val().appId);
                        let currentInviteStringValue = 'openChat("' + child.val().appId + '")';
                        document.getElementById('tip_chat').setAttribute('onclick', currentInviteStringValue);
                    }
                });
            }
        }
        else if (arg.event.extendedProps.description.split("/")[0] == "inviteRequest") {
            let elem_cancelInvite = document.getElementById('tip_cancelInvite');
            document.getElementById('tip_cancelInvite').style.display = '';
            let currentInviteStringValue = 'cancelInviteFromTippy("' + arg.event.id + '")';
            elem_cancelInvite.setAttribute('onclick', currentInviteStringValue);
            document.getElementById('tip_invite').style.display = 'none';
            document.getElementById('tip_trash').style.display = '';
            
        }
        else if (arg.event.extendedProps.description.split("/")[0] == "deleted") {
            document.getElementById('tip_invite').style.display = 'none';
            document.getElementById('tip_trash').style.display = '';
            document.getElementById('tip_chat').style.display = 'none';
            document.getElementById('tip_open').style.display = '';
            let elem_openEvent = document.getElementById('tip_open');
            let currentOpenEventStringValue = 'openEventFromTippy("' + arg.event.id + '")';
            elem_openEvent.setAttribute('onclick', currentOpenEventStringValue);
        }
        else {
            document.getElementById('tip_invite').style.display = 'none';
            document.getElementById('tip_trash').style.display = '';
        }
    }
    //ADD the tippy info the the OTHER USERS created events
    else {
        // console.log("add none");
        document.getElementById('tip_trash').style.display = 'none';
        document.getElementById('tip_invite').style.display = 'none';
        document.getElementById('tip_cancelInvite').style.display = 'none';
        document.getElementById('tip_acceptInvite').style.display = 'none';
        document.getElementById('tip_declineInvite').style.display = 'none';
        document.getElementById('tip_chat').style.display = 'inline-block';
        let currentInviteStringValue = 'openChat("' + arg.event.extendedProps.appId + '")';
        document.getElementById('tip_chat').setAttribute('onclick', currentInviteStringValue);

        if (arg.event.extendedProps.description.split("/")[0] == "inviteRequest") {
                       
            document.getElementById('tip_invite').style.display = 'none';
            document.getElementById('tip_trash').style.display = '';
            
            document.getElementById('tip_acceptInvite').style.display = '';            
            let currentInviteAcceptStringValue = 'acceptlInviteFromTippy("' + arg.event.id + '")';
            let elem_acceptInvite = document.getElementById('tip_acceptInvite');            
            elem_acceptInvite.setAttribute('onclick', currentInviteAcceptStringValue);
            
            document.getElementById('tip_declineInvite').style.display = '';
            let currentInviteDeclineStringValue = 'declinelInviteFromTippy("' + arg.event.id + '")';
            let elem_declineInvite = document.getElementById('tip_declineInvite');            
            elem_declineInvite.setAttribute('onclick', currentInviteDeclineStringValue);
        }

    }
    // if(instance !== undefined){
    //     instance.destroy();
    // }

    tippy(arg.el, {
        //  content: "hello",
        content: template.innerHTML,
        allowHTML: true,
        interactive: true,
        delay: [0, 1],
        onShow(instance) {
            tippInstance = instance;
            if (allowTippy == false) {
                instance.popper.style.display = 'none';
            }
            else {
                instance.popper.style.display = '';
            }
        },
        appendTo: function () {
            return document.querySelector('.calendarArea')
        },


    });
}

tippInstance = [];

function writeCalArrayTo_firbase(eventId) {
    console.log("writeCalArrayTo_firbase: ",eventId);
    allowUpdate = false; //ignore the updates localy
    firebase.database().ref('users/' + currentUser.luid).update(
        {
            calArray: currentUser.calArray
        });

    firebase.database().ref('calUpdates/' + currentUser.luid).update(
        {
            "sender": currentUser.appId,
            "event": eventId,
            "timestamp": firebase.database.ServerValue.TIMESTAMP
        });
}

function deleteFromTippy(eventId) {
    console.log("delete event from tippy")
    // tippInstance.hide();
    deleteEvent(eventId);
    // tippInstance.show();
}




//////////////// heade buttons //////////////////

function today() {
    console.log("today")
    // let scrollPos = document.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
    // scrollerPositionY = scrollPos[0].scrollTop;
    getYpos()
    console.log("scroll time", myCalendarAlt.view.currentStart)
    // console.log("scroll time active", myCalendar.view.activeStart)
    var duration = moment.duration({ 'minutes': 30 });
    var changeddate2 = moment(Date.now()).subtract(duration);
    let nowTime = moment(changeddate2).format("HH:mm")
    
    // myCalendar.today();
    myCalendarAlt.today();
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;

    if (sourceCal == "cal"){
        
        setYpos()
    }
    else{
        myCalendarAlt.scrollToTime(nowTime)
    }
    // let newNow = moment().format()
    // console.log(newNow)
    // myCalendarAlt.scrollToTime('2020-12-20')
    // scrollPos[0].scrollTop = scrollerPositionY;
}
function nextDate() {
    // let scrollPos = document.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
    // scrollerPositionY = scrollPos[0].scrollTop;
    getYpos()

    // myCalendar.next();
    myCalendarAlt.next();
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;

    setYpos()
    // scrollPos[0].scrollTop = scrollerPositionY;

}
function prevDate() {
    // let scrollPos = document.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
    // scrollerPositionY = scrollPos[0].scrollTop;
    getYpos()

    // myCalendar.prev();
    myCalendarAlt.prev();
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;

    setYpos()
    // scrollPos[0].scrollTop = scrollerPositionY;
}

function day() {

    // document.getElementById('btn_day').style.backgroundColor = 'lightblue';
    // document.getElementById('btn_week').style.backgroundColor = 'lightGray';
    // document.getElementById('btn_month').style.backgroundColor = 'lightGray';
    //   if(displayUsersList == true){
    //     myCalendar.changeView('resourceTimelineDay');
    //   }
    //   else{
    //     myCalendar.changeView('timelineDay');
    //   }
    console.log("viewDay ",viewDay)
    myCalendarAlt.changeView(viewDay);
    // myCalendar.setOption('scrollTime', moment().format());
    myCalendarAlt.scrollTime = moment().format();
    // myCalendar.scrollTime = moment().format();
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;
    // if (listDisplay == true) {
    //     myCalendarAlt.changeView('listDay');
    // }
}
function week() {
    console.log("week")
    // document.getElementById('btn_day').style.backgroundColor = 'lightGray';
    // document.getElementById('btn_week').style.backgroundColor = 'lightblue';
    // document.getElementById('btn_month').style.backgroundColor = 'lightGray';

    //   if(displayUsersList == true){
    //     myCalendar.changeView('resourceTimelineWeek');
    //   }
    //   else{
    //     myCalendar.changeView('timelineWeek');
    //   }


    myCalendarAlt.changeView(viewWeek);
    myCalendarAlt.scrollTime = moment().format();
    // myCalendar.scrollTime = moment().format();
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;
    // if (listDisplay == true) {
    //     myCalendarAlt.changeView('listWeek');
    // }
}

function month() {
    
    // document.getElementById('btn_day').style.backgroundColor = 'lightGray';
    // document.getElementById('btn_week').style.backgroundColor = 'lightGray';
    // document.getElementById('btn_month').style.backgroundColor = 'lightblue';

    //   if(displayUsersList == true){
    //     myCalendar.changeView('resourceTimelineMonth');
    //   }
    //   else{
    //     myCalendar.changeView('timelineMonth');
    //   }

    myCalendarAlt.changeView(viewMonth);
    myCalendarAlt.scrollTime = moment().format();
    // myCalendar.setOption('scrollTime', moment().format());
    // myCalendar.scrollTime = moment().format();
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;
    // if (listDisplay == true) {
    //     myCalendarAlt.changeView('listMonth');
    // }
}

//////////////// respond to buttons //////////////////////////////////
var allowTippy = true;
var toggleDisplay_check = false; // if false = myCalendarAlt cal if true = mycalendar

function toggleToolTip() {
    console.log(allowTippy)
    // var instance = tippy(document.querySelector('button'));
    if (allowTippy == true) {
        allowTippy = false;
    }
    else {
        allowTippy = true;
    }
}

function toggleToolTipGeneric() {
    console.log(allowTippyGeneric)
    // var instance = tippy(document.querySelector('button'));
    if (allowTippyGeneric == true) {
        allowTippyGeneric = false;
    }
    else {
        allowTippyGeneric = true;
    }
}



temporaryEvent = "";
publicDetailsUpdate = false
privatePublicUpdate = false
oldPublicDetails = ""
newPublicDetails = ""
oldPrivateDetails = ""
newPrivateDetails = ""

// document.getScroll = function() {
//     if (window.pageYOffset != undefined) {
//         return [pageXOffset, pageYOffset];
//     } else {
//         var sx, sy, d = document,
//             r = d.documentElement,
//             b = d.body;
//         sx = r.scrollLeft || b.scrollLeft || 0;
//         sy = r.scrollTop || b.scrollTop || 0;
//         console.log("scroll: ",sx
//         return [sx, sy];
//     }
// }
// "fc-scroller fc-scroller-liquid-absolute"


function backToCal() {


    //myCalendar
    console.log("=========backtoCal ", sourceCal);
    document.getElementById("singleCal").style.visibility = "hidden"
    document.getElementById("mainView").style.visibility = "visible";
    

    setYpos()
    sourceCal = "alt";
    return;
    console.log("posx: ", scrollerPosHorz)
    

    //check if there was a change in the event details
    console.log("coming back from this event: ", eventSingle.id)
    newPublicDetails = document.getElementById('eventDetailsData_Public').value
    newPrivateDetails = document.getElementById('eventDetailsData_Private').value
    console.log("public details: ", newPublicDetails);
    console.log("private details: ", newPrivateDetails);

    if (newPublicDetails !== oldPublicDetails) {
        console.log("found new text in Public details")

        //check if the event has a correspanding event, only when the description is longer the 3 elements!

        if (eventSingle.extendedProps.description.split("/").length > 3) {
            // and if so update the correct id
            let updateString1 = eventSingle.extendedProps.description.split("/")[4]
            let updateString2 = eventSingle.extendedProps.description.split("/")[3]
            firebase.database().ref("eventDetails/" + updateString1).update({
                'publicDetails': newPublicDetails,
            });
            firebase.database().ref("eventDetails/" + updateString2).update({
                'publicDetails': newPublicDetails,
            });
        }

    }

    if (newPrivateDetails !== oldPrivateDetails) {
        console.log("found new text in Private details")

        //save the text to firebase "details" based on the eventId
        firebase.database().ref("eventDetails/" + eventSingle.id).update({
            'privateDetails': newPrivateDetails
        });
    }
    document.getElementById("eventDetailsData_Public").value = "";
    document.getElementById("eventDetailsData_Private").value = "";


    //check if there was a guestStatus change
    if (originalGuestStatus == eventSingle.extendedProps.acceptGuest) {
        console.log("no guest staus change");
    }
    else {
        console.log("guest staus change");
        eventSingle.setExtendedProp("editable", true)
        eventSingle.setExtendedProp("eventResizableFromStart", true)
        myCalendarAlt.getEventById(eventSingle.id).remove()
        // myCalendar.getEventById(eventSingle.id).remove()
        myCalendarAlt.addEvent(eventSingle);
        // myCalendar.addEvent(eventSingle);
        for (e in currentUser.calArray) {
            let tempvar = JSON.parse(currentUser.calArray[e]);
            console.log(tempvar.id + " :: " + eventSingle.id);
            if (tempvar.id == eventSingle.id) {
                console.log("event found at index: " + e);
                currentUser.calArray.splice(e, 1);
                currentUser.calArray.push(JSON.stringify(eventSingle));
                // allowInit = false;
                allowUpdate = false;
                firebase.database().ref('/users/' + currentUser.luid).update({
                    calArray: currentUser.calArray
                });
                break;
            }
        }
    }

    allowUpdate = true;

    //set the time on the header
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;


    if (sourceCal == "singleInvite") {
        checkIfTimeChanged();
    }
    else if (sourceCal == "single") {
        console.log("going back from Single")
    }
    else if (sourceCal == "singleConfirm") {
        calendarConfirm.destroy();
    }
    
    if (updateNeeded == true) {
        console.log("loading an update from backto cal");
        updateNeeded = false;
        var mySelect = document.getElementById("foiSelector1");
        var fieldName = mySelect.value;
        console.log("call FOI filter ");
        filterResourcesFOI(fieldName);
    }

    // document.getElementById("eventDetails").style.display = "none";
    // document.getElementById("calendarAlt").style.visibility = "visible";
    // document.getElementById("calendar").style.visibility = "hidden";
    

    if (toggleDisplay_check == true) {
        // document.getElementById("calendar").style.visibility = "visible";
        // document.getElementById("calendarAlt").style.visibility = "hidden";

        sourceCal = "cal";
    }
    //check if list shuld e displayed
    // document.getElementById("myList").style.visibility = 'hidden';
    // if (displayUsersList == true) {
    //     document.getElementById("myList").style.visibility = 'visible';
    // }

    showButtons()

    //go to the start time of the clicked event, that is the closest to the time I left it
    // myCalendar.scrollToTime(eventSingle.start);
    // myCalendarAlt.scrollToTime(eventSingle.start);
    // let scrollPos = document.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
    // scrollPos[0].scrollTop = scrollerPositionY;

    if (listDisplay === true) {
        if (myCalendarAlt.view.type.includes('Day')) {
            myCalendarAlt.changeView('listDay');
        }
        else if (myCalendarAlt.view.type.includes('Week')) {
            myCalendarAlt.changeView('listWeek');
        }
        else if (myCalendarAlt.view.type.includes('Month')) {
            myCalendarAlt.changeView('listMonth');
        }
    }
    // console.log("left 2: ",scrollerPosHorz)
    // let myElem = document.getElementById("calendar")
    // let scrollPosi1 = myElem.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
    // scrollPosi1[0].scrollLeft = scrollerPosHorz
    sourceCal = "alt";
   

    setYpos()
    
}




function dragElement(elmnt) {
    console.log("move me")
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function setActivitynotify(userAppid, status) {
    //   console.log("user appid: ", userAppid + "and status: ", status);
    let tempString = 'presence' + userAppid;
    //   console.log("string is: ",tempString)
    //   console.log(document.getElementById(tempString));
    if (document.getElementById(tempString) != null) {
        // console.log("change presence color")
        if (status == "online") {
            // console.log("set green")
            document.getElementById(tempString).setAttribute("style", "color:" + 'green')
        }
        else if (status == "idle") {
            // console.log("set ornage")
            document.getElementById(tempString).setAttribute("style", "color:" + 'blue')
        }
        else if (status == "offline") {
            // console.log("set red")
            document.getElementById(tempString).setAttribute("style", "color:" + 'grey')
        }
        else {
            alert("error #28")
        }

    }

}


var leftMenuOpen = true
function openLeftideMenu(){
    console.log("leftMenuOpen",leftMenuOpen)
if (leftMenuOpen ==false){
    leftMenuOpen = true
    document.getElementById("leftSide").setAttribute("style", "width:" + 250 + "px");
    document.getElementById("leftSide").style.display = ""
    myCalendarAlt.updateSize()
    // document.getElementById("leftSide").setAttribute("style", "width:" + 250 + "px");
    // calendarArea.setAttribute("style", "width:" + newwidth + "px");
}
else{
    leftMenuOpen = false
    document.getElementById("leftSide").setAttribute("style", "width:" + 0 + "px");
    document.getElementById("leftSide").style.display = "none"
    myCalendarAlt.updateSize()
}
    
}