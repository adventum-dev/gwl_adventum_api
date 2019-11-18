import { version } from '../../package.json';
import { Router } from "express";
import Ajv from "ajv";
import validateComplaintAJV from "../models/validateComplaint";
import validateCategoryAJV from "../models/validateCategory";
import validatePublicKeyAJV from "../models/validatePublicKey";
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
            let query = `insert into session(uuid,user_uuid,token,login_time,active) values ('${response.rows[0].uuid}','${response.rows[0].uuid}','${auth_token}',${login_time},true)`;
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
            let query = `insert into session(uuid,user_uuid,token,login_time,active) values ('${response.rows[0].uuid}','${response.rows[0].uuid}','${auth_token}',${login_time},true)`;
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



  //user TABLE

  api.get("/users", (req, res) => {
    db.query("SELECT * from users where active=true", (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "categories": response.rows });
      }
    });

  });


  api.get("/users/:cid", (req, res) => {

    db.query(`SELECT * from users where uuid='${req.params.cid}' and active=true`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "categories": response.rows });
      }
    });
  });


  api.post("/users", (req, res, next) => {
    //change end point to loginForDoctor
    // const validate = ajv.compile(validateCategoryAJV);
    // const valid = validate(req.body);
    // if (!valid) {
    //   return next({ Errors: validate.errors });
    // }

    const { user_name, name, password, user_type, email, gender, created_by } = req.body;

    const uuidv1 = require('uuid/v1');
    const uuid = uuidv1()

    const created_time = new Date().getTime();

    // db.query(`insert into users(uuid,user_name,name,email,password,created_time,active,user_type,gender,created_by) values('${uuid}','${user_name}','${name}','${email}','${password}','${created_time}',true,'${user_type}','${gender}','${created_by}')`,
    //   (err, response) => {
    //     if (err) {
    //       console.log(err.stack);
    //     } else {
    //       console.log(response.rows);
    //       res.json({ "status": "successfull", "response": response.rows });
    //     }
    //   });


    db.query(`insert into users(uuid,user_name,name,email,password,created_time,active,user_type,gender,created_by) values('${uuid}','${user_name}','${name}','${email}','${password}','${created_time}',true,'${user_type}','${gender}','${created_by}')`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          let query = `select * from users`;
          db.query(query, (err, response1) => {
            if (err) {
              console.log(err.stack);
              console.log(JSON.stringify(err))
            } else {
              // res.json({ all: response.rows, status :"success"});
              res.json({ "status": "success", "response": response1.rows });

            }
          })
        };
      });


  });




  api.put("/users/:cid", (req, res) => {

    const { user_name, password } = req.body;
    const created_time = new Date().getTime();

    //take category_details cid from path and find the cid and update
    db.query(`update users set user_name='${user_name}', password='${password}', created_time='${created_time}' where uuid='${req.params.cid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ version, status: "live", method: "put" });
        }
      })
  });

  api.delete("/users/:cid", (req, res) => {
    //take category_details cid from path and find the cid and update flag
    db.query(`update users set active=false where uuid='${req.params.cid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ version, status: "live", method: "delete" });
        }
      })
  })

  //Sesssion details TABLE

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


  //images TABLE

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
  })


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


  // Unique folder from images table

  api.get("/images_unique_folder", (req, res) => {
    db.query(`select distinct folder_id from images order by folder_id`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "images": response.rows });
        }
      })
  })


  // select images based on folder_id

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

  // for image labelled GET


  //images labelled
  api.put("/images_labelled/:cid", (req, res) => {

    const { updated_by } = req.body;
    const updated_time = new Date().getTime();
    const label = "labelled"
    const updated_date = new Date().getTime();
    let status = 'not completed';

    db.query(
      `update images set status='${label}',updated_date=${updated_date} where uuid='${req.params.cid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows, "response");
          console.log(req.params.cid, "cid");

          db.query(`select folder_id, image_id from images where uuid= '${req.params.cid}'`,
            (err, response1) => {
              if (err) {
                console.log(err.stack);
              }
              else {
                console.log(response1.rows, "response1");

                db.query(
                  `update folders set folder_status = '${status}', last_labelled ='${response1.rows[0].image_id}', updated_time=
                 ${updated_time} where folder_id = '${response1.rows[0].folder_id}'`,
                  (err, response2) => {
                    if (err) {
                      console.log(err.stack);
                    }
                    else {

                      db.query(
                        `update patient_info set last_labelled = '${response1.rows[0].image_id}' where folder_id = '${response1.rows[0].folder_id}'`,
                        (err, response2) => {
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



  //images under evaluation
  api.put("/images_evaluation/:cid", (req, res) => {

    const { updated_by } = req.body;
    const label = "under evaluation"
    const updated_date = new Date().getTime();
    let status = 'under evaluation';
    const updated_time = new Date().getTime();

    db.query(
      `update images set status='${label}',updated_date=${updated_date} where uuid='${req.params.cid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows, "response");
          db.query(`select folder_id, image_id from images where uuid= '${req.params.cid}'`,
            (err, response1) => {
              if (err) {
                console.log(err.stack);
              }
              else {
                console.log(response1.rows, "response1");

                db.query(
                  `update folders set folder_status = '${status}', last_labelled ='${response1.rows[0].image_id}', updated_time= ${updated_time} where folder_id = '${response1.rows[0].folder_id}'`,
                  (err, response2) => {
                    if (err) {
                      console.log(err.stack);
                    }
                    else {

                      db.query(
                        `update patient_info set last_labelled = '${response1.rows[0].image_id}' where folder_id = '${response1.rows[0].folder_id}'`,
                        (err, response2) => {
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

  // total number of images labelled

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

  //API to count number of cases i.e. images and number of cases solvedi.e. labelled images
  api.get("/images_cases_and_labelled_images_count", (req, res) => {
    db.query(`select count(image_id) from images `,
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
                  NoOfImages: response.rows[0].count,
                  NoOfLabelledImages: labelled_images
                });
              }
            })
        }
      })
  })


  api.post("/patient_info", (req, res, next) => {


    const { image_uuid, study_id, age, gender, date_of_birth, date_of_scan, device, eye, folder_id } = req.body;

    const uuidv1 = require('uuid/v1');
    const uuid = uuidv1()

    const created_date = new Date().getTime();


    db.query(`insert into patient_info(uuid,image_uuid,study_id,age,gender,date_of_birth,date_of_scan,device,eye,created_date,folder_id) values('${uuid}','${image_uuid}','${study_id}','${age}','${gender}','${date_of_birth}','${date_of_scan}','${device}','${eye}','${created_date}',${folder_id})`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "status": "successfull", "response": response.rows });
        }
      });
  });



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

  api.get("/patient_info_image_uuid/:cid", (req, res) => {

    db.query(`SELECT * from patient_info where image_uuid='${req.params.cid}'`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "categories": response.rows });
      }
    });
  });


  api.get("/image_uuid", (req, res) => {

    db.query(`SELECT uuid from images`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ "image_uuid": response.rows });
      }
    });
  });

  // insert into folders

  api.post("/folders", (req, res, next) => {

    // const validate = ajv.compile(validatePublicKeyAJV);
    // const valid = validate(req.body);
    // if (!valid) {
    //   return next({ Errors: validate.errors });
    // }

    const { doctor_uuid, patient_uuid, folder_id, folder_status, last_labelled } = req.body;

    const uuidv1 = require('uuid/v1');
    const uuid = uuidv1()

    const login_time = new Date().getTime();

    db.query(`insert into folders(uuid,doctor_uuid,patient_uuid,folder_id,folder_status,last_labelled) values('${uuid}','${doctor_uuid}','${patient_uuid}','${folder_id}','${folder_status}','${last_labelled}')`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "status": "successfull", "response": response.rows });
        }
      });
  });


  api.get("/folder_status/:stat", (req, res) => {

    // db.query(`SELECT * from folders where doctor_uuid='${req.params.docid}' and folder_status='${req.params.stat}'`, 
    db.query(`SELECT * from folders where folder_status='${req.params.stat}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "image_uuid": response.rows });
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
    let login_time = '';
    let logout_time = '';
    let userArr = [];
    db.query(`SELECT b.user_name,max(b.images) as images,max(b.name) as name, max(labelled_image) as labelled_image,

     array_agg(((DATE_PART('day', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp
    - TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp) * 24 + 
         DATE_PART('hour', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp 
       - TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) * 60 +
         DATE_PART('minute', TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp -
       TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) * 60 +
         DATE_PART('second',TO_CHAR(TO_TIMESTAMP(session.logout_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp -
       TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'YYYY/MM/DD HH24:MI:SS')::timestamp)) AS No_of_hours,

       COUNT(TO_CHAR(TO_TIMESTAMP(session.login_time/1000),'DD/MM/YYYY HH24:MI:SS'))AS no_of_sessions FROM session JOIN
 (SELECT users.uuid,users.name,user_name, COUNT(image_id) AS images FROM users JOIN images ON users.uuid=images.user_uuid 
 GROUP BY users.uuid) b ON session.user_uuid= b.uuid AND active=false GROUP BY b.user_name`,
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
            totalTime = hours + ':' + minutes + ':' + seconds;

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
GROUP BY users.uuid) b ON session.user_uuid= b.uuid AND active=false GROUP BY b.user_name`,
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
            totalTime = hours + ':' + minutes + ':' + seconds;

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
    db.query(`select users.user_name, (select sum(s) from unnest(array_agg(labelled_image)) s) as labelled_images from users join session on session.user_uuid=users.uuid
    and session.active= false  group by users.user_name`,
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
  })


  return api;
};