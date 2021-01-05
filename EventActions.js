function eventAddNew(info){
    console.log("++ eventAddNew: Add event on calendar by dragging")
    getYpos()
    //--check if the current time clicked is before the end of event, if so allow to click, else do nothing.    
    if (moment(info.startStr).isBefore(moment().format())) {
        Confirm.open('confirm101',{
            title: 'Alert',
            cancelText: '',
            cancelDisplay:"none",
            message: 'You can not create an event in the past!',                                      
          })                
        return;
    }

    /* SET THE PARAMETERS FOR THE NEW EVENT*/
    var r = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "")    
    var allowGuest = false;
    // var bgColor = color_normal_me;
    if (document.getElementById('acceptGuest_default').checked == true) {
        allowGuest = true;
        // bgColor = color_guest_me;
    }
    
    //create the new event 
    let myEvent = {
        id: r,
        resourceId: currentUser.appId,
        title: myFullName,
        start: info.startStr,
        end: info.endStr,
        allDay: false,
        editable: true,
        draggable: true,
        eventStartEditable: true,
        droppable: true,
        // Duration: ('00:15:00'),
        extendedProps: {
            description: "open/" + currentUser.luid,
            appId: currentUser.appId,
            acceptGuest: allowGuest
        }
    };

    // add the event to both calendares -> this will call "mountEvents" where they will get colored
    writeEventToCalendars(myEvent)
    // addEventToGoogle(myEvent) 
}

