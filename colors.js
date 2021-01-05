document.addEventListener('DOMContentLoaded', function() {
   
});

function openColorPick(pickerName){

    console.log(pickerName.id);
    console.log(sourceCal);
    if(sourceCal == "cal" || sourceCal == "alt"){
        console.log("!")
    }
    else{
        console.log("2")
        return;
    }

    getYpos()

    if(picker !== undefined){
        picker.destroy();
    }
    var modal = document.getElementById("cpicker");  
    var parent = document.getElementById('cpicker');

    // var parent = document.querySelector(classText);
    var picker = new Picker(parent);
    modal.style.display = "block";
    picker.show();    
    if (pickerName.id == 'normalColor'){
        picker.setColor(color_normal_me)                
    }
    else if(pickerName.id == 'guestColor'){
        picker.setColor(color_guest_me)
        
    }
    else if(pickerName.id == 'otherColor'){
        picker.setColor(color_main)
       
    }
    else if(pickerName.id == 'otherGuestColor'){
        picker.setColor(color_guest)
        
    }
    else if(pickerName.id == 'waiting'){
        picker.setColor(color_toBook)
        
    }
    else if(pickerName.id == 'booked'){
        picker.setColor(color_booked)
        
    }
    else if(pickerName.id == 'inviteColor'){
        picker.setColor(color_invite)
        
    }
    else if(pickerName.id == 'deleteColor'){
        picker.setColor(color_deleted)
        
    }
    else if(pickerName.id == 'specialColor'){
        picker.setColor(color_special) 
    }
    picker.onDone = function(color){

        if (pickerName.id == 'normalColor'){
            color_normal_me = color.rgbaString;
            colorArray["normalColor"] = color_normal_me;                        
        }
        else if(pickerName.id == 'guestColor'){
            color_guest_me = color.rgbaString;
            colorArray["guestColor"] = color_guest_me;
        }
        else if(pickerName.id == 'otherColor'){
            color_main = color.rgbaString;
            colorArray["otherColor"] = color_main;
        }
        else if(pickerName.id == 'otherGuestColor'){
            color_guest = color.rgbaString;
            colorArray["otherGuestColor"] = color_guest;
        }
        else if(pickerName.id == 'waiting'){
            color_toBook = color.rgbaString;
            colorArray["waiting"] = color_toBook;
        }
        else if(pickerName.id == 'booked'){
            color_booked = color.rgbaString;
            colorArray["booked"] = color_booked;
        }
        else if(pickerName.id == 'inviteColor'){
            color_invite = color.rgbaString;
            colorArray["invite"] = color_invite;
        }
        else if(pickerName.id == 'deleteColor'){
            color_deleted = color.rgbaString;
            colorArray["deleted"] = color_deleted;
        }
        else if(pickerName.id == 'specialColor'){
            color_special = color.rgbaString;
            colorArray["special"] = color_special;
            console.log("color_special: ",color_special)
        }

        document.getElementById('normalColor').style.color = color_normal_me;
        document.getElementById('guestColor').style.color = color_guest_me;
        document.getElementById('otherGuestColor').style.color = color_guest;
        document.getElementById('otherColor').style.color = color_main;
        document.getElementById('waiting').style.color = color_toBook;
        document.getElementById('booked').style.color = color_booked;
        document.getElementById('deleteColor').style.color = color_deleted;
        document.getElementById('inviteColor').style.color = color_invite;
        document.getElementById('specialColor').style.color = color_special;

        document.documentElement.style.setProperty('--color_normal_me', color_normal_me);
        document.documentElement.style.setProperty('--color_main', color_main);
        document.documentElement.style.setProperty('--color_toBook', color_toBook);
        document.documentElement.style.setProperty('--color_booked', color_booked);
        document.documentElement.style.setProperty('--color_deleted', color_deleted);
        document.documentElement.style.setProperty('--color_invite', color_invite);
        document.documentElement.style.setProperty('--color_special', color_special);
        
        console.log(color);
        myCalendarAlt.destroy();
        // myCalendar.destroy();
        // myCalendar.render();
        myCalendarAlt.render();
        // console.log("normalColor: ",color_normal_me);
        picker.destroy();
        modal.style.display = "none";
        parent.style.display = "none";

        // picker.destroy();

        setYpos()
        
        // write to firebase as prefs
        writeColorsToFB();
        
    };

    // var span = document.getElementsByClassName("closeSingleUser")[0];
    
    
  
    // When the user clicks on <span> (x), close the modal
    // span.onclick = function() {
    //   modal.style.display = "none";
    // }
  
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        parent.style.display = "none";

        picker.destroy();
      }
    }

    $(document).keyup(function(e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            modal.style.display = "none";
            parent.style.display = "none";
            picker.destroy();
        }
    });
}
function writeColorsToFB(){
    console.log("write colors to firebase ", colorArray) 
    allowInit = false;
        firebase.database().ref('/users/'+currentUser.luid).update({
            colors: colorArray
        });
}



