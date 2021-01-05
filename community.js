var database = firebase.database();
var currentUser = JSON.parse(localStorage.getItem("currentUser"));
var isBuilt = localStorage.getItem("isBuilt");
var info = sessionStorage.getItem("snapTable");
var singleUserDiv = document.getElementById("userInfo");
var singleUserName = document.getElementById("suName");
var allUsersDisplayDiv = document.getElementById('allUsersDisplay');
var masterUsersTable = document.getElementById('masterUsersTable');
// var allUsersDisplayDiv = document.getElementById('allUsersDisplay');
var allUsersSnapShot = [];
var allUsersArray = [];
var countriesList =
 ["AF","Afrikaans","SQ","Albanian","AR","Arabic","HY","Armenian","EU","Basque","BN","Bengali","BG","Bulgarian","CA","Catalan","KM","Cambodian","ZH","Chinese(Mandarin)","HR","Croatian","CS","Czech","DA","Danish","NL","Dutch","EN","English","ET","Estonian","FJ","Fiji","FI","Finnish","FR","French","KA","Georgian","DE","German","EL","Greek","GU","Gujarati","HE","Hebrew","HI","Hindi","HU","Hungarian","IS","Icelandic","ID","Indonesian","GA","Irish","IT","Italian","JA","Japanese","JW","Javanese","KO","Korean","LA","Latin","LV","Latvian","LT","Lithuanian","MK","Macedonian","MS","Malay","ML","Malayalam","MT","Maltese","MI","Maori","MR","Marathi","MN","Mongolian","NE","Nepali","NO","Norwegian","FA","Persian","PL","Polish","PT","Portuguese","PA","Punjabi","QU","Quechua","RO","Romanian","RU","Russian","SM","Samoan","SR","Serbian","SK","Slovak","SL","Slovenian","ES","Spanish","SW","Swahili","SV","Swedish ","TA","Tamil","TT","Tatar","TE","Telugu","TH","Thai","BO","Tibetan","TO","Tonga","TR","Turkish","UK","Ukrainian","UR","Urdu","UZ","Uzbek","VI","Vietnamese","CY","Welsh","XH","Xhosa"
];
var imageUrl = "../gse5/emptyProfile.png";

usersNamesArray=[];




// const userTableData = document.getElementById("userTableData");
// var userTableDiv = document.getElementById("userTable");
// var customers = new Array;



window.addEventListener('load', function() {
  info = sessionStorage.getItem("snapTable");  
    // GenerateTable();
    createTabsNamesByInterest();
    buildLangSelector();
    createLocalDB();
    // populateUsersTable();
});

