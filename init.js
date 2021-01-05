var user = [];
var fbUser = [];
allUsersSnapShot = [];
allowInit = false;
var currentUser = [];
var myFavArray = [];
inBoxContent = [];
inBoxModalOpen = false;
inBoxContentArray = [];
updatesArray = [];
googleEventToUpdateArray = [];
googleEventToINserArray = []
var allowUpdate = true //PREMISSION TO UPDATE THE CALENDARS AFTER RECIEVEING INFO FROM FIREBASE, CALLED ON UPDATECALENDARS()

var countriesList =
  ["0", "None", "AF", "Afrikaans", "SQ", "Albanian", "AR", "Arabic", "HY", "Armenian", "EU", "Basque", "BN", "Bengali", "BG", "Bulgarian", "CA", "Catalan", "KM", "Cambodian", "ZH", "Chinese(Mandarin)", "HR", "Croatian", "CS", "Czech", "DA", "Danish", "NL", "Dutch", "EN", "English", "ET", "Estonian", "FJ", "Fiji", "FI", "Finnish", "FR", "French", "KA", "Georgian", "DE", "German", "EL", "Greek", "GU", "Gujarati", "HE", "Hebrew", "HI", "Hindi", "HU", "Hungarian", "IS", "Icelandic", "ID", "Indonesian", "GA", "Irish", "IT", "Italian", "JA", "Japanese", "JW", "Javanese", "KO", "Korean", "LA", "Latin", "LV", "Latvian", "LT", "Lithuanian", "MK", "Macedonian", "MS", "Malay", "ML", "Malayalam", "MT", "Maltese", "MI", "Maori", "MR", "Marathi", "MN", "Mongolian", "NE", "Nepali", "NO", "Norwegian", "FA", "Persian", "PL", "Polish", "PT", "Portuguese", "PA", "Punjabi", "QU", "Quechua", "RO", "Romanian", "RU", "Russian", "SM", "Samoan", "SR", "Serbian", "SK", "Slovak", "SL", "Slovenian", "ES", "Spanish", "SW", "Swahili", "SV", "Swedish ", "TA", "Tamil", "TT", "Tatar", "TE", "Telugu", "TH", "Thai", "BO", "Tibetan", "TO", "Tonga", "TR", "Turkish", "UK", "Ukrainian", "UR", "Urdu", "UZ", "Uzbek", "VI", "Vietnamese", "CY", "Welsh", "XH", "Xhosa"
  ];



color_invite = '#9a031e';
color_main = '#0f4c5c';
color_guest = '#5f0f40';//'#18535e'
color_special = '#9a031e';
color_normal_me = '#fb8b24';
color_guest_me = '#e36414';
color_booked = "#D1BE9C";
color_toBook = "#CC8B86";
color_deleted = '#46b5be'

var firebaseConfig = {
  apiKey: "AIzaSyD2azQePddBCUaU8iLPs18jdgx-l_4zr_I",
  authDomain: "coaching-34394.firebaseapp.com",
  databaseURL: "https://coaching-34394.firebaseio.com",
  projectId: "coaching-34394",
  storageBucket: "coaching-34394.appspot.com",
  messagingSenderId: "937235581132",
  appId: "1:937235581132:web:2b98f6cdd6151238395a69"
};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
};

var googleSync = false;
var googleCall = ""

