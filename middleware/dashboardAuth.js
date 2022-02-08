import jwt from 'jsonwebtoken';
import UserModel from '../schema/schema.js';

const dashboardAuth = async (req,res,next) =>{
	try{
		let userToken = req.cookies.userAuth;
		let verifyUserToken = await jwt.verify(userToken,process.env.SECRET_KEY);
		let user = await UserModel.findOne({_id:verifyUserToken._id,"tokens.token":userToken});
		req.userToken = userToken;
		req.userData = user;
		req.userId = user._id;
		next();
	}catch(e){
		res.status(401).send({unAurthorize:"unAuthorized"});
	}
}

export default dashboardAuth;