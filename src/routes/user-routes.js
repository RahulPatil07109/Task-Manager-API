// *******************E N D P O I N T S**********************
const express = require("express");
const auth = require("../middlewares/auth");
const multer = require("multer");
const sharp = require("sharp");
const {
  sendWelcomeEmail,
  sendCancelationEmail,
} = require("../emails/accounts");
const User = require("../models/user");

const { AutoEncryptionLoggerLevel } = require("mongoose/node_modules/mongodb");

const router = new express.Router();
// So the Authentication is Applied to  signup and login endpoints
// ######### U S E R S #################
//           #Creation
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    // Sending Welcome Email
    sendWelcomeEmail(user.email, user.name);
    // Generate a token
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
// login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    // Generate a token
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// logout

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

// logout all users

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});
//      FILE UPLOADS
// Avatar upload

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    // if file is not in the given format then throw an error
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      callback(
        new Error("Please Upload in any of the format jpg , jpeg or png")
      );
    }
    // else no error
    callback(undefined, true);
  },
});

// Here we will use sharp for resizing and image conversion to png

// Handeling Express Errors
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    // resizing and image conversion to png
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//        #Reading
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// to get avatar image in jpg format instead of binary
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

//        #Update By Id
router.patch("/users/me", auth, async (req, res) => {
  // Error :Check if we get additional property which is not in the database Eg: height
  const allowedUpdates = ["name", "email", "password", "age"];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(404).send({ error: "Invalid updates !!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.status(201).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
//  #Deletion
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    // Sending Cancelation Email
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});
// Deletion of avatar image
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();

  res.send();
});

module.exports = router;
