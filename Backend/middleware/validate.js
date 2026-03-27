const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    // format errors into a clean array of messages
    const messages = errors.array().map(e => e.msg);
    return next(new Error(messages.join(', ')));
  }

  next();
};

module.exports = validate;