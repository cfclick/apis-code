
module.exports = (io) => {
   


    io.on('connection', (socket) => {
   console.log('connected to socket.io!')
        socket.on('placebid', (message) => {
            console.log(message);
            io.emit('broadcast',{user:'alez'})
          });


         

    });


       
}
