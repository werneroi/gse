
var updateMessagNow = true
var chatUserId = "";
var chatKey = "";
//Get the elements based on their class name
// var tabs = document.getElementsByClassName('accordion-header');

// for(var i=0; i<tabs.length; i++) {
//   // Add event listener to each accordion element
//   tabs[i].addEventListener('click', function() {
//       console.log("collapse")
//     var content = this.nextElementSibling;
//     content.classList.toggle('full-height');
//   });
// }



document.addEventListener('DOMContentLoaded', function() {           
        allowInit = false;        
        //set a listener to pressing enter on keyboard
        document.getElementById('message').onkeypress = function(e){
            if (!e) e = window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == '13'){
                e.preventDefault();                   
                    // Trigger the button element with a click
                    sendMessage()
              
              return false;
            }
        }   

        // var acc = document.getElementsByClassName("accordion");
        // var i;
        
        // for (i = 0; i < acc.length; i++) {
        //     acc[i].addEventListener("click", function callClick() {
        //         console.log(document.getElementById("chatExpend").innerHTML);
        //         console.log("this: ",this)
        //         this.classList.toggle("active");
        //         var panel = this.nextElementSibling;
        //         console.log("panel: ",panel)
        //         if (panel.style.maxHeight) {
        //         panel.style.maxHeight = null;
        //         } else {
        //         panel.style.maxHeight = panel.scrollHeight + 5 +"px";
        //         } 
                
        //     });
        // }

        
            
        

        
        // for(var i=0; i<tabs.length; i++) {
        //     // Add event listener to each accordion element
        //     tabs[i].addEventListener('click', function() {
        //         console.log("collapse")
        //       var content = this.nextElementSibling;
        //       content.classList.toggle('full-height');
        //     });
        //   }
});

// function accordionAnimation(this){

    
// }


    
var messagesIdArray = []//an array to hold the ids of messages so I can make sure there are no dups      
   
//-- get the current conversation
function loadConversation(){
    // messagesIdArray = [];
    console.log("loadConversation with ",chatUserId);
    checkNow = true;
    firebase.database().ref('messages/'+chatKey).off()
    firebase.database().ref("messages").once("value", function (snapshot1) {
        let allMessages = snapshot1;
        document.getElementById("messages").innerHTML = "";
        chatKey = "";
        // load each message into the list
        checkNow = true;
        allMessages.forEach(function(child) {
            if (checkNow == true){
                console.log("each message in all messages: ",child.val().creator + " " + child.val().to)
                
                //check if I am one side in the chat                
                if(child.val().creator == currentUser.appId || child.val().to == currentUser.appId ){
                    console.log("found myself in the child, now look for the other side - looking for: ",chatUserId)
                    
                    //check if the chatUserId is the other side of this conversation
                    if(child.val().creator == chatUserId || child.val().to == chatUserId ){
                    
                        chatKey = child.key  
                        console.log("find the user in this chat: ",chatKey);  
                        checkNow = false;   
                        populateChat();                                 
                    }                              
                }
            }

        }); 
        console.log("find the user in this chat: ",chatKey);        
    });
}

function populateChat(){
    console.log("populating chat");
    //get all the messages
    firebase.database().ref('messages/'+chatKey).orderByChild('timestamp').once("value", function(snap){                
        // load each message into the chat
        snap.forEach(function(childd){
            console.log(childd.key);            
            // console.log(childd.val().message);
            displayMessage(childd);                            
        });
        
    });

    
    console.log("adding listener for active chat now at: ",chatKey);
    addListeners();
    // firebase.database().ref('messages/'+child.key).orderByChild('timestamp').startAt(Date.now()).off()
    
    

    console.log("adding listener for active chat delete now at: ",chatKey);

    firebase.database().ref("messages/" + chatKey).on("child_removed", function (snapshot) {
        // remove message node
        document.getElementById("message-" + snapshot.key).innerHTML = "This message has been removed";
    });

    var acc = document.getElementsByClassName("accordion");
    var i;   
    // for (i = 0; i < acc.length; i++) {
            
    //     if(acc[i].classList.value == "accordion"){
    //         console.log("contract")                
    //         var panel = acc[i].nextElementSibling;
    //         console.log(panel);
    //         panel.style.maxHeight = null;                
    //     }
    //     else{
    //         console.log("expend")
    //         var panel = acc[i].nextElementSibling;
    //         console.log(panel);
    //         panel.style.maxHeight = panel.scrollHeight + 5 +"px";                
    //     }                 

    // } 
}

