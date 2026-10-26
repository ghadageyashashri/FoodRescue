const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

const donationCreateValidator = [
  body('foodName').trim().notEmpty().withMessage('Food name is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Food description is required').isLength({ max: 1000 }),
  body('category')
    .isIn(['cooked_meals', 'raw_ingredients', 'packaged_groceries', 'bakery', 'beverages', 'other'])
    .withMessage('Valid food category is required'),
  body('quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be greater than 0'),
  body('unit')
    .isIn(['meals', 'kg', 'packets', 'boxes', 'liters', 'servings'])
    .withMessage('Valid unit is required'),
  body('preparationDate').isISO8601().withMessage('Valid preparation date is required'),
  body('useByDate')
    .isISO8601()
    .withMessage('Valid use-by date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.preparationDate)) {
        throw new Error('Use-by date must be after preparation date');
      }
      return true;
    }),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  handleValidationErrors,
];

module.exports = {
  donationCreateValidator,
};
