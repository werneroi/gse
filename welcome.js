var database = firebase.database();
var info = {};
var street ="";
var city ="";
var country ="";
var address = "";
var calArray="";
var editUser = false;
var fieldsOfinterest = [];
var tempAppId="";
var website="";
var facebookPage="";
var linkedInPage="";

// var countriesList =
//  ["0","None","AF","Afrikaans","SQ","Albanian","AR","Arabic","HY","Armenian","EU","Basque","BN","Bengali","BG","Bulgarian","CA","Catalan","KM","Cambodian","ZH","Chinese(Mandarin)","HR","Croatian","CS","Czech","DA","Danish","NL","Dutch","EN","English","ET","Estonian","FJ","Fiji","FI","Finnish","FR","French","KA","Georgian","DE","German","EL","Greek","GU","Gujarati","HE","Hebrew","HI","Hindi","HU","Hungarian","IS","Icelandic","ID","Indonesian","GA","Irish","IT","Italian","JA","Japanese","JW","Javanese","KO","Korean","LA","Latin","LV","Latvian","LT","Lithuanian","MK","Macedonian","MS","Malay","ML","Malayalam","MT","Maltese","MI","Maori","MR","Marathi","MN","Mongolian","NE","Nepali","NO","Norwegian","FA","Persian","PL","Polish","PT","Portuguese","PA","Punjabi","QU","Quechua","RO","Romanian","RU","Russian","SM","Samoan","SR","Serbian","SK","Slovak","SL","Slovenian","ES","Spanish","SW","Swahili","SV","Swedish ","TA","Tamil","TT","Tatar","TE","Telugu","TH","Thai","BO","Tibetan","TO","Tonga","TR","Turkish","UK","Ukrainian","UR","Urdu","UZ","Uzbek","VI","Vietnamese","CY","Welsh","XH","Xhosa"
// ];




document.addEventListener('DOMContentLoaded', function() {
  
  document.getElementById('mail').style.display="none";
  document.getElementById('mailLabel').style.display="none";
  currentUser = JSON.parse(localStorage.getItem("currentUser"));
  buildLangSelector();
  buildFoiSelector();
    
});

function populateUserInfo(user){

  console.log("populateUserInfo");
  
  // document.getElementById('user_para').innerHTML="Hello " + currentUser.email;
  document.getElementById('firstName').value=currentUser.name;
  document.getElementById('lastName').value= currentUser.lastName;
  document.getElementById('mail').value=currentUser.email;
  document.getElementById('mailLabel').style.display="block";
  document.getElementById('mail').style.display="block";
  // document.getElementById('mainLanguageSelector').placeholder=snapshot.val().mainLanguage;
  // document.getElementById('selectLang').value = currentUser.mainLanguage;
  if ((currentUser.enableGuests) == "on"){
    document.getElementById('enableGuests').checked = true;
  }
  if (currentUser.about){
    document.getElementById('about').value = currentUser.about;
  }
  if (currentUser.calArray){
    calArray = currentUser.calArray;
    // console.log("calArray: " + calArray);
  }
  if (currentUser.favoritesArray){
    favoritesArray = currentUser.favoritesArray;
    // console.log("favoritesArray: " + favoritesArray);
  }
  // document.getElementById('secLanguageSelector').placeholder=snapshot.val().secLanguage;
  // console.log(currentUser.address);
  // if(currentUser.address){
  //   document.getElementById('address').innerHTML = currentUser.address;
  //   document.getElementById('address').style.display = "block";
  //   document.getElementById('getLocationButton').style.display = "none";
  // }

  if(currentUser.city){
    cityField = document.getElementById("cityInput");
    countryfield = document.getElementById("countryInput");
    cityField.value = currentUser.city;
    countryfield.value = currentUser.country;
  }

  // for (i in currentUser.fieldsOfinterest){
  //   if (currentUser.fieldsOfinterest[i]=="All_as_guest"){
  //     currentUser.fieldsOfinterest.splice(i, 1);
  //   }
  //   else{
  //     console.log(currentUser.fieldsOfinterest[i]);
  //     // foiArray.push(currentUser.fieldsOfinterest[i]);
  //     document.getElementById(currentUser.fieldsOfinterest[i]).checked = true;
  //   }
    
    
  // }

  tempAppId = currentUser.appId;
  // city = currentUser.city;
  // country = currentUser.country;
  // address = currentUser.address;

  // console.log(user.uid);
  // console.log(currentUser.facebookUrl);


  //--socail
  if (currentUser.facebookUrl){
     document.getElementById("facebookUrl").value = currentUser.facebookUrl;
  }

  if (currentUser.userWebSite){
    document.getElementById("userWebSite").value = currentUser.userWebSite;
  }

  if (currentUser.linkedInUrl){
    document.getElementById("linkedInUrl").value = currentUser.linkedInUrl;
  }

  if(currentUser.profileImageUrl){
    document.getElementById("imgFileUpload").src = currentUser.profileImageUrl;
  }

  lockForm(inputForm);
  var imageButton = document.getElementById("imgFileUpload");
  imageButton.style.cursor = "default";
  var cancelB = document.getElementById('cancel');
  cancelB.style.display = "none";
  var submitB = document.getElementById('submit1');
  submitB.innerHTML = "Update Profile";        
  submitB.setAttribute( "onClick", "javascript: updateProfile();" );

  
}



