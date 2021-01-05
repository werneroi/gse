
userListWeventsState = "open"
userListNoEventsState = "closed"
var presenceArray = []

// create an event by drag select
function respondTo_EventSelect(info) {
    eventAddNew(info)
    
}


function populateUsersTablePC(info) {
    console.log('populateUsersTablePC');
    // console.log(typeof(singleUserForList));
    
    

    var usersForList = [];
    if (typeof (info) === 'undefined') {
        usersForList = usersResourceList;
    }
    else {
        usersForList = info;
    }

    usersForList.sort((a, b) => a.title.localeCompare(b.title))


    if (showOnlyFavs == true) {
        var tempArray = []
        for (u in usersForList) {
            for (i in myFavArray) {
                // console.log("look here: ",myFavArray[i] + "  " + fbUserAppId);
                if (myFavArray[i] == usersForList[u].id) {
                    tempArray.push(usersForList[u])
                    break;
                }
            }
        }
        usersForList = tempArray;
    }

    // console.log("usersForList : ",usersForList);


    //populate the names table as an HTML 
    let userswithEventsArray = []
    let userswithNoneArray = []

    let tempString = '';    
    let mainHtml = '';
    let noneHtml = '';
    var displayedNamesArray = [];
    mainDiv = document.getElementById("myList");
    
    k = 0;
    //check inside all the users if there is a fav

    for (p = 0; p < usersForList.length; p++) {
        
        // console.log('checking: ',usersForList[p].id)
        if (usersForList[p].id == currentUser.appId){
            // console.log("found myself")
        }
        // add all others to table
        else{
            
            userListSelector.add({
                value: usersForList[p].id,
                text: usersForList[p].title
            });            
        
            // console.log('found: ',usersForList[p].id)
            addtoTable = 'none'
            
            /* CHECK IF THE USER HAVE EVENTS THAT START AFTER NOW AND IF SO ADD IT TO TOP LIST*/
            var resourceA = myCalendarAlt.getResourceById(usersForList[p].id);
            var foundResourcesInA = resourceA.getEvents()
            if (foundResourcesInA.length > 0) {
                // console.log("I am now checking here because event s where found for user: ",usersForList[i].id);
                for (var m = 0; m < foundResourcesInA.length; ++m) {
                    let tempEvent = foundResourcesInA[m]
                    console.log("found temo that starts later then now")
                    if(moment(tempEvent.start).isAfter(moment())){
                        console.log("change color to yellow )")
                        userRowBackgroundColor = 'yellow';
                        addtoTable = "with"
                        
                        break;
                    }
                }
            }
            // console.log("add to tabele for user: ",usersForList[p].title + " ",addtoTable)
            if (addtoTable == "none"){
                userswithNoneArray.push(usersForList[p])
            }
            else{
                userswithEventsArray.push(usersForList[p])
            }
        }
    }

    // console.log("",userswithNoneArray.length," and ",userswithEventsArray.length)

    /* BUILD THE TABLES */
    noneHtml = ""//'<p>Users without events</p>'
    mainHtml = ""//'<p>Users with events</p>'
    for (var b in userswithEventsArray){
        // console.log('checking index: ',userswithEventsArray[b].title)
        var dataHtml = " "
        let fbUserAppId = userswithEventsArray[b].id;        
        var userString = "\"" + fbUserAppId + "\"";
        let userRowBackgroundColor = 'yellow';
        dataHtml += "<div style = 'background-color: " + userRowBackgroundColor + "' id='" + fbUserAppId + "'class='user_row' >" +
                "<i id = 'presence" + fbUserAppId + "' class='fa fa-circle' aria-hidden='true' ></i><i class='fa fa-eye-slash' id='toggleUserSelection" + fbUserAppId + "' onclick= 'toggleSelect(" + userString + ")'>" +
                "</i>" +
                "<p onclick='openUser(" + userString + ")'>" + userswithEventsArray[b].title + "</p>";
            
        //check if the user is a favorite and check the box on
        var string = "<i class='openStar fa fa-star-o'";
        for (f in myFavArray) {
            if (myFavArray[f] == fbUserAppId) {
                string = "<i class='fullStar fa fa-star'";
                break;
            }
        }

        dataHtml += "<i id = 'chatIcon" + fbUserAppId + "' class='chatIcon fa fa-comment' +  onclick='openChat(" + userString + ")'></i>" + string + " id='toggleFavorite1" + fbUserAppId + "' onclick='toggleFavs(" + userString + ")'></i></div>";        
        mainHtml += dataHtml;
        // console.log("new html: "
    }
    for (var x in userswithNoneArray){
        // console.log('checking index: ',userswithNoneArray[x].title)
        var dataHtml = " "
        let fbUserAppId = userswithNoneArray[x].id;        
        var userString = "\"" + fbUserAppId + "\"";
        let userRowBackgroundColor = 'grey';
        dataHtml += "<div style = 'background-color: " + userRowBackgroundColor + "' id='" + fbUserAppId + "'class='user_row' >" +
                "<i id = 'presence" + fbUserAppId + "' class='fa fa-circle' aria-hidden='true' ></i><i class='fa fa-eye-slash' id='toggleUserSelection" + fbUserAppId + "' onclick= 'toggleSelect(" + userString + ")'>" +
                "</i>" +
                "<p onclick='openUser(" + userString + ")'>" + userswithNoneArray[x].title + "</p>";
            
        //check if the user is a favorite and check the box on
        var string = "<i class='openStar fa fa-star-o'";
        for (f in myFavArray) {
            if (myFavArray[f] == fbUserAppId) {
                string = "<i class='fullStar fa fa-star'";
                break;
            }
        }

        dataHtml += "<i id = 'chatIcon" + fbUserAppId + "' class='chatIcon fa fa-comment' +  onclick='openChat(" + userString + ")'></i>" + string + " id='toggleFavorite1" + fbUserAppId + "' onclick='toggleFavs(" + userString + ")'></i></div>";       
        noneHtml += dataHtml;
        // console.log("new html: "
    }
                           
    document.getElementById("usersTableWithEvents").innerHTML = mainHtml;
    document.getElementById("usersTableNoEvents").innerHTML = noneHtml;
    
    
    
    // console.log("check presence")
    firebase.database().ref("status").once("value", function (snapshot) {
        presenceArray = snapshotToArray(snapshot);
        // console.log(presenceArray.length);
        snapshot.forEach(function (child) {
            setActivitynotify(child.key, child.val().status);
        });
    });

    populateChatIcons()
    
    // react to user select
    userListSelector.on('selectr.select', function(option) {           
        //expend both headres so I have access to the relevant row
                
        // toogle all the user to hidden
        var x = document.getElementsByClassName('user_row');
        var i;
        for (i = 0; i < x.length; i++) {
            // x[i].classList.setAttribute("class", "user_row hidden");
            x[i].className = ("user_row hidden");
        }
        // untoggle the selected user so it will show
        document.getElementById(userListSelector.getValue()).classList.remove("hidden")

        var acc = document.getElementsByClassName("userListPanel");                  
        for ( var i = 0; i < acc.length; i++) {                    
            // this.classList = "userlistAccordion activeSign"
            var panel = acc[i];
            console.log("this panel: ",panel);
            // panel.style.maxHeight = panel.scrollHeight + 5 +"px";                
            // panel.style.maxHeight = 300 +"px";                
        }

        // hide the tabel headers
        var x = document.getElementsByClassName('userlistAccordion');
        var i;
        for (i = 0; i < x.length; i++) {
            x[i].className = "userlistAccordion hidden";
        }       
    }); 


    userListSelector.on('selectr.clear', function() {        
        
        console.log("reset selector")

        var x = document.getElementsByClassName('user_row');
        var i;
        for (i = 0; i < x.length; i++) {
            x[i].className = "user_row"
        }
        
        if(userListWeventsState == "closed"){
            document.getElementById("panel_usersTableWithEvents").style.maxHeight = null
            document.getElementById("userListWithEvents").className = "userlistAccordion"            
        }
        else{
            document.getElementById("userListWithEvents").className = "userlistAccordion activeSign"
            var panel = document.getElementById("panel_usersTableWithEvents")
            panel.style.maxHeight = panel.scrollHeight + 5 +"px";
        }
        
        
        if(userListNoEventsState == "closed"){
            document.getElementById("panel_usersTableNoEvents").style.maxHeight = null
            document.getElementById("userListWithNoEvents").className = "userlistAccordion"
        }
        else{
            document.getElementById("userListWithNoEvents").className = "userlistAccordion activeSign"
            var panel = document.getElementById("panel_usersTableNoEvents")
            // panel.style.maxHeight = panel.scrollHeight + 5 +"px";
            // panel.style.maxHeight = 300 +"px";
        }        
    });

    //check accordion state and set it accordingly 
    var acc = document.getElementsByClassName("userlistAccordion");
    var i;   
    for (i = 0; i < acc.length; i++) {               
        if(acc[i].classList.value == "userlistAccordion"){
            console.log("contract")                
            var panel = acc[i].nextElementSibling;
            console.log(panel);
            panel.style.maxHeight = null;                
        }
        else{
            console.log("expend")
            var panel = acc[i].nextElementSibling;
            console.log(panel);
            panel.style.maxHeight = panel.scrollHeight + 5 +"px";                
        }                     
    }   
}


