var currentUser = JSON.parse(localStorage.getItem("currentUser"));
calendar = FullCalendar;
// console.log(currentUser);
var eventi = [];
var reqEvent=[];

var event1 = [];
var event2 = [];
var event3 = [];

allowInit = false;
var requestingUserId = "";
const queryString = window.location.search;
// console.log(queryString);


if (queryString){
  const urlParams = new URLSearchParams(queryString);  
  requestKey = urlParams.get('key')
  // console.log(requestKey);

  firebase.database().ref('/requests/' + requestKey).once('value').then(function(snapshot) {
      
      const userData = snapshot.val();
      console.log(userData);
      if(userData != null){

      }
      else{
        console.log("redirect");
        
        window.location.href = "../gse5/publicCalendar.html";
        return;

      }
      requestingUserId = snapshot.val().requestBy;

      eventi = JSON.parse(snapshot.val().origEvent);
      console.log(eventi.extendedProps.acceptGuest);

      reqEvent = JSON.parse(snapshot.val().requestedEvent);
      console.log(reqEvent);

      buildCal();

      let myself = myFullName;
      console.log(myself);
      let bookedTitled = "requested by: " + reqEvent.extendedProps.auther;
      console.log(bookedTitled);
      
      
      // console.log(snapshot.val().requestBy);
      if (eventi.start == reqEvent.start && eventi.end == reqEvent.end){
        console.log("same time");
        event1= {id:1 , title: bookedTitled, start: eventi.start, end: eventi.end, backgroundColor: 'red',extendedProps:{
          acceptGuest : 'booked',
          appId: currentUser.appId,
          auther: currentUser.name,
          requestby: requestingUserId,

          droppable: false
        },};
        
        calendar.addEvent(event1);
        ccase = 1;
        
      }
      else if (eventi.start < reqEvent.start && eventi.end == reqEvent.end){
        console.log("start later");

        event1= {id:1 , title: myself, start: eventi.start, end: reqEvent.start, backgroundColor: color_normal_me, extendedProps:{
          acceptGuest : eventi.extendedProps.acceptGuest,
          appId: currentUser.appId,
          auther: currentUser.name,
          droppable: false
        },
      
      };
        event2= {id:2 , title: bookedTitled, start: reqEvent.start, end: eventi.end, backgroundColor: 'red',extendedProps:{
          acceptGuest : 'booked',
          appId: currentUser.appId,
          auther: currentUser.name,
          requestby: requestingUserId,
          droppable: false
        },};
                            
        calendar.addEvent(event1);                    
        calendar.addEvent(event2);                                                           
        ccase = 2;
        
      }
      else if (eventi.start < reqEvent.start && eventi.end > reqEvent.end){
        console.log("start later end before");
        const tempEvent = eventi;

        event1= {id:1 , title: myself, start: eventi.start, end: reqEvent.start, backgroundColor: color_normal_me, extendedProps:{
          acceptGuest : eventi.extendedProps.acceptGuest,
          appId: currentUser.appId,
          auther: currentUser.name,
          droppable: false
        },};
        event2= {id:2 , title: bookedTitled, start: reqEvent.start, end: reqEvent.end,backgroundColor: 'red',extendedProps:{
          acceptGuest : 'booked',
          appId: currentUser.appId,
          auther: currentUser.name,
          requestby: requestingUserId,
          droppable: false
        },};
        event3= {id:3 , title: myself, start: reqEvent.end, end: eventi.end, backgroundColor: color_normal_me, extendedProps:{
          acceptGuest : eventi.extendedProps.acceptGuest,
          appId: currentUser.appId,
          auther: currentUser.name,
          droppable: false
        },};
                            
        calendar.addEvent(event1);                    
        calendar.addEvent(event2);                                                           
        calendar.addEvent(event3);
        ccase =3;

        
      }
      else if (eventi.start == reqEvent.start && eventi.end > reqEvent.end){
        console.log("start same end before");
        event1= {id:1 , title: bookedTitled, start: eventi.start, end: reqEvent.end, backgroundColor: 'red',extendedProps:{
          acceptGuest : 'booked',
          appId: currentUser.appId,
          auther: currentUser.name,
          requestby: requestingUserId,
          droppable: false
        },};
        event2= {id:2 , title: myself, start: reqEvent.end, end: eventi.end,backgroundColor: color_normal_me, extendedProps:{
          acceptGuest : eventi.extendedProps.acceptGuest,
          appId: currentUser.appId,
          auther: currentUser.name,        
          droppable: false
        },};
                            
        calendar.addEvent(event1);                    
        calendar.addEvent(event2);                     
        ccase =4;
        
      }
                                           
      // calendar.addEvent(reqEvent);
      console.log(calendar.getEvents());
      
  });
}
  