function addListeners(){
    console.log("add listeners for chatKey: ", chatKey)
    firebase.database().ref('messages/'+chatKey).orderByChild('timestamp').startAt(Date.now()).on('child_added', function(snapi) {
        console.log('new record', snapi.key + "at: ",chatKey);
        if(chatModalOpen == true){
            displayMessage(snapi);
        }
        
    });
    //respond to a new message that is arriving
    firebase.database().ref('messages/'+chatKey).orderByChild('timestamp').startAt(Date.now()).on('child_changed', function(snapi) {
        console.log('new update', snapi.key);
        console.log("this is conversation is between: ",snapi.val().sender, "and ",snapi.val().to)
        //check if the chat is open
        if(chatModalOpen == true){
            //check if the chat is with the current user
            if(filteredUserInfo.appid == snapi.val().sender || filteredUserInfo.appid == snapi.val().to){
                displayMessage(snapi);
            }
            
        }
    });
}

function displayMessage(snapshot){
    // console.log("display message: ",snapshot.key);
    // console.log(messagesIdArray.length)    

    //checkc if the message needs to be inserted or just update
    if(messagesIdArray.length == 0){
        // console.log("starting a new messageArray");
        messagesIdArray.push(snapshot.key);
    }
    else{
        // console.log("continue a covnersation");
        let idfound = false;
        for (i=0; i<messagesIdArray.length; i++){
            if(messagesIdArray[i] === snapshot.key){
                // console.log("here is the update",snapshot.key + "with message" , snapshot.val().message);
                idfound = true;
                updateMessage(snapshot)
                  
                // break;                                    
            }           
        }
        if(idfound == false){
            // console.log("a new message",snapshot.key + "with message" , snapshot.val().message);
            messagesIdArray.push(snapshot.key);
            showMessage(snapshot)
        }
    }
    // console.log(messagesIdArray.length)
         
    
}

function updateMessage(snapshot){
    console.log("now?")
    idString = "message-" + snapshot.key;
    console.log("now?")
    
    console.log("idstring: ",idString)
    let elem = document.getElementById(idString);
    if(elem === null){
        return;
    }
    console.log(elem.innerHTML)
    var html = ""; 
    if (snapshot.val().sender == currentUser.appId) {
        // console.log("should add delete button");
        
        html += "<button data-id='" + snapshot.key + "' onclick='deleteMessage(this);'>";
            html += "Delete";
        html += "</button>";
        html +=  snapshot.val().message;
        html += "<div id='messageTime' style='font-size: 60%'>" + moment(snapshot.val().timestamp).format('HH:mm DD/MM/YY') + "</div>"
        checkColor = 'red'
        if(snapshot.val().status === 'read'){
            checkColor = 'blue';
        }
        html += "<i class='fa fa-check' aria-hidden='true' style='color:"+ checkColor +"'></i>"
        elem.innerHTML = html;
    }
    else{        
        html += "<div class = 'chat other'>"
        html += "<li class = 'receivedMessage' id='message-" + snapshot.key + "'>";
        // html += snapshot.val().sender + ": " + snapshot.val().message; option to show sender's name
        html += snapshot.val().message;
        html += "<div id='messageTime' style='font-size: 60%'>" + moment(snapshot.val().timestamp).format('HH:mm DD/MM/YY') + "</div>"
        checkColor = 'blue'
        // if(snapshot.val().status === 'read'){
        //     checkColor = 'blue';
        // }
        html += "<i class='fa fa-check' aria-hidden='true' style='color:"+ checkColor +"'></i>"
    
    } 
}

