const { check, validationResult } = require('express-validator');

const path = require('path');

const validate = [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password should be at least 2 characters long').isLength({ min: 2 }),
    check('image', 'Image should be a valid format (.png, .jpg, .jpeg)').custom(
        (value, { req }) => {
            if (!req.file) {
                throw new Error('Image is required'); // Throw an error if no file is attached
            }
            const ext = path.extname(req.file.originalname).toLowerCase();
            if (['.png', '.jpg', '.jpeg'].indexOf(ext) === -1) {
                throw new Error('Invalid file format'); // Throw an error if file format is not allowed
            }
            return true; // Return true if validation passes
        }
    )
];

module.exports = {validate};
