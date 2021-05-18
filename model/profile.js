const mongoose=require('mongoose')
const ProfileSchema=new mongoose.Schema({
    username:{type : String,required:true,unique:true },
    public_name:{type:String,require:true,unique:true},
    cusins:{type:Array},
    age:{type:Number},

},
{collection:"profs"}
)
const models=mongoose.model('ProfileSchema',ProfileSchema)
module.exports=models