function createLocalDB(){
  if (allUsersArray.length>0){
    populateUsersTable(allUsersArray);
  }
  else {
    firebase.database().ref('/users/').once('value').then(function(snapshot) {
      var username = (snapshot.val()) || 'Anonymous';
      
      allUsersSnapShot = snapshot;  
      allUsersJson = allUsersSnapShot.toJSON();
      var arrayCount =  snapshot.numChildren();
      // var allUsersArray = [];
      
      
      var tempIndex=0;
      for (i in allUsersJson) {
        console.log(allUsersJson[i].appId);
        
        
        tempIndex +=1;
        if (allUsersJson[i].appId != currentUser.appId){
          allUsersArray = allUsersArray.concat(allUsersJson[i]) ;
          let userNameString = allUsersJson[i].name + " " + allUsersJson[i].lastName;
          usersNamesArray = usersNamesArray.concat(userNameString);
        }
        console.log(usersNamesArray);
        
        autocomplete(document.getElementById("myInput"), usersNamesArray);
        if (tempIndex==arrayCount){
          filterByCurrentInterest(0);
          
        }
        
      }
    });
  }

}
function filterByCurrentInterest(currentField){
  
  if (currentField == 0){
    console.log("default: "+ currentField);
    populateUsersTable(allUsersArray);
  }
  else {
    console.log("currentField: "+ currentField);
    var tempUsersArray = [];
    usersNamesArray = [];
    for (i in allUsersArray){
      var tempFieldsArray = allUsersArray[i].fieldsOfinterest;
      // console.log(currentField in tempFieldsArray.values());
      if (Object.values(tempFieldsArray).includes(currentField)) {
        console.log("found here: "+currentField+ " at " + allUsersArray[i].name);
        tempUsersArray = tempUsersArray.concat(allUsersArray[i]); 
        let tempName = allUsersArray[i].name + " " + allUsersArray[i].lastName;
        usersNamesArray = usersNamesArray.concat(tempName);
        // break;       
      }      
    }
    autocomplete(document.getElementById("myInput"), usersNamesArray);
    populateUsersTable(tempUsersArray);
    

  }
  //get current selected tab
  
}
function populateUsersTable(arrayTouse){
  console.log("build tabel with: "+arrayTouse);

  for (i in arrayTouse){
    console.log(arrayTouse[i].fieldsOfinterest);
    
  }
 

  //filter only the relevent users based on interest
  var filteredUsersByInterest =  arrayTouse.filter(function(filter) {
    return filter.fieldsOfinterest == "hypnosis";
  });
  console.log(filteredUsersByInterest);
  
  
  let dataHtmlt = '';    
  for (i in arrayTouse){
    var foundUser = arrayTouse[i];
    name = foundUser.name +" "+ foundUser.lastName;
    if (typeof myFavArray === 'undefined' || myFavArray === null || myFavArray.length==0) {
    }else{
      let tempFavArray = myFavArray;
      
      var isFavString = '';
      
      if (tempFavArray.length>0){
        console.log(tempFavArray.length); 
        for (i in tempFavArray){
          if (tempFavArray[i]== foundUser.appId){
            console.log("favorite found! " + name + foundUser.appId);
            isFavString = "checked";
            break;
            
          }
        }
      }
    }
    
      dataHtmlt += "<div style='border:solid 1px;' class='gse5-user' id='" + foundUser.appId + "'  onclick='loadUserFromClickedDiv(" + foundUser.appId + ")'>" + 
      "<div style='display:inline-block; padding-left: 10px;'><image id='profileImage' src='" + imageUrl + "' style='width:80px' /></div>"
      + "<div style='display:inline-block; padding-left: 40px;'><p>" + name + "</p>" 
      + "<input type='checkbox' class = 'tavCheckBox' id='toggleFavorite"+ foundUser.appId +"' onclick='toggleFavorite(" + foundUser.appId + ")'"
      + isFavString + "/>"
      + "<label for='toggleFavorite'>Favorite</label>"+ "</div>"
      + "<p>" + foundUser.mainLanguage + "</p>"
      + "<p>" + foundUser.about + "</p></div></div>";   
      
      // console.log(dataHtmlt);
      
  }

  allUsersDisplayDiv.innerHTML = dataHtmlt;
    // snapshot.forEach(function(child) {      
    //   i = i+1;
    //   name = child.val().name +" "+ child.val().lastName;
    //   // console.log(i," ",child.key + " " + name);      
    //   dataHtmlt += "<div class='gse5-user' id='" + child.key + "'  onclick='loadUserFromClickedDiv(" + child.key + ")'><p>"
    //    + name + "</p>" 
    //    + "<p>" + child.val().mainLanguage + "</p>"
    //    + "<p>" + child.val().about + "</p></div>";

    //   // console.log(dataHtmlt);
    // });
    
    
  // });  
}


favToggleButtonPressed = false;

function toggleFavorite(info){
  
    var localFavoritesArray = myFavArray;
        //check if the button is checked or not
  favToggleButtonPressed = true;
  let x = document.getElementById("toggleFavorite"+info.id);
  // favoritesArray = currentUser.favoritesArray;
  if (x.checked == true){
    console.log("x.checked: true");
    //add to fav list
    localFavoritesArray = localFavoritesArray.concat(info.id);
  }
  else{
    console.log("x.checked: false");
    //remove from fav list
    const index = localFavoritesArray.indexOf(info.id);
      if (index > -1) {
        localFavoritesArray.splice(index, 1);
      }
  }
  console.log("favoritesArray: " + localFavoritesArray); 
  myFavArray =  localFavoritesArray;
  writeFavsToFB();   
  
  console.log("toggleFavorite called");
  
  
}

function writeFavsToFB(){  
  currentUser.favoritesArray = myFavArray;
  firebase.database().ref('users/' + currentUser.luid).update(
    {
      favoritesArray: myFavArray
      // test: "passed"
    });
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

}

function resetview(){
  console.log(allUsersArray);
  
  populateUsersTable(allUsersArray);
}