firebase.auth().onAuthStateChanged(function (user) {
  if (user == null) {
    // console.log("User not found");
    window.location.href = "../gse5/loginn.html";
    return;
  }
  //console.log("AUth Change ", user.uid);
  if (user) {
    // User is signed in.
    var userId = firebase.auth().currentUser.uid;
    // return 
    firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
      //check if the user has info on firebase already. if it does - go to calendar, if it doesnt go to welcome page
      var userCheck = snapshot.exists();
      if (userCheck == false) {
        window.location.href = "../gse5/newUser.html";
        return;
      }

      var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      currentUser = (snapshot.val());
      currentUser.luid = userId;
      // localStorage.setItem("currentUser", JSON.stringify(currentUser));

      console.log("google sync: ", currentUser + "is: ",currentUser.googleSync)
      if (currentUser.googleSync == true) {
        googleSync = true;
        googleCall = "init"
        let checkBox = document.getElementById("syncWithGoogle")
        checkBox.checked = true;
        handleClientLoad()
      }

      if(snapshot.val().firstDay){
        firstDayValue = snapshot.val().firstDay;        
      }

      if (currentUser.calArray == undefined) {
        currentUser.calArray = [];
      }

      if (currentUser.colors != undefined) {
        console.log("loading colors", currentUser.colors);
        console.log("colorInvite: ",typeof(currentUser.colors.invite))
        console.log("colorInvite orig: ",color_invite)
        if(currentUser.colors.otherColor != undefined) {
          color_main = currentUser.colors.otherColor;
        }
        if(currentUser.colors.otherGuestColor != undefined) {
          color_guest = currentUser.colors.otherGuestColor;
        }
        if(currentUser.colors.waiting != undefined) {
          color_toBook = currentUser.colors.waiting;
        }
        if(currentUser.colors.normalColor != undefined) {
          color_normal_me = currentUser.colors.normalColor;
        }
        if(currentUser.colors.guestColor != undefined) {
          color_guest_me = currentUser.colors.guestColor;
        }
        if(currentUser.colors.booked != undefined) {
          color_booked = currentUser.colors.booked;
        }
        
        if(currentUser.colors.invite != undefined) {          
          color_invite = currentUser.colors.invite;
        }
        if(currentUser.colors.special != undefined) {
          color_special = currentUser.colors.special;
        }

        console.log("colorInvite orig: ",color_invite)
        
        
        
        
        
        
        
        
        
      }

      ReadInfoOnce()
      loadInBoxListeners()


      console.log("call listeners on calupdate")

      firebase.database().ref("calUpdates/").orderByChild("timestamp").startAt(Date.now()).on("child_changed", function (snapshot) {
        console.log("a change value in calUpdates: ", JSON.stringify(snapshot.val().sender));
        if(snapshot.val().sender != currentUser.appId){
          allowUpdate = true;
          initCalsDisplay = false;
          loadAllData_firebase()
        }
        
      });
      firebase.database().ref("calUpdates/").orderByChild("timestamp").startAt(Date.now()).on("child_added", function (snapshot) {
        console.log("added value in calUpdates: ", JSON.stringify(snapshot.val().sender));
        if(snapshot.val().sender != currentUser.appId){
          allowUpdate = true;
          loadAllData_firebase()
        }
        
      });




      // get the current updates waiting
      myName = currentUser.name
      myLastName = currentUser.lastName
      myFullName = myName.charAt(0).toUpperCase() + myName.slice(1) + " " + myLastName.charAt(0).toUpperCase() + myLastName.slice(1);
      console.log("my name: ", myFullName)
      //listen to updates if there is a new message in one of the chats      
      // firebase.database().ref("updates/" + currentUser.appId).on("child_changed", function (snapshot) {
      //   // console.log("a change value in updates: ", JSON.stringify(snapshot));
      // });


      firebase.database().ref("updates/" + currentUser.appId).on("child_added", function (snapshot) {
        
        // I know have a notification message that there is a new chat message soemwhere.
        // once I open this chat, delete the message from the firebase
        //convert the 
        updatesArray.push({
          key: snapshot.key,
          sender: snapshot.val().sender
        })

        // console.log("populateChatIcons from update");
        populateChatIcons()

        //send message to inBox in case the userList is empty? for now I do it all the time.
        //// console.log("call false in read")
        // firebase.database().ref("/inBox/" + currentUser.appId + "/read").update({
        //   'state': false,
        //   "timestamp": firebase.database.ServerValue.TIMESTAMP,

        // });
        firebase.database().ref("inBox/" + currentUser.appId + "/" + snapshot.key).set({
          "sender": snapshot.val().sender,
          "message": "a new message is waiting",
          "status": "chat",
          "state": "off",
          "eventId": snapshot.key,
          "timestamp": firebase.database.ServerValue.TIMESTAMP
        });
      });

      loadAllData_firebase()




      // console.log("call builds");
      buildFOISelector();
      buildLangSelecorPC();
      loadMainPage();
    });
  } else {
    // No user is signed in.   
  }
});

