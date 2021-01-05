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
    
    if(user == null){
      console.log("User not found");
      document.getElementById('loading').style.display = 'none';
      return;
    }
    console.log("AUth Change ",user.uid);
    var userId = user.uid;
    // return 
    firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
      //check if the user has info on firebase already. if it does - go to calendar, if it doesnt go to welcome page
      var userCheck = snapshot.exists();
      if (userCheck == false){
        console.log("User info not found proceed to create a profile");
        window.location.href = "../gse5/newUser.html";
        return;
      }
      else{
        console.log("User found proceed to calendars");
        window.location.href = "../gse5/test.html";
        
      }
    });

  });