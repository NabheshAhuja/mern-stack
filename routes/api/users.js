const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const User = require('../../models/User');
const config = require('config')
// const bcrypt = require('bcryptjs/dist/bcrypt');



router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter correct e-mail address').isEmail(),
    check('password', 'Enter Password with Minimum 8 characters').isLength({min: 8})
], async(req,res) => {
    // console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {name, email, password} = req.body;
    try{
    let user = await User.findOne({email})
if(user){
    return res.status(400).json({ errors:[{msg:'User already exists'}] })
}
const avatar = gravatar.url(email,{
    s:'200',
    r:'pg',
    d:'mm',
})
user = new User({
    name,
    email,
    avatar,
    password
})
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(password, salt);
await user.save();
    
const payload = {
    user:{
    id: user.id
    }
}
jwt.sign(payload, config.get('jwtSecret'),{
    expiresIn:360000
}, (err, token)=>{
    if(err) throw err;
    res.json({token})
});
    }catch(err){
        console.error((err.message));
        res.status(500).send('Server Error');
    }
});
module.exports = router;