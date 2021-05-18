const mongoose=require('mongoose')
var postSchema = new mongoose.Schema({
    public_name:{type:String,required:true},
    cusins:{type:String,required:true},
    title:{type:String,required:true},
    Location:{type:String},
    Discription:{type:String},
    Imageurl:{type:String , required:true},
    Likes:{type:Number},
    Liked:{type:Boolean},
    createdAt:{type:Date}
},  
{ collection:'posts'}
)

const model=mongoose.model('postSchema',postSchema)
module.exports=model
