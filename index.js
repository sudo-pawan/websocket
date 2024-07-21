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
  socket.on("joinRoom", ({ group, page,user }) => {
    const room = `${group}-${page}`;
    socket.join(room);
    
    socket.to(room).emit("userJoined", user);

    socket.on("disconnect", () => {
      console.log("user disconnected:", socket.id);
      socket.to(room).emit("userLeft",user);
    });

    socket.on("pageChange", (data) => {
      socket.to(room).emit("pageChange", data);
    });
  });
});

app.get("/",(req,res)=>{
res.send("working")
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
