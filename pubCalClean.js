//CREATE AN OPEN EVENT



//EDIT AN OPEN EVENT

function respondTo_EventResize(info){
    

    console.log("info: ",info)
    
    tippInstance.destroy();
    
    var eventObj = info.event;
    if (eventObj.extendedProps.appId != currentUser.appId){
        //console.log("Not your event, can't touch this.");
        info.revert();
        return;
    }
    else
    {  
        

        var eventEnding = moment(eventObj.end);
                    
        //--check if the current time clicked is before the end of event, if so allow to click, else do nothing.
        var timeClickedDate = Date.parse(moment().format('YYYY-MM-DD'));
        let endDate = Date.parse(eventEnding.format('YYYY-MM-DD'));
        if (timeClickedDate>endDate){
        //console.log("event is in the past");
        alert("You can not edit an event in the past!");
        info.revert();
        return;
        }
        else if (timeClickedDate == endDate){
        console.log("same day");
        
        var timeClickedTime = moment().format('HH:mm:ss');
        let endTime = eventEnding.format('HH:mm:ss');

        str1 =  timeClickedTime.split(':');
        str2 =  endTime.split(':');

        //console.log(timeClickedTime + " " + endTime);

        totalSecondsTimeClicked = parseInt(str1[0] * 3600 + str1[1] * 60 + str1[0]);
        totalSecondsEndtime = parseInt(str2[0] * 3600 + str2[1] * 60 + str2[0]);
        //console.log(totalSecondsTimeClicked + " " + totalSecondsEndtime);
            if (totalSecondsTimeClicked > totalSecondsEndtime ){
                //console.log("event is in the past");
                alert("You can not edit an event in the past!");
                info.revert();
                return;
            }                   
        }                  
    
        for (let index = 0; index < currentUser.calArray.length; index++) {
            var element = JSON.parse(currentUser.calArray[index]);
            // console.log(element.id + " / "  + eventObj.id);                
            if(element.id == eventObj.id){                                
                element.start = moment(eventObj.start);
                element.end = moment(eventObj.end);

                currentUser.calArray[index] = JSON.stringify(element);
                console.log(JSON.parse(currentUser.calArray[index]));                                        
                break;
            }                
        }  

        /* THIS IS FOR A CASE OF SINGLE VIEW */
        if (sourceCal == "single"){                        
            // document.getElementById("heade").style.display =""
            // document.getElementById("calendarArea").style.display =""
            // document.getElementById("singleCal").style.display ="none"
            myCalendarAlt.getEventById(info.event.id).remove();                        
            // myCalendar.addEvent(eventObj);
            
            // writeEventToCalendars(eventObj)
            // info.event = eventObj;
            // addEventTippyMouse(info);
            // document.getElementById("heade").style.display ="none"
            // document.getElementById("calendarArea").style.display ="none"
            // document.getElementById("singleCal").style.display =""  
            myCalendarAlt.addEvent(eventObj);           
        }
        else{
            addEventTippyMouse(info);
        }
        // info.event = eventObj;
            // addEventTippyMouse(info);
        
        console.log("event id: ",eventObj.id)
        updateEventToGoogle(eventObj)
                
        allowTippy = true;

        console.log("tipp: ",tippInstance)
       writeCalArrayTo_firbase(eventObj.id);
      
    }
}

//DELETE AN OPEN EVENT

//================================================================



//ORIGINAL SIDE
//INVITE USER TO AN EVENT

//EDIT AN INVITATION

//DELETE AN INVITATION
//AFTER ACCEPTANCE INVITATION IS SET

//OTHER SIDE
//ACCEPT AN INVITATION

//DELTE ACCEPTED INVITATION

//EDIT ACCEPTED INVITATION


//================================================================

//REQUEST AN EVENT

//DELETE REQUEST

//APPROVE A REQUEST

//DELTE APPROVED 

//EDIT APPROVED