function writeEventToCalendars(EventToWrite){
    console.log("++ writeEventToCalendars = Write an event to calendars")
    // myCalendar.addEvent(EventToWrite);
    myCalendarAlt.addEvent(EventToWrite);
    
    if (currentUser.calArray === undefined) {
        currentUser.calArray = [];
    }
    currentUser.calArray.push(JSON.stringify(EventToWrite));
    allowUpdate = false

    addEventToGoogle(EventToWrite)

    writeCalArrayTo_firbase(EventToWrite);
}

function showButtons(){
    console.log("showButtons", sourceCal);
    //show showButtons

    if (sourceCal == "cal" || sourceCal == "alt"){
        console.log("cal or alt")
        
        document.getElementById("mainFOISelector").style.display = "";
        document.getElementById("heade").style.display = "";
        document.getElementById('calsButtonRow').style.display = "";
        document.getElementById("calendar").style.visibility = "visible";
        // document.getElementById("calendarSingle").style.visibility = "hidden";
        document.getElementById("cancelInvite").style.display = "none";
                
    
        document.getElementById("requestEv").style.display = "none";
        document.getElementById("backToCal").style.display = "none";
        document.getElementById("deleteEvent").style.display = "none";
        document.getElementById("inviteUserSingle").style.display = "none";

        document.getElementById('trimB').style.display = "none"; 
        document.getElementById('confirmB').style.display = "none" 
        document.getElementById('declineB').style.display = "none"

        document.getElementById("toggleSelf").style.display = "";
        // document.getElementById("toggleDisplay").style.display = "";
        // document.getElementById("toggleResources").style.display = "";
        // document.getElementById("openEventsToConfirm").style.display = "";

        document.getElementById('label_AG').style.display = "none";
        document.getElementById('acceptGuest_default').style.display = "none";

        document.getElementById('label_AG_singlePage').style.display = "none";
        document.getElementById('acceptGuest_singlePage').style.display = "none";
        document.getElementById('AddEventManually').style.display = "";
        document.getElementById('joinEventManually').style.display = "";

        if(useGuest == true){
            console.log("should change bg topnav");
            document.getElementById('topnav').setAttribute("style","background:" + '#999999');
            document.getElementById('AddEventManually').style.display = "none";
            document.getElementById('label_AG').style.display = "none";
            document.getElementById('acceptGuest_default').style.display = "none";
        }
    }
    else{
        
        // document.getElementById('joinEventManually').style.display = "none";
        // document.getElementById("calendarAlt").style.visibility = "hidden";
        // document.getElementById("myList").style.visibility = "hidden";
        // document.getElementById("heade").style.display = "none";
        document.getElementById("mainFOISelector").style.display = "none";
        // document.getElementById("calendarSingle").style.visibility = "visible";
        document.getElementById("backToCal").style.display = "";
        document.getElementById("openEvent").style.display = "none";
        document.getElementById('label_AG').style.display = "none";
        document.getElementById('acceptGuest_default').style.display = "none";
        document.getElementById('calsButtonRow').style.display = "none";
        // document.getElementById('AddEventManually').style.display = "none";
        document.getElementById('inviteUserSingle').style.display = "none";
        document.getElementById('deleteEvent').innerText = "Delete Event";    
        document.getElementById("eventDetails").style.display = "";
        document.getElementById('calsButtonRow').style.display = "none";
        document.getElementById('acceptGuest_singlePage').style.display = "none";
        document.getElementById('label_AG_singlePage').style.display = "none"; 

        if(sourceCal == "singleConfirm"){            
            // document.getElementById('openEventsToConfirm').style.display = "none";                            
        }
    
        else if(sourceCal == "singleInvite"){            
            document.getElementById("eventDetails").style.display = "";        
        }
    
        else if (sourceCal == "single"){
            console.log("single")                          
            document.getElementById("eventDetails").style.display = "";                                                                
        }
    }
}



