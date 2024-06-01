const express = require('express');


const User = require('../models/User');
// const Image = require('../models/Image')

var path = require('path')
var fs = require('fs');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // Install nodemailer

// // POST route to add profile picture in Base64
// var multer = require('multer');

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });

// var upload = multer({ storage: storage });

// router.post('/upload-profile', upload.single('image'), async (req, res, next) => {
//     try {
//         var obj = {
//             name: req.body.name,
//             desc: req.body.desc,
//             img: {
//                 data: fs.readFileSync(path.join('uploads/' + req.file.filename)).toString('base64'),
//                 contentType: 'image/png'
//             }
//         }
//         const newImage = new Image(obj);

//         // Save the new user to the database
//         const response = await newImage.save();
//         res.status(201).json({ "imageURL": obj.img.data.toString('base64') });

//     } catch (error) {

//         console.log(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// POST route to add a person
router.post('/signup', async (req, res) => {
  try {
    const data = req.body
    console.log(req.body);
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with the same Email already exists' });
    }

    // Create a new User document using the Mongoose model
    const newUser = new User(data);

    // Save the new user to the database
    const response = await newUser.save();
    console.log('data saved');

    const payload = {
      uid: response.uid
    }
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);

    res.status(200).json({ response: response, token: token, statusCode: 200 });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email: email });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid Email or Password' });
    }

    // generate Token 
    const payload = {
      id: user.id,
    }
    const token = generateToken(payload);

    console.log(user);
    // resturn token as response
    res.status(200).json({

      statusCode: 200,
      "response": user, token
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
    console.log(user)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('No user with that email address was found.');
    }

    user.generateResetToken();
    await user.save();

    var emailTamplate = `
    <!DOCTYPE HTML
      PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
      <!--[if gte mso 9]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
      <title></title>
    
      <style type="text/css">
        @media only screen and (min-width: 620px) {
          .u-row {
            width: 600px !important;
          }
    
          .u-row .u-col {
            vertical-align: top;
          }
    
          .u-row .u-col-100 {
            width: 600px !important;
          }
    
        }
    
        @media (max-width: 620px) {
          .u-row-container {
            max-width: 100% !important;
            padding-left: 0px !important;
            padding-right: 0px !important;
          }
    
          .u-row .u-col {
            min-width: 320px !important;
            max-width: 100% !important;
            display: block !important;
          }
    
          .u-row {
            width: 100% !important;
          }
    
          .u-col {
            width: 100% !important;
          }
    
          .u-col>div {
            margin: 0 auto;
          }
        }
    
        body {
          margin: 0;
          padding: 0;
        }
    
        table,
        tr,
        td {
          vertical-align: top;
          border-collapse: collapse;
        }
    
        p {
          margin: 0;
        }
    
        .ie-container table,
        .mso-container table {
          table-layout: fixed;
        }
    
        * {
          line-height: inherit;
        }
    
        a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
        }
    
        table,
        td {
          color: #000000;
        }
    
        #u_body a {
          color: #0000ee;
          text-decoration: underline;
        }
    
        @media (max-width: 480px) {
          #u_content_image_1 .v-container-padding-padding {
            padding: 40px 10px 10px !important;
          }
    
          #u_content_image_1 .v-src-width {
            width: auto !important;
          }
    
          #u_content_image_1 .v-src-max-width {
            max-width: 50% !important;
          }
    
          #u_content_heading_1 .v-container-padding-padding {
            padding: 10px 10px 20px !important;
          }
    
          #u_content_heading_1 .v-font-size {
            font-size: 22px !important;
          }
    
          #u_content_heading_2 .v-container-padding-padding {
            padding: 40px 10px 10px !important;
          }
    
          #u_content_text_2 .v-container-padding-padding {
            padding: 10px !important;
          }
    
          #u_content_heading_3 .v-container-padding-padding {
            padding: 10px !important;
          }
    
          #u_content_button_1 .v-container-padding-padding {
            padding: 30px 10px 40px !important;
          }
    
          #u_content_button_1 .v-size-width {
            width: 65% !important;
          }
    
          #u_content_image_2 .v-container-padding-padding {
            padding: 20px 10px 40px !important;
          }
        }
      </style>
    
    
    
      <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Raleway:400,700&display=swap" rel="stylesheet" type="text/css">
      <!--<![endif]-->
    
    </head>
    
    <body class="clean-body u_body"
      style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9ff;color: #000000">
      <!--[if IE]><div class="ie-container"><![endif]-->
      <!--[if mso]><div class="mso-container"><![endif]-->
      <table id="u_body"
        style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9ff;width:100%"
        cellpadding="0" cellspacing="0">
        <tbody>
          <tr style="vertical-align: top">
            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9ff;"><![endif]-->
    
    
    
              <div class="u-row-container" style="padding: 0px;background-color: transparent">
                <div class="u-row"
                  style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                  <div
                    style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
    
                    <!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffffff;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                    <div class="u-col u-col-100"
                      style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                      <div style="background-color: #ffffff;height: 100%;width: 100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                          style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                          <!--<![endif]-->
    
                          <table id="u_content_image_1" style="font-family:'Raleway',sans-serif;" role="presentation"
                            cellpadding="0" cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td class="v-container-padding-padding"
                                  style="overflow-wrap:break-word;word-break:break-word;padding:60px 10px 10px;font-family:'Raleway',sans-serif;"
                                  align="left">
    
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                      <td style="padding-right: 0px;padding-left: 0px;" align="center">
    
                                        <!-- <img align="center" border="0"
                                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3YuWaHPJTlxJsJlQeNIpIcqofU-14UlGhnhGJv_QxfQ&s"
                                          alt="image" title="image"
                                          style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 35%;max-width: 203px;"
                                          width="203" class="v-src-width v-src-max-width" /> -->
                                        <h1>Heystallers</h1>
                                      </td>
                                    </tr>
                                  </table>
    
                                </td>
                              </tr>
                            </tbody>
                          </table>
    
                          <table id="u_content_heading_1" style="font-family:'Raleway',sans-serif;" role="presentation"
                            cellpadding="0" cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td class="v-container-padding-padding"
                                  style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 30px;font-family:'Raleway',sans-serif;"
                                  align="left">
    
                                  <!--[if mso]><table width="100%"><tr><td><![endif]-->
                                  <h1 class="v-font-size"
                                    style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 20px; font-weight: 400;">
                                    <strong>Forget password ?</strong>
                                  </h1>
                                  <!--[if mso]></td></tr></table><![endif]-->
    
                                </td>
                              </tr>
                            </tbody>
                          </table>
    
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    
    
    
    
    
                <div class="u-row-container" style="padding: 0px;background-color: transparent">
                  <div class="u-row"
                    style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                    <div
                      style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                      <div class="u-col u-col-100"
                        style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                        <div
                          style="background-color: #ffffff;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                          <div
                            style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                            <table id="u_content_heading_2" style="font-family:'Raleway',sans-serif;" role="presentation"
                              cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td class="v-container-padding-padding"
                                    style="overflow-wrap:break-word;word-break:break-word;padding:40px 60px 10px;font-family:'Raleway',sans-serif;"
                                    align="left">
    
                                    <h1 class="v-font-size"
                                      style="margin: 0px; line-height: 140%; text-align: left; word-wrap: break-word; font-size: 16px; font-weight: 400;">
                                      <span>If you've lost your password or wish to reset it, use the link below to get
                                        started:</span>
                                    </h1>
    
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <table id="u_content_text_2" style="font-family:'Raleway',sans-serif;" role="presentation"
                              cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td class="v-container-padding-padding"
                                    style="overflow-wrap:break-word;word-break:break-word;padding:10px 60px;font-family:'Raleway',sans-serif;"
                                    align="left">
    
                                    <div class="v-font-size"
                                      style="font-size: 14px; color: #1386e5; line-height: 140%; text-align: left; word-wrap: break-word;">
                                      <p style="line-height: 140%;"><span
                                          style="text-decoration: underline; line-height: 19.6px;"><span
                                            style="line-height: 19.6px;"><strong>http://${req.headers.host}/user/reset/${user.resetToken}</strong></span></span>
                                      </p>
                                    </div>
    
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <table id="u_content_heading_3" style="font-family:'Raleway',sans-serif;" role="presentation"
                              cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td class="v-container-padding-padding"
                                    style="overflow-wrap:break-word;word-break:break-word;padding:10px 60px;font-family:'Raleway',sans-serif;"
                                    align="left">
    
                                    <!--[if mso]><table width="100%"><tr><td><![endif]-->
                                    <h1 class="v-font-size"
                                      style="margin: 0px; line-height: 140%; text-align: left; word-wrap: break-word; font-size: 14px; font-weight: 400;">
                                      <div>
                                        <div>You are receiving this because you ${email} have requested the reset of the
                                          password for your account.
                                          <div>
                                            <div>Please click on the "Reset Your password" button or paste this into your
                                              browser to complete the process within one hour of receiving it.<br />
                                              <div>
                                                <div>If you did not request this, please ignore this email and your password
                                                  will remain unchanged.</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </h1>
                                    <!--[if mso]></td></tr></table><![endif]-->
    
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <table id="u_content_button_1" style="font-family:'Raleway',sans-serif;" role="presentation"
                              cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td class="v-container-padding-padding"
                                    style="overflow-wrap:break-word;word-break:break-word;padding:30px 10px 40px;font-family:'Raleway',sans-serif;"
                                    align="left">
    
                                    <div align="center">
                                      <a href="http://${req.headers.host}/user/reset/${user.resetToken}" target="_blank"
                                        class="v-button v-size-width v-font-size"
                                        style="box-sizing: border-box;display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #000000; background-color: #fdb441; border-radius: 25px;-webkit-border-radius: 25px; -moz-border-radius: 25px; width:38%; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;">
                                        <span style="display:block;padding:10px 20px;line-height:120%;"><span
                                            style="line-height: 16.8px;">Reset Your Password</span></span>
                                      </a>
                                    </div>
    
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <!--[if (!mso)&(!IE)]><!-->
                          </div><!--<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]></td><![endif]-->
                      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                    </div>
                  </div>
                </div>
    
    
    
    
    
                <div class="u-row-container" style="padding: 0px;background-color: transparent">
                  <div class="u-row"
                    style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                    <div
                      style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
    
                      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                      <div class="u-col u-col-100"
                        style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                        <div
                          style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                          <!--[if (!mso)&(!IE)]><!-->
                          <div
                            style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                            <!--<![endif]-->
    
                            <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0"
                              cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td class="v-container-padding-padding"
                                    style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Raleway',sans-serif;"
                                    align="left">
    
                                    <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0"
                                      width="100%"
                                      style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <tbody>
                                        <tr style="vertical-align: top">
                                          <td
                                            style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                            <span>&#160;</span>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
    
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <table id="u_content_image_2" style="font-family:'Raleway',sans-serif;" role="presentation"
                              cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td class="v-container-padding-padding"
                                    style="overflow-wrap:break-word;word-break:break-word;padding:30px 10px 40px;font-family:'Raleway',sans-serif;"
                                    align="left">
    
                                    <!-- <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
          <img align="center" border="0" src="images/image-2.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 149px;" width="149" class="v-src-width v-src-max-width"/>
          
        </td>
      </tr>
    </table> -->
    
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <!--[if (!mso)&(!IE)]><!-->
                          </div><!--<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]></td><![endif]-->
                      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                    </div>
                  </div>
                </div>
    
    
    
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
      <!--[if mso]></div><![endif]-->
      <!--[if IE]></div><![endif]-->
    </body>
    
    </html>
    `;
    console.log(user.resetToken);
    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      // host: "smtp.gmail.com",
      // port: 587,
      auth: {
        user: "heystallers@gmail.com",
        pass: "cswg sopn bdje podb",
      },
    });

    const mailOptions = {
      from: "heystallers@gmail.com",
      to: email,
      subject: 'Password Reset Request',

      // text: `You are receiving this because you ${email} have requested the reset of the password for your account.\n\n
      //    Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
      //    http://${req.headers.host}/reset/${user.resetToken}\n\n
      //    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      html: emailTamplate,
    };

    await transporter.sendMail(mailOptions);

    res.send('Check your email for further instructions.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong. Try again later.');
  }
});