function deleteEvent(eventId) {
    console.log("deleteEvent : ", eventId)
    //get the event if from tippy by Id
    if (eventId.length == 0) {
        eventId = eventSingle.id;
    }
    else {
        eventSingle = myCalendarAlt.getEventById(eventId);
    }
    
    console.log("Delete event: ", eventSingle)
    console.log("googleSync: ", googleSync)

    tippInstance.disable();
    /* CALL SAVE STATE*/
    saveCalendarsViewState()

    console.log("deleting a event with satuts: ", eventSingle.extendedProps.description.split("/")[0])
    
    if (eventSingle.extendedProps.description.split("/")[0] == "open") {
        console.log("delete open event")

        //-delete the request from the asking user
        Confirm.open('confirm001', {
            title: 'Alert',
            message: 'Are you sure you want to delte this session?',
            onok: () => {
                console.log("confirmAccept ", message);
                confirm001()
            },
            oncancel: () => {
                tippInstance.enable()
                return
            }
        })

        function confirm001() {
            // REMOVE EVENT FROM CALARRAY AND FROM CALENDARS
            for (e in currentUser.calArray) {
                let tempvar = JSON.parse(currentUser.calArray[e]);                
                if (tempvar.id == eventId) {
                    // console.log("event found at index: " + e);
                    currentUser.calArray.splice(e, 1);
                    // myCalendar.getEventById(eventSingle.id).remove();
                    myCalendarAlt.getEventById(eventSingle.id).remove();
                    deleteEventToGoogle(eventSingle.id)
                    break;
                }
            }

            writeCalArrayTo_firbase(eventSingle.id)            

            console.log("call back to cal from delete open")
            backToCal();
        }

    }

    else if (eventSingle.extendedProps.description.split("/")[0] == "deleted") {
        console.log("delete open event")

        //-delete the request from the asking user
        Confirm.open('confirm007', {
            title: 'Alert',
            message: 'Are you sure you want to delte this session?',
            onok: () => {
                console.log("confirmAccept ", message);
                confirm007()
            },
            oncancel: () => {
                tippInstance.enable()
                return
            }
        })

        function confirm007() {
            // REMOVE EVENT FROM CALARRAY AND FROM CALENDARS
            for (e in currentUser.calArray) {
                let tempvar = JSON.parse(currentUser.calArray[e]);                
                if (tempvar.id == eventId) {
                    // console.log("event found at index: " + e);
                    currentUser.calArray.splice(e, 1);
                    // myCalendar.getEventById(eventSingle.id).remove();
                    myCalendarAlt.getEventById(eventSingle.id).remove();
                    deleteEventToGoogle(eventSingle.id)
                    break;
                }
            }

            // writeCalArrayTo_firbase(eventSingle.id)   
            allowUpdate = false; //ignore the updates localy
            firebase.database().ref('users/' + currentUser.luid).update(
                {
                    calArray: currentUser.calArray
                });         

            console.log("call back to cal from delete deleted")
            backToCal();
        }

    }
    //delete an invite 
    else if (eventSingle.extendedProps.description.split("/")[0] == "inviteRequest") {
        console.log("delete invite event");

        Confirm.open('confirm005', {
            title: 'Alert',
            message: 'This event is waiting confirmation, if you delete it, the invitation will be deleted.',
            onok: () => {
                console.log("confirmAccept ", message);
                confirm005()
            },
            oncancel: () => {
                tippInstance.enable()
                return
            }
        })

        function confirm005(){
                    
            if (eventSingle.extendedProps.description.split("/")[1] == currentUser.luid) {
                console.log("THIS IS AN EVENT I CREATED")
                deleteEventToGoogle(eventSingle.id)
            }
            else {
                console.log("THIS IS AN EVENT I WAS INVITED TO")
            }
            

            //remove the event from the cals
            // myCalendar.getEventById(eventSingle.id).remove();
            myCalendarAlt.getEventById(eventSingle.id).remove();

            //delete the event from the user's cal array
            for (e in currentUser.calArray) {
                let tempvar = JSON.parse(currentUser.calArray[e]);
                console.log(tempvar.id + " :: " + eventSingle.id);
                if (tempvar.id == eventSingle.id) {
                    console.log("event found at index: " + e);
                    currentUser.calArray.splice(e, 1);
                    // allowInit = false;
                    allowUpdate = false;
                    firebase.database().ref('/users/' + currentUser.luid).update({
                        calArray: currentUser.calArray
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


            //delete the invite event from the otherside and send him an email the invitation was deleted
            allUsersSnapShot.forEach(function (child) {
                // console.log(child.val().appId + " : " + eventSingle.extendedProps.appId);
                let inviteeID = eventSingle.extendedProps.description.split("/")[2];
                if (child.key == inviteeID) {
                    userEmail = child.val().email;
                    nameTosend = child.val().name;
                    console.log(nameTosend + ' ' + child.key);

                    //open Text
                    let textAreaField = document.getElementById("textAreaField");
                    let eventDate = moment(eventSingle.start).format("dddd, MMMM Do YYYY, h:mm:ss a");

                    let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " has deleted the invite for the event on " + eventDate +
                        ". The request has been updated in your calendar";

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
                            Subject: "Invitation deleted",
                            Body: mailBody,
                        }).then(
                            message => alert("mail sent successfully")
                        );
                    }

                    let inBoxText_inviteRequestDelte = myFullName + " has deleted the invite for the event on " + eventDate +
                        ". The request has been updated in your calendar";

                    console.log("Send to InBox 100");
                    firebase.database().ref("inBox/" + child.val().appId + "/new/" + eventSingle.id).set({
                        "sender": currentUser.luid,
                        "message": inBoxText_inviteRequestDelte,
                        "status": "inviteReq meeting deleted",
                        "eventId": eventSingle.id,
                        "state": "off",
                        "timestamp": firebase.database.ServerValue.TIMESTAMP,
                    });
                    firebase.database().ref("inBox/" + child.val().appId + "/all/" + eventSingle.id).update({
                        "sender": currentUser.luid,
                        "message": inBoxText_inviteRequestDelte,
                        "status": "inviteReq meeting deleted",
                        "eventId": eventSingle.id,
                        "state": "off",
                        "timestamp": firebase.database.ServerValue.TIMESTAMP,
                    });                    
                    deleteInBoxList(eventSingle.id)
                };
            });
        }
    }
    //   delete a waiting event
    else if (eventSingle.extendedProps.description.split("/")[0] === "waiting") {
        console.log("delete waiting event");
        Confirm.open('confirm003', {
            title: 'Alert',
            message: 'This event is waiting confirmation, if you delete it, the request will be deleted.',
            onok: () => {
                console.log("confirmAccept ", message);
                confirm003()
            },
            oncancel: () => {
                tippInstance.enable()
                return
            }
        })

        function confirm003() {


            //get the request so i have the events ids:
            requestKey = eventSingle.extendedProps.description.split("/")[5];

            console.log("deleting an event from this requestkey: ", requestKey);
            firebase.database().ref('/requests/' + requestKey).once('value').then(function (snapshot) {
                console.log("snap: ", snapshot.val())
                var userCheck = snapshot.exists();
                if (userCheck == false) {
                    let eventTodelete = eventSingle

                    for (e in currentUser.calArray) {
                        let tempvar = JSON.parse(currentUser.calArray[e]);
                        // console.log(tempvar.id);
                        if (tempvar.id == eventSingle.id) {
                            console.log("event found at index: " + e);
                            currentUser.calArray.splice(e, 1);
                            allowInit = false;
                            // myCalendar.getEventById(eventSingle.id).remove();
                            myCalendarAlt.getEventById(eventSingle.id).remove();
                            break;

                        }
                    }
                    console.log(currentUser.calArray);
                    // allowInit = false;
                    allowUpdate = false;
                    firebase.database().ref('users/' + currentUser.luid).update(
                        {
                            calArray: currentUser.calArray
                        });
                }
                else {

                    let originaleventToDelete = JSON.parse(snapshot.val().origEvent);
                    let requestEventToDelete = JSON.parse(snapshot.val().requestedEvent);
                    
                    console.log("originaleventToDelete: ",originaleventToDelete)
                    console.log("requestEventToDelete: ",requestEventToDelete)

                    //-delete the request
                    firebase.database().ref('/requests/' + requestKey).remove();

                    //-delete the request from the asking user
                    for (e in currentUser.calArray) {
                        let tempvar = JSON.parse(currentUser.calArray[e]);
                        // console.log(tempvar.id);
                        if (tempvar.id == eventSingle.id) {
                            console.log("event found at index: " + e);
                            currentUser.calArray.splice(e, 1);
                            allowInit = false;
                           
                            let tempEv1 = myCalendarAlt.getEventById(requestEventToDelete.id)
                            console.log(tempEv1)
                            let tempEv2 = myCalendarAlt.getEventById(originaleventToDelete.id)
                            console.log(tempEv2)
                            
                            if(tempEv1 != null){
                                // myCalendar.getEventById(requestEventToDelete.id).remove();
                                myCalendarAlt.getEventById(requestEventToDelete.id).remove();
                            }
                            if(tempEv2 != null){
                                // myCalendar.getEventById(originaleventToDelete.id).remove();
                                myCalendarAlt.getEventById(originaleventToDelete.id).remove();
                            }
                            
                            break;

                        }
                    }
                    console.log(currentUser.calArray);
                    // allowInit = false;
                    allowUpdate = false;
                    firebase.database().ref('users/' + currentUser.luid).update(
                        {
                            calArray: currentUser.calArray
                        });


                    //-update the event on the original side
                    let creatorId = originaleventToDelete.extendedProps.appId;
                    console.log(creatorId);
                    allUsersSnapShot.forEach(function (child) {
                        // console.log(child.val().appId + " : " + eventSingle.extendedProps.appId);

                        if (child.val().appId == creatorId) {

                            console.log("found a user to update the deleted request ",child.key);
                            firebase.database().ref('/users/' + child.key).once('value').then(function (snapshot) {
                                let originalUser = snapshot.val();
                                // console.log(originalUser.calArray);

                                let localTempArray = originalUser.calArray;
                                for (e in localTempArray) {
                                    let element = JSON.parse(localTempArray[e]);
                                    if (element.id == originaleventToDelete.id) {
                                        let fullName = originalUser.name.charAt(0).toUpperCase() + originalUser.name.slice(1) + " " + originalUser.lastName.charAt(0).toUpperCase() + originalUser.lastName.slice(1);
                                        element.title = fullName;
                                        element.extendedProps.description = "open/" + child.key + "/" + element.id;
                                        console.log(element);

                                        // myCalendar.addEvent(element);
                                        myCalendarAlt.addEvent(element);

                                        // element.editable = true;
                                        // element.resizable = true;
                                        localTempArray[e] = JSON.stringify(element);
                                        console.log("nre cal array: ", localTempArray)
                                        break;

                                    }
                                }
                                console.log(localTempArray);
                                //update the Firebase array of the user with the new info
                                // allowInit = false;
                                // allowUpdate = false;
                                
                                firebase.database().ref('users/' + child.key).update(
                                    {
                                        calArray: localTempArray
                                    });
                            
                                firebase.database().ref('calUpdates/' + currentUser.luid).update(
                                    {
                                        "sender": currentUser.appId,
                                        "event": originaleventToDelete.id,
                                        "timestamp": firebase.database.ServerValue.TIMESTAMP
                                    });

                                let inviteeID = eventSingle.extendedProps.description.split("/")[1];
                                userEmail = child.val().email;
                                nameTosend = child.val().name;
                                console.log(nameTosend + ' ' + child.key);
                                let InviterAppId = child.val().appId;

                                //open Text
                                let textAreaField = document.getElementById("textAreaField");
                                let eventDate = moment(eventSingle.start).format("dddd, MMMM Do YYYY, h:mm:ss a");

                                let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " has deleted the request for the event on " + eventDate +
                                    ". The request has been updated in your calendar";

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
                                        Subject: "Invitation deleted",
                                        Body: mailBody,
                                    }).then(
                                        message => alert("mail sent successfully")
                                    );
                                }


                                console.log("Send to InBox 1110");
                                firebase.database().ref("inBox/" + InviterAppId + "/new/" + eventSingle.id).set({
                                    "sender": currentUser.luid,
                                    "message": mailBody,
                                    "status": "Request deleted",
                                    "eventId": originaleventToDelete.id,
                                    "state": "off",
                                    "timestamp": firebase.database.ServerValue.TIMESTAMP,
                                });
                                firebase.database().ref("inBox/" + InviterAppId + "/all/" + originaleventToDelete.id).update({
                                    "sender": currentUser.luid,
                                    "message": mailBody,
                                    "status": "Request deleted",
                                    "eventId": originaleventToDelete.id,
                                    "state": "off",
                                    "timestamp": firebase.database.ServerValue.TIMESTAMP,
                                });

                                deleteInBoxMessage_remote(eventSingle.id)

                            });
                            
                        }

                    });
                    
                    //delete the invite event from the otherside and send him an email the invitation was deleted
                    // allUsersSnapShot.forEach(function (child) {

                    //     console.log(child.val().key + " / " + inviteeID);
                    //     if (child.key == inviteeID) {
                    //         // userEmail = child.val().email;
                    //         // nameTosend = child.val().name;
                    //         // console.log(nameTosend + ' ' + child.key);
                    //         // let InviterAppId = child.val().appId;

                    //         // //open Text
                    //         // let textAreaField = document.getElementById("textAreaField");
                    //         // let eventDate = moment(eventSingle.start).format("dddd, MMMM Do YYYY, h:mm:ss a");

                    //         // let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " has deleted the request for the event on " + eventDate +
                    //         //     ". The request has been updated in your calendar";

                    //         // if (textAreaField.value.length > 0) {
                    //         //     mailBody += "\n \n A message was sent as well: \n" + textAreaField.value;
                    //         //     textAreaField.value = "";
                    //         // }
                    //         // if (sendEmails == true) {
                    //         //     Email.send({
                    //         //         Host: "smtp.ipage.com",
                    //         //         Username: "roi@roiwerner.com",
                    //         //         Password: "Roki868686",
                    //         //         To: userEmail,
                    //         //         From: "<roi@roiwerner.com>",
                    //         //         Subject: "Invitation deleted",
                    //         //         Body: mailBody,
                    //         //     }).then(
                    //         //         message => alert("mail sent successfully")
                    //         //     );
                    //         // }


                    //         // console.log("Send to InBox 1110");
                    //         // firebase.database().ref("inBox/" + InviterAppId + "/new/" + eventSingle.id).set({
                    //         //     "sender": currentUser.luid,
                    //         //     "message": mailBody,
                    //         //     "status": "Request deleted",
                    //         //     "eventId": originaleventToDelete.id,
                    //         //     "state": "off",
                    //         //     "timestamp": firebase.database.ServerValue.TIMESTAMP
                    //         // });
                    //         // firebase.database().ref("inBox/" + InviterAppId + "/all/" + eventSingle.id).set({
                    //         //     "sender": currentUser.luid,
                    //         //     "message": mailBody,
                    //         //     "status": "Request deleted",
                    //         //     "eventId": originaleventToDelete.id,
                    //         //     "state": "off",
                    //         //     "timestamp": firebase.database.ServerValue.TIMESTAMP
                    //         // });

                    //         // deleteInBoxMessage_remote(eventSingle.id)
                    //     };
                    // });
                }
            });
            tippInstance.enable()
            console.log("call back to cal")
            backToCal();
        }
        

    }

    // delete a pending event
    else if (eventSingle.extendedProps.description.split("/")[0] == "pending") {
        console.log("delete pending event");
        

        Confirm.open('confirm006', {
            title: 'Alert',
            message: 'This is a requested event!\nAre you sure you want to delete this event?\nIf you do, the event will be cancelled \nand a message will be sent to the other person!',
            onok: () => {
                console.log("confirmAccept ", message);
                confirm006()
            },
            oncancel: () => {
                tippInstance.enable()
                return
            }
        })

        function confirm006() {        

            requestKey = eventSingle.extendedProps.description.split("/")[5];
            console.log(requestKey);
                                
            if (eventSingle.extendedProps.description.split("/")[1] == currentUser.luid) {
                console.log("THIS IS AN EVENT I CREATED")
                // deleteEventToGoogle(eventSingle.id)
            }
            else {
                console.log("THIS IS AN EVENT I WAS INVITED TO")
            }

            let eventsAr = myCalendarAlt.getEvents()
            console.log(eventsAr)
            console.log(eventSingle.id);
            for(ein in eventsAr) {
                console.log(eventsAr[ein].id)
            }
                
    
            //remove the event from the cals
            // myCalendar.getEventById(eventSingle.id).remove();
            myCalendarAlt.getEventById(eventSingle.id).remove();
    
                //delete the event from the user's cal array
            for (e in currentUser.calArray) {
                let tempvar = JSON.parse(currentUser.calArray[e]);
                console.log(tempvar.id + " :: " + eventSingle.id);
                if (tempvar.id == eventSingle.id) {
                    console.log("event found at index: " + e);
                    currentUser.calArray.splice(e, 1);
                    console.log("new arry: ", currentUser.calArray)
                    // allowInit = false;
                    allowUpdate = false;
                    firebase.database().ref('/users/' + currentUser.luid).update({
                        calArray: currentUser.calArray
                    });
                    deleteEventToGoogle(eventSingle.id)
                    console.log("call back to cal from delete open")
                

                    // firebase.database().ref('calUpdates/' + currentUser.luid).update(
                    // {
                    //     "sender": currentUser.appId,
                    //     "event": eventSingle.id,
                    //     "timestamp": firebase.database.ServerValue.TIMESTAMP
                    // });
                    break;
                }
                // backToCal();
            }
    
    
                
            
        // for (e in currentUser.calArray) {
        //     let tempvar = JSON.parse(currentUser.calArray[e]);                
        //     if (tempvar.id == eventSingle.id) {
        //         console.log("event found at index: " + e);
        //         currentUser.calArray.splice(e, 1);
        //         myCalendar.getEventById(eventSingle.id).remove();
        //         myCalendarAlt.getEventById(eventSingle.id).remove();
        //         deleteEventToGoogle(eventSingle.id)
        //         writeCalArrayTo_firbase(eventSingle.id)
        //         break;
        //     }
        // }

             
            
            firebase.database().ref('/requests/' + requestKey).once('value').then(function (snapshot) {
                if (snapshot.exists()) {
                    let originaleventToDelete = JSON.parse(snapshot.val().origEvent);
                    let requestEventToDelete = JSON.parse(snapshot.val().requestedEvent);
                    console.log("originaleventToDelete", originaleventToDelete)
                    console.log("requestEventToDelete", requestEventToDelete)
                    /*-delete the request from firebase */
                    firebase.database().ref('/requests/' + requestKey).remove();

                    //GET REQUESTOR EMAIL
                    let requestorId = requestEventToDelete.extendedProps.appId;
                    console.log("requestorId: ", requestorId);
                    allUsersSnapShot.forEach(function (child) {
                        

                        if (child.val().appId == requestorId) {
                            userEmail = child.val().email;
                            nameTosend = child.val().name;
                            console.log("found this user to send email to : ", nameTosend + ' ' + child.key);

                            //open Text
                            let textAreaField = document.getElementById("textAreaField");
                            let eventDate = moment(eventSingle.start).format("dddd, MMMM Do YYYY, h:mm:ss a");

                            let mailBody = "Hello " + nameTosend + ".\n " + myFullName + " has deleted the event on " + eventDate +
                                ". The request has been updated in your calendar";

                            if (textAreaField.value.length > 0) {
                                mailBody += "\n \n A message was sent as well: \n" + textAreaField.value;
                                textAreaField.value = "";
                            }
                            // console.log(mailBody);       
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


                            console.log("Send to InBox 202");
                            firebase.database().ref("inBox/" + child.val().appId + "/new/" + eventSingle.id).set({
                                "sender": currentUser.luid,
                                "message": mailBody,
                                "status": "pending meeting deleted",
                                "state": "off",
                                "eventId": eventSingle.id,
                                "timestamp": firebase.database.ServerValue.TIMESTAMP,
                            });
                            firebase.database().ref("inBox/" + child.val().appId + "/all/" + eventSingle.id).update({
                                "sender": currentUser.luid,
                                "message": mailBody,
                                "status": "pending meeting deleted",
                                "state": "off",
                                "eventId": eventSingle.id,
                                "timestamp": firebase.database.ServerValue.TIMESTAMP,
                                "eventTs": moment(eventSingle.start).valueOf(),
                            });

                            deleteInBoxList(eventSingle.id)

                            var tempArray = child.val().calArray
                            console.log(tempArray);

                            for (e in tempArray) {
                                let element = JSON.parse(tempArray[e])
                                console.log(element.id + ":" + eventSingle.id);
                                if (element.id == requestEventToDelete.id) {
                                    // IN CASE I WANT TO CHNAGE THE EVENT FOR THE REQUESTER TO FREE TIME?
                                    element.title = "deleted by "+myFullName;                                    
                                    element.extendedProps.description = "deleted/" + child.key + "/" + currentUser.luid;                                    
                                    tempArray[e] = JSON.stringify(element)
                                    console.log("tempArray ", tempArray);
                                    console.log(child.key);                                    
                                    

                                    firebase.database().ref('/users/' + child.key).update({
                                        calArray: tempArray
                                    });
                                    firebase.database().ref('calUpdates/' + currentUser.luid).update(
                                    {
                                        "sender": currentUser.appId,
                                        "event": element.id,
                                        "timestamp": firebase.database.ServerValue.TIMESTAMP
                                    });
                                    break;
                                }
                            }
                        }
                    });

                }
                else {
                    console.log("no request id is found")
                }
                backToCal();

            });

                //delete the event from currentUser
                           
    
                


                // for (e in currentUser.calArray) {
                //     let tempvar = JSON.parse(currentUser.calArray[e]);
                //     // console.log(tempvar.id + " :: " + eventSingle.id);
                //     if (tempvar.id == eventSingle.id) {
                //         console.log("event found at index: " + e);
                //         console.log("should remove this: ", myCalendar.getEventById(eventSingle.id))
                //         myCalendar.getEventById(eventSingle.id).remove();
                //         myCalendarAlt.getEventById(eventSingle.id).remove();
                //         currentUser.calArray.splice(e, 1);
                //         // allowUpdate = false;
                //         writeCalArrayTo_firbase(eventSingle.id)
                //         // firebase.database().ref('/users/' + currentUser.luid).update({
                //         //     calArray: currentUser.calArray
                //         // });
                //         break;

                //     }
                // }

                // // remove the event from the calendars 
                
                

                // if (googleSync == true) {
                //     deleteEventToGoogle(eventId)
                // }

                // console.log("call back to cal")
                // backToCal();
            // });
        }


    }
    //delete a booked event
    else if (eventSingle.extendedProps.description.split("/")[0] == "booked") {
        console.log("delete booked event");

        Confirm.open('confirm002', {
            title: 'Alert',
            message: 'This is a confirmed event!\nAre you sure you want to delete this event?\nIf you do, the event will be cancelled \nand a message will be sent to the other person!',
            onok: () => {
                console.log("confirmAccept ", message);
                confirm002()
            },
            oncancel: () => {
                tippInstance.enable()
                return
            }
        })

        function confirm002(){

            let requestId = eventSingle.extendedProps.description.split("/")[2];
            let approveId = eventSingle.extendedProps.description.split("/")[1];
            let originalEventId = eventSingle.extendedProps.description.split("/")[3];
            let requestedEventId = eventSingle.extendedProps.description.split("/")[4];
            
            if (approveId != currentUser.luid) {
                console.log("I ram not the origianl side  ");

                /* get the ownder of the event details */
                
                
                firebase.database().ref('/users/' + approveId).once('value').then(function (snapshot) {
                    //send Email to the other side
                    userEmail = snapshot.val().email;
                    nameTosend = snapshot.val().name;
                    userToInviteAppId = snapshot.val().appId;
                    console.log(nameTosend + ' ' + userEmail);
                    //open Text
                    let textAreaField = document.getElementById("textAreaField");
                    let eventDate = moment(eventSingle.start).format("dddd, MMMM Do YYYY, h:mm:ss a");

                    let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " has deleted the event on " + eventDate +
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



                    /* Open the event on the other side */

                    let userToFindCalArray = snapshot.val().calArray;
                    console.log(userToFindCalArray.length);
                    for (let i = 0; i < userToFindCalArray.length; i++) {
                        let eventToUpdate = JSON.parse(userToFindCalArray[i]);                        
                        if (eventToUpdate.id == eventSingle.extendedProps.description.split("/")[3]) {
                            console.log("found an event to update: ", eventToUpdate);
                            // eventToUpdate.title = snapshot.val().name + " " + snapshot.val().lastName;
                            eventToUpdate.title = "Deleted by: " + myFullName;
                            eventToUpdate.extendedProps.description = "deleted/" + snapshot.key;
                            eventToUpdate.backgroundColor = color_deleted;
                            userToFindCalArray[i] = JSON.stringify(eventToUpdate)


                            /*DO NOT DELETE----- DO NOT DELETE ----- 


                            //connect events
                            let eventsToDeleteArray = [];
                            for (j = 0; j < userToFindCalArray.length; j++) {
                                let tempEvent = JSON.parse(userToFindCalArray[j]);
                                // console.log("tempevent: ", tempEvent);
                                if (tempEvent.extendedProps.description.split("/"[0] == "open")) {
                                    if (moment(tempEvent.end).isSame(moment(eventToUpdate.start))) {
                                        eventToUpdate.start = tempEvent.start;
                                        // userToFindCalArray.splice(j,1);  
                                        eventsToDeleteArray.push(tempEvent.id);


                                    }
                                    if (moment(tempEvent.start).isSame(moment(eventToUpdate.end))) {
                                        eventToUpdate.end = tempEvent.end;
                                        // userToFindCalArray.splice(j,1); 
                                        eventsToDeleteArray.push(tempEvent.id);
                                    }
                                }
                            }
                        
                            userToFindCalArray.splice(i, 1);
                            eventToUpdateInCal = JSON.parse(JSON.stringify(eventToUpdate));
                            eventToUpdateInCal.editable = true;
                            eventToUpdateInCal.resizable = true;
                            userToFindCalArray.push(JSON.stringify(eventToUpdateInCal));
                            //   userToFindCalArray.push(JSON.stringify(eventToUpdate));

                            for (k = 0; k < eventsToDeleteArray.length; k++) {
                                for (j = 0; j < userToFindCalArray.length; j++) {
                                    let tempEvent = JSON.parse(userToFindCalArray[j]);
                                    if (tempEvent.id == eventsToDeleteArray[k]) {
                                        userToFindCalArray.splice(j, 1);
                                        myCalendar.getEventById(tempEvent.id).remove();
                                        myCalendarAlt.getEventById(tempEvent.id).remove();

                                    }

                                }
                            }
                            console.log(eventsToDeleteArray);
                            console.log(userToFindCalArray);

                            DO NOT DELETE----- DO NOT DELETE ----- */



                            // myCalendar.getEventById(eventSingle.id).remove();
                            // myCalendarAlt.getEventById(eventSingle.id).remove();
                           
                            // myCalendar.getEventById(eventToUpdate.id).remove();
                            // myCalendarAlt.getEventById(eventToUpdate.id).remove();
                            // myCalendarAlt.addEvent(eventToUpdate);
                            // myCalendar.addEvent(eventToUpdate);

                            // allowInit = false;
                            allowUpdate = false;
                            console.log("call updates here before")
                            firebase.database().ref('/users/' + approveId).update({
                                calArray: userToFindCalArray
                            });

                            let bookedEventDeltedByOtherSide = myFullName + " has deleted the event on " + eventDate +
                                ". The request has been updated in your calendar";

                            console.log("Send to InBox 303");
                            firebase.database().ref("inBox/" + userToInviteAppId + "/new/" + originalEventId).set({
                                "sender": currentUser.luid,
                                "message": bookedEventDeltedByOtherSide,
                                "status": "booked meeting deleted",
                                "state": "off",
                                "eventId": originalEventId,
                                // "eventsToDelete": eventsToDeleteArray,
                                "timestamp": firebase.database.ServerValue.TIMESTAMP
                            });
                            firebase.database().ref("inBox/" + userToInviteAppId + "/all/" + originalEventId).update({
                                "sender": currentUser.luid,
                                "message": bookedEventDeltedByOtherSide,
                                "status": "booked meeting deleted",
                                "state": "off",
                                "eventId": originalEventId,
                                // "eventsToDelete": eventsToDeleteArray,
                                "timestamp": firebase.database.ServerValue.TIMESTAMP,
                                "eventTs": moment(eventSingle.start).valueOf(),
                            });

                            for (e in currentUser.calArray) {
                        
                                let tempvar = JSON.parse(currentUser.calArray[e]);        
                                if (tempvar.id == eventId) {
                                    console.log("event found at index: " + e);
                                    currentUser.calArray.splice(e, 1);
                                    // myCalendar.getEventById(eventId).remove();
                                    myCalendarAlt.getEventById(eventId).remove();
    
                                    allowUpdate = false;
                                    firebase.database().ref('/users/' + currentUser.luid).update({
                                        calArray: currentUser.calArray
                                    });
    
                                    console.log("call updates here")
                                    firebase.database().ref('calUpdates/' + currentUser.luid).update(
                                    {
                                        "sender": currentUser.appId,
                                        "event": eventId,
                                        "timestamp": firebase.database.ServerValue.TIMESTAMP
                                    });
                                    deleteEventToGoogle(eventSingle.id)
                                    console.log("done deleteing")
                                    break;
                                }
                            } 
                            

                            deleteInBoxList(requestedEventId)
                            console.log("call back to cal")
                            backToCal(); 
                            break;
                        }
                                   
            
                                    
                        
                    }
                });
            }
            else {
                console.log("I am the origianl side  ");

                /* GET THE OTHER SIDE */
                firebase.database().ref('/users/' + requestId).once('value').then(function (snapshot) {

                    //send Email to the other side
                    userEmail = snapshot.val().email;
                    nameTosend = snapshot.val().name;
                    userToInviteAppId = snapshot.val().appId;
                    console.log(nameTosend + ' ' + userEmail);

                    //open Text
                    let textAreaField = document.getElementById("textAreaField");
                    let eventDate = moment(eventSingle.start).format("dddd, MMMM Do YYYY, h:mm:ss a");

                    let fullName = snapshot.val().name.charAt(0).toUpperCase() + snapshot.val().name.slice(1) + " " + snapshot.val().lastName.charAt(0).toUpperCase() + snapshot.val().lastName.slice(1);

                    let mailBody = "Hello " + nameTosend + ".\n " + myFullName + " has deleted the event on " + eventDate +
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

                    inBoxText_BookedDelete = myFullName + " has deleted the event on " + eventDate +
                        ". The request has been updated in your calendar";

                    console.log("Send to InBox delete request event from other side");
                    let statusText = eventSingle.extendedProps.description.split("/")[0] + " meeting deleted"
                    firebase.database().ref("inBox/" + userToInviteAppId + "/new/" + requestedEventId).set({
                        "sender": currentUser.luid,
                        "message": inBoxText_BookedDelete,
                        "status": statusText,
                        "state": "off",
                        "eventId": requestedEventId,
                        "timestamp": firebase.database.ServerValue.TIMESTAMP
                    });
                    console.log("Send to InBox");
                    firebase.database().ref("inBox/" + userToInviteAppId + "/all/" + requestedEventId).update({
                        "sender": currentUser.luid,
                        "message": inBoxText_BookedDelete,
                        "status": statusText,
                        "state": "off",
                        "eventId": requestedEventId,
                        "timestamp": firebase.database.ServerValue.TIMESTAMP,
                        "eventTs": moment(eventSingle.start).valueOf(),
                    });
                    
                    deleteInBoxList(eventSingle.id)

                    //open the event on the OTHER side
                    let userToFindCalArray = snapshot.val().calArray;
                    console.log(userToFindCalArray);
                    if(userToFindCalArray == undefined ||userToFindCalArray == 'undefined'|| userToFindCalArray.length == 0){
                        alert("error deleteing")                        
                    }
                    else{

                        /* REMOVE EVENT FROM USER SIDE */
                        // myCalendar.getEventById(eventSingle.id).remove();
                        myCalendarAlt.getEventById(eventSingle.id).remove();
                        // myCalendar.getEventById(eventToUpdate.id).remove();
                        // myCalendarAlt.getEventById(eventToUpdate.id).remove();
                        for (var k = 0; k <currentUser.calArray.length; k++){
                            let eventFound = JSON.parse(currentUser.calArray[k])
                            if(eventFound.id == eventSingle.extendedProps.description.split("/")[3] ){
                                currentUser.calArray.splice(k,1)
                                deleteEventToGoogle(eventFound.id)
                            }
                            firebase.database().ref('/users/' + currentUser.luid).update({
                                calArray: currentUser.calArray
                            });

                        }

                    
                        for (let i = 0; i < userToFindCalArray.length; i++) {
                            let eventToUpdate = JSON.parse(userToFindCalArray[i]);
                            console.log(eventToUpdate.id);
                            console.log(eventSingle.id);
                            if (eventToUpdate.id == eventSingle.extendedProps.description.split("/")[4]) {
                                console.log("FOUND EVENT TO OPEN AFTER DELETE: ",eventToUpdate);
                                let fullName = snapshot.val().name.charAt(0).toUpperCase() + snapshot.val().name.slice(1) + " " + snapshot.val().lastName.charAt(0).toUpperCase() + snapshot.val().lastName.slice(1);

                                eventToUpdate.title = "Deleted by: "+myFullName;
                                eventToUpdate.extendedProps.description = "deleted/" + snapshot.key + "/" + eventToUpdate.id + "/" + currentUser.appId;
                                userToFindCalArray.splice(i, 1);
                                eventToUpdateInCal = JSON.parse(JSON.stringify(eventToUpdate));
                                eventToUpdateInCal.editable = true;
                                eventToUpdateInCal.resizable = true;
                                userToFindCalArray.push(JSON.stringify(eventToUpdateInCal));
                                console.log(userToFindCalArray);
                                allowInit = false;
                                
                                firebase.database().ref('/users/' + requestId).update({
                                    calArray: userToFindCalArray
                                });

                                firebase.database().ref('calUpdates/' + currentUser.luid).update(
                                {
                                    "sender": currentUser.appId,
                                    "event": eventToUpdate.id,
                                    "timestamp": firebase.database.ServerValue.TIMESTAMP
                                });

                                console.log("call back to cal")
                                backToCal();
                                // myCalendarAlt.addEvent(eventToUpdate);
                                // myCalendar.addEvent(eventToUpdate);
                                break;
                            }
                        }
                    }

                    

                    
                });

            }                      
        }
    }

    //delete an open event
    else {
        // alert ("found an unidntified event to delete")
        console.log("found an unidntified event to delete")
        //-delete the request from the asking user


        let answer = confirm("Are you sure you want to delete this event?");

        if (answer == false) { //cancel deletion
            return;
        }

        // not from tippy
        for (e in currentUser.calArray) {
            let tempvar = JSON.parse(currentUser.calArray[e]);
            // console.log(tempvar.id + " :: " + eventId);
            // console.log(tempvar.id);
            if (tempvar.id == eventId) {
                // console.log("event found at index: " + e);
                currentUser.calArray.splice(e, 1);
                // myCalendar.getEventById(eventId).remove();
                myCalendarAlt.getEventById(eventId).remove();
                break;
            }
        }
        allowUpdate = false;
        firebase.database().ref('users/' + currentUser.luid).update(
            {
                calArray: currentUser.calArray
            });

        if (googleSync == true) {
            deleteEventToGoogle(eventId)
        }

        console.log("call back to cal from delete open")
        backToCal();

    }
}

