// First let's say I don't have an account so I will move to signup endpoint  

const { response } = require("express");

function movetoSignUp(){
  document.getElementById("signup-container").style.display="block";
  document.getElementById("signin-container").style.display="none";
  document.getElementById("todos-container").style.display="none";


}
function movetoSignIn(){
  document.getElementById("signup-container").style.display="none";
  document.getElementById("signin-container").style.display="block";
  document.getElementById("todos-container").style.display="none";


}

function showTodoApp(){
  document.getElementById("signup-container").style.display="none";
  document.getElementById("signin-container").style.display="none";
  document.getElementById("todos-container").style.display="block";
}

// function to handle my user signup 

async function signup(){
const username = document.getElementById("signup-username").value;
const password = document.getElementById("signup-password").value;

try{
 const response = await  axios.post("http://localhost:3000/signup",{
    username : username,
    password : password,
  });


// alert(response.data.message);

 if(response.data.message==="You've Succesfully signed up!"){
  movetoSignIn();
 }

}catch(error){
 console.log("Error while signing up!");
}

}



async function signin(){
  const username = document.getElementById("signin-username").value;
  const password = document.getElementById("signin-password").value;
  
  try{
   const response = await  axios.post("http://localhost:3000/signin",{
      username : username,
      password : password,
    });
  
  
  
  
   if(response.data.token){
      localStorage.setItem("token",response.data.token);
      // alert("You're Signed in")
      showTodoApp();
   }

   else{
    alert("Invalid Credentials");
   }

   getTodos();
  
  }catch(error){
    // alert(error);
   console.log("Error while signing in!");
  }
  
  }


  async function logout(){
    localStorage.removeItem("token");

    // alert("you are logged out succesfully !");

    movetoSignIn();
  }


  // function to fetch & display todos 
  async function getTodos(){
    try{
      const token = localStorage.getItem("token");

      //sending a get request to fetch the user's todos

      const response = await axios.get("http://localhost:3000/todos",{
        headers: {token : token},
      })

      console.log(response); /// response is an array 

      //get the todo list container 
      const todolist = document.getElementById("todos-list");

      //clear the current list of todos

      todolist.innerHTML = "";

      //if there are todos create element for each  

      if(response.data.length){
        response.data.forEach((todo) => {
          console.log(todo); // this is a single object 
          const todoElement = createTodoElement(todo);
          todolist.appendChild(todoElement);
          // console.log(todolist);
        });
      }

    }catch(error){
        console.error("Error while getting Todo-list",error);
    }
  }


  async function addTodo(){
    const title = document.getElementById("input").value;

    if(title.trim()===""){
      // alert("Please write something to add to the todo-list , Please for the sake of god please please ");
      return;
    }

    try{
      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:3000/todos/create",{
        title : title,

      },{
        headers: {
          token : token
        }
      })

      //clearing the input field after adding the todo 
      document.getElementById("input").value = "";

      //refresh the list to get todos 
      getTodos();


    }catch(error){
          console.log("Error while adding a new Todo",error);
    }

   

  }


  function createTodoElement(todo){
    const todoDiv = document.createElement("div");
    todoDiv.className = "todo-item";

   
    //creating an input element for the todo title  

    const inputElement = createInputElement(todo.title);
    const updateBtn = createupdatebutton(inputElement, todo.id);
    
    const DeleteBtn = createdeletebutton( todo.id);
    const doneCheckBox = createDoneCheckBox(todo.done , todo.id , inputElement)
    inputElement.readOnly = true;

    todoDiv.appendChild(inputElement);
    todoDiv.appendChild(doneCheckBox);
    todoDiv.appendChild(updateBtn);
    todoDiv.appendChild(DeleteBtn);
 

      return todoDiv;
  }


  function createInputElement(value){
    //create an input element 
     
    const inputElement = document.createElement("input");
   

    inputElement.type = "text";

    inputElement.value = value;

    inputElement.readOnly = true;


    return inputElement;
  }


  function createupdatebutton(inputElement ,id){
       const updatebtn = document.createElement("button");
       updatebtn.textContent="Edit";

       updatebtn.onclick= function(){
         if(inputElement.readOnly){
          inputElement.readOnly = false;
          updatebtn.textContent = "Save";
          inputElement.focus(); //focus on the input element
          inputElement.style.outline = "1px solid #007BFF"; // Add blue focus color

         }

         else{
          inputElement.readOnly = true;
          updatebtn.textContent = "Edit";
          inputElement.style.outline = "none"; // Remove focus outline
          // Update the To-Do with new title
          updateTodo(id,inputElement.value)

         }
       }

       return updatebtn;

       //Handle button Click
  }


  //updating my todo 

async function updateTodo(id,newTitle){

  const token = localStorage.getItem("token");
  try{
    const response = axios.put(`http://localhost:3000/todos/${id}`,{
         title: newTitle
    },{
      headers : {
        token : token,
      }
    })

    
    //refresh the list of todos
    getTodos();

  }catch(error){
    console.log("Error while updating the todo-items",error);
  }

}



// now let's add functionality to delete a todo , first we weill create a delete button then we willl add delete fuctionality


function createdeletebutton(id){
  const deletebtn = document.createElement("button");
  deletebtn.textContent = "Delete";

  deletebtn.onclick=function () {
    deleteTodo(id);
  }


  return deletebtn;
}



//function to delete todo

async function deleteTodo(id){
 const token = localStorage.getItem("token");

 try{
  const response  = axios.delete("http://localhost:3000/todos/"+id,
    
  {
    headers:{
      token : token
    },

    
  }
  
  
  );


    getTodos();
 }catch(error){
   console.log("Error While Deleting the todo",error);
 }
}

 

//creating done checkbox




async function toggleToDoDone(id,done){

  const token = localStorage.getItem("token");

  try{
  await axios.put("http://localhost:3000/todos/mark"+id,{}, {
    headers : {
      token : token
    }

  }
  );
//refresh the todo list to reflect the changes
  

  }catch(error){
    console.log("Error while marking the todo",error);
  }

}



















function createDoneCheckBox(done,id,inputElement){
const doneCheckbox = document.createElement("input");

doneCheckbox.type = "checkbox";

doneCheckbox.checked = done;

inputElement.style.textDecoration  = done ? "line-through" : "none";

//handlechekbox onchange

doneCheckbox.onchange = function (){
  toggleToDoDone(id,done);

  inputElement.style.textDecoration = doneCheckbox.checked ? "line-through" : "none"; // Update text decoration based on checkbox state
}

return doneCheckbox;
}


//marking the todo