function removeEventFromCals(eventToDelte){
    console.log("removeEventFromCals")
    console.log("event with id: ", eventToDelte.id)
    // myCalendar.getEventById(eventToDelte.id).remove();
    myCalendarAlt.getEventById(eventToDelte.id).remove();


    //find the event in the calArray
    for (i = 0; i < currentUser.calArray.length; i++){
        let tempEvent = JSON.parse(currentUser.calArray[i]);
        console.log("tempEvent: ",tempEvent.id + " : " + eventToDelte.id)
        if(tempEvent.id == eventToDelte.id){
            console.log("Found an event to delete")
            currentUser.calArray.splice(i, 1)
            break;
        }
    }

    allowInit = false;
    allowUpdate = false;

    //save to firebase (this will call updates on other users)
    writeCalArrayTo_firbase(eventToDelte);

}

function UpdateEventsOnCals(info){
    console.log("UpdateEventsOnCals");
    for (i = 0; i < currentUser.calArray.length; i++){
        let tempEvent = JSON.parse(currentUser.calArray[i]);
        console.log("tempEvent: ",tempEvent.id + " : " + eventToDelte.id)
        if(tempEvent.id == eventToDelte.id){
            console.log("Found an event to update")
            tempEvent.title = googleNewTitle
            break;
        }
    }
}

