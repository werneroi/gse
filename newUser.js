// var database = firebase.database();
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
var countriesList =
 ["0","None","AF","Afrikaans","SQ","Albanian","AR","Arabic","HY","Armenian","EU","Basque","BN","Bengali","BG","Bulgarian","CA","Catalan","KM","Cambodian","ZH","Chinese(Mandarin)","HR","Croatian","CS","Czech","DA","Danish","NL","Dutch","EN","English","ET","Estonian","FJ","Fiji","FI","Finnish","FR","French","KA","Georgian","DE","German","EL","Greek","GU","Gujarati","HE","Hebrew","HI","Hindi","HU","Hungarian","IS","Icelandic","ID","Indonesian","GA","Irish","IT","Italian","JA","Japanese","JW","Javanese","KO","Korean","LA","Latin","LV","Latvian","LT","Lithuanian","MK","Macedonian","MS","Malay","ML","Malayalam","MT","Maltese","MI","Maori","MR","Marathi","MN","Mongolian","NE","Nepali","NO","Norwegian","FA","Persian","PL","Polish","PT","Portuguese","PA","Punjabi","QU","Quechua","RO","Romanian","RU","Russian","SM","Samoan","SR","Serbian","SK","Slovak","SL","Slovenian","ES","Spanish","SW","Swahili","SV","Swedish ","TA","Tamil","TT","Tatar","TE","Telugu","TH","Thai","BO","Tibetan","TO","Tonga","TR","Turkish","UK","Ukrainian","UR","Urdu","UZ","Uzbek","VI","Vietnamese","CY","Welsh","XH","Xhosa"
];
var curUser = [];



//config the firebase
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

firebase.auth().onAuthStateChanged(function(user) {
    
    curUser = user;
    console.log("AUth Change ",curUser.uid);

});