function ReadInfoOnce() {
  console.log("read info once ", currentUser.appId);

  //read settings
  console.log("checking google key")
  firebase.database().ref('/settings/' + currentUser.appId).once('value').then(function (snapshot) {
    var checkExist = snapshot.exists();
    console.log(checkExist)
    if (checkExist == true) {
      googleCalendarId = snapshot.val().gapid
      console.log("googleCalendarId: ", googleCalendarId);
      console.log("firstDay found: ",snapshot.val().firstDay)      
    }
  });

  // read favorites once
  // console.log("read favorites once");
  firebase.database().ref('/favs/' + currentUser.appId).once('value').then(function (snapshot) {
    console.log("*************GETTING FAVORITES HERE");
    var checkExist = snapshot.exists();

    if (checkExist == true) {
      myFavArray = snapshot.val().myFavArray
      //// console.log("myfavArray: ",myFavArray);
    }
    buildFavs();
    populateUsersTablePC()
  });

  //read updates once
  // console.log("getting updates once now for: ", currentUser.appId);
  firebase.database().ref("updates/" + currentUser.appId).once("value", function (snapshot) {
    // console.log("getting updates once now to:", snapshot.numChildren());
    snapshot.forEach(function (child) {
      updatesArray.push({
        key: child.key,
        sender: child.val().sender
      });
    });
    // console.log("populateChatIcons");
  });


  //read InBox once
  firebase.database().ref("/inBox/" + currentUser.appId + "/new/").orderByChild('timestamp').once("value", function (snapshot) {
    // console.log("+++++++++FOUND InBOX 2");
    /* CHECK IF THERE ARE UNREAD MESSAGES AND APPLY BADGE ACCORDINGLY */
    if (snapshot.numChildren() > 0) {
      document.getElementById('openInBox').style.background = 'red';
    }
    else {
      document.getElementById('openInBox').style.background = 'white';
    }
  });

  firebase.database().ref("/inBox/" + currentUser.appId + "/all/").orderByChild('timestamp').once("value", function (snapshot) {
    console.log("inbox - found these messages: ",snapshot.val())
    document.getElementById('openInBox').innerText = "Inbox " + (snapshot.numChildren());
    document.getElementById('badgeNum').innerText = snapshot.numChildren();
  })

}

