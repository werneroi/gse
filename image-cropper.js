// $(document).ready(function(){
//   // var image_crop = $('#image_demo').croppie({
//   //     viewport: {
//   //         width: 300,
//   //         height: 300,
//   //         type:'circle' //circle
//   //     },
//   //     boundary:{
//   //         width: 350,
//   //         height: 350
//   //     }
//   // });

//   // $('#cover_image').on('click', function(){
    
//   // });

//   $('#cover_image').on('change', function(){
    
//     // $('.modal-header').removeClass('ready');
    
//       var reader = new FileReader();
//       reader.onload = function (event) {
//         $('#cover_image').val(''); // this will clear the input val.
//           image_crop.croppie('bind', {
//               url: event.target.result,
//           });
//       }
//       reader.readAsDataURL(this.files[0]);
//       $('#uploadimageModal').modal('show');
//       console.log("hi");
//   });
//   $('.crop_image').click(function(event){
    
//     $('#imgFileUpload').val('')
//       var formData = new FormData();
    
//       image_crop.croppie('result',{type:'blob',size:{width:600,height:600},format:'png'}).then(function(r) { 
//         document.getElementById('imgFileUpload').src = URL.createObjectURL(r, { oneTimeOnly: true });;
//         // document.getElementById('imgFileUpload').src = r;

//         var img = document.getElementById("imgFileUpload");  // $('img')[0]
//         myImg = r;
//         // src = URL.createObjectURL(r); // set src to blob url  
//         // console.log("image ust",img);
//         saveImageTofb();
//         // gciSaveImage(r);
//        });
       
//       $('#uploadimageModal').modal('hide');
//   });
// });