function writeUserInfo(){
  
  firebase.auth().onAuthStateChanged(function(user)
    {
      if (user){

        
        //upload profile image to firestore:
        




        if (myImg != null){
          console.log("found an image: " + myImg);          
        } 

        if (typeof(profileImageUrl) === 'undefined') {        
          profileImageUrl = '../gse5/emptyProfile.png';
        }
        
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
        
        var LanguageSelector = document.getElementById("selectLang").selectedOptions;

        langs = [];
        // console.log(langs);
        for (e in LanguageSelector){
          console.log(LanguageSelector[e].value);
          if(LanguageSelector[e].value != undefined){
            langs.push(LanguageSelector[e].value); 
          }                       
        }
        console.log(langs)

        var foiSelectorValues = document.getElementById("foiList").selectedOptions;

        foiArray = [];
        // console.log(langs);
        for (e in foiSelectorValues){
          console.log(foiSelectorValues[e].value);
          if(foiSelectorValues[e].value != undefined){
            foiArray.push(foiSelectorValues[e].value); 
          }                       
        }
        console.log(foiArray)

          
          var about = document.getElementById("about").value;
          var enableGuests = document.getElementById("enableGuests").value;
          // var address = document.getElementById('address').innerHTML;
          
          if (typeof favoritesArray === 'undefined' || favoritesArray === null) {
            favoritesArray = [];
          }
          if (typeof tempAppId === 'undefined' || tempAppId === null || tempAppId.length == 0) {
              console.log("no tempAppId found");
              
              // variable is undefined or null
              let r = Math.random().toString(36).substring(2);
              tempAppId = r;
          }
          
          //get the chosen field of interest and turn it into an array
          var allCheckButtons = document.getElementsByName("intereset");  
          console.log(allCheckButtons);
          
          fieldsOfinterest = []; 
          
          for(var i = 0; i < allCheckButtons.length; i++) {
            if(allCheckButtons[i].checked){
                  console.log(allCheckButtons[i].id);
                  fieldsOfinterest = fieldsOfinterest.concat(allCheckButtons[i].id);  
            }        
          }

          if(foiArray.length == 0 || foiArray == null){
            printError("Please please choose at least 1 field of practice!");
            return;
          }
          console.log(tempAppId);


          userWebSite = document.getElementById("userWebSite").value;
          facebookUrl = document.getElementById("facebookUrl").value;
          linkedInUrl = document.getElementById("linkedInUrl").value;
          
            
          firebase.database().ref('users/' + user.uid).set(
            {
            //   username: name,
              appId: tempAppId,
              email: user.email,
              name: name,
              lastName: lastName,
              mainLanguage: langs,
              // secLanguage: secLanguage,
              address: address,
              city: city,
              country: country,
              enableGuests: enableGuests,
              about: about,
              calArray: calArray,
              favoritesArray: favoritesArray,
              fieldsOfinterest: foiArray,
              userWebSite:userWebSite,
              facebookUrl:facebookUrl,
              linkedInUrl:linkedInUrl,
              profileImageUrl: profileImageUrl
              
              

            },function(error)
            {
              if (error) {
                alert (error);
                // The write failed...
              } else {
                info["email"] = user.email;
                info["lastName"] = lastName;
                info["name"] = name;
                info["mainLanguage"] = langs;
                info["about"] = about;
                info["address"] = address;
                info["city"] = city;
                info["country"] = country;
                info["enableGuests"] = enableGuests;
                info["luid"] = user.uid;
                info["calArray"] = calArray;
                info["appId"] = tempAppId;
                info["favoritesArray"] = favoritesArray;
                info["fieldsOfinterest"] = foiArray;
                info["userWebSite"] = userWebSite;
                info["facebookUrl"] = facebookUrl;
                info["linkedInUrl"] = linkedInUrl;
                info["profileImageUrl"] = profileImageUrl;
                console.log(info);
                
                localStorage.setItem("currentUser", JSON.stringify(info));
                // for (var key in info) {
                //   console.log(info[key]);
                // }
                alert ('success');
                // window.location.href = "../gse5/welcome.html";
                lockForm(inputForm);    
                var cancelB = document.getElementById('cancel');
                cancelB.style.display = "none";
                var submitB = document.getElementById('submit1');
                submitB.innerHTML = "Update Profile";        
                submitB.setAttribute( "onClick", "javascript: updateProfile();" );
                
                // document.getElementById("cancel").style.display = "";
                // document.getElementById("inputForm").className="disabled";
                // <fieldset "disabled"="disabled">
              }
            });
        }
  });
  
}

