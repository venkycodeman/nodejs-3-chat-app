const socket = io()

//Elements
const $formElement = document.querySelector('#form-id')
const $formElementInput = $formElement.querySelector('input')
const $formElementButton = $formElement.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {userName, room} = Qs.parse(location.search, { ignoreQueryPrefix : true})


const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Heigth of New message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeigth = $newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of the messages container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight- newMessageHeigth <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        userName:message.userName,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    
    const html = Mustache.render(locationTemplate,{
        userName:message.userName,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData',({users,room})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


document.querySelector('#form-id').addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable button
    $formElementButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error)=>{
        //enable button
        $formElementButton.removeAttribute('disabled')
        $formElementInput.value=''
        $formElementInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })
    
    

})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude : position.coords.latitude, 
            longitude : position.coords.longitude
        },()=>{

            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')

        })
    })
})

socket.emit('join', {userName, room},(error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }
})