function loadInBoxListeners() {
  //listen to further changes in InBox      
  firebase.database().ref("/inBox/" + currentUser.appId + "/new/").on("child_changed", function (snapshot) {
    console.log("a new inBox message changed!", snapshot.key);
    console.log("a new inBox message changed!", snapshot.val());


    if (googleSync == true) {

      if (snapshot.val().status == "meeting deleted") {

        //update the event that was deleted on the other side
        let eventToUpdate = snapshot.val().eventId
        let tempEventToGoogleUpdate = myCalendarAlt.getEventById(eventToUpdate)
        updateEventToGoogle(tempEventToGoogleUpdate)

        /* DO NOT DELETE----- DO NOT DELETE ----- 
        //delete the remining parts of the event if the delete cause a connect events
  
        if(snapshot.val().eventsToDelete !== undefined){
         // console.log("events to delete found: ",snapshot.val().eventsToDelete)
          let eventsToDelete = snapshot.val().eventsToDelete
          for(eachEvent in eventsToDelete){
           // console.log("this is the event id to delete: ",eventsToDelete[eachEvent])
            deleteEventToGoogle(eventsToDelete[eachEvent])
          }
        }
        DO NOT DELETE----- DO NOT DELETE ----- */
      }



    }
    
    /** Handle the new message */
    var ref = firebase.database().ref("/inBox/" + currentUser.appId + "/all/");
    ref.once("value")
      .then(function (snapshot) {
        var inBoxCount = snapshot.numChildren();
        document.getElementById('openInBox').innerText = "Inbox " + (snapshot.numChildren());
        document.getElementById('badgeNum').innerText = snapshot.numChildren();
      });

    /* add message to Inbox */
    // let newMessage = snapshotToArray(snapshot)
    //// console.log(newmessage);
    // let nM = snapshot.exportVal(); 
    // inBoxContentArray.push(nM)

    console.log("count in box 2", inBoxContentArray.length)
    console.log("count in box 2", inBoxContentArray)

    if (inBoxModalOpen == true) {
      openInBox();
    }
  })

  firebase.database().ref("/inBox/" + currentUser.appId + "/new/").on("child_added", function (snapshot) {
    console.log("a new inBox message added!", snapshot.key);
    console.log("a new inBox message details!", snapshot.val());
    //add the snap shot to the inBoxContentArray

    /*check the message and if need add to google:
      check if google sync is on */

    if (googleSync == true) {

      console.log("Message status: ", snapshot.val().status)

      
      //check for invite
      if (snapshot.val().status == "inviteRequest") {
        let tempEventToGoogleUpdate = myCalendarAlt.getEventById(snapshot.val().eventId)
        addEventToGoogle(tempEventToGoogleUpdate)
      }

      else if (snapshot.val().status == "invitation canceled") {
        let tempEventToGoogleUpdate = snapshot.val().eventId
        deleteEventToGoogle(tempEventToGoogleUpdate)
      }

      else if (snapshot.val().status == "inviteAccept") {

        let tempEventToGoogleUpdate = myCalendarAlt.getEventById(snapshot.val().eventId)
        console.log(tempEventToGoogleUpdate)
        let tempString = tempEventToGoogleUpdate.title
        console.log("new title: ", tempString)

        googleNewTitle = tempString.replace("Waiting acceptence from: ", "Accepted Invitation by: ")
        console.log("new title: ", googleNewTitle)
        updateEventToGoogle(tempEventToGoogleUpdate)
      }

      else if (snapshot.val().status == "request") {
        console.log("update google with the event: ", snapshot.val().eventId)

        let tempEventToGoogleUpdate = myCalendarAlt.getEventById(snapshot.val().eventId)
        updateEventToGoogle(tempEventToGoogleUpdate)
      }
      //check for delete
      else if (snapshot.val().status == "invite meeting deleted") {
        console.log("delete a meeting deleted ", snapshot.val().eventId)
        //update the event that was deleted on the other side
        let eventToUpdate = snapshot.val().eventId
        deleteEventToGoogle(snapshot.val().eventId)
        // googleEventToUpdateArray.push(snapshot.val().eventId)        
      }

      else if (snapshot.val().status == "booked meeting deleted") {
        console.log("delete a meeting deleted ", snapshot.val().eventId)

        /* GET THE EVENT FROM THE CAL SO I CAN UPDATE IT*/
        let tempEventToGoogleUpdate = myCalendarAlt.getEventById(snapshot.val().eventId)
        console.log(tempEventToGoogleUpdate)
        let tempString = tempEventToGoogleUpdate.title
        console.log("new title: ", tempString)

        allUsersSnapShot.forEach(function (child) {
          if (child.key === snapshot.val().sender) {

            otherUserName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);
            // otherUserName = child.val().name + " " + child.val().lastName
            console.log("Found a user with name: ", otherUserName)

            googleNewTitle = "Deleted by: " + otherUserName
            console.log("new new title: ", googleNewTitle)
            updateEventToGoogle(tempEventToGoogleUpdate)
            return true
          }

        })



        /* Hide the event from my Cal for now (allow option to open it later*/
        // console.log("found id: ",snapshot.val().eventId)
        // let tempEventToHide = myCalendarAlt.getEventById(snapshot.val().eventId)
        // console.log("here is the event to delte: ",tempEventToHide)
        // UpdateEventsOnCals(tempEventToHide)          
      }

      else if (snapshot.val().status == "Request deleted") {
        console.log("delete a waiting deleted ", snapshot.val().eventId)
        //update the event that was deleted on the other side
        // let  eventToUpdate = snapshot.val().eventId
        let tempEventToGoogleUpdate = myCalendarAlt.getEventById(snapshot.val().eventId)
        googleNewTitle = myFullName
        // tempEventToGoogleUpdate.title = currentUser.name + " " + currentUser.lastName
        console.log("should update google: ", tempEventToGoogleUpdate)
        updateEventToGoogle(tempEventToGoogleUpdate)
      }

      else if (snapshot.val().status == "decline Invitation") {
        console.log("google update decline invitation")

        /* GET THE EVENT FROM THE CAL SO I CAN UPDATE IT*/
        let tempEventToGoogleUpdate = myCalendarAlt.getEventById(snapshot.val().eventId)
        // console.log(tempEventToGoogleUpdate)
        // let tempString = tempEventToGoogleUpdate.title
        // console.log("new title: ",tempString)

        allUsersSnapShot.forEach(function (child) {
          if (child.key === snapshot.val().sender) {
            otherUserName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);
            // otherUserName = child.val().name + " " + child.val().lastName
            console.log("Found a user with name: ", otherUserName)

            googleNewTitle = "Invitation declined by: " + otherUserName
            console.log("new new title: ", googleNewTitle)
            updateEventToGoogle(tempEventToGoogleUpdate)
            return true
          }

        })

        // let  eventToUpdate = snapshot.val().eventId
        // deleteEventToGoogle(snapshot.val().eventId)
      }

      else if (snapshot.val().status == "inviteReq meeting deleted") {
        console.log("delete an invitation from the googleCal")
        let eventToUpdate = snapshot.val().eventId
        deleteEventToGoogle(snapshot.val().eventId)
      }

      else {
        console.log("got an unidintified message !")
      }

      //check for update
    }
    /* After getting the info from the message, discard it*/
    firebase.database().ref("/inBox/" + currentUser.appId + "/new/" + snapshot.key).remove()

    /* Change the inbox notification color and number! */
    firebase.database().ref("/inBox/" + currentUser.appId + "/all/").orderByChild('timestamp').once("value", function (snapshot) {
      document.getElementById('openInBox').innerText = "Inbox " + (snapshot.numChildren());
      document.getElementById('badgeNum').innerText = snapshot.numChildren();
      if (inBoxModalOpen == true) {
        openInBox();
      }
      else {
        document.getElementById('openInBox').style.background = 'red';
      }
    })
  })

  firebase.database().ref("/inBox/" + currentUser.appId + "/new/").on("child_removed", function (snapshot) {
    console.log("a new inBox message removed!", snapshot.key);
  })
}