var filterEventsOn = false
function filterFromColor(color){
    console.log("filterFromColor: ",color.id)
    var toggleArray = ["openEvent", "inviteRequestEvent","waitingEvent","bookedEvent","openOtherEvent","deletedEvent","pendingEvent","inviteRequestOtherEvent"]
    var toggleListArray = ["openEvent_List", "inviteRequestEvent_List","waitingEvent_List","bookedEvent_List","openOtherEvent_List","deletedEvent_List","pendingEvent_List","inviteRequestOtherEvent_List"]

   /* RESET ALL FILTERS FIRST SO I CAN HIDE THE RELEVENT ONES LATER*/
   /* reset the cals events */ 
   for (var m = 0; m < toggleArray.length; m++){
        var x = document.getElementsByClassName(toggleArray[m]);
        var i;
        for (i = 0; i < x.length; i++) {
            if ( x[i].classList.contains('hidden') ){
                x[i].classList.toggle('hidden');
            }                        
        }
    }
    /* reset for list display events */
    for (var m = 0; m < toggleListArray.length; m++){
        var x = document.getElementsByClassName(toggleListArray[m]);
        var i;
        for (i = 0; i < x.length; i++) {
            if ( x[i].classList.contains('hidden') ){
                x[i].classList.toggle('hidden');
            }
        }
    }


    /* FILTER THE EVENTS BY COLOR*/
    if(this.event.srcElement.className == "colorName"){
        // console.log("this: ",this.event.srcElement)
                
        event.stopPropagation();
        
        if(color.id == "normalColor"){
            toggleArray.splice(0,1)
            toggleListArray.splice(0,1)
            filterEventsByColor("normal")
                
        }
        else if(color.id == "inviteColor"){
            console.log("show invites")
            toggleArray.splice(1,1)                
            toggleListArray.splice(1,1)                
            toggleArray.pop();                
            toggleListArray.pop();                
            toggleArray.pop();                
            toggleListArray.pop();                
            filterEventsByColor("inviteColor")              
        }
        else if(color.id == "waiting"){
            toggleArray.splice(2,1)                
            toggleListArray.splice(2,1)                
            filterEventsByColor("waiting")              
        }
        else if(color.id == "booked"){
            toggleArray.splice(3,1)                
            toggleListArray.splice(3,1)  
            filterEventsByColor("booked")              
        }
        else if(color.id == "otherColor"){
            toggleArray.splice(4,1)                
            toggleListArray.splice(4,1)  
            filterEventsByColor("otherColor")              
        }
        else if(color.id == "deleteColor"){
            toggleArray.splice(5,1)   
            toggleListArray.splice(5,1)  
            filterEventsByColor("deleteColor")            
        }

        var x = document.getElementsByClassName('colorName');    
        for (var i = 0; i < x.length; i++) {
            x[i].className = "colorName"
        }

        this.event.srcElement.className = "colorName highLight"
            
        // console.log("toggleArray: ",toggleArray)
        for (var m = 0; m < toggleArray.length; m++){
            var x = document.getElementsByClassName(toggleArray[m]);
            var i;
            for (i = 0; i < x.length; i++) {
                x[i].className = x[i].className + " hidden";
                console.log("new class: ",x[i].className)
            }
        }

        // console.log("toggleListArray: ",toggleListArray)
        for (var m = 0; m < toggleListArray.length; m++){
            var x = document.getElementsByClassName(toggleListArray[m]);
            var i;
            for (i = 0; i < x.length; i++) {
                x[i].className = x[i].className + " hidden";
            }
        }
    }
    //reset all color filters and show all events
    else{
        this.event.srcElement.className = "colorName"  
        restoreAllEvents()  
    }
}

