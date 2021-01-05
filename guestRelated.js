function toggleGuest() {
    console.log("toggleGuest", eventSingle.id);
    if (document.getElementById("acceptGuest_singlePage").checked == true) {

        console.log("allow guest now");
        eventSingle.setExtendedProp('acceptGuest', true);
        eventSingle.setProp("editable", true)
        eventSingle.setProp("eventResizableFromStart", true)
    }
    else {
        console.log("cancel guest now");
        eventSingle.setExtendedProp('acceptGuest', false);
        eventSingle.setProp("editable", true)
        eventSingle.setProp("eventResizableFromStart", true)
    }
    calendarSingle.getEventById(eventSingle.id).remove();
    calendarSingle.addEvent(eventSingle);
}