document.addEventListener('DOMContentLoaded', function() {
    console.log('doc ready');
    document.getElementById('mail').style.display="none";
    document.getElementById('mailLabel').style.display="none";
    // currentUser = JSON.parse(localStorage.getItem("currentUser"));
    // document.getElementById('practionersOnly').style.display="none";
    // document.getElementById('practioner').checked = false;
    // document.getElementById('guest').checked = false;
    buildLangSelector();
    buildFoiSelector();

    //profile image
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
        console.log("load image1");
        //prepare the elements for croppie
        var fileupload = document.getElementById("cover_image");
        // var filePath = document.getElementById("spnFilePath");
        var image = document.getElementById("imgFileUpload");
        
        //start here, when clicking the image
        image.onclick = function () {
            console.log("load image2");
            // if (isDisabled == true){
            //   return;
            // }
            //   lockSubmit();
            //open the upload image modal
            fileupload.click();
        };

        
        fileupload.onchange = function () {
            console.log("load image 3");
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

function buildLangSelector(){
    var dynamicSelect = document.getElementById("selectLang");
    let filtered = countriesList.filter((a,i)=>i%2===1);
    filtered.forEach(function(item)
    {
        var newOption = document.createElement("option");
        newOption.text = item.toString();//item.whateverProperty
        dynamicSelect.add(newOption);
    });
      
    langSelector = new Selectr(dynamicSelect, {
      multiple: true,    
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
            
        foiSelector = new Selectr(dynamicSelect, {
            multiple: true,        
        });            
        //   finish loading the page
        $('#loading').hide();
    });    
}

function checkPractioner(){
    if(document.getElementById('practioner').checked == true){
        document.getElementById('guest').checked = false
        document.getElementById('practionersOnly').style.display="";
    }
    else{

        document.getElementById('guest').checked = true
        document.getElementById('practionersOnly').style.display="none";
    }  
}

function checkGuest(){
    if(document.getElementById('guest').checked == true){
        document.getElementById('practioner').checked = false
        document.getElementById('practionersOnly').style.display="none";
    }
    else{
        document.getElementById('practioner').checked = true
        document.getElementById('practionersOnly').style.display="";
    }    
}


function writeUserInfo(){    
                        
    // if there is no profile image set a default empty
    if (typeof(profileImageUrl) === 'undefined') {        
        profileImageUrl = '../gse5/emptyProfile.png';
    }
    
    //check all form variables
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
    
    // get the selected additonal languages
    var LanguageSelector = document.getElementById("selectLang").selectedOptions;
    //turn selected languages into an array to save in firebase
    langs = [];
    for (e in LanguageSelector){
        console.log(LanguageSelector[e].value);
        if(LanguageSelector[e].value != undefined){
        langs.push(LanguageSelector[e].value); 
        }                       
    }
    console.log(langs)

    //check if the user is a guest or practioners
    userStatus = "";
    foiArray = [];
    userStatus = "practioner";

        var foiSelectorValues = document.getElementById("foiList").selectedOptions;
        if(foiSelectorValues.length == 0){
            printError("Please please choose at least 1 field of practice!");
            return;
        }

        
        // console.log(langs);
        for (e in foiSelectorValues){
            console.log(foiSelectorValues[e].value);
            if(foiSelectorValues[e].value != undefined){
                foiArray.push(foiSelectorValues[e].value); 
            }                       
        }
        console.log(foiArray)

    // if(document.getElementById('practioner').checked==true){
    //     console.log("practioner checked");
    //     userStatus = "practioner";

    //     var foiSelectorValues = document.getElementById("foiList").selectedOptions;
    //     if(foiSelectorValues.length == 0){
    //         printError("Please please choose at least 1 field of practice!");
    //         return;
    //     }

        
    //     // console.log(langs);
    //     for (e in foiSelectorValues){
    //         console.log(foiSelectorValues[e].value);
    //         if(foiSelectorValues[e].value != undefined){
    //             foiArray.push(foiSelectorValues[e].value); 
    //         }                       
    //     }
    //     console.log(foiArray)
        
    // }
    // else if(document.getElementById('guest').checked==true){
    //     console.log("guest checked");  
    //     userStatus = "guest";              
    // }
    // else{
    //     printError("Please choose a guest or practionar status");
    //     return;
    // }
    
    var about = document.getElementById("about").value;
    var looking = document.getElementById("looking").value;
    // var enableGuests = document.getElementById("enableGuests").value;
    
    
    if (typeof favoritesArray === 'undefined' || favoritesArray === null) {
        favoritesArray = [];
    }
    if (typeof tempAppId === 'undefined' || tempAppId === null || tempAppId.length == 0) {
        console.log("no tempAppId found");
        
        // variable is undefined or null
        let r = Math.random().toString(36).substring(2);
        
        tempAppId = r;
    }
    
    
    userWebSite = document.getElementById("userWebSite").value;
    facebookUrl = document.getElementById("facebookUrl").value;
    linkedInUrl = document.getElementById("linkedInUrl").value;
    var enableGuests = false
        
    firebase.database().ref('users/' + curUser.uid).set(
        {
        //   username: name,
        appId: tempAppId,
        email: curUser.email,
        name: name,
        lastName: lastName,
        mainLanguage: langs,
        address: address,
        city: city,
        country: country,
        
        enableGuests: enableGuests,
        about: about,
        looking: looking,
        // calArray: calArray,
        // favoritesArray: favoritesArray,
        fieldsOfinterest: foiArray,
        userWebSite:userWebSite,
        facebookUrl:facebookUrl,
        linkedInUrl:linkedInUrl,
        profileImageUrl: profileImageUrl,
        userStatus: userStatus,
        
        

        },function(error)
        {
        if (error) {
            alert (error);
            // The write failed...
        } else {
            info["email"] = curUser.email;
            info["lastName"] = lastName;
            info["name"] = name;
            info["mainLanguage"] = langs;
            info["about"] = about;
            info["looking"] = looking;
            info["address"] = address;
            info["city"] = city;
            info["country"] = country;
            info["enableGuests"] = enableGuests;
            info["luid"] = curUser.uid;
            info["appId"] = tempAppId;
            info["fieldsOfinterest"] = foiArray;
            info["userWebSite"] = userWebSite;
            info["facebookUrl"] = facebookUrl;
            info["linkedInUrl"] = linkedInUrl;
            info["profileImageUrl"] = profileImageUrl;
            info["userStatus"] = userStatus;
            console.log(info);
            
            localStorage.setItem("currentUser", JSON.stringify(info));                  
            window.location.href = "../gse5/test.html";
        
        }
    });    
}

function printError(text){
    alert(text);
}

function saveImageTofb(){
    
    console.log("user: ",curUser.uid);
    const ref = firebase.storage().ref('users/' + curUser.uid);
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
    })
    .catch(console.error);        
}


//last resort - log out//
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