function filterEventsByColor(colorName){
    console.log(colorName)
    console.log("found events: ",tempEventsFromResources.length)
    saveCalendarsViewState()
    allEvents = []
    for (var i = 0; i < tempEventsFromResources.length; i++) {
        let tempoEv = tempEventsFromResources[i]
        if (colorName == "normal"){
            console.log("found Normal")
            if(tempoEv.extendedProps.description.split("/")[0] == "open" && tempoEv.extendedProps.appId == currentUser.appId){

                // console.log(tempoEv.extendedProps.appId)
                allEvents.push(tempoEv)
            }
        }
        else if(colorName == "inviteColor"){
            if(tempoEv.extendedProps.description.split("/")[0] == "inviteRequest" ){
                allEvents.push(tempoEv)
            }
        }
        else if(colorName == "booked"){
            if(tempoEv.extendedProps.description.split("/")[0] == "booked" && tempoEv.extendedProps.appId == currentUser.appId){
                allEvents.push(tempoEv)
            }
        }
        else if(colorName == "otherColor"){
            if(tempoEv.extendedProps.appId != currentUser.appId){
                allEvents.push(tempoEv)
            }
        }
        else if(colorName == "deleteColor"){
            if(tempoEv.extendedProps.description.split("/")[0] == "deleted" && tempoEv.extendedProps.appId == currentUser.appId){
                allEvents.push(tempoEv)
            }
        }
        else if(colorName == "waiting"){
            if(tempoEv.extendedProps.description.split("/")[0] == "pending" && tempoEv.extendedProps.appId == currentUser.appId){
                allEvents.push(tempoEv)
            }
        }



    }
    console.log("new all events: ",allEvents.length)
    updateEventsOnCals()
}

