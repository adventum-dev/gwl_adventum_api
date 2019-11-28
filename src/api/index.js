import {version} from '../../package.json'
import { Router } from "express";
import Ajv from "ajv";
import validateComplaintAJV from "../models/validateComplaint";
import validateCategoryAJV from "../models/validateCategory";
import validatePublicKeyAJV from "../models/validatePublicKey";

import asyncHandler from 'express-async-handler';
import listDirectories from './aws'
import { Response } from 'aws-sdk';
const axios = require('axios');
var ajv = new Ajv();

export default ({ config, db }) => {
  let api = Router();


  // API for User login 

  api.post("/user_login", (req, res) => {
    let { user_name, password } = req.body;
    let user_type = 'doctor'
    db.query(
      `select * from users where user_name ='${user_name}' and password = '${password}' and user_type='${user_type}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
          console.log(JSON.stringify(err));
        } else {
          console.log(response.rows);
          if (response.rows.length == 0) {
            res.json({ login_message: "Invalid User/ Password" });
          } else {
            let authKey = require("uuid/v1");
            let auth_token = authKey();
            let status = "successfull";
            let login_time = new Date().getTime();
            let query = `insert into session(uuid,user_uuid,token,login_time,active,labelled_image) 
            values ('${response.rows[0].uuid}','${response.rows[0].uuid}','${auth_token}',${login_time},true,0)`;
            console.log(query);
            db.query(query, (err, response1) => {
              if (err) {
                console.log(err.stack);
                console.log(JSON.stringify(err))
              } else {
                res.json({ all: response.rows, auth_token, status });
                console.log(JSON.stringify(err))
              }
            });
          }
        }
      }
    );
  });




  // API for Admin login 

  api.post("/admin_login", (req, res) => {
    let { user_name, password } = req.body;
    let user_type = 'admin'
    db.query(
      `select * from users where user_name ='${user_name}' and password = '${password}' and user_type='${user_type}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
          console.log(JSON.stringify(err));
        } else {
          console.log(response.rows);
          if (response.rows.length == 0) {
            res.json({ login_message: "Invalid User/ Passwordss" });
          } else {
            let authKey = require("uuid/v1");
            let auth_token = authKey();
            let status = "successfull";
            let login_time = new Date().getTime();
            let query = `insert into session(uuid,user_uuid,token,login_time,active,labelled_image) values
             ('${response.rows[0].uuid}','${response.rows[0].uuid}','${auth_token}',${login_time},true,0)`;
            console.log(query);
            db.query(query, (err, response1) => {
              if (err) {
                console.log(err.stack);
                console.log(JSON.stringify(err))
              } else {
                res.json({ all: response.rows, auth_token, status });
                console.log(JSON.stringify(err))
              }
            });
          }
        }
      }
    );
  });



  //logout
  api.put("/logout", (req, res) => {

    const { auth_token } = req.body;
    const logout_time = new Date().getTime();

    db.query(
      `update session set logout_time=${logout_time}, active=false where token='${auth_token}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          res.json({ isloggedIn: false });
        }
      }
    );
  });

  // user verification

  api.post("/verify", (req, res) => {
    const { auth_token } = req.body;
    db.query(
      `select uuid from session where token='${auth_token}' and active=true`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          if (response.rows.length == 0) {
            res.json({ isloggedIn: false });
          } else {
            res.json({ isloggedIn: true });
          }
        }
      }
    );
  });


  //USERS

  // Retrieval of user details

  api.get("/users", (req, res) => {
    db.query(`SELECT uuid, user_name, gender, phone,email, user_type, name from users where active=true 
    order by created_time desc`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "categories": response.rows });
      }
    });

  });


//Retrieval of user_id, user_name, allocated folders
api.get('/users_folders',(req,res) => {

          db.query(`SELECT user_name, MAX(name) as name, ARRAY_AGG(folder_id) as folders FROM users JOIN folders ON 
          users.uuid = folders.doctor_uuid AND users.active = true and folders.active = true GROUP BY user_name`, (err, response) => {
          if(err) {
            console.log(err.stack);
          } else {
            console.log(response.rows);
            res.json({
              usersFolders: response.rows
            })
          }
})
});

//Retrieval of userNames with type = doctor
api.get('/users-doctors',(req,res) => {

  db.query(`SELECT user_name, uuid FROM users WHERE user_type = 'doctor' AND active =true`, (err, response) => {
  if(err) {
    console.log(err.stack);
  } else {
    console.log(response.rows);
    res.json({
      users: response.rows
    })
  }
})
});

// Creation of User

  api.post("/users", (req, res) => {
    //change end point to loginForDoctor
    // const validate = ajv.compile(validateCategoryAJV);
    // const valid = validate(req.body);
    // if (!valid) {
    //   return next({ Errors: validate.errors });
    // }

    const { user_name, name, password, user_type, email,phone, gender, created_by } = req.body;
    console.log(req.body,"body");
    

    const uuidv1 = require('uuid/v1');
    const uuid = uuidv1()

    const created_time = new Date().getTime();
    db.query(`insert into users(uuid,user_name,name,email,phone,password,created_time,active,user_type,gender,created_by) values
    ('${uuid}','${user_name}','${name}','${email}',${phone},'${password}','${created_time}',true,'${user_type}','${gender}','${created_by}')`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
              // res.json({ all: response.rows, status :"success"});
              res.json({"userDetails": response.rows , "status" : "success"});
          }
        
  });
});


//Updation of user details

  // api.put("/users/:cid", (req, res) => {

  //   const { user_name, password } = req.body;
  //   const created_time = new Date().getTime();

  //   //take category_details cid from path and find the cid and update
  //   db.query(`update users set user_name='${user_name}', password='${password}', created_time='${created_time}' where uuid='${req.params.cid}'`,
  //     (err, response) => {
  //       if (err) {
  //         console.log(err.stack);
  //       } else {
  //         console.log(response.rows);
  //         res.json({ version, status: "live", method: "put" });
  //       }
  //     })
  // });

//Deletion of user

  api.put("/users/:uuid", (req, res) => {
  
    db.query(`UPDATE users SET active=false where uuid='${req.params.uuid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          db.query(`UPDATE folders SET active=false where doctor_uuid='${req.params.uuid}'`,
          (err1, response1) => {
            if (err1) {
              console.log(err1.stack);
            } else {
              db.query(`UPDATE images SET isactive=false where user_uuid='${req.params.uuid}'`,
              (err2, response2) => {
                if (err2) {
                  console.log(err2.stack);
                } else {
                  res.json({
                    respone: "success"
                  })
              }
            })
            }
          })
        }
      })
  })

  //SESSION TABLE

  //Retrieval of session details

  api.get("/session", (req, res) => {
    //public_key_details table and return the public_key
    db.query(`SELECT * from session`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "public_key": response.rows });
        }
      })
  })

  // perhaps expose some API metadata at the root
  api.get("/session/:pkid", (req, res) => {

    db.query(`SELECT * from session where uuid='${req.params.pkid}' and active=true`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "public_key": response.rows });
        }
      });
  });

   //Creation of session

  api.post("/session", (req, res, next) => {

    const validate = ajv.compile(validatePublicKeyAJV);
    const valid = validate(req.body);
    if (!valid) {
      return next({ Errors: validate.errors });
    }

    const { uuid, user_name, token, logout_time } = req.body;

    // const uuidv1 = require('uuid/v1');
    // const uuid = uuidv1()

    const login_time = new Date().getTime();

    db.query(`insert into session(uuid,user_name,token,login_time,logout_time,active) values('${token}','${user_name}','${token}','${login_time}','${logout_time}',true)`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "status": "successfull", "response": response.rows });
        }
      });
  });

