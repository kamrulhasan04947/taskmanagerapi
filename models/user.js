const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
    },

    firstName:{
        type:String,
        required: true,
        trim:true
    },
    
    lastName:{
        type: String,
        required:true,
        trim:true
    },
    
    email:{
        type:String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value)=>{
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email address formate'
        },
    },

    password:{
        type: String,
        required: true,
        minlength:6,
        trim:true,
    },

    mobile:{
        type:String,
        unique:true,
        required:true,
    },

    otp:{
        type: String,
    },

    isVarified:{
        type:Boolean,
        default:false,
    },

    otpExpaires:{
        type:Date
    },

    photo:{
        type: String,
        required:false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},
{
    timestamps: true,

});

// Hash the plain text password before saving
userSchema.pre('save', async function (next){
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    if (!user.userId) {
        user.userId = uuidv4();  
    }
    next();
});

// Generate a secure OTP using cryptographic random bytes
userSchema.methods.generateBase64OTP = async function (length=6) {
    const user = this

    // console.log(console.log(user instanceof mongoose.Model));

    if(user.isVarified){
        throw new Error('User allradey verified');
    }

    const buffer = crypto.randomBytes(Math.ceil(length / 2)); // Convert to Base64, then truncate to desired length
    const otp = buffer.toString('hex').slice(0, length); 

    // set otp and expaire date
    user.otp = otp,
    user.otpExpaires = Date.now() + 10*60*1000;

    await user.save();

    return otp;
};
   

// generate authentication tokedn
userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    user.tokens = user.tokens || [];
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

// userSchema.methods.generateOTP = async (length = 6)=>{
  
//     digits = '';

//     for(let i = 0; i<=1000; i++){
//         digits = digits.concat(digits+ i.toString());
//     }


// }

// Find user by email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}; 



const User = mongoose.model('User', userSchema);

module.exports =  User