function snapshotToArray(snapshot) {
  var returnArr = [];

  snapshot.forEach(function (childSnapshot) {
    var item = childSnapshot.val();
    item.key = childSnapshot.key;

    returnArr.push(item);
  });

  return returnArr;
};

//listen to messages if there is a new message in one of the chats

firebase.database().ref("messages").on("child_changed", function (snapshot) {
  snapshot.forEach(function (child) {
    //// console.log(child.val().timestamp);
  });
  
  //change the chat icon to green only if the currnet chat with user is not open
  if (chatModalOpen == true) {
    let senderName = filteredUserInfo.name.charAt(0).toUpperCase() + filteredUserInfo.name.slice(1) + " " + filteredUserInfo.lastName.charAt(0).toUpperCase() + filteredUserInfo.lastName.slice(1);
    // let senderName = filteredUserInfo.name + " " + filteredUserInfo.lastName;
    // console.log("found user: ", senderName)

    //  if (filteredUserInfo.appId != snapshot.val().creator ){

    //  }
  }
  if (snapshot.val().to == currentUser.appId) {
    document.getElementById("chatIcon" + snapshot.val().creator).color = "red";
  }
  else if (snapshot.val().creator == currentUser.appId) {
    document.getElementById("chatIcon" + snapshot.val().to).color = "red";
  }

});