function buildCal(){
  var calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {

            initialView: 'timeGridDay',
            allDaySlot: false, 
            selectable: true,
            editable: false,
            droppable: false, 
            eventResizableFromStart: true,
            slotDuration: ('00:15:00'),
            slotMinTime: moment(eventi.start).format('HH:mm:ss'),
            slotMaxTime: moment(eventi.end).format('HH:mm:ss'),
            // height: (window.innerHeight)/2,
            
            eventContent: { domNodes: [] },
            eventContent: function(arg) {
                let italicEl = document.createElement('p')

                    // if (arg.event.id == '1') {
                    //     italicEl.innerHTML = arg.event.title
                    // } else {
                    //     italicEl.innerHTML = arg.event.title
                    // }
                    italicEl.innerHTML = arg.event.title
                    let arrayOfDomNodes = [ italicEl ]
                    return { domNodes: arrayOfDomNodes }
            },
                
            events: [
                {
                  // id: eventi.id,
                  // title: eventi.title,
                  // start: eventi.start,
                  // end: eventi.end,
                  // draggable: false,
                  // display: 'background' 
                  
                //   slotMinTime: eventi.start,

                }
                
              ]                 
        });        
        
        calendar.render();
        // console.log(eventi);
        
        // calendar.addEventSource(eventi);
        calendar.gotoDate(eventi.start);   
        var timeSlotArray =document.getElementsByClassName("fc-event-draggable");
        var timeSlot = timeSlotArray[timeSlotArray.length-1];
}

var confirmed = true;

function confirmEvent(){
  console.log("confirm");
  confirmed = true;
  //open Text
  openTextModal();
}