// Updation of session details

  api.put("/session/:pkid", (req, res) => {

    const { token } = req.body;
    const updated_time = new Date().getTime();

    //take public_key_details cid from path and find the pkid and update
    db.query(`update session set logout_time='${updated_time}', token='${token}' where uuid='${req.params.pkid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ version, status: "live", method: "put" });
        }
      })
  });

  //Deletion of session details

  api.delete("/session/:pkid", (req, res) => {

    //take public_key_details cid from path and find the pkid and update flag
    db.query(`update session set active=false where uuid='${req.params.pkid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ version, status: "live", method: "delete" });
        }
      })
  })


  //IMAGES TABLE
    //Retrieval of images

  api.get("/images", (req, res) => {
    db.query(`SELECT * from images where isactive=true`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "images": response.rows });
        }
      })
  })

// Retrieval of images on the basis of uuid
  api.get("/images/:pkid", (req, res) => {
    const { uuid } = req.body;
    db.query(`SELECT * from images where uuid='${req.params.pkid}' and isactive=true`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "images": response.rows });
        }
      })
  })

// Retrieval of images on the basis of image_id
  api.get("/images_id/:pkid", (req, res) => {
    db.query(`SELECT * from images where image_id='${req.params.pkid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "images": response.rows });
        }
      })
  });

//Retrieval of uuid from images
  api.get("/image_uuid/:id", (req, res) => {
       let finalArr =[];
    db.query(`SELECT images.uuid, image_id from images where folder_id = (SELECT folder_id from images where uuid='${req.params.id}')`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        let tempArr =[];
        tempArr= response.rows;
        tempArr.forEach(arr =>  {
          console.log(arr,"arr");
          
          if(!arr.image_id.includes('.mp4')){
             finalArr.push(arr)
          }
        })
        console.log(finalArr,"finalARR");
        
        res.json({ "image_uuid": finalArr});
      }
    });
  });


  // Retrieval of image status
  api.get("/image_status_id/:fid", (req, res) => {

    db.query(`SELECT status from images where uuid='${req.params.fid}'`, 
    (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "status": response.rows });
      }
    });
  });

 //Creation of image

  api.post("/images", (req, res, next) => {

    // const validate = ajv.compile(validatePublicKeyAJV);
    // const valid = validate(req.body);
    // if (!valid) {
    //   return next({ Errors: validate.errors });
    // }

    const { uuid, user_uuid, folder_id, image_id, status, created_by, labelled_images_id } = req.body;
    // const { uuid, user_uuid, folder_id, image_id, status, created_by, created_date } = req.body;

    const uuidv1 = require('uuid/v1');
    const uuid1 = uuidv1()

    const created_date = new Date().getTime();


    db.query(`insert into images(uuid,user_uuid,folder_id,image_id,status,created_by,created_date,isactive,labelled_images_id) values('${uuid1}','${user_uuid}','${folder_id}','${image_id}','${status}','${created_by}',${created_date},true,'${labelled_images_id}')`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "status": "successfull", "response": response.rows });
        }
      });
  });

//Updation of image

  api.put("/images/:id", (req, res) => {
    const { status, updated_by } = req.body;
    const updated_time = new Date().getTime();

    //take complain_details cid from path and find the cpid and update
    db.query(`update images set status='${status}', updated_by='${updated_by}', updated_date='${updated_time}' where user_uuid='${req.params.id}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ version, status: "live", method: "put" });
        }
      })
  });

  //Deletion of image

  api.delete("/images/:pkid", (req, res) => {

    //take public_key_details cid from path and find the pkid and update flag
    db.query(`update images set isactive=true where user_uuid='${req.params.pkid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ version, status: "live", method: "delete" });
        }
      })
  })


  //FOLDERS TABLE


   //Retrieval of folders
  api.get("/folder-ids", (req, res) => {
    db.query(`select folder_id from folders where active = true`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ folders: response.rows });
        }
      })
  })


  // Retrieval of images based on the folder_id

  api.get("/images_unique_images/:cid", (req, res) => {

    db.query(`select * from images where folder_id='${req.params.cid}' and isactive=true`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ categories: response.rows });
      }
    });
  });

//Retrieval of image details based on uuid

  api.get("/image_details/:uuid", (req, res) => {

    db.query(`SELECT * from patient_info where folder_id = (select folder_id from images where uuid= '${req.params.uuid}')`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "categories": response.rows });
      }
    });
  });

  const getPatientDetails = async (patientDetailsKey) => {
    try {

      return  axios.default.get(`https://input-annotation-adventum.s3.us-east-2.amazonaws.com/${patientDetailsKey}`)

    } catch (error) {
      console.log(error);
      
    }

  }


  // Allocating folders to the NEW USER
  api.post('/allocate-folder/new', (req,res) => {
    const {userDetails,folderInfo,created_by} = req.body;
    const created_date = new Date().getTime();
    let uuid = require('uuid/v1');
   let uuid1 = () => uuid();
   let uuidArr = [];
   let patientDetailsKey ='';
   let patientDetailsArray =[];

   console.log(uuid,"uuid");
   console.log(userDetails,"user");
   console.log(folderInfo,"folderInfo");

   folderInfo.forEach( u => {
    uuidArr.push(uuid1());
  })
  console.log(uuidArr,"arrrrr");

    folderInfo.forEach( folder => {
      folder.keys.forEach ( key => {
        if(key.includes('.json')){
          patientDetailsKey = key;
        }
      })
    })
        console.log(patientDetailsKey,"patientDetailsKey");

         
          let setPatientDetails = async () => {
           patientDetailsArray =await  getPatientDetails(patientDetailsKey).then(response => {
                  //console.log(b,"bbbb")
                  console.log(response.data,"data")
                  return response.data;
                
              }).catch(error => {
                console.log(error)
              })
              console.log(patientDetailsArray,"patientdetails");

              let rows ='';
              let rowArr =[];
              let image_uuid = null;
              patientDetailsArray.forEach( patient => { 
                let study_id = patient.Study_ID;
                let age = patient.Age;
                let gender= patient.Gender;
                let date_of_birth= patient.DOB;
                let date_of_scan=patient.San_Date;
                let device= patient.Device;
                let eye=patient.Eye;
          
                rows = `'${study_id}', ${age}, '${gender}', '${date_of_birth}', '${date_of_scan}','${device}','${eye}', 
                null,${created_date},'${created_by}',null,null,true`
                 rowArr.push(rows); 
                })
          
                let newRow = '';
                let uniqueUuid = '';
                uuidArr.map(( uuid , i)=> { 
                  if (newRow.length != 0) {
                    newRow += ',';
                  }
                uniqueUuid = uuid;
                newRow += `('${uniqueUuid}',${rowArr[i]})`
          
              })
              console.log(rows,"rows");
              console.log(newRow,"newRows");  
            let q = `insert into patient_info values ${newRow}`;
            console.log(q,"qqqq");
            
          
              db.query(`insert into patient_info values ${newRow}`,
              (err, response) => {
                if (err) {
                  console.log(err.stack);
                } else {
                  let val ='';
                  let folder_status = 'not opened'
                  folderInfo.forEach( (folder,index) => { 
                    if (val.length != 0) {
                      val += ',';
                    }
                    let folder_id1 = folder.id;
                   
                    uuidArr[index];
                    val += `('${uuid()}','${userDetails.user_name.uuid}','${ uuidArr[index]}','${folder_id1}','${folder_status}','${created_by}',
                    ${created_date},null,null,null,true )`
                  })
                  console.log(val,"val");
                  
                  db.query(`INSERT  into folders values ${val} `,
                  (err1, response1) => {
                    if (err1) {
                      console.log(err1.stack);
                    } else {
                       
                      let imageResult = '';
                      let image_status = 'not labelled'
                      let tempArr =[];
                      let folderInfoExcludeJson =[];
                      folderInfo.forEach( folder => {
                            tempArr.push({id:folder.id, keys: folder.keys.map( (k) => {
                                    if(!k.includes('.json')){
                                      return k
                                    
                                    } else {
                                      return 
                                    }
                                  }
                              )});
                          
                      })
                      tempArr.forEach(folder => {
                          folderInfoExcludeJson.push({id: folder.id, keys: folder.keys.filter(k => {
                            if(k!=undefined){
                              return k
                            }
                          } )})
                      })
                      folderInfoExcludeJson.forEach(folder => {
          
                         let folder_id2 = folder.id;
                         console.log(folder_id2,"folderid2");
                         
                         folder.keys.forEach( image => {
                          if (imageResult.length != 0) {
                            imageResult += ',';
                          }
                          let image_id = image;
                          imageResult += `('${uuid()}','${userDetails.user_name.uuid}','${folder_id2}','${image_id}','${image_status}', '${created_by}',
                          ${created_date},null,null,true, null)`
          
                         })               
                      })
                      console.log(imageResult,"imageResult");
                      db.query(`INSERT into images values ${imageResult}`,
                      (err2, response2) => {
                        if(err2){
                          console.log(err2.stack);
                          
                        }else {
                          res.json ({
                            response : "success"
                          })
                        }
                      }
                      )           
                    }
                  });
                }
              });            
          }
               setPatientDetails();
          
         
        
         
console.log(patientDetailsArray,"patientDetailsArray");


   
   
  
  });

  //Transferring folder to the USER
  api.put('/transfer-folder', (req,res) => {
    const {userDetails, updated_by} = req.body;
    const updated_date = new Date().getTime();
   console.log(userDetails,"user");
   console.log(updated_by,"updated_by");
   
    let rows ='';
    userDetails.folderDetails.forEach( folder => { 
      if (rows.length != 0) {
        rows += ',';
      }
      let folder_id=folder.value;
      console.log(rows,"rrrr");
      
      rows += `'${folder_id}'`
     })
console.log(rows,"rows");
console.log(userDetails.user_name.uuid,"uuuu");
// let q = `UPDATE folders SET doctor_uuid = '${userDetails.user_name.uuid}' WHERE folder_id IN(${rows})`;
// console.log(q,"q");


    db.query(`UPDATE folders SET doctor_uuid = '${userDetails.user_name.uuid}', updated_by = '${updated_by}',
    updated_time = ${updated_date} WHERE folder_id IN(${rows})`,
    (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        db.query(`UPDATE images SET user_uuid = '${userDetails.user_name.uuid}', updated_by = '${updated_by}',
         updated_date = ${updated_date} WHERE folder_id IN(${rows})`,
        (err1, response1) => {
          if (err1) {
            console.log(err1.stack);
          } else {
            res.json({ response : "success"})
          }
        });
      }
    }
    )
  });

  // Updation of images with image status and folder status (LABELLED)
  api.put("/images_labelled/:cid", (req, res) => {

    const { updated_by,image_id, user_uuid } = req.body;
    const updated_time = new Date().getTime();
    const updated_date = new Date().getTime();
    let status = 'not completed';
    let label = 'labelled';

    db.query(
      `update images set status='${label}',updated_date=${updated_date}, updated_by='${updated_by}', 
      labelled_image_id ='${image_id}' where uuid='${req.params.cid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows, "response");
          console.log(req.params.cid, "cid");

          db.query(`select folder_id, image_id from images where uuid= '${req.params.cid}' and isactive =true`,
            (err, response1) => {
              if (err) {
                console.log(err.stack);
              }
              else {
                console.log(response1.rows, "response1");

                db.query(
                  `update folders set folder_status = '${status}', last_labelled ='${response1.rows[0].image_id}',
                  updated_by='${updated_by}', updated_time=${updated_time} where folder_id = '${response1.rows[0].folder_id}'`,
                  (err, response2) => {
                    if (err) {
                      console.log(err.stack);
                    }
                    else {
                      db.query(
                        `update session set labelled_image = labelled_image+1 where active = true and user_uuid = '${user_uuid}'`,
                        (err, response3) => {
                          if (err) {
                            console.log(err.stack);
                          }
                          else {
                            res.json({
                              status: "success"
                            })
                          }
                        });
                    
                    }
                  }
                )
              }
            })
        }
      }
    );
  });
  

  // Updation of images with image status and folder status (UNDER EVALUATION)
  api.put("/images_evaluation/:cid", (req, res) => {

    const { updated_by,user_uuid } = req.body;
    const label = "under evaluation"
    const updated_date = new Date().getTime();
    let status = 'under evaluation';
    const updated_time = new Date().getTime();

    db.query(
      `update images set status='${label}',updated_date=${updated_date}, updated_by='${updated_by}' where uuid='${req.params.cid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows, "response");
          db.query(`select folder_id, image_id, status from images where uuid= '${req.params.cid}'`,
            (err, response1) => {
              if (err) {
                console.log(err.stack);
              }
              else {
                console.log(response1.rows, "response1");
                let image_status = response1.rows[0];
                db.query(
                  `update folders set folder_status = '${status}', last_labelled ='${response1.rows[0].image_id}', 
                  updated_by = '${updated_by}', updated_time= ${updated_time} where folder_id = '${response1.rows[0].folder_id}'`,
                  (err, response2) => {
                    if (err) {
                      console.log(err.stack);
                    }
                    else {
                      if(image_status== 'labelled'){

                        db.query(
                         `update session set labelled_image = labelled_image-1 where active = true and user_uuid = '${user_uuid}'`,
                         (err, response3) => {
                           if (err) {
                             console.log(err.stack);
                           }
                           else {
                             res.json({
                               status: "success"
                             })
                           }
                         });
                       }
                       else {
                         res.json({
                           status: "success"
                         })
                       }
                    }
                  }
                )
              }
            })
        }
      }
    );
  });



   // Retrieval of folder status based on folder_id

  api.get("/folder_status_complted/:fid", (req, res) => {

    db.query(`SELECT folder_status from folders where folder_id='${req.params.fid}'`, 
    (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "folder_status": response.rows });
      }
    });
  });

  //Updating folder_status

  api.put("/folder_status_complete/:id", (req, res) => {

    const {updated_by,status} = req.body;
    const updated_time = new Date().getTime();
    // const status = 'completed';

    db.query(`update folders set folder_status='${status}', updated_by='${updated_by}', updated_time='${updated_time}' where folder_id='${req.params.id}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ version, status: "live", method: "put" });
        }
      })
  });

// Retrieval of folders based on folder status
api.get("/folder_status/:path/:docid", (req, res) => {


  // db.query(`SELECT * from folders where folder_status='${req.params.path}' order by folder_id asc`, 
  db.query(`SELECT * from folders where folder_status='${req.params.path}' and doctor_uuid='${req.params.docid}' and active =true`,
    (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "image_uuid": response.rows });
      }
    });
});


    // Retrieval of total number of images labelled

  api.get("/images_labelled_count", (req, res) => {
    db.query(`select count(status) from images where status='labelled'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ count: response.rows, counts: "succuss" });
        }
      })
  })

  //API to count number of cases i.e. folders and number of cases solvedi.e. labelled images
  api.get("/folders_cases_and_labelled_images_count", (req, res) => {
    db.query(`select count(folder_id) from folders where active =true `,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows, "response");
          db.query(`select labelled_image from session where labelled_image !=0`,
            (err1, response1) => {
              if (err1) {
                console.log(err1.stack);
              } else {
                let labelled_images = 0
                console.log(response1.rows, "response1");
                response1.rows.forEach(c =>
                  labelled_images = labelled_images + c.labelled_image)
                res.json({
                  NoOfFolders: response.rows[0].count,
                  NoOfLabelledImages: labelled_images
                });
              }
            })
        }
      })
  })

