allowTippyGeneric = true;

document.addEventListener('DOMContentLoaded', function () {
    tippy('#btn_menu', {
    content: "Toggle side menu",
    theme: 'tomato',
    onShow(instance) {
        // gtippInstance = instance;
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },   
  });
tippy('#addEvent', {
    content: "Add a new event.<br/> You can also drag across a time on the calendar.",
    allowHTML: true,
    theme: 'tomato',
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#gotoDate', {
    content: "Go to date",
    theme: 'tomato',
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#today', {
    content: "Go to today's date",
    theme: 'tomato',
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#prevDate', {
    content: "Previous date",
    theme: 'tomato',
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#nextDate', {
    content: "Next date",
    theme: 'tomato',
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#calSelector', {
    content: "Change Calendar Display",
    theme: 'tomato',
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#toggleAllFavSelection', {
    content: "Toggle Favorits display",
    theme: 'tomato',
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#icon_toggleSelf', {
    content: "Toggle all users events <br/> or only personal events",
    theme: 'tomato',
    allowHTML: true,
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#Icon_inBox', {
    content: "Open Inbox",
    theme: 'tomato',
    allowHTML: true,
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });
tippy('#openEventsToConfirm', {
    content: 'Click to show Events to confirm list', 
    theme: 'tomato',       
    allowHTML: true,        
    onShow(instance) {
        if (allowTippyGeneric == false) {
            instance.popper.style.display = 'none';
        }
        else {
            instance.popper.style.display = '';
        }
    },
  });

  const button = document.querySelector('#openEventsToConfirm');
    tippy(button, {
        content: 'Event to confirm',
        trigger: 'click',
        allowHTML: true,
        interactive: true,
        placement: 'left',
    });
    tippyInstance = button._tippy;

});