function gotoDate(){
    /* open a date inptut modal */
    document.getElementById("gotoDate_Modal").style.display = ""
    console.log("openAddEventManually");

    var modal = document.getElementById("gotoDate_Modal");  
    var span = document.getElementsByClassName("closeGotoDate")[0];

    modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        console.log("close");
        modal.style.display = "none";
        // datepicker.destroy();
    }

    // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function (event) {
    //     if (event.target == modal) {
    //     modal.style.display = "none";
    //     // datepicker.destroy();
    //     }
    // }

    $(document).keyup(function (e) {
        console.log(addeventModalOpen);

        if (e.key === "Escape") { // escape key maps to keycode `27`      
            modal.style.display = "none";
            // datepicker.destroy();    
        }
    });
    // myCalendarAlt.gotoDate(2021-01-01)
}

function respondToGotoDate()
{
    let dateTogo = $('#datetime17').combodate('getValue');
    console.log(dateTogo)
    // moment('31.10.2013', 'DD.MM.YYYY').format('YYYY/MM/DD')
    console.log("dateTogo ",moment(dateTogo, 'DD:MM:YYYY').format('YYYY-MM-DD'))
    myCalendarAlt.gotoDate(moment(dateTogo, 'DD:MM:YYYY').format('YYYY-MM-DD'))
    document.getElementById("gotoDate_Modal").style.display = "none"
    document.getElementById('currentDate').innerHTML = myCalendarAlt.view.title;

}
function restoreAllEvents(){
    saveCalendarsViewState()
    allEvents = tempEventsFromResources
    updateEventsOnCals()
}

function getYpos(){
    if(listDisplay == true){
        return
    }
  console.log("++++ getYpos  +++++")
  
  let scrollPos = document.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
  console.log("scrollPos Get ",typeof(scrollPos[0]))

  if(typeof(scrollPos[0]) == undefined || typeof(scrollPos[0]) == "undefined"){
    console.log("no Y pos found")
  }
  else{
    scrollerPositionY = scrollPos[0].scrollTop;
  }

  let scrolx = document.getElementById("orizEl")
  if(typeof(scrolx) == undefined || typeof(scrolx) == "undefined"){
    console.log("no x found")
  }
  else{
    scrollerPosHorz = scrollPos[0].scrollLeft
    console.log(" x found ",scrollerPosHorz)
  }  
}

function setYpos(){
    console.log("setYpos")
    if(listDisplay == true){
        return
    }
  
  let scrollPos = document.getElementsByClassName("fc-scroller fc-scroller-liquid-absolute")
  if(typeof(scrollPos[0]) == undefined || typeof(scrollPos[0]) == "undefined"){
    console.log("no Y pos found")
  }else{
    scrollPos[0].scrollTop = scrollerPositionY;
  }

  /* set the X position of myCalendar slider */
  setTimeout(function(){ 
    console.log("set x pos here",scrollerPosHorz)
    // const myEleme = document.getElementById("orizEl")
    // console.log("current x: ",myEleme.scrollLeft)
    // myEleme.scrollLeft = scrollerPosHorz   
    scrollPos[0].scrollLeft =  scrollerPosHorz;
   }, 1);  
}


function loadProfile(){
    document.getElementById("profilePage").style.display ="block"
    var body=document.getElementsByTagName('body')[0];
    body.style.overflow ="auto"

}

function backFromProfile(){
    document.getElementById("profilePage").style.display ="none"
    var body=document.getElementsByTagName('body')[0];
    body.style.overflow ="hidden"
}