function connectEvents(event){
    console.log("connectEvents");
    //get the event dates
    //get all the events and check only for events by the user with the same dates
    for (var i = 0; i <currentUser.calArray.length; i++){
        
        let tempEvent = JSON.parse(currentUser.calArray[i]);
        if (tempEvent.extendedProps.description.split("/")[0] == "open"){
            if (moment(tempEvent.end).isSame(moment(event.start))){
                console.log("found same end start");
    
            }
            if (moment(tempEvent.start).isSame(moment(event.end))){
                console.log("found same start end");
    
            }
        }
       

    }
    // check if the start or end time are the same
    //make a new event from the ones found with same start end time
    //delete the seperate events from the calendars and from calarray
    //add the new combined event to the calendars and the calarray
     

}


function checkIfTimeChanged(){
    console.log("SSSSSSS TTTTT  OOOOO   PPPPPP");
    console.log("checkIfTimeChanged  NEED TO BE UPDATED IN CREATE EVENT!");
    console.log(eventSingle.start);
    let curEve = calendarConfirm.getEvents()[0];
    console.log(curEve.start);
    let sameStart = moment(curEve.start).isSame(moment(eventSingle.start));
    let sameEnd = moment(curEve.end).isSame(moment(eventSingle.end));
    if (sameStart == false || sameEnd == false){
        let r = confirm("The event time changed, do you want to keep the new time or revert to the original time?");
        if(r == true){
            console.log("write the new event!");

            //delete original event from user calArray & //add new event to the calArray
            for (i = 0; i < currentUser.calArray.length; i++){
                let tempEvent = JSON.parse(currentUser.calArray[i])
                console.log(tempEvent.id);
                console.log(eventSingle.id);
                if(tempEvent.id == eventSingle.id){
                    console.log(tempEvent);
                    currentUser.calArray.splice(i,1);


                    newEvent = {
                        resourceId: currentUser.appId,
                        title: curEve.title,
                        start: moment(curEve.start).format(),
                        end: moment(curEve.end).format(),
                        id: curEve.id,                              
                        backgroundColor: curEve.backgroundColor,
                        extendedProps:{
                          acceptGuest : false,
                          appId: currentUser.appId,          
                          description: curEve.extendedProps.description,
                          status : "invite",
                          auther: currentUser.name + " " + currentUser.lastName          
                        }
                    }; 
                    
                    curEve.resourceId = currentUser.appId;
                    currentUser.calArray.push(JSON.stringify(newEvent));
                    allowInit = false;
                    writeCalArrayTo_firbase();
                    break;
                }
                
            }
            

            //delete origianl event from user calendars
            // myCalendar.getEventById(eventSingle.id).remove();
            myCalendarAlt.getEventById(eventSingle.id).remove();
            // add new event to calendars
            // myCalendar.addEvent(newEvent);
            myCalendarAlt.addEvent(newEvent);
            //send an update email to the invitee

            allUsersSnapShot.forEach(function(child) { 
                // console.log(child.val().appId + " : " + eventSingle.extendedProps.appId);
                let inviteeID = newEvent.extendedProps.description.split(":")[2];
                if(child.key == inviteeID){
                    userEmail = child.val().email;
                    nameTosend = child.val().name;
                    console.log(nameTosend + ' ' + child.key);
    
                    //open Text
                    let textAreaField = document.getElementById("textAreaField");
                    let eventDate = moment(eventSingle.start).format("dddd, MMMM Do YYYY, h:mm:ss a");
                
                    let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " has changed invitation times for the event on "+ eventDate + 
                                    ". The request has been updated in your calendar";
                
                        if (textAreaField.value.length >0){
                        mailBody += "\n \n A message was sent as well: \n"+textAreaField.value;
                        textAreaField.value = "";
                        }
                    console.log(mailBody);
                    if(sendEmails == true)
                    {    Email.send({
                            Host: "smtp.ipage.com",
                            Username : "roi@roiwerner.com",
                            Password : "Roki868686",
                            To : userEmail,
                            From : "<roi@roiwerner.com>",
                            Subject : "Invitation time changed",
                            Body : mailBody,
                            }).then(
                            message => alert("mail sent successfully")
                        );
                    } 

                    alert("I need to change here time!")
                };
            });                        
        }
    }
    
}


