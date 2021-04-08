const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
// register user
// validation 

router.post('/',[
    check('name','Name is required')
    .not()
    .isEmpty(),
    check('email', 'Please include a valid email')
    .isEmail(),
    check('password','Please enter a valid password minimum 6 chars')
    .isLength({min:6})
], async (req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const { name, email, password} = req.body;
    try{
         // Check if user exists
        let user = await User.findOne({email}); // get the user by text search email
        if (user){
            return res.status(400).json({errors:[{msg:'User already exists'}]});
        }
        // Get users gravatar
        const avatar = gravatar.url(email,{
            s:'200', // size
            r:'pg', //rating
            d:'mm'//default
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        // Encrypt password using bcrypt
        const salt = await bcrypt.genSalt(10); // take the users.password and hash it
        user.password = await bcrypt.hash(password, salt);
        await user.save(); //save the new user to the db

        // Return jsonwebtoken -> for frontend to log in immediately
        const payload = {
            user:{
                id:user.id
            }
        }
        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn : 3600000000},
            (err, token)=>{
                if (err) throw err;
                res.json({token});
            });
    } catch(err){
        console.error(err.message);
        res.status(500),send('Sedrver error');
    }

     
    
});

module.exports = router;