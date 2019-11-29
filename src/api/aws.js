// require('dotenv').config();
// require('../../acess.env');

var AwsS3 = require ('aws-sdk/clients/s3');
var envVariable=require("../envVariables").default;

// console.log(envVariable);

// console.log(envVariable.ACCESS_KEY_ID)

// console.log(envVariable.SECRET_ACCESS_KEY)

const s3 = new AwsS3 ({
  accessKeyId: envVariable.ACCESS_KEY_ID,
  secretAccessKey: envVariable.SECRET_ACCESS_KEY,
  region: '',
});

const listDirectories = (params={}) => {
    console.log("aws s3 hit")
  return new Promise ((resolve, reject) => {
    const s3params = {
      // Bucket: 'gwl-adventum-test-not-labelled',
      Bucket: 'input-annotation-adventum',
      MaxKeys: 150,
      Delimiter: '/',
      ...params
    };
    s3.listObjectsV2 (s3params, (err, data) => {
      if (err) {
        console.log(err)
        reject (err);
      }
      console.log(data)
      resolve (data);
      
    });
  });
};



// listDirectories({Prefix:"1003/"});
export default listDirectories;