function unlockSubmit(){
  console.log("unlockSubmit");
  var submitB = document.getElementById('submit1');
  submitB.style.background = '#3ac162';
  submitB.disabled = false;

}

function lockSubmit(){
  console.log("lockSubmit");
  
  var submitB = document.getElementById('submit1');
  submitB.style.background = '#333333';
  submitB.disabled = true;
}


function updateProfile(){
  unlockForm(inputForm);
  var imageButton = document.getElementById("imgFileUpload");
  imageButton.style.cursor = "pointer";
  var submitB = document.getElementById('submit1');
  submitB.innerHTML = "Submit";        
  submitB.setAttribute( "onClick", "javascript: writeUserInfo();" );
  var cancelB = document.getElementById('cancel');
  cancelB.style.display = "";
  cancelB.setAttribute( "onClick", "javascript: cancel();" );  
}

function cancel(){
  var answer = confirm("Are you sure you want to cancel?")
  if (answer == true){
    lockForm(inputForm);
    var imageButton = document.getElementById("imgFileUpload");
    imageButton.style.cursor = "default";
    var cancelB = document.getElementById('cancel');
    cancelB.style.display = "none";
    var submitB = document.getElementById('submit1');
    submitB.innerHTML = "Update Profile";        
    submitB.setAttribute( "onClick", "javascript: updateProfile();" );
    // window.location.href = "../gse5/welcome.html";
  }
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

  console.log(currentUser.mainLanguage);
  langSelector = new Selectr(dynamicSelect, {
    multiple: true,
    selectedValue: currentUser.mainLanguage
  });
  
}
function buildFoiSelector(){
  firebase.database().ref('/foi/').once('value').then(function(snapshot) {
    foiList = snapshot.val();
    var dynamicSelect = document.getElementById("foiList");
    
    foiList.forEach(function(item)
    {
            var newOption = document.createElement("option");
            newOption.text = item.toString();//item.whateverProperty
            dynamicSelect.add(newOption);
    });

    console.log(foiList);
    foiSelector = new Selectr(dynamicSelect, {
      multiple: true,
      selectedValue: currentUser.fieldsOfinterest
    });
    
    if((typeof(currentUser.name))!== undefined){
      populateUserInfo(currentUser.id);
    }
    else{
  
    }
    $('#loading').hide();
  });
  
  
}