function sendInvite(){
    console.log("sendInvite",eventToInvite);        
    saveCalendarsViewState()
    
    /* THE INVITE PROCESS DOES NOT CREATE AN EVENT FOR THE OTHER SIDE, THIS WILL BE DONE
       WHEN THE INVITE REACHES THE OTHER SIDE THROUGH THE MESSAGE */
        
    //incase inviting a non registered user via email!
    if (inviteSource == "email"){
        userToInviteEmail = document.getElementById('emailToInvite').value;
        ValidateEmail(userToInviteEmail);
        userToInviteName =  "";
        console.log(userToInviteEmail);
    }

    // inviting a user
    else{
        /* Get the user from the selector */
        console.log("selector slecetd: ",selector.getValue())
        if (selector.getValue() == undefined){
            alert("Please choose a person to Invite :)")
            return
        }
        var userToInviteAppId = selector.getValue()
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
                let otherUserName = child.val().name.charAt(0).toUpperCase() + child.val().name.slice(1) + " " + child.val().lastName.charAt(0).toUpperCase() + child.val().lastName.slice(1);

                let mailBody = "Hello " + userToInviteName + ".\n " + myFullName + " is inviting you to an event on " + moment(eventToInvite.start).format('dddd') + " " + moment(eventToInvite.start).format('DD.MM.YYYY') + " starting at: " + moment(eventToInvite.start).format('HH:mm') + " ending at: " + moment(eventToInvite.end).format('HH:mm');
                mailBody += "Please click the following link to access this event: www.roiwerner.com/gse5/pubCal.html?&invite="+eventToInvite.id;
                if (inviteTextAreaField.value.length >0){
                    let inviteTextAreaField = document.getElementById('inviteTextAreaField');
                    mailBody += "\n \n A message was sent as well: \n"+inviteTextAreaField.value;
                    inviteTextAreaField.value = "";
                }

                console.log("MAILBODY: ",mailBody);
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

                /* send a message to the other side - ivnitee */
                inBoxText_Invite = myFullName + " is inviting you to an event on " + moment(eventToInvite.start).format('dddd') + " " + moment(eventToInvite.start).format('DD.MM.YYYY') + " starting at: " + moment(eventToInvite.start).format('HH:mm') + " ending at: " + moment(eventToInvite.end).format('HH:mm');                    

                console.log("inviteText: ", inBoxText_Invite)
                
                firebase.database().ref("inBox/" + userToInviteAppId + "/new/" + eventToInvite.id).set({
                    "sender": currentUser.luid,
                    "message": inBoxText_Invite,
                    "status": "inviteRequest",
                    "eventId": eventToInvite.id,
                    "timestamp": firebase.database.ServerValue.TIMESTAMP,
                    
                });
                firebase.database().ref("inBox/" + userToInviteAppId + "/all/" + eventToInvite.id).update({
                    "sender": currentUser.luid,
                    "message": inBoxText_Invite,
                    "status": "inviteRequest",
                    "eventId": eventToInvite.id,
                    "timestamp": firebase.database.ServerValue.TIMESTAMP,
                    "eventTs": moment(eventSingle.start).valueOf(),
                    
                });

                /* UPDATE THE EVENT ON MYSIDE = ORIGINAL SIDE*/
         for (var i = 0; i < currentUser.calArray.length; i++) {
                    
            let curEvent = JSON.parse(currentUser.calArray[i]);
            
            
            /* FIND THE EVENT TO*/
            if (curEvent.id == eventToInvite.id){
                
                // console.log("event ti invite Found in cal array to: ",curEvent.id);
                /* UPDATE THE EVENT ON BOTH CALENDARS */
                // let eventToUpdate = myCalendar.getEventById(eventToInvite.id)    
                let eventToUpdateAlt = myCalendarAlt.getEventById(eventToInvite.id)

                // eventToUpdate.setProp('title', "Waiting acceptence from: " + otherUserName)
                // eventToUpdate.setExtendedProp('description',"inviteRequest/" + currentUser.luid + "/" + child.key +"/" + eventToInvite.id)
                // eventToUpdate.setProp('editable',false)
                // eventToUpdate.setProp('backgroundColor',color_invite)
                
                eventToUpdateAlt.setProp('title', "Waiting acceptence from: " + otherUserName)
                eventToUpdateAlt.setExtendedProp('description',"inviteRequest/" + currentUser.luid + "/" + child.key +"/" + eventToInvite.id)
                eventToUpdateAlt.setProp('editable',false)
                eventToUpdateAlt.setProp('backgroundColor',color_invite)
                
                curEvent.title = "Waiting acceptence from: " + otherUserName
                curEvent.extendedProps.description = "inviteRequest/" + currentUser.luid + "/" + child.key +"/" + eventToInvite.id;
                curEvent.backgroundColor = color_invite;
                curEvent.editable = false;
                
                currentUser.calArray.splice(i,1);
                currentUser.calArray.push(JSON.stringify(curEvent));
                
                                

                
                googleNewTitle = "Invite Waiting acceptence from: " + userToInviteName + " " + userToInviteLastName
                updateEventToGoogle(curEvent)

                
                

                //saveTofirebased
                
                writeCalArrayTo_firbase(curEvent);

                //CLOSE THE MODAL_INVITE
                textModalOpen = false;
                modalInvite.style.display = "none";
                updateNeeded = false
                console.log("tippInstance: ",tippInstance)
                const template = document.getElementById('template');
                document.getElementById('tip_title').innerHTML = myFullName;
                document.getElementById('tip_date').innerHTML = moment(curEvent.start).format('dddd DD.MM.YYYY');
                document.getElementById('tip_start').innerHTML = moment(curEvent.start).format('HH:mm') + "-" + moment(curEvent.end).format('HH:mm');                
                document.getElementById('tip_acceptInvite').style.display = 'none';
                document.getElementById('tip_declineInvite').style.display = 'none';
                
                let elem_cancelInvite = document.getElementById('tip_cancelInvite');
                document.getElementById('tip_cancelInvite').style.display = '';
                let currentInviteStringValue = 'cancelInviteFromTippy("' + curEvent.id + '")';
                elem_cancelInvite.setAttribute('onclick', currentInviteStringValue);
                document.getElementById('tip_invite').style.display = 'none';
                document.getElementById('tip_trash').style.display = '';

                tippInstance.setContent(template.innerHTML);

                backToCal();
                break;
            }                    
        }

                
            }
        });          
    }
}

