firebase.auth().onAuthStateChanged(function(user)
    {
        if (user){
            firebase.database().ref('/users/'+ user.uid).once('value').then(function(snapshot) {
                // favoritesArray =  snapshot.val().favoritesArray;
                console.log("got user: "+snapshot.val().appId);

                myFavArray = snapshot.val().favoritesArray;
                console.log("got myFavArray: "+myFavArray);
            });
        }
    });
      