const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').trim().toLowerCase().isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('role')
    .optional()
    .isIn(['donor', 'ngo', 'volunteer'])
    .withMessage('Role must be either donor, ngo, or volunteer. Admin registration is restricted.'),
  handleValidationErrors,
];

const loginValidator = [
  body('email').trim().toLowerCase().isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

module.exports = {
  registerValidator,
  loginValidator,
  handleValidationErrors,
};
