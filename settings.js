var CLIENT_ID = '937235581132-5di5q85qo9f3egntmq99rg7km7s46hud.apps.googleusercontent.com';            
var API_KEY = 'AIzaSyAhOyI13Y2C5X-ArJ__kZzezzAyUcp0t7I';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar";
var googleCalendarId = 'primary'
//'baptgfv8sn3ivm0r65db7gj9u8@group.calendar.google.com',

document.addEventListener('DOMContentLoaded', function (){

    // dayDisplaySelector = new Selectr(document.getElementById("dayDisplay_selectUser"));    
    var dynamicSelect = document.getElementById("dayDisplay_selectUser"); 
    dayDisplaySelector = new Selectr(dynamicSelect, {
        multiple: false,
        // customClass: 'langSelectr',
        // width: 100,
        placeholder: 'Choose a day to start week display'
        // selectedValue: currentUser.mainLanguage
    });           
    dayDisplaySelector.add([
        {
            value: "99",
            text: "Current day"
        },
        {
            value: "0",
            text: "Sunday"
        },
        {
            value: "1",
            text: "Monday"
        },
        {
            value: "2",
            text: "Tuesday"
        },
        {
            value: "3",
            text: "Wednesday"
        },
        {
            value: "4",
            text: "Thursday"
        },
        {
            value: "5",
            text: "Friday"
        },
        {
            value: "6",
            text: "Saturday"
        },
        
        
    ]);
    
    var mySelect = document.getElementById("dayDisplay_selectUser");
    mySelect.onchange = (event) => {
    

        if(event.target.value == "99"){
            firstDayValue = moment().format('e')
        }
        else if(event.target.value == ""){
            firstDayValue = Integer.parseInt(event.target.value);  
        }
        else{
            firstDayValue = event.target.value;
        }
        console.log(firstDayValue); 
        
    // var mySelect = document.getElementById("foiSelector1");
    // dayDisplaySelector.onchange = (event) => {

        saveCalendarsViewState()
        


        myCalendarAlt.destroy();
        // myCalendar.destroy();
        // makeCal();
        makeCalAlt();

        setYpos()

        /* save this to the user settings */
        firebase.database().ref('settings/' + currentUser.appId).update({
            "firstDay": event.target.value
        })
        firebase.database().ref('users/' + currentUser.luid).update({
            "firstDay": event.target.value
        })

        console.log("event text: ",event.target)
        
    }

})

function settings(){
    console.log("settings");
    console.log("googleCalendarId: ",googleCalendarId);
    console.log("firstDayValue: ",firstDayValue);
    //open the settings modal
    modalSetting = document.getElementById("settings_Modal");  
    modalSettingSpan = document.getElementsByClassName("btn_closeSettingsModal")[0];
    modalSetting.style.display = "block";
    document.getElementById("googleCalendarId").value = googleCalendarId

    if(googleSync == true){
        googleSyncEvents = "confirmed"
        document.getElementById("googleSyncConfirmedEvents").disabled = false
        document.getElementById("googleSyncAllEvents").disabled = false
        document.getElementById("googleSyncConfirmedEvents").checked = true
        document.getElementById("googleSyncAllEvents").checked = false
        
        if(googleSyncEvents == "all"){
            googleSyncEvents = "all"
            document.getElementById("googleSyncConfirmedEvents").checked = false
            document.getElementById("googleSyncAllEvents").checked = true
        }
    }
    else{
        document.getElementById("googleSyncConfirmedEvents").disabled = true
        document.getElementById("googleSyncAllEvents").disabled = true
    }


    if(firstDayValue){
        var mySelect = document.getElementById("dayDisplay_selectUser");
        dayDisplaySelector.setValue(firstDayValue)
        // mySelect.setValue = firstDayValue
    }
     
    //When the user clicks on <span> (x), close the modal
    modalSettingSpan.onclick = function() {
        closeSettingsModal()  
    }
  
    // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function(event) {
    //   if (event.target == modalChat) {
    //     // modal.style.display = "none";
    //   }
    // }
    $(document).keyup(function(e) {
        console.log(textModalOpen);
        
        if (e.key === "Escape") { // escape key maps to keycode `27`
        closeSettingsModal()           
       }
   });
}

function closeSettingsModal(){
    modalSetting.style.display = "none";
        
}


document.addEventListener('DOMContentLoaded', function () {
    console.log("loading settings with googleSync", googleSync)
    // handleClientLoad()
})

