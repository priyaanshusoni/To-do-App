const express = require("express");
const path = require("path");
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { decode } = require("punycode");
const jwt_secret = "ilovekiara";
const cors = require("cors")

let users= [];
let todos=[];






app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json())

// First I will create a Sign up functionality for my users 






app.post("/signup",function(req,res){
      const username = req.body.username;
      const password = req.body.password;


    

      if(!username || ! password){
        return res.json({
            message : "Username & Password fields can't be empty"
        })
      }

      if(username.length<5){
        return res.json({
            message: "Username must have atleast 5 characters"
        })
      }

      const foundUser = users.find((u)=>u.username==username);

      if(foundUser){
        return res.json({
            message: "User with same username Already Exists !"
        })
      }

      users.push({
        username: username,
        password : password,
      })

      

      res.status(200).json({
        message: "You've Succesfully signed up!"
      })


})

app.post("/signin",function(req,res){

    const username = req.body.username;
    const password = req.body.password;

   

    const token = jwt.sign({
        username : username
    },jwt_secret);

     const foundUser = users.find((u)=>u.username==username && u.password==password);

     if(foundUser){
        return res.status(200).json({
            token : token
        })}

    else{
        res.status(404).json({
            message : "Invalid Username or Password "
        })
    }

     }


)

// creating the auth middleware 

function auth(req,res,next){
    const token = req.headers.token;

    if(!token){
        return res.status(404).json({
            message : "Token is Missing"
        })
    }
   try{
  

    const decodedUsername = jwt.verify(token,jwt_secret);


    let foundUser = users.find((u)=>u.username==decodedUsername.username)

    if(foundUser){
        req.username = decodedUsername.username;
       return  next();
    }
   }catch{
       
         return res.status(404).send("You are not logged In , Please Login Before Accesssing or the token is invalid !")
      
    }
}

// Now here I will start creating my todo app routes after clearing signup & sign in route  

app.get("/todos",auth,function(req,res){
    const currentUser = req.username;

   

    const usertodos = todos.filter((x)=>x.username==currentUser);

    res.json(usertodos);

})

//Route to create a new todo 

app.post("/todos/create",auth,function(req,res){

const currentUser = req.username;



const title = req.body.title;

if(!title){
    return res.json({
        message : "Todo Title is Required"
    })
}

const newTodo = {
    id: todos.length+1,
    username : currentUser,
    title : title,
    done: false,
}

todos.push(newTodo);

console.log(todos);

return res.json({
    message : "Todo Added Succesfully !",
    todo : newTodo
})



})

//updating the title of the todo  

app.put("/todos/:id",auth,function(req,res){
    const id = req.params.id;
    const currentUser = req.username;
    const title = req.body.title;
    
    if(!title){
        return res.json({
            message : "Todo Title is Required"
        })
    }


    const todo = todos.find((x)=>x.id == parseInt(id) && x.username==currentUser)

    if(!todo){
        return res.json({
            message : "To-do not found"
        })
    }
    //updating the title of the todo

    todo.title=title;

   

   return res.json({
        message : "Todo Updated Succesfully"
    })



})

app.delete("/todos/:id",auth,function(req,res){
    const id = req.params.id;

    const currentUser = req.username;

  

    const todoIndex = todos.findIndex((x)=>x.username==currentUser && x.id==parseInt(id));

    if(todoIndex==-1){
         return res.json({
            message : "To-Do not found"
         })
    }

    todos.splice(todoIndex,1);

   

    return res.json({
        message : "Todo Deleted Succesfully"
    })
})


// route to mark a todo done  

app.put("/todos/mark/:id",auth,function(req,res){
    const id = req.params.id;
    const currentUser = req.username;


    let foundTodo = todos.find((u)=>u.username==currentUser && u.id == parseInt(id));


    if(foundTodo){
        foundTodo.done = !foundTodo.done;

       

        return res.json({
            message : `To-do marked as ${foundTodo.done ? "done" : "undone"}`
        })


    }
   
    else{
        return res.json({
            messege : "No to-do found to update"
        })
    }

});


app.listen(3000);