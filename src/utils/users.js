// addUser, removeUser, getUser, getUsersInRoom
const users = []
const addUser = ({id, userName, room})=>{
//clean the data
userName = userName.trim().toLowerCase()
room = room.trim().toLowerCase()

//validate the data
if(!userName || !room){
    return {
        error: 'username and room are required!'
    }
}

//check for existing user
const existingUser = users.find((user)=>user.userName === userName && user.room === room)

//validate username
if(existingUser){
    return {
        error:'username already in use'
    }
}

//store users
const user = {
    id,
    userName,
    room
}
users.push(user)
return {user}

}


const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room)=>{
    return users.filter((user)=> room === user.room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
