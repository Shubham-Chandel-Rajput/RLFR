import mongoose from 'mongoose';

const con = mongoose.connect("mongodb://localhost:27017/userData").then(()=>{
    console.log("connect")
}).catch((e)=>{
    console.log(e);
})

export default con;