function showMessage(snapshot){
    let str = snapshot.ref.toString();        
    var new_str1 = str.split("com")[1].replace("status", "");

    if(snapshot.val().sender === undefined){
        
    }
    else
    {                
        var html = "";                
        console.log("found message from: ",snapshot.val().sender + " with content: ", snapshot.val().message);
        
        
        // show delete button if message is sent by me
        // console.log("message status: ",snapshot.val().status);
        if (snapshot.val().sender == currentUser.appId) {
            // console.log("should add delete button");
            html += "<div class = 'chat owner'> <div class='messageIfno'><span class='message_info_userName'>"
            + myFullName + "</span><div id='messageTime' style='font-size: 60%'>" + moment(snapshot.val().timestamp).format('HH:mm DD/MM/YY') + "</div>"
            checkColor = 'red'
            if(snapshot.val().status === 'read'){
                checkColor = 'blue';
            }
            html += "<i class='fa fa-check-circle-o' aria-hidden='true' style='color:"+ checkColor +"'></i></div>"
            
        
            html += "<div class='messageBody'> <li class ='sentMessage' id='message-" + snapshot.key + "'>";            
            html +=  snapshot.val().message;
            html += "<button data-id='" + snapshot.key + "' onclick='deleteMessage(this);'>";
                html += "Delete";
            html += "</button>";                        
            html += "</li></div>";
            
            
        }
        else{
            str = "read";
            firebase.database().ref(new_str1).update({
                status: str
            });
            let fullName = filteredUserInfo.name.charAt(0).toUpperCase() + filteredUserInfo.name.slice(1) + " " + filteredUserInfo.lastName.charAt(0).toUpperCase() + filteredUserInfo.lastName.slice(1);
            html += "<div class = 'chat other'> <div class='messageIfno'><span class='message_info_userName'>"
            + fullName + "</span><div id='messageTime' style='font-size: 60%'>" + moment(snapshot.val().timestamp).format('HH:mm DD/MM/YY') + "</div>"
            checkColor = 'blue'
            html += "<i class='fa fa-check-circle-o' aria-hidden='true' style='color:"+ checkColor +"'></i></div>"
            
            html += "<div class='messageBody'> <li class = 'receivedMessage' id='message-" + snapshot.key + "'>";
            // html += snapshot.val().sender + ": " + snapshot.val().message; option to show sender's name
            html += snapshot.val().message;            
            html += "</li></div>";
            
            // if(snapshot.val().status === 'read'){
            //     checkColor = 'blue';
            // }
            
        }        
        
        document.getElementById("messages").innerHTML += html;
    }
}

function sendMessage() {
    console.log("this chatkey: ",chatKey);
    var message = document.getElementById("message").value;
    // console.log("thi sis the emessage",message.length);
    if(message.length == 0){
        // console.log("empty message, ignoring it")
        return;
    }
    if (chatKey == ""){
        console.log("empty chat")
        chat();
    }
    // if(window.hasOwnProperty("chatKey") == false ){
    //     console.log("empty chat 2")
    //     //start a new conversation here
    //     chat();
    // }
    else{        
        
        let readString = 'unread';

        console.log("should update: ",filteredUserInfo.appId);
        firebase.database().ref("updates/"+filteredUserInfo.appId+"/"+currentUser.appId).set({
            "sender": currentUser.appId
          });

        // --save in database
        firebase.database().ref("messages/" + chatKey).push().set({
            "sender": currentUser.appId,
            "message": message,
            "status": readString,
            "timestamp": firebase.database.ServerValue.TIMESTAMP 
        });
        
        document.getElementById("message").value = "";
    }
}

function deleteMessage(self) {
    console.log("delete message: ",self);
    
    // get message ID
    var messageId = self.getAttribute("data-id");
    console.log("message id to delete : ",messageId);
 
    // delete message from firebase
    console.log("sjould delete from firebase: ",chatKey + "child: ",messageId);
    firebase.database().ref("messages/" + chatKey).child(messageId).remove();

    //delete the message from the chat on the owner side
    // document.getElementById("message-" + messageId).innerHTML = "This message has been removed";
    document.getElementById("message-" + messageId).parentElement.remove()
}
 
// attach listener for delete message


function checkImage(imageSrc, good, bad) {
    var img = new Image();
    img.onload = good; 
    img.onerror = bad;
    img.src = imageSrc;
}
//--END OF CHAT--


var webSiteLink = ""
var facebookLink = ""
var linkedInLink = ""


