firebase.auth().onAuthStateChanged(function(user) {
    console.log("user: " + user);
    getUseInfo();
  });

  function getUseInfo(){
    //--1.load the user from Firebase
    var currentUser = firebase.auth().currentUser;
    console.log(currentUser.uid);

    //2. check if the user has a record already - which means it has comleted the profile
    firebase.database().ref('/users/' + currentUser.uid).once('value').then(function(snapshot) {
    //   console.log(JSON.stringify(snapshot));
    currentUser = (snapshot.val());
    if ((currentUser.name).length>0){
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        window.
    }      
    });
    
  
  }