//PATIENT_INFO TABLE


//Retrieval of patient details based on folder_id
  api.get("/patient_info/:cid", (req, res) => {

    db.query(`SELECT * from patient_info where folder_id='${req.params.cid}'`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "categories": response.rows });
      }
    });
  });

  //Retrieval of patient details based on uuid
  api.get("/patient_info_uuid/:uuid", (req, res) => {

    db.query(`SELECT * from patient_info where uuid=(SELECT patient_uuid FROM folders WHERE folder_id = (SELECT 
      folder_id FROM images WHERE uuid = '${req.params.uuid}'))`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "patientInfo": response.rows });
      }
    });
  });



  //Admin statitistics

  api.get("/admin_stats", (req, res) => {
    //API to fetch total number of doctors

    let userType = 'doctor';
    db.query(`SELECT count(uuid) from users where user_type='${userType}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          res.json({
            countOfDoctors: response.rows
          });
        }
      }
    )
  });

  // User statistics
  api.get("/user_stats", (req, res) => {
    //API to fetch user details, No of images assigned to user, No of images labelled, No of hours
 
    db.query(`SELECT  x.user_name, MAX(x.name) AS name ,MAX(labelled_image) AS labelled_image,
    MAX(x.pending_images) AS pending_images, MAX(x.folders) AS folders,
    ARRAY_AGG(((DATE_PART('day', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp
        - TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp) * 24 + 
             DATE_PART('hour', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp 
           - TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) * 60 +
             DATE_PART('minute', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp -
           TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) * 60 +
             DATE_PART('second',TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp -
           TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) AS No_of_hours,
    
        COUNT(TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'DD/MM/YYYY HH24:MI:SS'))AS no_of_sessions FROM session JOIN
    
    (SELECT b.uuid, MAX(b.user_name) AS user_name,MAX(b.folders) AS folders, MAX(b.name) AS name,
    COUNT(image_id) FILTER(WHERE images.status IN('under evaluation', 'not labelled')) AS pending_images
    FROM images JOIN (SELECT users.uuid,user_name, users.name, COUNT(folder_id) AS folders FROM users JOIN folders ON
    users.uuid=folders.doctor_uuid AND users.active = true AND folders.active =true GROUP BY users.uuid) b ON images.user_uuid= b.uuid 
    AND images.isactive =true GROUP BY b.uuid) x ON session.user_uuid = x.uuid AND session.active=false GROUP BY x.user_name`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          let arr = [];
          console.log(response.rows, "response");
          response.rows.forEach(r =>
            arr.push(r));
          console.log(arr, "no of hours");

          let hours = 0;
          let minutes = 0;
          let seconds = 0;
          let totalTime = '';
          let totalSeconds = 0;
          arr.forEach(a => {
            console.log(a, "aaa");
            a.no_of_hours.forEach(f =>
              totalSeconds = totalSeconds + f

            )
            console.log(totalSeconds, "totalSeconds");
            hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            minutes = Math.floor(totalSeconds / 60);
            seconds = totalSeconds % 60;
            console.log(hours, minutes, seconds, "hms");
            totalTime = hours + ':' + minutes + ':' + seconds;

            a.time = totalTime
            totalSeconds = 0;
          })


          console.log(arr, "array");

          res.json({
            res: arr

          })


        }
      }
    )
  });

  // api to fetch user details and no of hours
  api.get("/user_evaluation_no_of_hours_graph", (req, res) => {

    db.query(`SELECT b.user_name,

array_agg(((DATE_PART('day', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp
  - TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp) * 24 + 
       DATE_PART('hour', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp 
     - TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) * 60 +
       DATE_PART('minute', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp -
     TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) * 60 +
       DATE_PART('second',TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp -
     TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) AS No_of_hours

 FROM session JOIN
(SELECT users.uuid,users.name,user_name, COUNT(image_id) AS images FROM users JOIN images ON users.uuid=images.user_uuid
AND users.active= true GROUP BY users.uuid) b ON session.user_uuid= b.uuid AND active=false GROUP BY b.user_name`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          let arr = [];
          console.log(response.rows, "response");
          response.rows.forEach(r =>
            arr.push(r));
          console.log(arr, "no of hours");

          let hours = 0;
          let minutes = 0;
          let seconds = 0;
          let totalTime = '';
          let totalSeconds = 0;
          arr.forEach(a => {
            console.log(a, "aaa");
            a.no_of_hours.forEach(f =>
              totalSeconds = totalSeconds + f

            )
            console.log(totalSeconds, "toyjvvkh");
            hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            minutes = Math.floor(totalSeconds / 60);
            seconds = totalSeconds % 60;
            console.log(hours, minutes, seconds, "hms");
            totalTime = hours + '.' + minutes ;

            a.time = totalTime
            totalSeconds = 0;
          })
          console.log(arr, "hjhgjgvi");

          res.json({
            res: arr
          })
        }
      }
    )
  });

  //API to count number of images labelled by each user
  api.get("/labelled_images_count_graph", (req, res) => {
    db.query(`select users.user_name, (select sum(s) from unnest(array_agg(labelled_image)) s) as labelled_images
     from users join session on session.user_uuid=users.uuid and session.active= false  group by users.user_name`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows, "response");
           res.json({
             res: response.rows
           })
        }
      })
  });

  // API to find the rate of labelled images 
  api.post("/rate_of_labelled_images_graph", (req,res) => {
    const {requiredDate,currentDate} = req.body;
    // let yesterdayQuery = `SELECT MAX(users.uuid) as uuid, users.user_name,array_agg(TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'DD/MM/YYYY HH24:MI:SS')) AS login,
    // array_agg(TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'DD/MM/YYYY HH24:MI:SS')) AS logout, array_agg(session.labelled_image) AS labelled_image
    //  FROM users JOIN session ON users.uuid= session.user_uuid AND session.active =false GROUP BY users.user_name`;

    
     db.query(`SELECT MAX(users.uuid) as uuid, users.user_name,array_agg(TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'DD/MM/YYYY HH24:MI:SS')) AS login,
    array_agg(TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'DD/MM/YYYY HH24:MI:SS')) AS logout, 
    (select sum(s) from unnest(array_agg(session.labelled_image)) s) AS labelled_image FROM users JOIN session ON 
    users.uuid= session.user_uuid AND session.active =false AND TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'DD/MM/YYYY') 
    BETWEEN '${requiredDate}' AND '${currentDate}' GROUP BY users.user_name`,(err, response) => {
       if (err) {
         console.log(err.stack);
       } else {
         
         console.log(response.rows, "response");
          // let images =[];
          //  response.rows.forEach(resp => {            
          //   resp.login.forEach( (a, index) => {
                     
          //    if(a.includes(yesterdayDate) && resp.labelled_image[index]!= 0){          
          //      images.push({
          //        user_name: resp.user_name, labelled_images:resp.labelled_image[index]
          //      })
          //        } })
          //       }
          // )
          // console.log(images,"images array");
                     
          res.json({
            res: response.rows
          })
       }
     })


  });

  //API to fetch 

 

// for compare image add folder id
  api.get("/image_compare", (req, res) => {
    const label ='true';
    db.query(`SELECT * from images where isactive='${label}' `, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ 
          "image_label": response.rows 
        });
      }
    });
   });


   api.get("/s3bucket", (req,res) =>{
     let tempArr = [];
     listDirectories().then((response)=>{
      response.CommonPrefixes.map(prefix => {
      tempArr.push(prefix.Prefix.replace('/',''));
      })
      res.json({Array: tempArr});
     })
   })

   api.get("/s3bucket/:cid", (req,res) =>{

    const { folder } = req.body;
    //  response
     listDirectories({Prefix:'${req.params.cid}'}).then((response)=>{
      // listDirectories({Prefix:'${folder}'}).then((response)=>{
      res.json(response);
     })
   })

// s3 bucket API to get folder details
   api.post("/s3bucketARRAY",asyncHandler(async (req, res, next) =>{
    //  response
    // var folder=["1003/","1004/","1005/","1006/"];
    const { folder_ids } = req.body;

    var folderassests ={};
    console.log("Api hit")
    for(var i=0;i<folder_ids.length;i++){
      console.log(folder_ids[i])
       const folderRes = await listDirectories({Prefix:folder_ids[i]});
      console.log(folderRes,"folderres");
      folderassests[folder_ids[i]]=folderRes;      

    console.log("transaction completed")
   }

      res.json( { response:folderassests});
  }))
  

  return api;
   
};