function toggleSyncGoogle(){
    let checkBox = document.getElementById("syncWithGoogle")
    console.log("checked state: ",checkBox.checked);
    if(checkBox.checked === false){
        document.getElementById("googleSyncConfirmedEvents").disabled = true
        document.getElementById("googleSyncAllEvents").disabled = true
        // this will termeinate the sync and will sign the user out from the auto2 on api calls        
        handleSignoutClick();
    }
    else {
        document.getElementById("googleSyncConfirmedEvents").disabled = false
        document.getElementById("googleSyncAllEvents").disabled = false
        document.getElementById("googleSyncConfirmedEvents").checked = true
        document.getElementById("googleSyncAllEvents").checked = false
        
        //to be sure the user is not using a previous account that was not signed out:
        gapi.auth.checkSessionState({session_state: null}, function(isUserNotLoggedIn){
            if (isUserNotLoggedIn) {
            // do some stuff
            console.log("1")
            }
            else{
                console.log("@")
                handleSignoutClick();
            }
        });

        //start the sign in process
        googleCall = "local"
        handleClientLoad();
        
    }                 
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}
  
  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
function initClient() {
      console.log("initClient")
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
        console.log("succes gapi ")
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
  
      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      
    }, function(error) {
        console.log(error)
      appendPre(JSON.stringify(error, null, 2));
    });
}

function updateSigninStatus(isSignedIn) {
    console.log("listen")
    if (isSignedIn) {
        console.log('succesful sign in to GAPI')    
    //   listUpcomingEvents();
    } else {
        console.log("eror")
        if (googleCall == "init"){

        }
        else{
            Promise.resolve(gapi.auth2.getAuthInstance().signIn()).then(function() {
                //sign in successful, update the system:
                console.log("gapi signed in ok")
                googleSync = true
                allowUpdate = false;
                firebase.database().ref('users/' + currentUser.luid).update({
                    googleSync: true
                })

            }).catch(function(error) { 
                console.log(error)               
              if (error && error.error == 'popup_blocked_by_browser') {
                // A popup has been blocked by the browser
              } else {
                  console.log(error)
                // some other error
              }

              //since there are errors turn the check mark of on the page and in firebase
              let checkBox = document.getElementById("syncWithGoogle")
              checkBox.checked = false
              googleSync = false
              allowUpdate = false;
              firebase.database().ref('users/' + currentUser.luid).update({
                  googleSync: false
              })
              
            });
            // gapi.auth2.getAuthInstance().signIn();
        }
        
    }
  }
  
  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }
  
  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
      //check if user is signed in:
        googleSync = false
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function (){

        })
        // gapi.auth2.getAuthInstance().signOut();
        auth2.disconnect();
        //upon success disconnect update the user sync state on his firebase data
        allowUpdate = false;
        firebase.database().ref('users/' + currentUser.luid).update({
            googleSync: false
        })
      

    
  }
  
  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }
  
  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
  function listUpcomingEvents() {
      console.log("gapi calendar:", gapi.client.calendar)
    gapi.client.calendar.events.list({
      'calendarId': googleCalendarId,
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    }).then(function(response) {
      var events = response.result.items;
      appendPre('Upcoming events:');
  
      if (events.length > 0) {
        for (i = 0; i < events.length; i++) {
          var event = events[i];
          var when = event.start.dateTime;
          if (!when) {
            when = event.start.date;
          }
          appendPre(event.id + " / " + event.summary + ' (' + when + ')')
        }
      } else {
        appendPre('No upcoming events found.');
      }
    });
  }


  function addEvent(){
    
    console.log('add event')
    let idString = (Math.random().toString(36) + Date.now().toString(36) + Math.random().toString(36).substr(2, 5))
    var rand = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "")
    console.log("id: ",rand)
    console.log(typeof(rand))
    var event = {
        'summary': 'fullcalendar 4',
        'id': rand,
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
        'dateTime': '2020-11-16T09:00:00+01:00',
        },
        'end': {
        'dateTime': '2020-11-16T17:00:00+01:00',
        },
    };
    
    var request = gapi.client.calendar.events.insert({
        'calendarId': googleCalendarId,        
        'resource': event
    });

    request.execute(function(event) {
        console.log(event.htmlLink);
        console.log(event.id);
        appendPre('Event created: ' + event.htmlLink);
    });

}


