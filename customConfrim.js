var confirmCheck = false
var confirmModal = ""
var confirmId = ""
var confirmAnswer = ""

document.addEventListener('DOMContentLoaded', function () {
    /* FOR TESTING PURPOSES*/
    // openConfirm("Are you sure you want to delete this?")
})

const Confirm = {
    open (confirmId,options) {
        options = Object.assign({}, {
            title: '',
            message: '',
            id: '',
            okText: 'OK',
            cancelText: 'Cancel',
            cancelDisplay: "",
            onok: function () {},
            oncancel: function () {}
        }, options);
        
        const html = `
            <div class="confirm">
                <div class="confirm__window">
                    <div class="confirm__titlebar">
                        <span class="confirm__title">${options.title}</span>
                        <button class="confirm__close">&times;</button>
                    </div>
                    <div class="confirm__content">${options.message}</div>
                    <div class="confirm__buttons">
                        <button class="confirm__button confirm__button--ok confirm__button--fill">${options.okText}</button>
                        <button class="confirm__button confirm__button--cancel" style="display: ${options.cancelDisplay}">${options.cancelText}</button>
                    </div>
                    <div class="confirm__check">
                        <input type = "checkbox" class = "confirm__check">Never Show this again</input>
                    </div>
                </div>
            </div>
        `;

        console.log("id: ",confirmId)
        const template = document.createElement('template');
        template.innerHTML = html;

        // Elements
        const confirmEl = template.content.querySelector('.confirm');
        const btnClose = template.content.querySelector('.confirm__close');
        const btnOk = template.content.querySelector('.confirm__button--ok');
        const btnCancel = template.content.querySelector('.confirm__button--cancel');
      
        const confirmCheckBox = template.content.querySelector('.confirm__check');

        confirmEl.addEventListener('click', e => {
            if (e.target === confirmEl) {
                options.oncancel();
                this._close(confirmEl);
            }
        });
      
        
        btnOk.addEventListener('click', () => {
            options.onok();
            this._close(confirmEl);
        });
        
        [btnCancel, btnClose].forEach(el => {
            el.addEventListener('click', () => {
                options.oncancel();
                this._close(confirmEl);
            });
        });
        
        confirmCheckBox.addEventListener('click', () => {
            console.log("checked ", confirmId)
            firebase.database().ref("settings/" + currentUser.appId + "/confirmCheck/"+confirmId).update({
                confirmId: true ,
            })
            confirmId = ""
        })

        document.body.appendChild(template.content);
    },

    _close (confirmEl) {
        confirmEl.classList.add('confirm--close');

        confirmEl.addEventListener('animationend', () => {
            document.body.removeChild(confirmEl);
        });
    }
};


// function openConfirm(id, message){
//     console.log("openConfirm")
//     if (!confirmCheck){    
//         confirmModal = document.getElementById("modalCanvas")
//         confirmModal.style.display = "flex"
//         confirmTextBody = document.getElementById("confirmText_Body")
//         confirmTextBody.innerHTML = message
//         confirmCheck = id
//     }
// }
function confirmAccept(message){
    console.log("confirmAccept ",message);    
    // closeConfirmModal()
}

function confirmCancel(){
    console.log("confirmCancel");
    closeConfirmModal()
}

function toggleConfirmCheck(){
    console.log("toggleConfirmCheck");
    if (confirmCheck == false){
        confirmCheck = true;
        /* save the confirmCheck to firebase */
        
    }
    else{
        confirmCheck = false
    }

    /* SAVE THE CONFIRM CHECKS BASED ON THE CONFIRM ID*/
    firebase.database().ref("settings/" + currentUser.appId + "/confirmCheck").update({
        id: confirmCheck ,
    })
}

function closeConfirmModal(){
    confirmModal.style.display = "none"
}