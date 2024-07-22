const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 8080;

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ group, page, user }) => {
    const room = `${group}-${page}`;
    socket.join(room);
    
    // Notify other users in the room that a new user has joined
    socket.broadcast.to(room).emit("userJoined", user);

    socket.on("disconnect", () => {
      console.log("user disconnected:", socket.id);
      // Notify other users in the room that the user has left
      socket.broadcast.to(room).emit("userLeft", user);
    });

    socket.on("pageChange", (data) => {
      // Broadcast to all other clients in the room except the sender
      socket.broadcast.to(room).emit("pageChange", data);
    });
  });
});

app.get("/", (req, res) => {
  res.send("working");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
