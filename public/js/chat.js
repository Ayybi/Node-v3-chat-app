const socket = io()
//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location-btn')
const $divMessages = document.querySelector('#messages')


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //New msg element
    const $newMessage = $divMessages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin =    parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $divMessages.offsetHeight

    //Height of messages conatiner
    const conatinerHeight = $divMessages.scrollHeight
    
    //How far hv i scrolled
    const scrollOffset = $divMessages.scrollTop + visibleHeight

    if(conatinerHeight - newMessageHeight <= scrollOffset){
        $divMessages.scrollTop = $divMessages.scrollHeight
    }
}

socket.on('message', (messages) => {
    console.log(messages)
    const html = Mustache.render(messageTemplate, {
        username: messages.username,
        message: messages.text,
        createdAt: moment(messages.createdAt).format('hh:mm a')
    })
    $divMessages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({ room, users }) =>{
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
socket.on('locationMessage' , (message) => {
    console.log(message)

    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })

    $divMessages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
     //disable
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable
         if(error){
             return console.log(error)
         }
         console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browzer')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
               
               socket.emit('sendLocation', {
                   latitude: position.coords.latitude,
                   longitude: position.coords.longitude
                }, () => {
                    $sendLocationButton.removeAttribute('disabled')
                    console.log('Location shared')
                })
    })
})

socket.emit('join', { username, room, }, (error) => {
     if(error){
         alert(error)
         location.href = '/'   
     }
})