function sendRequestEvent() {

    console.log("request event: ", JSON.stringify(eventSingle));

    
    var origianlEvent = eventSingle;
    var requestedEve = eventSingle;
    var titleForNewTitle = ""

    if(fromTippy == false){
        var requestedEvents = calendarSingle.getEvents();
        // var requestedEve = [];
        if (requestedEvents.length == 1) { 
            requestedEve = requestedEvents[0]; //this is the original
            titleForNewTitle = requestedEve.title
            
        }
        else { //user add a new time
            requestedEve = requestedEvents[1]; //this is the new time
            titleForNewTitle = eventSingle.title
        }

    }
    else{
        fromTippy = false
    }

    // checking if the user selected a differant time than the whole time scope
    

    /* CREATE A UNIQUE KEY FOR THE REQUEST */
    let UniqueKey = Math.random().toString(36).substring(2);
    
    /* CREATE A UNIQUE ID FOR THE NEW EVENT ON USER (WHO REQUESTS) SIDE */
    var r = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "")
    
    // create the new event to be put into the user calendar
    newEvent = {
        resourceId: currentUser.appId,
        title: "waiting approval from: " + titleForNewTitle,
        start: moment(requestedEve.start).format(),
        end: moment(requestedEve.end).format(),
        id: r,
        // backgroundColor: color_toBook,
        extendedProps: {
            acceptGuest: false,
            appId: currentUser.appId,
            description: "waiting/" + origianlEvent.extendedProps.description.split("/")[1] + "/" + currentUser.luid + "/" + origianlEvent.id + "/" + r + "/" + UniqueKey,                 
        }
    };

    /* REMOVE THE EVENTS FROM BOTH CALENDARS*/
    // myCalendar.getEventById(origianlEvent.id).remove();
    myCalendarAlt.getEventById(origianlEvent.id).remove();
    
    /* ++ ADD THE REQUESET EVENT TO USER CALENDARS */
    writeEventToCalendars(newEvent)
    
    
    //--Get the User who created the event! this is for the other side!
    allUsersSnapShot.forEach(function (child) {
        // console.log(child.val().appId + " : " + eventSingle.extendedProps.appId);

        if (child.val().appId == origianlEvent.extendedProps.appId) {
            nameTosend = child.val().name;
            emailTosend = child.val().email;
            requestAppId = currentUser.appId;
            originalUserId = child.key;
            originalUserAppId = child.val().appId;

            console.log("found a user: ", child.val().name)

            //get the specific event for confirmation process
            
            firebase.database().ref('users/'+ child.key).once('value').then(function (snapshot) {
                var tempArray = snapshot.val().calArray 
                for (e in tempArray) {
                    let element = JSON.parse(tempArray[e])
                    // console.log("element id: " + element.id + " : " + eventSingle.id);
                    if (element.id == origianlEvent.id) {
                        element.resourceId = origianlEvent.extendedProps.appId;
                        element.title = "pending your approval from: " + myFullName;                    
                        element.extendedProps.description = "pending/" + origianlEvent.extendedProps.description.split("/")[1] + "/" + currentUser.luid + "/" + origianlEvent.id + "/" + r + "/" + UniqueKey;
                        tempArray[e] = JSON.stringify(element);
                        
                        origianlEvent = element;
                        console.log("pahse 1")
                        allowInit = false;
                        firebase.database().ref('/users/' + child.key).update({
                            calArray: tempArray
                        });
    
                        firebase.database().ref('calUpdates/' + child.key).update(
                        {
                            "sender": currentUser.appId,
                            "event": origianlEvent.id,
                            "timestamp": firebase.database.ServerValue.TIMESTAMP
                        });

                        /* WRITE THE REQUEST */
                        firebase.database().ref('requests/' + UniqueKey).set(
                            {
                                
                                requestBy: currentUser.luid,
                                origEvent: JSON.stringify(origianlEvent),
                                requestedEvent: JSON.stringify(newEvent),
                            }
                            ,function (error) {
                                if (error) {
                                    alert(error);
                                }
                            }).then(() => {
                                //send an email to the auther
                                console.log("phase 2")
                                let mailBody = "Hello " + nameTosend + ".\n " + myFullName + " would like to book your offered session\n" +
                                    "on: " + moment(newEvent.start).format('dddd') + " " + moment(newEvent.start).format('DD.MM.YYYY') + " starting at: " + moment(newEvent.start).format('HH:mm') + " ending at: " + moment(newEvent.end).format('HH:mm')
                                    + "please follow this link to approve it\n"
                                    + "roiwerner.com/gse5/singleEvent.html?&key=" + UniqueKey;        
                        
                                let textAreaField = document.getElementById("textAreaField");
                                if (textAreaField.value.length > 0) {
                                    mailBody += "\n \n A message was sent as well: \n" + textAreaField.value;
                                    textAreaField.value = "";
                                }
                        
                                console.log("MAILBODY: ",mailBody);
                                if (sendEmails == true) {
                                    Email.send({
                                        Host: "smtp.ipage.com",
                                        Username: "roi@roiwerner.com",
                                        Password: "Roki868686",
                                        To: emailTosend,
                                        From: "<roi@roiwerner.com>",
                                        Subject: "Session booking",
                                        Body: mailBody,
                                    }).then(
                                        message => alert("mail sent successfully")
                                    );
                                }
                        
                        
                                console.log("Send to InBox: ", newEvent.id);
                                firebase.database().ref("inBox/" + originalUserAppId + "/new/" + origianlEvent.id).set({
                                    "sender": currentUser.luid,
                                    "message": mailBody,
                                    "status": "request",
                                    "eventId": origianlEvent.id,
                                    "timestamp": firebase.database.ServerValue.TIMESTAMP
                                });
                                firebase.database().ref("inBox/" + originalUserAppId + "/all/" + origianlEvent.id).update({
                                    "sender": currentUser.luid,
                                    "message": mailBody,
                                    "status": "request",
                                    "eventId": origianlEvent.id,
                                    "timestamp": firebase.database.ServerValue.TIMESTAMP,
                                    "eventTs": moment(eventSingle.start).valueOf(),
                                });        
                            });
                        break;
                    }
                }
            })                              
        }
    });

    

    

    updateNeeded = false
    backToCal();    
}

