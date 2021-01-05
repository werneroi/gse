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

  function loginGmail(){
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    return firebase.auth().signInWithPopup(provider)
    .then(function(){
      console.log("google signin succes");
      
      
    })
    .catch(function(error){
      console.log("google sign in error: ",error);
      
    });        
  }

  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // ...
    }
    // The signed-in user info.
    var user = result.user;
    console.log("google signed: "+ user);
    
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });


  firebase.auth().onAuthStateChanged(function(user) {
    console.log("user: " + user);
    
  });