function ValidategoogleCalendarId(){
    console.log("ValidategoogleCalendarId")
    //get the code 
    console.log(document.getElementById("googleCalendarId").value);
    googleCalendarId = "'" + document.getElementById("googleCalendarId").value + "'"
    console.log(typeof(googleCalendarId))
    firebase.database().ref('settings/' + currentUser.appId).update({
        "gapid": document.getElementById("googleCalendarId").value
    })

}
function addEventToGoogle(eventToGoogle){
    console.log("add event to google: ",googleSync)
    if (googleSync == true) {
    // console.log(typeof(eventToGoogle.id))
        console.log(eventToGoogle.extendedProps.description)
        
        let tempTitle = eventToGoogle.title
        if(eventToGoogle.extendedProps.description.split("/")[0] == "open"){
            if(eventToGoogle.extendedProps.description.split("/")[1] !== currentUser.luid){
                console.log("should change name")
                tempTitle = "Invitation from " + eventToGoogle.title
            }
        }
        
        var event = {
            'summary': tempTitle,
            'id': eventToGoogle.id,
            'description': 'Global sessions excange meeting',
            'start': {
            'dateTime': eventToGoogle.start,
            },
            'end': {
            'dateTime': eventToGoogle.end,
            },        
        };
        
        console.log("event: ",event)
        var request = gapi.client.calendar.events.insert({
            'calendarId': googleCalendarId,
            'resource': event
        },function (error){
            console.log(error);
        });

        request.execute(function(response) {
            if(response.error || response == false){
                // alert('Error in delete event');
                console.log("there is an error in add to google: ",response.error);
                if(response.error.message == "The requested identifier already exists.")
                {
                    updateEventToGoogle(eventToGoogle) 
                }
            }
            else{
                // alert('Successfully deleted the event');               
            }
        });
    }
    
}
var googleNewTitle = ""
function updateEventToGoogle(eventToGoogle){

    console.log("update event to google: ",googleSync)
    if (googleSync == true) {
        console.log("update event to google: ",eventToGoogle.id)  
        console.log("update event to google: ",eventToGoogle.title)  
        
        if(googleNewTitle == ""){
            googleNewTitle = eventToGoogle.title
        }

        if(eventToGoogle.extendedProps.description.split("/")[0] == "open"){
            if(eventToGoogle.extendedProps.description.split("/")[1] !== currentUser.luid){
                console.log("should change name")
                googleNewTitle = "Invitation from " + eventToGoogle.title
            }
        }    
        
        
        var event = {
            'summary': googleNewTitle,
            'id': eventToGoogle.id,
            'description': 'Global sessions excange meeting',
            'start': {
            'dateTime': eventToGoogle.start,
            },
            'end': {
            'dateTime': eventToGoogle.end,
            },        
        };

        var request = gapi.client.calendar.events.update({
            'calendarId': googleCalendarId,
            'eventId':eventToGoogle.id,
            'resource': event
        });

        request.execute(function(response) {
            if(response.error || response == false){
                // alert('Error in delete event');
                console.log("there is an error in update google: ",response.error);
            }
            else{
                // alert('Successfully deleted the event');  
                googleNewTitle = ""             
            }
            // appendPre('Event created: ' + event.htmlLink);
        });
    }
    
}

function deleteEventToGoogle(eventId){
    console.log("delete event to google: ",googleSync)
    if (googleSync == true) {
        console.log("delete event to google: ",eventId)
        gapi.client.load('calendar', 'v3', function() {
            var request = gapi.client.calendar.events.delete({
                'calendarId': googleCalendarId,
                'eventId': eventId
            });
            request.execute(function(response) {
                if(response.error || response == false){
                    // alert('Error in delete event');
                    console.log("there is an error in delete from google: ",response.error);
                }
                else{
                    // alert('Successfully deleted the event');               
                }
            });
        });
    }
}

var googleSyncEvents = "";
function googleSyncAllEvents(){
    console.log("googleSyncAllEvents")
    document.getElementById("googleSyncConfirmedEvents").checked = false
    googleSyncEvents = "all"
    allowUpdate = false;
    firebase.database().ref('settings/' + currentUser.appId).update({
        googleSyncEvents: "all"
    })
    
}

function googleSyncConfirmedEvents(){
    console.log("googleSyncConfirmedEvents")
    document.getElementById("googleSyncAllEvents").checked = false
    googleSyncEvents = "confirmed"
    allowUpdate = false;
    firebase.database().ref('settings/' + currentUser.appId).update({
        googleSyncEvents: "confirmed"
    })

}