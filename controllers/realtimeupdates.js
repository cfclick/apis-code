
module.exports = (io) => {


  let users = [];
  io.on('connection', (socket) => {
    console.log('hiiiiiii', socket.id)
    socket.on('placebid', (message) => {
      io.emit('broadcast', { user: 'alez' })
    });

    socket.on('acceptbid', (message) => {
      io.emit('bidaccepted', { user: 'alez' })
    });


    socket.on('saveuser', (obj) => {
      console.log('wowowowoowowwwwwwwwwwwwwwwwwwwwwwwwwww', obj)
      if (users.map(user => user.username).indexOf(obj.username) == -1) {
        let user = {
          username: obj.username,
          socketId: socket.id,
          isSeller: obj.isSeller
        };
        users.push(user);
        io.emit('usernames', users)
        console.log(users)

      }
    });

    socket.on('newMessage', (message) => {
      console.log('the message is', message)
      socket.broadcast.to(message.sendTo.socketId).emit('haveNewMessage', message);
    })


    socket.on('disconnect', function () {
      console.log('disconnect', socket.id)
      var i = users.map(user => user.socketId).indexOf(socket.id);
      users.splice(i, 1);
      io.emit('usernames', { users: this.users })
    });


  });



}