//listen to messages if there is a new chat request
//startAt(Date.now())
firebase.database().ref("messages").on("child_added", function (snapshot) {
  //check if a chat was initated
  // console.log("a new snap: ", snapshot);
  string = snapshot.val();
  var inventer = snapshot.val().creator;
  // console.log("inventer :" + inventer);


  //check if the user is part of the code

  if (snapshot.val().to == currentUser.appId) {

    //check if status is waiting
    if (snapshot.val().status == "waiting")
      firebase.database().ref('users/').orderByChild("appId").equalTo(inventer).on('value', function (snap) {

        // console.log("inventor step2: " + snap.val());
        snap.forEach(function (child) {
          // console.log(child.val().name);
          let chatInventer = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

          // let chatInventer = child.val().name + " " + child.val().lastName;
          //notify user of a new chat request
          r = confirm("You are invited for a chat with " + chatInventer + "Click Yes to open the chat window." +
            "\n or cancel to continue, you can always find the chat invite in your inbox or through the userList");
          if (r == true) {
            firebase.database().ref('messages/' + snapshot.key).update(
              {
                status: "onGoing"
              });
            //open the chat window
            openChat(inventer)
          }
          else {
            //decline? park?
            firebase.database().ref('messages/' + snapshot.key).update(
              {
                status: "onGoing"
              });

          }

          updatesArray.push({
            key: snapshot.key,
            sender: snapshot.val().creator
          })
        });
      });

  } else {
    //notify user of a new chat messages
    // console.log("there is a new chat message waiting from: ", snapshot.val().sender);
  }
});

//--listen to changes on firebase main thread!
// Get a reference to the database service
var database = firebase.database();
var usersRef = database.ref('/users/');
var colorArray = [];


//LISTEN TO CHANGES ON FIREBASE MAIN THREAD
function loadAllData_firebase(){

  if(allowUpdate == true){
    firebase.database().ref('/users').once('value', function (snapshot) {
      console.log('loadAllData_firebase');  
      if (window.location.href.includes("welcome")) {
        return;
      }
      allUsersSnapShot = snapshot;
      
      allUsersSnapShot.forEach(function (child) {
        if (child.val().appId == currentUser.appId) {
          currentUser.calArray = child.val().calArray;
          if (currentUser.calArray === undefined) {
            currentUser.calArray = [];
          }        
          console.log("This is the new calArray: ",currentUser.calArray)
        }
      });
      UpdateCalendars();
    });
  }  
}

function loadMainPage() {

  // console.log("============Allow Init cal: ", allowInit);
  document.getElementById('normalColor').style.color = color_normal_me;
  // document.getElementById('guestColor').style.color = color_guest_me;
  // document.getElementById('otherGuestColor').style.color = color_guest;
  document.getElementById('otherColor').style.color = color_main;
  document.getElementById('waiting').style.color = color_toBook;
  document.getElementById('booked').style.color = color_booked;
  document.getElementById('inviteColor').style.color = color_invite;
  document.getElementById('deleteColor').style.color = color_deleted;
  document.getElementById('specialColor').style.color = color_special;
  document.documentElement.style.setProperty('--color_normal_me', color_normal_me);
  document.documentElement.style.setProperty('--color_main', color_main);
  document.documentElement.style.setProperty('--color_toBook', color_toBook);
  document.documentElement.style.setProperty('--color_booked', color_booked);
  document.documentElement.style.setProperty('--color_deleted', color_deleted);
  document.documentElement.style.setProperty('--color_invite', color_invite);
  document.documentElement.style.setProperty('--color_special', color_special);
  colorArray = {
    'normalColor': color_normal_me,
    'guestColor': color_guest_me,
    'otherGuestColor': color_guest,
    'otherColor': color_main,
    'waiting': color_toBook,
    'booked': color_booked,
    'invite': color_invite,
    'deleted': color_deleted,
    'special': color_special,
  };
  /*
  if (allowInit == true) {
  }
  else {
    allowInit = true;
  }*/
  InitCal();
 
}


usersRef.startAt(Date.now()).on('child_added', function(snapi) {
 // console.log('new record', snapi.key);
  if(snapi.val().appId == currentUser.appId){
    //// console.log("MeFound !");
    return;

  }

 // console.log('new record', snapi.key);
  displayMessage(snapi);
});

// usersRef.startAt(Date.now()).on('child_changed', function(snapi) {
//  // console.log('new record', snapi.key);
//   if(snapi.val().appId == currentUser.appId){
//     //// console.log("MeFound !");
//     return;

