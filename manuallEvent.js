var addeventModalOpen = false; //BOOL IS "ADD MANUAL EVENT MODAL" OPEN
var UserManualselector = [] //THE USER SELECTOR ELEMENT IN THE "ADD MANUAL EVENT" MODAL

document.addEventListener('DOMContentLoaded', function() { 
  UserManualselector = new Selectr(document.getElementById("selectUserManual"),{
    clearable: true,
  })
})

function openAddEventManually(info) {
  console.log("openAddEventManually");
  
  addeventModalOpen = true;

  const input = document.getElementById('dateInput');
  datepicker = new TheDatepicker.Datepicker(input);

  datepicker.render();
  datepicker.options.setMinDate(moment().format('YYYY-MM-DD'));
  datepicker.options.setInputFormat('d-m-Y');

  // if date is clicked open the createeevent with data from the click
  if (info !== undefined) {
    // get the clicked date
    let date = moment(info.dateStr).format('DD-MM-YYYY')

    //pass the clicked date to the picker
    const input = document.getElementById('dateInput');
    input.value = date;

    //populate the start time from the clicked date
    let startTime = moment(info.dateStr).format('HH:mm')
    console.log(startTime)
    let endTime = moment(startTime, 'HH:mm:ss').add(60, 'minutes').format('HH:mm');
    console.log(endTime)

    // let tempStart = $('#datetime15').combodate();
    $('#datetime15').combodate('setValue', startTime);
    $('#datetime16').combodate('setValue', endTime);

  }

  var modal = document.getElementById("myModal");  
  var span = document.getElementsByClassName("closeManualEvent")[0];

  buildUsersSelectorManual()

  modal.style.display = "block";
  

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    console.log("close");
    modal.style.display = "none";
    datepicker.destroy();
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      datepicker.destroy();
    }
  }

  $(document).keyup(function (e) {
    console.log(addeventModalOpen);

    if (e.key === "Escape") { // escape key maps to keycode `27`
      if (addeventModalOpen == true) {
        addeventModalOpen = false;
        modal.style.display = "none";
        datepicker.destroy();
      }
    }
  });
}

function buildUsersSelectorManual(){
  console.log("++++ buildUsersSelectorManual ++++ ")
  UserManualselector.removeAll()

  // // UserManualselector = new Selectr(document.getElementById("selectUserManual"),{
  // //   clearable: true,
  // // }
  // ); 
  usersResourceList.forEach(function(item)
    {  
        if(item.id != currentUser.appId){
          UserManualselector.add({
                value: item.id,
                text: item.title
            });            
        }        
    }); 
  UserManualselector.on('selectr.select', function(option) {
      console.log("selector slecetd: ",UserManualselector.getValue())
      //check if this is open from invite or list
  });    
}