function sendConfirmation(){
  console.log("confirm");

  
  
  
  //get requesting user email
  firebase.database().ref('/users/'+requestingUserId).once('value').then(function(snapshot){
    
    userEmail = snapshot.val().email;
    nameTosend = snapshot.val().name;

    //open Text
    let textAreaField = document.getElementById("textAreaField");

    let mailBody = "Hellooooooo " + nameTosend + ".\n " + currentUser.name + " approved your session request\n"+
                    "The request has been updated in your calendar";

    if (textAreaField.value.length >0){
      mailBody += "\n \n A message was sent as well: \n"+textAreaField.value;
      textAreaField.value = "";
    }
    console.log(mailBody);       
    Email.send({
        Host: "smtp.ipage.com",
        Username : "roi@roiwerner.com",
        Password : "Roki868686",
        To : userEmail,
        From : "<roi@roiwerner.com>",
        Subject : "Session request approved",
        Body : mailBody,
        }).then(
          message => alert("mail sent successfully")
      ); 

    //--update the reqested event on the requestBy side
    
    var tempArray = snapshot.val().calArray
    console.log(tempArray);
    

    for (e in tempArray){
      let element = JSON.parse(tempArray[e])
      console.log(element.id + ":" + reqEvent.id);
      if(element.id == reqEvent.id){
        element.title = "Confirmed by "+myFullName;
        element.backgroundColor = "red";
        element.extendedProps.acceptGuest = "booked";
        element.extendedProps.approvedBy = currentUser.luid;
        tempArray[e] = JSON.stringify(element);
        console.log("tempArray ",tempArray);
        
        firebase.database().ref('/users/'+requestingUserId).update({
          calArray: tempArray
        });
        break;        
      }      
    }
    // return;
    //--update the event on the currentUser based on the split choice
    console.log(currentUser.luid);
    var tempUserArray = [];

    firebase.database().ref('/users/'+currentUser.luid).once('value').then(function(snap){
      tempUserArray = snap.val().calArray;

      for (e in tempUserArray){
        let element = JSON.parse(tempUserArray[e]);
        
        if (element.id == eventi.id){
          console.log(element);
          tempUserArray.splice(e,1);        
  
          if (event1Trimmed == false & event1.length != 0){ 
            event1.id = Math.random().toString(36).substring(2); 
            if(event1.extendedProps.acceptGuest == "booked"){
              event1.id = reqEvent.id;
            }                    
            tempUserArray.push(JSON.stringify(event1));
          }
          if (event2Trimmed == false & event2.length != 0){
            event2.id = Math.random().toString(36).substring(2); 
            if(event2.extendedProps.acceptGuest == "booked"){
              event2.id = reqEvent.id;
            } 
            tempUserArray.push(JSON.stringify(event2));
          }
          if (event3Trimmed == false & event3.length != 0){
            event3.id = Math.random().toString(36).substring(2); 
            if(event3.extendedProps.acceptGuest == "booked"){
              event3.id = reqEvent.id;
            } 
            tempUserArray.push(JSON.stringify(event3));
          } 
          console.log("tempUserArray ",tempUserArray);  
          
          // -- update the current user in firebase
          firebase.database().ref('/users/'+currentUser.luid).update({
            calArray: tempUserArray
          },function(error, committed, snapshot) {
            if (error) {
              console.error(error);
            } else {
              //delete the request from 'requests'
              firebase. database().ref('/requests/'+requestKey).remove(); 
              console.log("tempUserArray ",tempUserArray); 
              // tempUserArray = currentUser.calArray;
              
              //go back to main window
              window.location.href = "../gse5/publicCalendar.html";
            }
            
          });
          break;          
        }      
      }
      
    });
  });  
}

function decline(){
  console.log("decline");
  confirmed = false;
  openTextModal();

}
function sendDecline(){
  console.log("sendDecline");
  //get requesting user email
  firebase.database().ref('/users/'+requestingUserId).once('value').then(function(snapshot){
    console.log(requestingUserId);
    
    userEmail = snapshot.val().email;
    nameTosend = snapshot.val().name;
    console.log(userEmail);

    

    let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " has declined your session request\n"+
                    "The request has been deleted from your calendar";
    console.log(mailBody);

    //open Text
    let textAreaField = document.getElementById("textAreaField");        
    if (textAreaField.value.length >0){
      mailBody += "\n \n A message was sent as well: \n"+textAreaField.value;
      textAreaField.value = "";
    }
        
    Email.send({
        Host: "smtp.ipage.com",
        Username : "roi@roiwerner.com",
        Password : "Roki868686",
        To : userEmail,
        From : "<roi@roiwerner.com>",
        Subject : "Session request not approved",
        Body : mailBody,
        }).then(
          message => alert("mail sent successfully")
      ); 

    //delete the reqested event from firebase
    var tempArray = snapshot.val().calArray
    for (e in tempArray){
      let element = JSON.parse(tempArray[e])
      // console.log(element);
      if(element.id == reqEvent.id){
        console.log("event to delete found ", element.id + " " + snapshot.key);
        tempArray.splice(e ,1);
        console.log(tempArray);
        
        firebase.database().ref('/users/'+requestingUserId).update({
          calArray: tempArray
        });
        break;        
      }      
    }

    // set the event back to open state on user cal




    console.log(currentUser.luid);
    var tempUserArray = [];

    firebase.database().ref('/users/'+currentUser.luid).once('value').then(function(snap){
      tempUserArray = snap.val().calArray;

      for (e in tempUserArray){
        let element = JSON.parse(tempUserArray[e]);
        
        if (element.id == eventi.id){
          console.log(element);
          tempUserArray.splice(e,1); 
          // origEvent.extendedProps.description = "";
          element.extendedProps.description = "";

          console.log(element);
          // console.log(origEvent);
          // origEvent.setExtendedProp('description', "");                
          tempUserArray.push(JSON.stringify(element));
          
          console.log("tempUserArray ",tempUserArray);  
          
          // -- update the current user in firebase
          firebase.database().ref('/users/'+currentUser.luid).update({
            calArray: tempUserArray
          },function(error, committed, snapshot) {
            if (error) {
              console.error(error);
            } 
            
          });
          break;          
        }      
      }
      
    });

    //delete the request from 'requests'
    firebase.database().ref('/requests/'+requestKey).remove();

  });

  window.location.href = "../gse5/publicCalendar.html";

}
var isTrimmed = false;
var event1Trimmed = false;
var event2Trimmed = false;
var event3Trimmed = false;

