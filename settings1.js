var CLIENT_ID = '937235581132-5di5q85qo9f3egntmq99rg7km7s46hud.apps.googleusercontent.com';            
var API_KEY = 'AIzaSyAhOyI13Y2C5X-ArJ__kZzezzAyUcp0t7I';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar";


function settings(){
    console.log("settings");

    //open the settings modal
    modalSetting = document.getElementById("settings_Modal");  
    modalSettingSpan = document.getElementsByClassName("btn_closeSettingsModal")[0];
    
    
    modalSetting.style.display = "block";
     
    // When the user clicks on <span> (x), close the modal
    modalSettingSpan.onclick = function() {
        closeSettingsModal()  
    }
  
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modalChat) {
        // modal.style.display = "none";
      }
    }

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
console.log("loading settings")
//connect to the google api on the app behalf
    gapi.load('client:auth2',  {
        callback: function() {
            // Initialize client & auth libraries
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
            }).then(
                function(success) {
                    // Libraries are initialized successfully
                    // You can now make API calls
                    console.log("success")
                    console.log("googleSync: ",googleSync)
                    // gapi.auth2.authorize({
                    //     client_id: CLIENT_ID,
                    //     scope: SCOPES,
                    //     response_type: 'id_token permission'
                    //   }, function(response) {
                    //     if (response.error) {
                    //       // An error happened!
                    //       return;
                    //     }
                    //     // The user authorized the application for the scopes requested.
                    //     var accessToken = response.access_token;
                    //     var idToken = response.id_token;
                    //     console.log("got something: ",accessToken)
                    //     // You can also now use gapi.client to perform authenticated requests.
                    //   })
                    if(googleSync == true){
                        alert ("found google sync on")
                        // var CLIENT_ID = '937235581132-5di5q85qo9f3egntmq99rg7km7s46hud.apps.googleusercontent.com';            
                        // var API_KEY = 'AIzaSyAhOyI13Y2C5X-ArJ__kZzezzAyUcp0t7I';
                
                        // // Array of API discovery doc URLs for APIs used by the quickstart
                        // var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
                        // var SCOPES = "https://www.googleapis.com/auth/calendar";
                
                        
                      }
                }, 
                function(error) {
                    // Error occurred
                    // console.log(error) to find the reason
                    console.log(error)
                }
            );
        },
        onerror: function() {
            // Failed to load libraries
        }
    });
})

function toggleSyncGoogle(){
    let checkBox = document.getElementById("syncWithGoogle")
    console.log("checked state: ",checkBox.checked);
    if(checkBox.checked === false){
        // this will termeinate the sync and will sign the user out from the auto2 on api calls        
        signOut()
    }
    else (        
        renderGoogleLoginButton()
    )
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





function renderGoogleLoginButton() {

    
    
    gapi.signin2.render('gSignIn', {
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'discoveryDocs': DISCOVERY_DOCS,
        'scope': SCOPES,
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

// Sign-in success callback
function onSuccess(googleUser) {
   
    // Get the Google profile data (basic)
    //var profile = googleUser.getBasicProfile();
    
    // Retrieve the Google account data
    gapi.client.load('oauth2', 'v2', function () {
        var request = gapi.client.oauth2.userinfo.get({
            'userId': 'me'
        });
        request.execute(function (resp) {
            // Display the user details
            var profileHTML = '<h3>Welcome '+resp.given_name+'! <a href="javascript:void(0);" onclick="signOut();">Sign out</a></h3>';
            // profileHTML += '<img src="'+resp.picture+'"/><p><b>Google ID: </b>'+resp.id+'</p><p><b>Name: </b>'+resp.name+'</p><p><b>Email: </b>'+resp.email+'</p><p><b>Gender: </b>'+resp.gender+'</p><p><b>Locale: </b>'+resp.locale+'</p><p><b>Google Profile:</b> <a target="_blank" href="'+resp.link+'">click to view profile</a></p>';
            document.getElementsByClassName("userContent")[0].innerHTML = profileHTML;
            
            document.getElementById("gSignIn").style.display = "none";
            document.getElementsByClassName("userContent")[0].style.display = "block";
            // initClient()
            console.log("cal details: ",gapi.client.calendar)
            listUpcomingEvents()

            //upon success register the user sync state on his firebase data
            firebase.database().ref('users/' + currentUser.luid).update({
                googleSync: true
            })
        });
    });  
}

// Sign-in failure callback
function onFailure(error) {
    alert(error);
}

// Sign out the user
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        document.getElementsByClassName("userContent")[0].innerHTML = '';
        document.getElementsByClassName("userContent")[0].style.display = "none";
        document.getElementById("gSignIn").style.display = "block";
    });
    
    auth2.disconnect();
    //upon success disconnect update the user sync state on his firebase data
    firebase.database().ref('users/' + currentUser.luid).update({
        googleSync: false
    })
}


function listUpcomingEvents() {
    console.log("list events");
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
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
            appendPre(event.summary + ' (' + when + ')')
        }
        } else {
        appendPre('No upcoming events found.');
        }
    });
}


  function addEvent(){
    
    console.log('add event')
    var event = {
        'summary': 'Google I/O 2015',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
        'dateTime': '2020-11-28T09:00:00-07:00',
        'timeZone': 'America/Los_Angeles'
        },
        'end': {
        'dateTime': '2020-11-28T17:00:00-07:00',
        'timeZone': 'America/Los_Angeles'
        },
        'recurrence': [
        'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'attendees': [
        {'email': 'lpage@example.com'},
        {'email': 'sbrin@example.com'}
        ],
        'reminders': {
        'useDefault': false,
        'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
        ]
        }
    };

    var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
    });

    request.execute(function(event) {
        appendPre('Event created: ' + event.htmlLink);
    });

}