// Route to handle password reset submission
router.get('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const resetForm = `<!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset password</title>
      <link rel="stylesheet" href="style.css">
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }

          body {
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
          }

          .form-container {
              background-color: white;
              padding: 30px;
              border-radius: 5px;
              box-shadow: 0 0 14px rgba(0, 0, 0, 0.1);
              max-width: 400px;
              width: 100%;
          }

          .form {
              display: flex;
              flex-direction: column;
              align-items: center;
          }

          h1 {
              margin-bottom: 20px;
          }

          p {
              margin-bottom: 20px;
              text-align: center;
          }

          input[type="text"] {
              width: 100%;
              padding: 10px;
              margin-bottom: 20px;
              border: 1px solid #ccc;
              border-radius: 3px;
              font-size: 16px;
          }

          .submit-btn {
              width: 100%;
              padding: 10px 20px;
              background-color: black;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
          }

          .submit-btn:hover {
              background-color: gray;
          }

          @media (max-width: 480px) {
              .container {
                  padding: 20px;
              }
          }
      </style>
  </head>

  <body>

      <div class="form-container">
          <form action="" class="form">
              <h1>Reset password</h1>


              <p>Enter a new password to access your heystaller account.</p>

              <input id="password" type="text" placeholder="New password">
              <button class="submit-btn">Reset password</button>

          </form>

      </div>

  </body>
