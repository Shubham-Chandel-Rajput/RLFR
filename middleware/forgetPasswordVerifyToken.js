import jwt from 'jsonwebtoken';
import UserModel from '../schema/schema.js';
import bcrypt from 'bcryptjs';

const forgetPasswordVerifyToken = async (req,res,next) =>{
	try{
		let {password,cpassword,token} = req.body;
		let verifyToken = await jwt.verify(token,process.env.SECRET_KEY);
		let getUserDetail = await UserModel.findOne({vToken:token});
		if(getUserDetail !== null){
			req.password = password;
			req.cpassword = cpassword;
			req.token = token;
			req.getUserDetail = getUserDetail;
			next();
		}else{
			res.status(401).send({response:"Invalid Token"});
		}
		}catch(e){	
			console.log(e);
		}
	}

export default forgetPasswordVerifyToken;