function sendConfirmation() {
    
    console.log("sendConfirmation ", requestKey);
   
    //GET OTHER SIDE AND CHANGE DATA
    
    firebase.database().ref('/users/' + requestingUserId).once('value').then(function (snapshot) {


        var tempArray = snapshot.val().calArray        
        for (e in tempArray) {
            let element = JSON.parse(tempArray[e])

            if (element.id == reqEvent.id) {
                //   console.log("found match: ", element.id + ":" + reqEvent.id);
                //   console.log("save to this user fb cal array: ",requestingUserId);
                element.resourceId = element.extendedProps.appId;
                element.title = "Confirmed by " + myFullName;                
                element.extendedProps.description = "booked/" + element.extendedProps.description.split("/")[1] + "/" + element.extendedProps.description.split("/")[2] + "/" + eventi.id + "/" + reqEvent.id;
                tempArray[e] = JSON.stringify(element);                
                allowUpdate = false;

                /* SAVE THE CONFIRMED EVENT ON THE OTHER SIDE */
                firebase.database().ref('/users/' + requestingUserId).update({
                    calArray: tempArray
                });
                
                // firebase.database().ref('calUpdates/'+ userToInviteAppId).update(
                firebase.database().ref('calUpdates/'+ currentUser.luid).update(
                    {
                            "sender": currentUser.appId,
                            "event": element.id,
                            "timestamp": firebase.database.ServerValue.TIMESTAMP
                    });
                
                break;
            }
        }
        //--REMOVE THE EVENT FROM THE QUICK ACCESS "EVENTS TO CONFRIM"
        for (var i = 0; i < eventsToConfirm.length; i++) {
            if (eventsToConfirm[i].id == eventi.id) {
                eventsToConfirm.splice(i, 1);
                break;
            }
        }

        /* DELETE FROM THE INBOX */
        deleteInBoxList(eventi.id)

        /* SEND EMAIL AND MESSAGES TO THE OTHER SIDE FOR CONFIRMATION */
        userEmail = snapshot.val().email;
        nameTosend = snapshot.val().name;
        let userToInviteAppId = snapshot.val().appId;
        //open Text
        let textAreaField = document.getElementById("textAreaField");

        let mailBody = "Hello " + nameTosend + ".\n " + currentUser.name + " approved your session request\n" +
            "on " + moment(eventi.start).format('dddd') + " " + moment(eventi.start).format('DD.MM.YYYY') + " starting at: " + moment(eventi.start).format('HH:mm') + " ending at: " + moment(eventi.end).format('HH:mm')
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
                Subject: "Session request approved",
                Body: mailBody,
            }).then(
                message => alert("mail sent successfully")
            );
        }

        

        console.log("Send to InBox: uAppid: ", userToInviteAppId + " sender: ", currentUser.luid + " eventId", reqEvent.id, );
        firebase.database().ref("inBox/" + userToInviteAppId + "/new/" + reqEvent.id).set({
            "sender": currentUser.luid,
            "message": mailBody,
            "status": "approve",
            "eventId": reqEvent.id,
            "timestamp": firebase.database.ServerValue.TIMESTAMP
        });
        firebase.database().ref("inBox/" + userToInviteAppId + "/all/" + reqEvent.id).update({
            "sender": currentUser.luid,
            "message": mailBody,
            "status": "approve",
            "eventId": reqEvent.id,
            "timestamp": firebase.database.ServerValue.TIMESTAMP,
            "eventTs": moment(eventSingle.start).valueOf(),
        });
        

        //--update the reqested event on the other side

        
        
        
        var tempUserArray = [];

        // firebase.database().ref('/users/' + currentUser.luid).once('value').then(function (snap) {
            // tempUserArray = snap.val().calArray;
        tempUserArray = currentUser.calArray;

        for (e in tempUserArray) {
            let element = JSON.parse(tempUserArray[e]);
            //   console.log(element.id + " " + eventi.id);

            if (element.id == eventi.id) {

                // let eventToUpdate = myCalendar.getEventById(eventi.id)
                let eventToUpdateAlt = myCalendarAlt.getEventById(eventi.id)
                // myCalendar.getEventById(eventi.id).remove();
                myCalendarAlt.getEventById(eventi.id).remove();
                

                console.log("Element to replace found! ", element);
                tempUserArray.splice(e, 1);
                /** 
                checking the events from the confirm - as I make 3 I here check which ones
                are valid, and which one needs to update or insert into google
                i also change the titles where needed
                **/
                
                if (event1Trimmed == false & event1.length != 0) {
                    console.log("event 1 found ", event1.extendedProps.description.split("/")[0]);
                    // event1.id = eventi.id; 
                    if (event1.extendedProps.description.split("/")[0] == "pending") {
                        event1.id = eventi.id;
                        event1.extendedProps.description = "booked/" + element.extendedProps.description.split("/")[1] + "/" + element.extendedProps.description.split("/")[2] + "/" + eventi.id + "/" + reqEvent.id;
                        let newtitle = event1.title.replace('requested by: ','Confirmed with: ');
                        event1.title = newtitle;
                        
                        console.log("should update event1 to google")                                
                        updateEventToGoogle(event1)
                                            
                    }
                    else {
                        
                        console.log("should change selectabele 1");
                        event1.editable = true;
                        addEventToGoogle(event1)
                    }
                    //   event1.setOption('editable','false');               
                    tempUserArray.push(JSON.stringify(event1));
                    myCalendarAlt.addEvent(event1);
                    // myCalendar.addEvent(event1);
                    
                }
                if (event2Trimmed == false & event2.length != 0) {
                    console.log("event 2 found");
                    event2.id = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "");
                    if (event2.extendedProps.description.split("/")[0] == "pending") {
                        event2.id = eventi.id;
                        event2.extendedProps.description = "booked/" + element.extendedProps.description.split("/")[1] + "/" + element.extendedProps.description.split("/")[2] + "/" + eventi.id + "/" + reqEvent.id;
                        let newtitle = event2.title.replace('requested by: ','Confirmed with: ');
                        event2.title = newtitle;
                        
                        console.log("should update event2 to google")                                
                        updateEventToGoogle(event2)
                        
                    }
                    else {
                        console.log("should change selectabele 2");
                        // event2.selectable = true;
                        event2.editable = true;
                        addEventToGoogle(event2)
                    }
                    // event2.setOption('editable','false');
                    tempUserArray.push(JSON.stringify(event2));
                    myCalendarAlt.addEvent(event2);
                    // myCalendar.addEvent(event2);
                    
                }
                if (event3Trimmed == false & event3.length != 0) {
                    console.log("event 3 found");
                    event3.id = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "");
                    if (event3.extendedProps.description.split("/")[0] == "pending") {
                        event3.id = eventi.id;
                        event3.extendedProps.description = "booked/" + element.extendedProps.description.split("/")[1] + "/" + element.extendedProps.description.split("/")[2] + "/" + eventi.id + "/" + reqEvent.id;
                        let newtitle = event3.title.replace('requested by: ','Confirmed with: ');
                        event3.title = newtitle;
                        
                        console.log("should update event3 to google")                                
                        updateEventToGoogle(event3)
                        
                    }
                    else {
                        console.log("should change selectabele 3");
                        event3.editable = true;
                        addEventToGoogle(event3)
                    }
                    tempUserArray.push(JSON.stringify(event3));
                    myCalendarAlt.addEvent(event3);
                    // myCalendar.addEvent(event3);
                    
                }

                // -- update the current user in firebase  
                currentUser.calArray = tempUserArray;
                console.log("new made array: ",currentUser.calArray)
                // allowUpdate = false;
                firebase.database().ref('/users/' + currentUser.luid).update({
                    calArray: tempUserArray
                }, function (error, committed, snapshot) {
                    if (error) {
                        console.error(error);
                    } else {
                        //delete the request from 'requests'
                        firebase.database().ref('/requests/' + requestKey).remove();
                        // console.log("tempUserArray ",tempUserArray);                 
                    }

                }); 
                
                firebase.database().ref('calUpdates/'+ requestingUserId).update(
                {
                        "sender": currentUser.appId,
                        "event": reqEvent,
                        "timestamp": firebase.database.ServerValue.TIMESTAMP
                });
                console.log("finisehd process")

                console.log("call backtocal")
                tippInstance.enable()
                backToCal();
                break;

            }
            
        }
        // });

    });
    
}

