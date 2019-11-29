// require('dotenv').config();
// require('../../acess.env');


// var AWS = require('aws-sdk');

// AWS.config.loadFromPath('s3_config.json');

// var s3Bucket = new AWS.S3( { params: {Bucket: 'output-annotation-adventum'} } );


// var s3 = new AwsS3 ({
//   accessKeyId: process.env.accessKeyId,
//   secretAccessKey: process.env.secretAccessKey,
//   region: '',
// });




// const uploadimage = (params) => {
//     console.log(params,"aws s3 hitsss")

//     buf = new Buffer(params.replace(/^data:image\/\w+;base64,/, ""),'base64')
//     console.log(buf,"bufffff");


//     var data = {
//       Key: 1234, 
//       Body: buf,
//       ContentEncoding: 'base64',
//       ContentType: 'image/jpeg'
//     };
//     console.log(data,"data");


//     s3Bucket.putObject(data, function(err, data){
//         if (err) { 
//           console.log(err);
//           console.log('Error uploading data: ', data); 
//         } else {
//           console.log('succesfully uploaded the image!');

//         }

//     });
// };



// // listDirectories({Prefix:"1003/"});
// export default uploadimage;


var AwsS3 = require ('aws-sdk/clients/s3');
var envVariable=require("../envVariables").default;

// console.log(process.env)
const s3 = new AwsS3 ({
  accessKeyId: envVariable.ACCESS_KEY_ID,
  secretAccessKey: envVariable.SECRET_ACCESS_KEY,
  region: '',
});


const imageUpload = (base64, imageId="1003/003.png") => {
  // console.log(base64, "base");


  

  const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

  const type = base64.split(';')[0].split('/')[1];

  const userId = 1;
  console.log(base64Data, "base64");
  console.log(type, "type");
  // console.log(accessKeyId,secretAccessKey,"access");


  var data = {
    Bucket: 'output-annotation-adventum',
    Key: imageId,
    Body: base64Data,
    ContentEncoding: 'base64',
    ContentType: `image/${type}`
  };
  console.log(data, "data");


  s3.putObject(data, function (err, data) {
    if (err) {
      console.log(err);
      console.log('Error uploading data: ', data);
    } else {
      console.log('succesfully uploaded the image!');

    }

  });

}

module.exports = imageUpload;