function writeManualEvent() {

  const input = document.getElementById('dateInput');
  console.log(input.value);
  let chosenDate = moment(input.value, 'DD-MM-YYYY');
  console.log(chosenDate);


  //verify time input 
  let tempDate = moment(input.value, 'DD-MM-YYYY').format('YYYY-MM-DD');
  console.log(tempDate);
  if(tempDate == "Invalid date"){
    alert("Please choose a date for your session.")
    return
  }
  // console.log(moment(tempDate)format('YYYY-DD-MMMM'));


  let tempStart = $('#datetime15').combodate('getValue');
  console.log(tempDate + " " + tempStart);

  let startTime = moment(tempDate + " " + tempStart);
  // console.log(startTime.format('YYYY-DD-MMMM'));

  // var startTime = moment(tempStart).format('MM DD YYYY') + ' ' + moment(tempStart, "HH:mm a");
  var t2 = moment(startTime).format();
  console.log(t2);

  t1 = moment(t2).format('YYYY-MM-DD') + t2.slice(10);


  let tempEnd = $('#datetime16').combodate('getValue');
  var endTime = moment(tempDate + " " + tempEnd);
  var t3 = moment(endTime).format();
  // console.log(t3);
  // console.log(t3.slice(10));
  t4 = moment(t3).format('YYYY-MM-DD') + t3.slice(10);
  console.log(t1 + " / " + t4);


  if (startTime.isAfter(endTime)) {
    console.log("oops");
    alert("Please set a proper start and end time.")
    return
  }
  else if (endTime.isAfter(startTime)) {
    console.log("time is ok");
    // console.log("day of hte week: ",(moment(t1).isoWeekday()));       

    // return;
    // let r = Math.random().toString(36).substring(2);
    var r = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "")
    var allowGuest = false;
    var bgColor = color_normal_me;
    if (document.getElementById('acceptGuest_default').checked == true) {
      allowGuest = true;
      bgColor = color_guest_me;
    }
    let myEvent = {};
    if (document.getElementById('repeatEvent').checked == true) {
      alert("Repeat Event is not available yet, please uncheck it to continue");
      return;
      //repeating event
      myEvent = {
        resourceId: currentUser.appId,
        id: r,
        title: myFullName,
        // startRecur: t1,
        start: t1,
        // end: t4,
        allDay: false,
        editable: true,
        draggable: true,
        eventStartEditable: true,
        droppable: true,
        groupId: "123",

        duration: "01:00",
        daysOfWeek: [moment(t1).isoWeekday()],
        // groupId: 'blueEvents',           
        extendedProps: {
          description: "open/" + currentUser.luid,
          // status:"open",           
          appId: currentUser.appId,
          // auther: currentUser.name,
          acceptGuest: allowGuest
        },


      };
    }
    else {

      


      let detailsText = document.getElementById('eventDetailsTextField').value;
      myEvent = {
        resourceId: currentUser.appId,
        id: r,
        title: myFullName,
        start: t1,
        end: t4,
        allDay: false,
        editable: true,
        draggable: true,
        eventStartEditable: true,
        droppable: true,

        extendedProps: {
          details: detailsText,
          description: "open/" + currentUser.luid,
          appId: currentUser.appId,
          acceptGuest: allowGuest
        }
      };
    }
    console.log(myEvent);

    //add the event to calendar
    // myCalendar.addEvent(myEvent);

    myCalendarAlt.addEvent(myEvent);
    myCalendarAlt.getEventById(myEvent.id).setStart(t1);
    currentUser.calArray.push(JSON.stringify(myEvent))

    if(googleSync ==true){
      addEventToGoogle(myEvent)
    }

    allowUpdate = false;
    writeCalArrayTo_firbase(myEvent.id);

    var modal = document.getElementById("myModal");
    modal.style.display = 'none';
    datepicker.destroy();

    /* INVITE A USER IF A USER WAS CHOSEN */
    let chosenUser = UserManualselector.getValue()
    console.log(chosenUser);
    if(chosenUser != null){
      console.log("invite a user")
      inviteUserFromManual(myEvent)
    }    
  }
  else {
    console.log("equeel");
    alert("Please set a proper start and end time.")
    return

  }
}

