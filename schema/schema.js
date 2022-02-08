import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// creating schema

let userSchema = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true,
    },
    password:String,
    cpassword:String,
    role:String,
    vToken:String,
    tokens:[{
        token:{
            type:String,
        }
    }]
});

//generating token
userSchema.methods.genToken = async function (){
    try{
        let token = await jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token});
        await this.save();
        return token;
    }catch(e){
        console.log(e);
    }
}

// Hash Password
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
        this.cpassword = this.password;
    }
    next();
});

//  creating model

let UserModel = new mongoose.model('user',userSchema);

export default UserModel;