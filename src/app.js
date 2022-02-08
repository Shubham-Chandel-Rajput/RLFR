import 'dotenv/config';
import con from '../db/connection.js';
import UserModel from '../schema/schema.js';
import bcrypt from 'bcryptjs';
import express from 'express';
import cokkie from 'cookie-parser';
import dashboardAuth from '../middleware/dashboardAuth.js';
import nodemailer from 'nodemailer';
import forgetPasswordGenerateToken from '../middleware/forgetPasswordGenerateToken.js';
import forgetPasswordVerifyToken from '../middleware/forgetPasswordVerifyToken.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cokkie());

app.post('/register', async (req,res)=>{
    try{
        let {name,email} = req.body;
        const insertData = new UserModel(req.body);
        const saveQuery = await insertData.save();
            let mailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'shubhamchandel127.0.0.1@gmail.com',
                    pass: process.env.PASSWORD
                }
            });
              
            let mailDetails = {
                from: 'shubhamchandel127.0.0.1@gmail.com',
                to: email,
                subject: 'User Registeration',
                text: 'Successfully Register'
            };
              
            mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    console.log('Error Occurs');
                } else {
                    console.log('Email sent successfully');
                }
            });

        res.status(200).send({response:'register'});
    }catch(e){
         // res.send(200).send({response:"Error.."});
    }
});
app.post('/login',async (req,res)=>{
    try{
        let {email,password} = req.body;
    
        // checking email exists or not in db
        const checkEmail = await UserModel.findOne({email});
        // console.log(checkEmail);
        if(checkEmail !== null){
            let gettingPassword = checkEmail.password;
            let checkPasswordMatch = await bcrypt.compare(password,gettingPassword);
            if(checkPasswordMatch == true){
                let generatinngToken = await checkEmail.genToken();
                // console.log(generatinngToken);
                res.cookie('userAuth',generatinngToken);
                res.status(200).send({response:'login',data:generatinngToken}); 
            }else{
                res.status(401).send({response:'Invalid credentials'});
                // console.log('Invalid');
            }
        }else{
            res.status(401).send({response:'Invalid credentials'});
        }
    }catch(e){
         res.status(401).send({response:'Error..'});
    } 
});
app.get('/dashboard', dashboardAuth , async (req,res)=>{
    try{
        res.status(200).send({Authorize:"authorized",data:req.userData});
    }catch(e){
        res.status(200).send({response:"Error.."});
    }
})
app.get('/logout', dashboardAuth , async (req,res)=>{
    try{
        req.userData.tokens = req.userData.tokens.filter((currEle)=>{
            return currEle.token !== req.userToken;
        });
        res.clearCookie('userAuth');
        await req.userData.save();
        res.status(200).send({response:"user logout"});
    }catch(e){
        res.status(401).send({response:"error during logout"});
    }
});
app.post('/change-password',dashboardAuth,async(req,res)=>{
    try{
        const {oldPassword,newPassword,confirmPassword} = req.body;
        const fetchPasswordBasedOnToken = await UserModel.findOne({"tokens.token":req.userToken});
        // console.log(fetchPasswordBasedOnToken.password);
        let comparePasswordBeforChange = await bcrypt.compare(oldPassword,fetchPasswordBasedOnToken.password);
        if(comparePasswordBeforChange){
            if(newPassword === confirmPassword){
                let hashingNewPassword = await bcrypt.hash(newPassword,10);
                let changePassword = await UserModel.updateOne({_id:fetchPasswordBasedOnToken._id},{
                    $set:{
                        password:hashingNewPassword,
                        cpassword:hashingNewPassword
                    }
                });
                req.userData.tokens = [];
                res.clearCookie('userAuth');
                await req.userData.save();
                res.status(200).send({response:"successfully changed"});
            }else{
                 res.status(401).send({response:"Passwords are not matching"});
            }
        }else{
            res.status(401).send({response:"Old password is not matching"});
        }
    }catch(e){
        res.status(500).send({response:"Internal Error"});
    }   
});
app.post('/forget-password', forgetPasswordGenerateToken , async (req,res)=>{
    try{
            let mailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'shubhamchandel127.0.0.1@gmail.com',
                    pass: process.env.PASSWORD
                }
            });
              
            let mailDetails = {
                from: 'shubhamchandel127.0.0.1@gmail.com',
                to: req.email,
                subject: 'Forget password request',
                text: "click on the button to change password",
                html:`<a href=http://localhost:3000/update-password/?v=${req.genToken}>Click here</a>`
            };
              
            mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    console.log('Error Occurs');
                } else {
                    console.log('Email sent successfully');
                }
            });
            res.status(200).send({response:"We have sent a change password link to your email"});
    }catch(e){ 
        res.status(401).send({response:"Server issue"}); 
        console.log('error');
    }
})
app.post('/update-password', forgetPasswordVerifyToken,async(req,res)=>{
    try{
        if(req.password === req.cpassword){
        let hashNewPassword = await bcrypt.hash(req.password,10);
        let updatePassword = await UserModel.updateOne({_id:req.getUserDetail._id},{
            $set:{
                password:hashNewPassword,
                cpassword:hashNewPassword
            }
        });
            // console.log(req.getUserDetail.tokens);
            req.getUserDetail.vToken = "";
            req.getUserDetail.tokens = [];
            await req.getUserDetail.save();
            res.status(200).send({response:"Password is changed"});
        }else{
            res.status(401).send({response:"Passwords are not matching"});
        }
    }catch(e){

    }
});
app.listen(4000,(()=>{
    console.log('Listening to port');
}));