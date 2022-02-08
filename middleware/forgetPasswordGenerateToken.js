import jwt from 'jsonwebtoken';
import UserModel from '../schema/schema.js';


const forgetPasswordGenerateToken = async (req,res,next) =>{
	try{
		let {email} = req.body;
        const checkingEmail = await UserModel.findOne({email});
        if(checkingEmail !== null){
		let genToken = jwt.sign({_id:checkingEmail._id},process.env.SECRET_KEY);
		req.genToken = genToken;
		req.email = email;
		let changePassword = await UserModel.updateOne({_id:checkingEmail._id},{
			$set:{
				vToken:genToken
				}
		});
		next();
	}else{
		res.status(401).send({response:"Email doesn't exists!"});
	}
	}catch(e){
		console.log(e);
	}
}

export default forgetPasswordGenerateToken;