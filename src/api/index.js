import { version } from "../../package.json";
import { Router } from "express";
import Ajv from "ajv";
import validateComplaintAJV from "../models/validateComplaint";
import validateCategoryAJV from "../models/validateCategory";
import validatePublicKeyAJV from "../models/validatePublicKey";
var ajv = new Ajv();

export default ({ config, db }) => {
  let api = Router();


  // API for login 

  api.post("/login", (req, res) => {
    let { user_name, password } = req.body;
    db.query(
      `select * from users where user_name ='${user_name}' and password = '${password}' `,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          if (response.rows.length == 0) {
            res.json({ login_message: "Invalid User/ Passwordss" });
          } else {
            let authKey = require("uuid/v1");
            let auth_token = authKey();
            let status ="successfull";
            let login_time = new Date().getTime();
            let query = `insert into session(uuid,user_uuid,token,login_time,active) values ('${response.rows[0].uuid}','${response.rows[0].uuid}','${auth_token}',${login_time},true)`;
            console.log(query);
            db.query(query, (err, response1) => {
              if (err) {
                console.log(err.stack);
              } else {
                res.json({ all: response.rows, auth_token, status });
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
      // console.log(auth_token);
      
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
      `select uuid from session where auth_token='${auth_token}' and active=true`,
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
    const validate = ajv.compile(validateCategoryAJV);
    const valid = validate(req.body);
    if (!valid) {
      return next({ Errors: validate.errors });
    }

    const { user_name, password } = req.body;

    const uuidv1 = require('uuid/v1');
    const uuid = uuidv1()

    const created_time = new Date().getTime();

    db.query(`insert into users(uuid,user_name,password,created_time,active) values('${uuid}','${user_name}','${password}','${created_time}',true)`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ "status": "successfull", "response": response.rows });
        }
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

    const {uuid, user_name,token, logout_time} = req.body;

    // const uuidv1 = require('uuid/v1');
    // const uuid = uuidv1()

    const login_time = new Date().getTime();

    db.query(`insert into session(uuid,user_name,token,login_time,logout_time,active) values('${uuid}','${user_name}','${token}','${login_time}','${logout_time}',true)`,
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



  api.post("/images", (req, res, next) => {

    const validate = ajv.compile(validatePublicKeyAJV);
    const valid = validate(req.body);
    if (!valid) {
      return next({ Errors: validate.errors });
    }

    const { uuid, user_uuid, folder_id, image_id,status,created_by} = req.body;
    // const { uuid, user_uuid, folder_id, image_id, status, created_by, created_date } = req.body;

    const uuidv1 = require('uuid/v1');
    const uuid1 = uuidv1()

    const created_date = new Date().getTime();
    

    db.query(`insert into images(uuid,user_uuid,folder_id,image_id,status,created_by,created_date,isactive) values('${uuid1}','${user_uuid}','${folder_id}','${image_id}','${status}','${created_by}',${created_date},true)`,
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
    db.query(`update images set isactive=false where user_uuid='${req.params.pkid}'`,
      (err, response) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(response.rows);
          res.json({ version, status: "live", method: "delete" });
        }
      })
  })


  return api;
};
