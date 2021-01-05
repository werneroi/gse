var database = firebase.database();
var user = firebase.auth().currentUser;


function test(){
  alert ("write");
}


// function writeUserData() {
//   firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//       var user = firebase.auth().currentUser;
//       var uName = document.getElementById("firstName");
//       var ulName = document.getElementById("lastName");
//       var about = document.getElementById("about");
//       // alert(about.value);
//         firebase.database().ref('users/' + user.uid).set({
//         //   username: name,
//           email: user.email,
//           name: uName.value,
//           lastName: ulName.value,
//           about: about.value,
//         });
//     }
//
//   });
// }


function readUsers(){
  var userId = firebase.auth().currentUser.uid;
return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
  var username = (snapshot.val() && snapshot.val().about) || 'Anonymous';
  alert(username);
  // ...
  });
}

// function logout(){
//
//   if (firebase.auth().currentUser) {
//     // [START signout]
//     // var user = firebase.auth().currentUser
//     // alert(user.email);
//     firebase.auth().signOut();
//     // alert ("signed out");
//     window.location.href = "/login.html";
//
//     // [END signout]
//   }else{
//     alert ("strange");
//     window.location.href = "/index.html";
//   }
// }

function logout(){
  firebase.auth().signOut().then(function() {
    alert ("You are now signed out");
    window.location.href = "../gse5//index.html";
  // Sign-out successful.
    }).catch(function(error) {
      alert ("error");
      // An error happened.
    });
}