<script>
  const form = document.querySelector('.form');
  const passwordInput = document.getElementById('password');
  const submitButton = document.querySelector('.submit-btn');

  submitButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default form submission

    const newPassword = passwordInput.value.trim();

    // Input Validation (optional, enhance security)
    if (!validatePassword(password)) {
      alert('Please enter a strong password that meets the following criteria:\n- Minimum length of 8 characters\n- Contains a mix of uppercase and lowercase letters, numbers, and symbols');
      return; // Exit if password is invalid
    }

    fetch('http://localhost:3000/user/reset/5565cf5177fe08b5ba73829bdab2a492abcb0b4a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword: password}) }) .then(response => response.json()) .then(data => console.log(data)) .catch(error => console.error(error)); 
  });
// Optional password validation function (consider using a library for more robust validation)
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password);

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;
}


  </script>

  </html>`;
  res.send(resetForm);
});

// Route to handle password reset submission
router.post('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now() } });
  if (!user) {
    return res.status(400).send('Password reset token is invalid or has expired.');
  }

  user.password = await bcrypt.hash(password, 10); // Hash the new password
  user.resetToken = undefined; // Clear the reset token
  user.resetExpires = undefined; // Clear the reset expiry
  await user.save();

  res.send('Your password has been changed successfully.');
  console.log(user.password);
});

router.put('/profile/password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

    // Check if currentPassword and newPassword are present in the request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }

    // Find the user by userID
    const user = await User.findById(email);

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    console.log('password updated');
    res.status(200).json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;