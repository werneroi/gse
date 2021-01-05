window.addEventListener('keydown', function(e) {
    // console.log(e)
    if(sourceCal == "alt" || sourceCal == "cal"){
        if (e.altKey == true && e.keyCode == 87){
            console.log('Alt + W'); 
            document.getElementById('calSelector').value = "Week"
            listDisplay = false;
            week()

        }
        if (e.altKey == true && e.keyCode == 68){
            console.log('Alt + d'); 
            document.getElementById('calSelector').value = "Day"
            listDisplay = false;
            day()
            myCalendarAlt.today()

        }
        if (e.altKey == true && e.keyCode == 77){
            console.log('Alt + m'); 
            document.getElementById('calSelector').value = "Month"
            listDisplay = false;
            month()

        }
        if (e.altKey == true && e.keyCode == 76){
            console.log('Alt + L'); 
            document.getElementById('calSelector').value = "List"
            listDisplay = true;
            showAsList()

        }
        if (e.ctrlKey == true && e.keyCode == 87){
            console.log('Ctrl + W'); 
            document.getElementById('calSelector').value = "Timeline Week"
            sourceCal = "cal"
                console.log("5")
                myCalendarAlt.changeView("timelineWeek")
                myCalendarAlt.today()

        }
        if (e.ctrlKey == true && e.keyCode == 68){
            document.getElementById('calSelector').value = "Timeline Day"
            console.log('Ctrl + d'); 
            sourceCal = "cal"
            console.log("5")
            myCalendarAlt.changeView("timelineDay")
            myCalendarAlt.today()

        }
        if (e.ctrlKey == true && e.keyCode == 77){
            document.getElementById('calSelector').value = "Timeline Month"
            console.log('Ctrl + m'); 
            sourceCal = "cal"
            console.log("5")
            myCalendarAlt.changeView("timelineMonth")
            myCalendarAlt.today()

        }
    }
});

