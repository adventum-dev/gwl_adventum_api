var AwsS3 = require ('aws-sdk/clients/s3');
const s3 = new AwsS3 ({
  accessKeyId: '',
  secretAccessKey: '',
  region: '',
});

const listDirectories = (params={}) => {
    console.log("aws s3 hit")
  return new Promise ((resolve, reject) => {
    const s3params = {
      Bucket: 'gwl-adventum-test-not-labelled',
      MaxKeys: 30,
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