const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../db/user');

// Route paths are prepended with /auth

router.get('/', (req, res) => {
  res.json({
    message: '🔐'
  });
});

// user can login to app with valid email/pass
// user cannot login to app with blank or missing email/
// user cannot login to app with blank or incorrect password

function validUser(user) {
  const validEmail = typeof user.email == 'string' &&
  user.email.trim() != '';

  const validPassword = typeof user.password == 'string' && user.password.trim() != '' && user.password.trim().length >= 6;

  return validEmail && validPassword;
}

router.post('/signup', (req, res, next) => {
  if (validUser(req.body)) {
    User
      .getOneByEmail(req.body.email)
      .then(user => {
        console.log('user', user);
        // if user not found
        if (!user) {
          // this is a unique email
          // hash the password
          bcrypt.hash(req.body.password, 10)
            .then((hash) => {
              // insert user into DB
              const user = {
                email: req.body.email,
                password: hash,
                created_at: new Date(),
              };

              User
                .create(user)
                .then(id => {
                  // redirect
                  res.json({
                    id,
                    message: '✅'
                  });
                });
            });
        } else {
          // email in use
          next(new Error('Email in use'));
        }
      });
  } else {
    next(new Error('Invalid User'));
  }
});

router.post('/login', (req, res, next) => {
  if (validUser(req.body)) {
    // check to see if in DB
    User
      .getOneByEmail(req.body.email)
      .then(user => {
        console.log('user', user);
        if (user) {
          // compare password with hashed password
          bcrypt
            .compare(req.body.password, user.password)
            .then((result) => {
              // if the passwords match
              if (result) {
                // setting the 'set-cookie' header
                const isSecure = req.app.get('env') !== 'development';
                res.cookie('user_id', user.id, {
                  httpOnly: true,
                  secure: isSecure,
                  signed: true,
                });
                res.json({
                  id: user.id,
                  message: 'Logged in!🔓'
                });
              } else {
                next(new Error('Invalid Login'));
              }
          });
        } else {
          next(new Error('Invalid Login'));
        }
      });
  } else {
    next(new Error('Invalid Login'));
  }
})

module.exports = router;