function openEventFromTippy(eventId){
    eventSingle = myCalendarAlt.getEventById(eventId)
    fromTippy = true;
    openEvent()
}


function openEvent(){
    console.log("openEvent", eventSingle.id)
    console.log("fromTippy state: ", fromTippy)
    
    for(var i = 0; i < currentUser.calArray.length; i++){
        let tempEvent = JSON.parse(currentUser.calArray[i])
        
        
        if(tempEvent.id == eventSingle.id){
            console.log("event to open found: ",tempEvent)
            tempEvent.title = myFullName
            tempEvent.extendedProps.description = "open/"+currentUser.luid
            tempEvent.backgroundColor = color_normal_me
            tempEvent.editable = true
            console.log("event to open updated: ",tempEvent)


            currentUser.calArray[i] = JSON.stringify(tempEvent)
            console.log("calArray updated: ",currentUser.calArray)

            

            let tempCalEventAlt = myCalendarAlt.getEventById(tempEvent.id)
            tempCalEventAlt.setProp('title', myFullName)
            tempCalEventAlt.setExtendedProp('description', "open/"+currentUser.luid)
            tempCalEventAlt.setProp('backgroundColor', color_normal_me)
            tempCalEventAlt.setProp('editable', true)
            // tempCalEventAlt.remove()


            const template = document.getElementById('template');
            document.getElementById('tip_title').innerHTML = myFullName;
            document.getElementById('tip_date').innerHTML = moment(eventSingle.start).format('dddd DD.MM.YYYY');
            document.getElementById('tip_start').innerHTML = moment(eventSingle.start).format('HH:mm') + "-" + moment(eventSingle.end).format('HH:mm');                
            document.getElementById('tip_acceptInvite').style.display = 'none';
            document.getElementById('tip_declineInvite').style.display = 'none';                                
            document.getElementById('tip_cancelInvite').style.display = 'none';                
            document.getElementById('tip_open').style.display = 'none';                
            // document.getElementById('tip_invite').style.display = '';
            document.getElementById('tip_trash').style.display = '';

            let elem_invite = document.getElementById('tip_invite');
            document.getElementById('tip_invite').style.display = '';
            let currentInviteStringValue = 'openInviteUserModal("' + eventSingle.id + '")';
            // console.log(currentStringValue);
            elem_invite.setAttribute('onclick', currentInviteStringValue);

            tippInstance.setContent(template.innerHTML);

            
            

            
           
            eventSingle = tempEvent
            console.log("eventSingle ",eventSingle)
            
            updateEventToGoogle(tempEvent) 
            
            writeCalArrayTo_firbase(tempEvent.id)
            if(fromTippy == false){

                let tempCalEvent = calendarSingle.getEventById(tempEvent.id)
                tempCalEvent.setProp('title', myFullName)
                tempCalEvent.setExtendedProp('description', "open/"+currentUser.luid)
                tempCalEvent.setProp('backgroundColor', color_normal_me)
                tempCalEvent.setProp('editable', true)
                tempCalEvent.remove()
                console.log("tempCalEvent ",tempCalEvent)
            
                fromTippy = false;
                loadEvent()
            }
        
        }
    }
}