//   }

//  // console.log('new record', snapi.key);
//   displayMessage(snapi);
// });

// usersRef.startAt(Date.now()).on('child_removed', function(snapi) {
//  // console.log('new record', snapi.key);
//   if(snapi.val().appId == currentUser.appId){
//     //// console.log("MeFound !");
//     return;

//   }

//  // console.log('new record', snapi.key);
//   displayMessage(snapi);
// });



// usersRef.on('child_added', (snapshot) => {

//   //// console.log('user was added !! ',snapshot.val().name);
//   if(snapshot.val().appId == currentUser.appId){
//     //// console.log("MeFound !");
//     return;

//   }
//   else{
//     // test();
//     // update (in the bg?) - users lists, data, fieldsof interest, and events!
//   }

//   // firebase.database().ref('/users/').once('value').then(function(snapshot) {
//   //   // var username = (snapshot.val()) || 'Anonymous';
//   //   allUsersSnapShot = snapshot;
//   //   localStorage.setItem("allUsersSnapShot", JSON.stringify(allUsersSnapShot));
//   // });
// });

// usersRef.on('child_removed', (snapshot) => {
//   // console.log('data was removed !! ', snapshot.val().name);
//   if (snapshot.val().appId == currentUser.appId) {
//     //// console.log("MeFound !");
//     return;

//   }
//   // firebase.database().ref('/users/').once('value').then(function(snapshot) {
//   //   // var username = (snapshot.val()) || 'Anonymous';
//   //   allUsersSnapShot = snapshot;
//   //   localStorage.setItem("allUsersSnapShot", JSON.stringify(allUsersSnapShot));
//   // });
// });


usersRef.on('child_changed', (snapshot) => {
  console.log('child_changed and IGNORED !! ')
  return

  console.log('child_changed data was cahanged by !! ', snapshot.val().name);
  console.log('child_changed data was cahanged by id !! ', snapshot.val().appId);
  console.log('data was cahanged current user!! ', currentUser.appId);

  let myself = currentUser.appId
  let other = snapshot.val().appId

  if (myself !== other) {
    console.log("child_changed other !", snapshot.val());
  }
  else {
    console.log("child_changed MeFound !", snapshot.val().title);
  }
  //  console.log('data was cahanged !! ', snapshot.val().extendedProps.appId);
  console.log("sourceCal ", sourceCal)
  if (snapshot.val().appId === currentUser.appId) {
    // console.log("MeFound !", snapshot.key);
    console.log("child_changed MeFound !", snapshot.val().title);
    return;

  }

  else if (snapshot.val().appId !== currentUser.appId) {
    allowUpdate = true;
    if (sourceCal == "single" || sourceCal == "singleInvite") {
      console.log("reacting in source cal single")
      // console.log("checking events in a single cal with: ", eventSingle.id)
      // console.log(snapshot.currentUser.calArray.length)

      // console.log(snapshot.currentUser.calArray.length)
      for (i = 0; i < currentUser.calArray.length; i++) {
        let tempEvent = JSON.parse(snapshot.currentUser.calArray[i])
        // console.log(JSON.parse(snapshot.currentUser.calArray[i]).id)
        // console.log("checking now: ", tempEvent)
        // console.log("checking now: ", tempEvent.id)
        if (tempEvent.id == eventSingle.id) {
          console.log("found a matching event record ")
          if (tempEvent === eventSingle) {
            console.log("no chancg")
          }
          else {
            console.log("there is a change")
          }
        }
        allowUpdate = false;
      }
    }
  }

});


firebase.database().ref("status").on('child_changed', (snapshot) => {
  //// console.log("there is a change on status for: ",snapshot.key + "with status: ",snapshot.val().status);
  setActivitynotify(snapshot.key, snapshot.val().status)
});

firebase.database().ref("status").on('child_added', (snapshot) => {
  //// console.log("there is a new status for: ",snapshot.key + "with status: ",snapshot.val().status);
  setActivitynotify(snapshot.key, snapshot.val().status)
});