function loadUserFromClickedDiv(info){
  console.log(allUsersArray);
    
  
  if (favToggleButtonPressed == true){
    favToggleButtonPressed = false;
    return;
  }
  else{
    console.log(info);
    var userToDisplay =  allUsersArray.filter(function(filter) {
      return filter.appId == info.id;
    });

    var filteredUserInfo = userToDisplay[0]
    
      console.log(userToDisplay);

          singleUserDiv.style.display = "block";
          allUsersDisplayDiv.style.display = "none";
          masterUsersTable.style.display = "none";
          singleUserName.innerHTML = "name: " + filteredUserInfo.name + " " +filteredUserInfo.lastName;
          console.log(filteredUserInfo.appId);
          var tempString = '';
          let tempFavArray = myFavArray;
         let x = document.getElementById(filteredUserInfo.appId).getElementsByClassName("tavCheckBox"); 
        //  document.getElementById("toggleFavoriteSingleUser").checked = false;
          if (x[0].checked == true){
            // document.getElementById("toggleFavoriteSingleUser").checked = true;
            tempString = "checked";
          }
          htmldata = "<label for='toggleFavoriteSingleUser'>Favorite</label><input type='checkbox' class='tavCheckBoxSingleUser' id='toggleFavoriteSingleUser" + filteredUserInfo.appId + "' onclick='toggleFavoriteFromSingleView(" + filteredUserInfo.appId + ")'"
          + tempString + "/>"
          document.getElementById("singUserFavCheck").innerHTML = htmldata;
         
          
          
          // if (tempFavArray.length>0){
            
          //   for (i in tempFavArray){
          //     if (tempFavArray[i]== info.id){
          //       console.log("favorite found! " + name + foundUser.appId);
          //       isFavString = "checked";
          //       break;
            
          //     }
          //   }
          // }
          if(filteredUserInfo.checked == true){
            console.log("fav!!!");
            
          }

    }
}



function backToTable(){
  console.log("back to table");
  
  singleUserDiv.style.display = "none";
  masterUsersTable.style.display = "";
  allUsersDisplayDiv.style.display = "";
  populateUsersTable(allUsersArray);
}

function buildLangSelector(){
  var dynamicSelect = document.getElementById("selectLang");
  let filtered=countriesList.filter((a,i)=>i%2===1);
  filtered.forEach(function(item)
  {
          var newOption = document.createElement("option");
          newOption.text = item.toString();//item.whateverProperty
          dynamicSelect.add(newOption);
  });
}

function filterByLanguage(){
  var mainLanguage = document.getElementById("selectLang").value;
    console.log(allUsersJson);
    // var objs = JSON.parse('['+allUsersJson.join(',')+']');
    // var objs = allUsersJson.map(JSON.parse);
    var objs = [];
    for (i in allUsersJson) {
      objs = objs.concat(allUsersJson[i]) ;
    }
    console.log(objs);
    console.log(Array.isArray(objs));

  var tempFilteredArray =  objs.filter(function(filter) {
  return filter.mainLanguage == mainLanguage;
  });
  populateUsersTable(tempFilteredArray);
}








// function GenerateTable()
// {
//   console.log(isBuilt);
//   // if (isBuilt == 1){
//   //   info = sessionStorage.getItem("snapTable");
//   //   console.log("info" + info);
//   //   userTableData.innerHTML = info;
//   //   return;
//   // }
//   //Build an array containing Customer records.
//   customers.push(["Index", "Name", "Country"]);
//   console.log(currentUser.luid)
//   if (currentUser.luid != null)
//   {
//     isBuilt = 1;
//     localStorage.setItem("isBuilt", 1);

//     // const userTableData = document.getElementById("userTableData");
//     var name = "";
//     var country = "";
//     let dataHtml = '';
//     firebase.database().ref('/users/').once('value').then(function(snapshot) {
//       var username = (snapshot.val()) || 'Anonymous';
//       allUsersSnapShot = snapshot;
//       var i =0;
//       snapshot.forEach(function(child) {
//         console.log(child.val().calArray);
//         console.log(i," ",child.key);
//         customers.push(child.key);
//         i = i+1;
//         name = child.val().name +" "+ child.val().lastName;
//         country = child.val().country;
//         dataHtml += '<tr id='+ child.key + ' onclick="loadUserFromTable('+i+')"><td>'+ i + '</td><td>'+ name + '</td><td>'+ country + '</td></tr>';
//         console.log(dataHtml);

