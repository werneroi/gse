/// Initializing croppie in my image_demo div
var image_crop = $('#image_demo').croppie({
    viewport: {
        width: 600,
        height: 300,
        type:'square'
    },
    boundary:{
        width: 650,
        height: 350
    }
});
/// catching up the cover_image change event and binding the image into my croppie. Then show the modal.
$('#cover_image').on('change', function(){
    var reader = new FileReader();
    reader.onload = function (event) {
        image_crop.croppie('bind', {
            url: event.target.result,
        });
    }
    reader.readAsDataURL(this.files[0]);
    $('#uploadimageModal').modal('show');
});