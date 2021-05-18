const express=require('express')
const path= require('path')
const app=express()
const bcrypt=require('bcryptjs')
const mongoose=require('mongoose')
const User=require('./model/user')
const Prof=require('./model/profile')
const Post=require('./model/post')

const jwt=require('jsonwebtoken')
const JWT_SECRET='SBCKQWHVUAOIGVIRQUGFWIU&*^%&$&**&*&&%NVKNBEKRYAUEWEYIUWOISDCVDHCB'

mongoose.connect(' mongodb+srv://vishal:yash@cluster0.nv3u9.mongodb.net/foodies?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
// two type of login
// Client provides itself somehow on the Secret/data that is non changable(jwt)
// Client-server share a request(Cookie)ie server sends password to client


const bodyParser=require('body-parser')

app.use('/',express.static(path.join(__dirname,'static')))
app.use(bodyParser.json())
app.post('/api/profile',async (req,res)=>{
    const {token,public_name,cusins,age}=req.body
    if(!public_name || typeof public_name !=='string'){
        return res.json({status:'error',error:"Invalid public name"})
    }
    try{
        const userd=jwt.verify(token,JWT_SECRET)
        const username=userd.username
        const response=await Prof.create({
            username,
            public_name,
            cusins,
            age

        })
        console.log('profile created succesfully',response)
        
        
    }catch(error){
        res.json({status:'error',error:'please provide a valid web token'})
        

        
    }
    res.json({status:'ok'})


})
app.post('/api/change-password',async (req,res)=>{
    const {token,newpassword}=req.body
    if(!newpassword || typeof newpassword !=='string'){
        return res.json({status:'error',error:"Invalid password"})
    }
    if(newpassword.length<5){
        return res.json({
            status:'error',
            error:'password tooo small,Should be atleast 6 characters '
        })
    }
    console.log(token)
    try{
        const userd=jwt.verify(token,JWT_SECRET)
        const _id=userd.id
        const hashedPassword=await bcrypt.hash(newpassword,10)
        await User.updateOne(
            {_id},
            {
            $set:{password:hashedPassword}
        }
        )
        res.json({status:'ok'})
    }
    catch(error){
        res.json({status:'error',error:'please provide a valid web token'})

    }
   
    
})
app.post('/api/login',async(req,res)=>{
    var {username,password}=req.body
    console.log(req.body.username)
    var user;
   await User.findOne({username:username},(error,data)=>{
        if(error){
            console.log(error)
        }else{
            user=data
            console.log("checj out nhdskhbvkhbsh",user)


        }
    })
   
    if(!user){

        return res.json({status:'error',error:"Invalid username/password"})
    }
      console.log("outside data",user,"  ,,,,,,,, ",password, "  ,,,,,,,,,,,,  ",user.password)
    if (await bcrypt.compare(password,user.password)){
        // console.log("please see it",user.password)
        // the username and password is succesfful
        console.log("inside data",user,password,user.password)
        
        const token=jwt.sign({
            id : user._id,
            username:user.username
        
        },JWT_SECRET)
        return res.json({status:'ok',data:token})
    }
        
    res.json({status:'error',data:'Invalid username/passwords'})
    



    
})
app.post('/api/register',async(req,res)=>{
    // hashing the passwords
    // bcrypt,md5,sha1,sha256,sha512.. password hashes
    // collision should be impropable
    // algorithum should be slow allways
    // it will slow down the brute force approach
    // bcrypt is a low lebel library
    var {username,password}=req.body
    if(!username || typeof username !='string'){
        return res.json({status:'error',error:"username is empty"})
    }
    if(password.length<5){
        return res.json({
            status:'error',
            error:'password tooo small,Should be atleast 6 characters '
        })
    }
    var passwords= await bcrypt.hash(password,10)
    password=passwords

    try{
        const response=await User.create({
            username,
            password
        })
        console.log('user created sucessfully',response)

    }catch(error){
        console.log(JSON.stringify(error.message))
        if(error.code === 11000){
        return res.json({status:'error',error:'Username is already in use'})
        }
        throw error

    }
    res.json({status:'ok'})


    
    return res.json()   
})
app.post('/api/editprofile',async (req,res)=>{
    const {token,cusins,age}=req.body
    try{
            if((!age || typeof age !=='number') && (cusins.length>0 || typeof cusins)){
                return res.json({status:'error',error:"Invalid credentials"})
            
        }
        else{
            try{
                const userd=jwt.verify(token,JWT_SECRET)
                const _id=userd.id
                await Prof.updateOne(
                    {username:userd.username},
                    {
                        $set:{
                            age:age,
                            cusins:[...cusins]
                        }

                    }
                )
                res.json({status:'ok'})

            }
            catch(error){
                res.json({status:'error',error:'please provide a valid web token'})
            }

        }
    }
    catch (error){
        console.log("error in edit profile : ",error );
        res.json({status:"error" , error:"invalid Datatype type"})
    }

})


app.get("/api/feed",async(req,res)=>{
    var feed=[];
    const{pagenum,token}=req.body
    try{
        const userd=jwt.verify(token,JWT_SECRET)
        const username=userd.username
        await Prof.findOne({username:username},async(error,data)=>{
            if(error){
                console.log(error)
            }
            else{
                console.log("this i feeed data : ",data)
                var array = data.cusins
                for (i in array){
                    await Post.find({cusins:array[i]},(error,data)=>{
                        if (error){
                            console.log(error)

                        }
                        else{
                            feed.push(...data);
                            // feed = [...feed,...data];                            
                            console.log("hellllllllo : ",feed);
                            
                            // console.log("this is actual feed ___________________: "+feed);
                        }
                    } )
                }
                feed.sort((a,b)=>{
                    return a.createdAt-b.createdAt
                })
                feed.reverse()
                res.json({status:'ok',data:feed})
            }
        })


        

    }
    catch(error){
        console.log(error);
        return res.json({status:'error in post',error:'please provide a valid web token'})
    }
}
)

app.post("/api/post", async (req, res) => {
    var user="";
    const{token,title,Location,cusins,Discription,Imageurl,Likes,Liked}=req.body
    if(!title || typeof title !=='string'){
        return res.json({status:'error',error:"pls give a title"})
    }
    if(!Imageurl || typeof Imageurl !=='string'){
        return res.json({status:'error',error:"pls give a Imageurl"})
    }
    if(!cusins || typeof cusins !=='string'){
        return res.json({status:'error',error:"pls give a cusin for yur dish"})
}   
var public_name;
    try{
        const userd=jwt.verify(token,JWT_SECRET)
        const username=userd.username
        await Prof.findOne({username:username},(error,data)=>{
            if(error){
                console.log(error)
            }else{
                public_name = data.public_name
                console.log("public names not it: ",public_name,Date.now())
                console.log({
                    public_name,
                    cusins, 
                    title,
                    Location,
                    Discription,
                    Imageurl    ,
                    Likes,
                    Liked,
                    
                })
    
            }
        })
        var createdAt=Date.now();
        const response=await Post.create({
            public_name,
            cusins,
            title,
            Location,
            Discription,
            Imageurl ,
            Likes,
            Liked,
            createdAt
        })
        console.log('post created succesfully',response)

    }   // try block ending
    catch(error){
        console.log(error)
        res.json({status:'error in post',error:'please provide a valid web token'})

    }
    res.json({status:'ok'})
   });
   app.get("/api/explore",async(req,res)=>{
    const {token,title} = req.body;
       var search=[]
       if(!title || typeof title !=='string'){
        return res.json({status:'error',error:"pls give a title"})
        } 
        try{
            const userd=jwt.verify(token,JWT_SECRET)
            const username=userd.username
            await Post.find({title:title} ,async(error , data) =>{      
                if (error){
                    console.log(error)

                }
                else{
                    search=[...data];
                    console.log("this i search data : ",search)
                    res.json({status:'ok',data:search})
                }

            }
            )
            

        }
        catch(error){
            console.log(error);
            return res.json({status:'error in post',error:'please provide a valid web token'})
        }
    }   
   )

   app.get("/api/profileSearch",async(req,res)=>{
    const {token} = req.body;
       var search=[];
       
        try{
            const userd=jwt.verify(token,JWT_SECRET)
            const username=userd.username
            var public_name;
            await Prof.findOne({username:username},(error,data)=>{
                if(error){
                    console.log(error)
                }else{
                    public_name = data.public_name
                    console.log(public_name)
                }
            })
            await Post.find({public_name:public_name} , async(error , data) =>{      
                if (error){
                    console.log(error)

                }
                else{
                    console.log("bjhvhb",data)
                    search=[...data];
                    console.log("this i search data : ",search)
                    res.json({status:'ok',data:search})
                }

            }
            )
            

        }
        catch(error){
            console.log(error);
            return res.json({status:'error in post',error:'please provide a valid web token'})
        }
    }   
   )

app.post('/api',async (req, res) => {
    console.log(req.body);
    // var resulthtml ='';
    // // return response.blob();
    // resulthtml= "<br> blob.size = " + blob.size + "</br>";
    // resulthtml += "<br>blob.type = " + blob.type + "</br>";
    // console.log(blob);
    res.send({" Status":"ok"});
})


const { PORT=3000, LOCAL_ADDRESS='0.0.0.0' } = process.env
app.listen(PORT, LOCAL_ADDRESS, () => {
  const address = app.address();
  console.log('server listening at', address);
});