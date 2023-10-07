const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const formatMessage = require("./utils/messages.js");
const {
  getCurrentUser,
  userJoin,
  userLeavesChat,
  getRoomUsers,
} = require("./utils/users.js");

const app = express();
const httpServer = require("http").createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(__dirname, "public")));

const botName = "chatBord Bot ";
//Run when the client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome current user
    socket.emit("message", formatMessage(botName, "Welocome to ChatCord"));

    //Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );


      //send users name and info
      io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
      })
  });

  //Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeavesChat(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat `)
      );
            //send users name and info
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
              })
        
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