function inviteUserFromManual(myEvent){
  console.log("inviteUserFromManual");

  // inviting a user
  let userToInviteAppId = UserManualselector.getValue()      
  console.log("sendInvite - user to invite appId: ",userToInviteAppId);
  /* Find the user to invite details*/
  var localUsers = allUsersSnapShot.toJSON();
  allUsersSnapShot.forEach(function(child) 
  {
      if(child.val().appId == userToInviteAppId){
          console.log(child.val().email);

          /* SEND AN EMAIL TO THE USER ABOUT THE INVITE*/
          let userToInviteEmail = child.val().email;
          let userToInviteName =  child.val().name;
          let userToInviteLastName = child.val().lastName;
          let mailBody = "Hello " + userToInviteName + ".\n " + myFullName + " is inviting you to an event on " + moment(myEvent.start).format('dddd') + " " + moment(myEvent.start).format('DD.MM.YYYY') + " starting at: " + moment(myEvent.start).format('HH:mm') + " ending at: " + moment(myEvent.end).format('HH:mm');
          mailBody += "Please click the following link to access this event: www.roiwerner.com/gse5/pubCal.html?&invite="+myEvent.id;
          if (inviteTextAreaField.value.length >0){
              let inviteTextAreaField = document.getElementById('inviteTextAreaField');
              mailBody += "\n \n A message was sent as well: \n"+inviteTextAreaField.value;
              inviteTextAreaField.value = "";
          }

          console.log(mailBody);
          if(sendEmails == true)
          {
              Email.send({
                  Host: "smtp.ipage.com",
                  Username : "roi@roiwerner.com",
                  Password : "Roki868686",
                  To : userToInviteEmail,
                  From : "<roi@roiwerner.com>",
                  Subject : "Session Invitation",
                  Body : mailBody,
                  }).then(
                  message => alert("mail sent successfully")
              ); 
          }

          /* UPDATE THE EVENT ON MYSIDE = ORIGINAL SIDE*/
          for (var i = 0; i < currentUser.calArray.length; i++) {
              // console.log(myEvent.id)
              let curEvent = JSON.parse(currentUser.calArray[i]);
              // console.log(currentUser.calArray[i].id)
              
              /* FIND THE EVENT TO*/
              if (curEvent.id == myEvent.id){
                  
                  console.log("event Found: ",curEvent.id);
                  curEvent.extendedProps.description = "inviteRequest/" + currentUser.luid + "/" + child.key +"/" + curEvent.id;
                  curEvent.backgroundColor = color_invite;
                  curEvent.editable = false;
                  console.log(curEvent);
                  currentUser.calArray.splice(i,1);
                  currentUser.calArray.push(JSON.stringify(curEvent));
                  // console.log(currentUser.calArray);
                  
                  // myCalendar.getEventById(curEvent.id).remove();
                  myCalendarAlt.getEventById(curEvent.id).remove();
                  // myCalendar.addEvent(curEvent);
                  myCalendarAlt.addEvent(curEvent);

                  inBoxText_Invite = myFullName + " is inviting you to an event on " + moment(myEvent.start).format('dddd') + " " + moment(myEvent.start).format('DD.MM.YYYY') + " starting at: " + moment(myEvent.start).format('HH:mm') + " ending at: " + moment(myEvent.end).format('HH:mm');

                  /* send a message to the other side - ivnitee */
                  console.log("inviteText: ", inBoxText_Invite)
                  firebase.database().ref("inBox/" + userToInviteAppId + "/new/" + curEvent.id).set({
                      "sender": currentUser.luid,
                      "message": inBoxText_Invite,
                      "status": "inviteRequest",
                      "eventId": curEvent.id,
                      "timestamp": firebase.database.ServerValue.TIMESTAMP 
                  });
                  firebase.database().ref("inBox/" + userToInviteAppId + "/all/" + curEvent.id).update({
                      "sender": currentUser.luid,
                      "message": inBoxText_Invite,
                      "status": "inviteRequest",
                      "eventId": curEvent.id,
                      "timestamp": firebase.database.ServerValue.TIMESTAMP,
                      "eventTs": moment(curEvent.start).valueOf(), 
                  });

                  if(googleSync == true){
                      googleNewTitle = "Invite Waiting acceptence from: " + userToInviteName + " " + userToInviteLastName
                      updateEventToGoogle(curEvent)
                  }

                  //saveTofirebased
                  allowUpdate = false;
                  writeCalArrayTo_firbase();

                  //CLOSE THE MODAL_INVITE
                  textModalOpen = false;
                  // modalInvite.style.display = "none";
                  backToCal();
                  break;
              }                    
          } 
      }
  });
  
}

storedYpos = 0;
joinEventManuallyBool = false
function joinEventManually(){
  console.log("joinEventManually with bool value ",joinEventManuallyBool );
  // show a list of only open events!
  //get list of open events only

  if (joinEventManuallyBool == false){
    
    getYpos()
    joinEventManuallyBool = true;
    var mySelect = document.getElementById("foiSelector1");
    var fieldName = mySelect.value;  
    console.log("call FOI filter "); 
    filterResourcesFOI(fieldName);

    // call the list view
    if(listDisplay == false){
      console.log("show as list from joint event manually")
      list_display = true;
      showAsList()
    }
    document.getElementById("joinEventManually").innerText = "Back to cal"
    
  }
  else {
    joinEventManuallyBool = false;
    var mySelect = document.getElementById("foiSelector1");
    var fieldName = mySelect.value;  
    console.log("call FOI filter "); 
    filterResourcesFOI(fieldName);
    list_display = false;
    showAsList()
    setYpos()
    document.getElementById("joinEventManually").innerText = "Join Events"
  }
}