//         // userTable.innerHTML = dataHtml;
//       });
//       console.log("check",customers.length);
//       console.log("build table here");
//       // const usersTable = document.getElementById("userTableData");


//       userTableData.innerHTML = dataHtml;
//       sessionStorage.setItem("snapTable", dataHtml);
//       info = sessionStorage.getItem("snapTable");
//       console.log("info" + info);
//       // let allrow = userTableData.innerHTML;
//       // console.log(allrow);
//     });
//     // const rows = document.querySelectAll("tr[data-href]");
//     // console.log(rows);
//   }
// }
// function loadUserFromTable(id){
//   console.log(id);
//     var x = document.getElementById("userTableData").rows[id-1];
//   console.log(x.id);
//   firebase.database().ref('/users/'+x.id).once('value').then(function(snapshot) {
//     console.log(snapshot.val().name);
//         singleUserDiv.style.display = "block";
//         userTableDiv.style.display = "none";
//         singleUserName.innerHTML = "name: " + snapshot.val().name;

//   });
// }

function toggleFavoriteFromSingleView(info){
  console.log("toggleFavoriteFromSingleView: ",info.id);
  // favToggleButtonPressed = true;
  
  let x = document.getElementById("toggleFavorite"+info.id);
  console.log(x);
  

  // favoritesArray = currentUser.favoritesArray;
  if (x.checked == false){
    console.log("x.checked: true");
    //add to fav list
    myFavArray = myFavArray.concat(info.id);
    x.checked=false;
  }
  else{
    console.log("x.checked: false");
    //remove from fav list
    const index = myFavArray.indexOf(info.id);
      if (index > -1) {
        myFavArray.splice(index, 1);
      }
      x.checked=true;
  }
  console.log("fav array after selction: "+myFavArray);
  
  console.log("toggleFavorite: " + info.id);  
  writeFavsToFB();
  
}


//tabs scripts
//create tabs names
function createTabsNamesByInterest (){
  console.log(currentUser.fieldsOfinterest);
  
  htmlString = '';
  tabsString = '';
  for (i in currentUser.fieldsOfinterest){
    currentField = currentUser.fieldsOfinterest[i]
    htmlString += "<button class='tablinks' onclick='openTab(event, " +currentField + ")'>" + currentField + "</button>"

    tabsString += "<div id=" + currentField + " class='tabcontent'><h3>" + currentField + "</h3><div  id='allUsersDisplay'></div></div>"
  
  }
  htmlData = "<div id='tableTabsByInterest' class='tab'>"+htmlString+"</div>"+tabsString;
  document.getElementById("masterUsersTable").innerHTML = htmlData;
  
}
function openTab(evt, fieldName) {
  console.log(fieldName.id);
  
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(fieldName.id).style.display = "block";
  evt.currentTarget.className += " active";

  filterByCurrentInterest(fieldName.id)
}

function search(){
  console.log("search");

  var searchForm = document.getElementById("searchForm");
  searchForm.action = "javascript:cancelSearch()";
  //clear the search bar

  //find the user and display him
  var searchResult = document.getElementById("myInput").value;
  const index = usersNamesArray.indexOf(searchResult);
  console.log(index);

  var allDisplayedEvents = document.getElementsByClassName("gse5-user");
  for (i = 0; i < allDisplayedEvents.length; i++){
    allDisplayedEvents[i].style.display="none";
    if (i == index){
      allDisplayedEvents[i].style.display="block";
      
    }
    //--change looking glass to x and make into a cancel search function
    var searchB = document.getElementById("searchB");
    var cancelS = document.getElementById("cancelS");
    // searchB.classList.add("fa-ban");
    // searchB.onclick = "cancelSearch()";
    searchB.style.display = "none";
    cancelS.style.display = "";
    
  }
  // action="javascript:search()"
}

function cancelSearch(){
  var searchB = document.getElementById("searchB");
  var cancelS = document.getElementById("cancelS");
  var searchForm = document.getElementById("searchForm");
  searchForm.action = "javascript:search()";
  
  console.log("cancael search");
  searchB.style.display = "";
  cancelS.style.display = "none";

  

  var allDisplayedEvents = document.getElementsByClassName("gse5-user");
  for (i = 0; i < allDisplayedEvents.length; i++){
    allDisplayedEvents[i].style.display="";
  }
}