function  writeUserProfileInfo(){
                           
    // if there is no profile image set a default empty
    if (typeof(profileImageUrl) === 'undefined') {        
        profileImageUrl = '../gse5/emptyProfile.png';
    }
    
    //check all form variables
    var name = document.getElementById("firstName").value;
    if(name.length == 0 || name == null){
        printError("Please enter a first name!");
        return;
    }
    
    var lastName = document.getElementById("lastName").value;
    if(lastName.length == 0 || lastName == null){
        printError("Please enter a last name!");
        return;
    }


    var city = document.getElementById("cityInput").value;
    var country = document.getElementById("countryInput").value;
    
    // get the selected additonal languages
    var LanguageSelector = document.getElementById("selectLang").selectedOptions;
    //turn selected languages into an array to save in firebase
    langs = [];
    for (e in LanguageSelector){
        console.log(LanguageSelector[e].value);
        if(LanguageSelector[e].value != undefined){
        langs.push(LanguageSelector[e].value); 
        }                       
    }
    console.log(langs)

    //check if the user is a guest or practioners
    // userStatus = "";
    foiArray = [];

    userStatus = "practioner";

        var foiSelectorValues = document.getElementById("foiList").selectedOptions;
        if(foiSelectorValues.length == 0){
            printError("Please please choose at least 1 field of practice!");
            return;
        }

        
        // console.log(langs);
        for (e in foiSelectorValues){
            console.log(foiSelectorValues[e].value);
            if(foiSelectorValues[e].value != undefined){
                foiArray.push(foiSelectorValues[e].value); 
            }                       
        }
        console.log(foiArray)
    // if(document.getElementById('practioner').checked==true){
    //     console.log("practioner checked");
    //     userStatus = "practioner";

    //     var foiSelectorValues = document.getElementById("foiList").selectedOptions;
    //     if(foiSelectorValues.length == 0){
    //         printError("Please please choose at least 1 field of practice!");
    //         return;
    //     }

        
    //     // console.log(langs);
    //     for (e in foiSelectorValues){
    //         console.log(foiSelectorValues[e].value);
    //         if(foiSelectorValues[e].value != undefined){
    //             foiArray.push(foiSelectorValues[e].value); 
    //         }                       
    //     }
    //     console.log(foiArray)
        
    // }
    // else if(document.getElementById('guest').checked==true){
    //     console.log("guest checked");  
    //     userStatus = "guest";              
    // }
    // else{
    //     printError("Please choose a guest or practionar status");
    //     return;
    // }
    
    var about = document.getElementById("about").value;
    // var enableGuests = document.getElementById("enableGuests").value;
    
    
    if (typeof favoritesArray === 'undefined' || favoritesArray === null) {
        favoritesArray = [];
    }
    if (typeof tempAppId === 'undefined' || tempAppId === null || tempAppId.length == 0) {
        console.log("no tempAppId found");
        
        // variable is undefined or null
        let r = Math.random().toString(36).substring(2);
        tempAppId = r;
    }
    
    
    userWebSite = document.getElementById("userWebSite").value;
    facebookUrl = document.getElementById("facebookUrl").value;
    linkedInUrl = document.getElementById("linkedInUrl").value;
    
        
    firebase.database().ref('users/' + curUser.uid).set(
        {
        //   username: name,
        appId: tempAppId,
        email: curUser.email,
        name: name,
        lastName: lastName,
        mainLanguage: langs,
        address: address,
        city: city,
        country: country,
        // enableGuests: enableGuests,
        about: about,
        calArray: calArray,
        favoritesArray: favoritesArray,
        fieldsOfinterest: foiArray,
        userWebSite:userWebSite,
        facebookUrl:facebookUrl,
        linkedInUrl:linkedInUrl,
        profileImageUrl: profileImageUrl,
        userStatus: userStatus,
        
        

        },function(error)
        {
        if (error) {
            alert (error);
            // The write failed...
        } else {
            info["email"] = curUser.email;
            info["lastName"] = lastName;
            info["name"] = name;
            info["mainLanguage"] = langs;
            info["about"] = about;
            info["address"] = address;
            info["city"] = city;
            info["country"] = country;
            // info["enableGuests"] = enableGuests;
            info["luid"] = curUser.uid;
            info["appId"] = tempAppId;
            info["fieldsOfinterest"] = foiArray;
            info["userWebSite"] = userWebSite;
            info["facebookUrl"] = facebookUrl;
            info["linkedInUrl"] = linkedInUrl;
            info["profileImageUrl"] = profileImageUrl;
            info["userStatus"] = userStatus;
            console.log(info);
            
            localStorage.setItem("currentUser", JSON.stringify(info));                       
        
        }
    });    
}