function findUser(receivedChatUserId){

    //save the value of the chat user Id in var chatUserId
    chatUserId = receivedChatUserId;
    console.log(chatUserId);
    
    //find the user based on the chatUserId
    var localUsersArray = allUsersSnapShot.toJSON();
    allUsersSnapShot.forEach(function(child) 
    { 
        if(child.val().appId == chatUserId){
        filteredUserInfo = child.val()
        }
    });
    
    console.log("userToDisplay: ", filteredUserInfo.appId);
    console.log("userToDisplay profile image: ", filteredUserInfo.profileImageUrl);

    webSiteLink = ""
    facebookLink = ""
    linkedInLink = ""
    
    //set the profile pic if there is one.
    
    
    checkImage(filteredUserInfo.profileImageUrl, 
        function(){ document.getElementById("singleUserModal_profileImage").src = filteredUserInfo.profileImageUrl }, 
        function(){ document.getElementById("singleUserModal_profileImage").src = "../gse5/emptyProfile.png" } );


    // else{
        // document.getElementById("singleUserModal_profileImage").src = "../gse5/emptyProfile.png"
    // }
    
    tempArr = [];

    //get the chatuser fields of interests
    let tempA = filteredUserInfo.fieldsOfinterest;
    for (i in tempA){
        // console.log(tempA[i]);
        tempArr.push(tempA[i]);
    }   
    
    //set all the elements in place
    let fullName = filteredUserInfo.name.charAt(0).toUpperCase() + filteredUserInfo.name.slice(1) + " " + filteredUserInfo.lastName.charAt(0).toUpperCase() + filteredUserInfo.lastName.slice(1);

    document.getElementById("userNameField").innerHTML = fullName;
    //set social links if they exsist
    if(filteredUserInfo.userWebSite){
        webSiteLink = filteredUserInfo.userWebSite;
        console.log("web1: ",webSiteLink)
    }
    if(filteredUserInfo.facebookUrl){
        facebookLink = filteredUserInfo.facebookUrl;
    }
    if(filteredUserInfo.linkedInUrl){
        linkedInLink = filteredUserInfo.linkedInUrl;
    }

    
    
    
    
    
    document.getElementById("fieldsOfInterest").innerHTML = tempArr.toString();
    document.getElementById("exLanguage").innerHTML = filteredUserInfo.mainLanguage;
    document.getElementById("addressText").innerHTML = filteredUserInfo.city + ", " + filteredUserInfo.country;
    // document.getElementById("addressCountry").innerHTML = filteredUserInfo.country;
    document.getElementById("aboutText").innerHTML = filteredUserInfo.about;
    document.getElementById("lookText").innerHTML = filteredUserInfo.looking;
    
    
    
    //show all info that was hidden till load!
    // document.getElementById("info").style.display = "";
    document.getElementById("singleUserModal").style.display = "";
    
    //now that I have the user info, load the conversation
    loadConversation();
    // //check accordion state and set it accordingly 

    
}

function contactUser(){

    console.log("Implement sending email here");
    
}

function chat(){
    console.log("Chat here");

    //initiate a new chat
    var reference = firebase.database().ref("messages").push()
    var uniqueKey = reference.key
    var nowTime = new Date();

    console.log("create a new chat key");
    reference.set({
        creator: currentUser.appId,
        to: chatUserId,
        status: "waiting",
        created: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        uq = uniqueKey;
        console.log("created a new chat key: ",uq);
        chatKey = uq;
        var message = document.getElementById("message").value;
        let readString = 'unread';

        // --save in database
        firebase.database().ref("messages/" + chatKey).push().set({
            "sender": currentUser.appId,
            "message": message,
            "status": readString,
            "timestamp": firebase.database.ServerValue.TIMESTAMP 
        });
        document.getElementById("message").value = "";
        //finish sending a message now load it into the conversation
        loadConversation()
    })
    .catch(err =>{
        console.log(err)
    });   
}


// function expendAbout(){
//     console.log("expend")
//     document.getElementById("expendMinus").style.display = "inline-block"
//     document.getElementById("expendPlus").style.display = "none"
//     document.getElementById("singleUserModal_personalDetails").style.display = ""
//     singleUserModal_personalDetails.style.maxHeight = singleUserModal_personalDetails.scrollHeight + "px";
// }

// function collapseAbout(){
//     console.log("collapse")
//     document.getElementById("expendMinus").style.display = "none"
//     document.getElementById("expendPlus").style.display = "inline-block"
//     // document.getElementById("singleUserModal_personalDetails").style.display = "none"
//     document.getElementById("singleUserModal_personalDetails").style.maxHeight = null;
// }

function toggleUserHeader(){
    console.log("toggleUserHeader")
    var accordion = document.getElementById("aboutWindow")
    console.log(accordion.style.scrollHeight)
    console.log(accordion.style.maxHeight)
    // accordion.classList.toggle("active")
    if (accordion.style.display == "none") {
        accordion.style.display = "flex";
    } else {
        accordion.style.display = "none";
    }
}



function openFromSingleUser_WebSite(){
    event.stopPropagation();
  console.log("open Website from SU") 
  console.log("web1: ",typeof(webSiteLink))
  console.log("web1: ",webSiteLink) 
  if (webSiteLink !== ""){
      //userWebSite
      alert ("website found: " + webSiteLink)
  }    
}

function openFromSingleUser_FaceBook(){
    event.stopPropagation();
  console.log("open facebook from SU")  
  if (facebookLink !== ""){
    alert ("facebook link found: " + facebookLink)
    }
}

function openFromSingleUser_LinkedIn(){
    event.stopPropagation();
  console.log("open linkedin from SU")  
  if (linkedInLink !== ""){
    alert ("LinkedIn link found: " + linkedInLink)
    }
}