function getLocation()
{
  var long = "";
  var lat = "";
  if (navigator.geolocation)
  { //check if geolocation is available
    navigator.geolocation.getCurrentPosition(function(position)
    {
      console.log(position);

      long = position.coords.longitude;
      lat = position.coords.latitude;
      // window.alert(lat +" " +long);
      const KEY = "AIzaSyCycQ9f5ZlB6Q6CFmQlnhQZqCEoE8S_cq4";
      const LAT = lat;
      const LNG = long;


      let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${LAT},${LNG}&key=${KEY}`;
      fetch(url)
        .then(response => response.json())
        .then(data => {
          // console.log(data);
          let parts = data.results[0].address_components;
          // for (a in parts){
          //   console.log(a.value);
          // }

          parts.forEach(part => {
            if (part.types.includes("country")) {
              country = part.long_name;
              //we found "country" inside the data.results[0].address_components[x].types array
            }
            if (part.types.includes("administrative_area_level_1")) {
              city = part.long_name;
            }
            if (part.types.includes("administrative_area_level_3")) {
              street = part.long_name;
            }
          });
          address = data.results[0].formatted_address;
          adddressText = document.getElementById("address");
          adddressButton = document.getElementById("getLocationButton");
          
          adddressText.innerHTML = address;
          adddressText.style.display = "block";
          adddressButton.style.display = "none";
          // alert (address);
        })
        .catch(err => console.warn(err.message));
    });
  };
};

function printError(text){
  alert(text);
}

isDisabled = false;

function lockForm(objForm) {
  isDisabled = true;
  var elArr = objForm.elements;
  langSelector.disable();
  foiSelector.disable();
  for(var i=0; i<elArr.length; i++) { 
    switch (elArr[i].type) {
      case 'radio': elArr[i].disabled = true; break;
      case 'checkbox': elArr[i].disabled = true; break;
      case 'select-one': elArr[i].disabled = true; break;
      case 'select-multiple': elArr[i].disabled = true; break;
      case 'text': elArr[i].readOnly = true; break;
      case 'textarea': elArr[i].readOnly = true; break;
      case 'button': elArr[i].disabled = true; break;
      case 'submit': elArr[i].disabled = true; break;
      case 'reset': elArr[i].disabled = true; break;
      
      default: elArr[i].disabled = true; break;
      
    }
  }
}

function unlockForm(objForm) {
  isDisabled = false;
  var elArr = objForm.elements;
  langSelector.enable();
  foiSelector.enable();
  for(var i=0; i<elArr.length; i++) { 
    switch (elArr[i].type) {
      case 'radio': elArr[i].disabled = false; break;
      case 'checkbox': elArr[i].disabled = false; break;
      case 'select-one': elArr[i].disabled = false; break;
      case 'select-multiple': elArr[i].disabled = false; break;
      case 'text': elArr[i].readOnly = false; break;
      case 'textarea': elArr[i].readOnly = false; break;
      case 'button': elArr[i].disabled = false; break;
      case 'submit': elArr[i].disabled = false; break;
      case 'reset': elArr[i].disabled = false; break;
      default: elArr[i].disabled = false; break;
    }
  }
}



function logOut(){
  var r = confirm("Are you sure you want to log out?");
  if(r== true){
  firebase.auth().signOut().then(function() {
    alert ("You are now signed out");
    window.location.href = "../gse5/loginn.html";
  // Sign-out successful.
    }).catch(function(error) {
      alert ("error");
      // An error happened.
    });
  }
}

// myImg = document.getElementById('userImageProfile');
// // document.querySelector('#userImageProfile').addEventListener('click', function() {
// //   // if (this.files && this.files[0]) {
    
// //   //   myImg = this.files[0]
// //   //   console.log(myImg);

// //   //     var img = document.getElementById("imgFileUpload");  // $('img')[0]
// //   //     img.src = URL.createObjectURL(this.files[0]); // set src to blob url          
// //   //     img.onload = imageIsLoaded;        
// //   //   }
// // });
// function uploadImage(e){  
//   console.log("uploadImage");
  
  
// }

    // if (this.files && this.files[0]) {

    //   myImg = this.files[0]
    //   console.log(myImg);
    // }
    
    // //attach the image to the element
    // var img = document.getElementById("imgFileUpload");  // $('img')[0]
    // img.src = URL.createObjectURL(this.files[0]); // set src to blob url  
    
    
    // saveImageTofb();        
    // img.onload = imageIsLoaded;     
    
    
  // };

  
// };

$(document).ready(function(){
  var image_crop = $('#image_demo').croppie({
      viewport: {
          width: 300,
          height: 300,
          type:'circle' //circle
      },
      boundary:{
          width: 350,
          height: 350
      }
  });

  myImg = {};
  
  window.onload = function () {  
    
    //prepare the elements for croppie
    var fileupload = document.getElementById("FileUpload1");
    var filePath = document.getElementById("spnFilePath");
    var image = document.getElementById("imgFileUpload");
    
    //start here, when clicking the image
    image.onclick = function () {
      if (isDisabled == true){
        return;
      }
        lockSubmit();
        //open the upload image modal
        fileupload.click();
    };

    
    fileupload.onchange = function () {
      //open a dialouge to choose file
      var reader = new FileReader();
      reader.onload = function (event) {
        $('#cover_image').val(''); // this will clear the input val.
        // create the croppie connection
        image_crop.croppie('bind', {
            url: event.target.result,
        });
      }

      //open the croppie modal
      reader.readAsDataURL(this.files[0]);
      $('#uploadimageModal').modal('show');


    };
  }

  //finish the croppie process
  $('.crop_image').click(function(event){
    
    $('#imgFileUpload').val('')
      var formData = new FormData();
    
      //get the image as a blob (can be change to 64bit if needed)
      // set here the size of the saveed image - how it will show is defined in the view canvas
      image_crop.croppie('result',{type:'blob',size:{width:600,height:600},format:'png'}).then(function(r) { 
        document.getElementById('imgFileUpload').src = URL.createObjectURL(r, { oneTimeOnly: true });;
        // document.getElementById('imgFileUpload').src = r;

        var img = document.getElementById("imgFileUpload");  // $('img')[0]
        myImg = r;
        // save it the the firestore as an image
        saveImageTofb();
      });
       
      $('#uploadimageModal').modal('hide');
  });
});

function saveImageTofb(){
  firebase.auth().onAuthStateChanged(function(user)
    {
      
      if (user){
        allowInit = false;
        console.log("user: ",user.uid);
        const ref = firebase.storage().ref('users/' + user.uid);
        // const file = document.querySelector('img').this.files[0]
        // const fileName = (+new Date()) + '-' + myImg.name;
        const fileName = "profile Image";
        const metadata = {
          contentType: myImg.type
        };
        const task = ref.child(fileName).put(myImg, metadata);task
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then((url) => {
          console.log(url);
          profileImageUrl = url;
          unlockSubmit();

          //save the url from firestore to firebase
          firebase.database().ref('users/' + user.uid).update(
            {
            //   username: name,              
              profileImageUrl: profileImageUrl
            });
        })
        .catch(console.error);
      }
    });
  }


