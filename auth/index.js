const express = require('express');
const router = express.Router();

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

  const validPassword = typeof user.password == 'string' &&                                       user.password.trim() != '' &&                                      user.password.trim().length >= 6;
  return validEmail && validPassword;
}

router.post('/signup', (req, res, next) => {
  if (validUser(req.body)) {
    res.json({
      message: '✅'
    });
  } else {
    next(new Error('Invalid User'));
  }
});

module.exports = router;