function trimEvent(){
  isTrimmed = true;
  console.log("trim " ,ccase);
  let trimB = document.getElementById('trimB');
  trimB.innerHTML = "Undo trim";
  trimB.setAttribute('onclick', 'undoTrim()');

  if(ccase == 0){

  }
  else if(ccase == 1){ //same time
    // eventt1.remove();
    // event1="";

  }
  else if(ccase ==2){ //start later
    var eventTodelete = calendar.getEventById('1');
    eventTodelete.remove();
    event1Trimmed = true;
    // event1=[];
  }
  else if(ccase ==3){ //start later end early
    
    var eventTodelete = calendar.getEventById('1');
    eventTodelete.remove();
    var eventTodelete = calendar.getEventById('3');
    eventTodelete.remove();
    // event1 = [];
    // event3 = [];
    event1Trimmed = true;
    event3Trimmed = true;

  }
  else{ //end early
    var eventTodelete = calendar.getEventById('2');
    eventTodelete.remove();
    event2Trimmed = true;
    // event2=[];

  }
}

function undoTrim(){
  isTrimmed = false;
  event1Trimmed = false;
  event2Trimmed = false;
  event3Trimmed = false;

  let trimB = document.getElementById('trimB');
  trimB.innerHTML = "Trim";
  trimB.setAttribute('onclick', 'trimEvent()');
  if(ccase == 0){

  }
  else if(ccase == 1){ //same time
    // eventt1.remove();
    // event1="";

  }
  else if(ccase ==2){ //start later
    // var eventTodelete = calendar.getEventById('1');
    // eventTodelete.remove();
    // event1=[];
    calendar.addEvent(event1);
  }
  else if(ccase ==3){ //start later end early
    
    // var eventTodelete = calendar.getEventById('1');
    // eventTodelete.remove();
    // var eventTodelete = calendar.getEventById('3');
    // eventTodelete.remove();
    // event1 = [];
    // event3 = [];

    calendar.addEvent(event1);
    calendar.addEvent(event3);

  }
  else{ //end early
    // var eventTodelete = calendar.getEventById('2');
    // eventTodelete.remove();
    // event2=[];
    calendar.addEvent(event2);

  }
}


function cancel(){
 let r =  confirm ("Cacnel - you will be redirected to the calendar and can choose to confirm at another time"); 
  if (r == true){
    window.location.href = "../gse5/publicCalendar.html";
  }
  

}


function openTextModal(message){
  var modal = document.getElementById("textArea");  
  var span = document.getElementsByClassName("close")[0]; 
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      // modal.style.display = "none";
    }
  }

}

var textTosend = "";
function submit(){
   
  console.log("submit");
  var modal = document.getElementById("textArea");  
  modal.style.display = "none";
  if (confirmed == true){
    sendConfirmation();
  }
  else{
    sendDecline();
  }
  
}

function clearText(){  
  console.log("clearText");
  let textAreaField = document.getElementById("textAreaField");
  console.log(textAreaField.value);
  textAreaField.value = "";
}


function test(){
  console.log("cancel");  
  let r =  confirm ("Cacnel - you will be redirected to the calendar and can choose to confirm at another time"); 
  if (r == true){
    window.location.href = "../gse5/publicCalendar.html";
  }
}