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

const usersJoiner = []

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle joining a room
  socket.on("joinRoom", ({ group, page, user }) => {
    const room = `${group}-${page}`;
    socket.join(room);
    socket.broadcast.to(room).emit("userJoined", user);

    // Handle user disconnecting
    socket.on("disconnect", () => {
      socket.broadcast.to(room).emit("userLeft", user);
      console.log("User disconnected");
    });

    // Handle page change
    socket.on("pageChange", ({ user, markdown }) => {
      socket.broadcast.to(room).emit("pageChange", { user, markdown });
    });

   // handle create or add page 
    socket.on("addPage", ({user}) => {
      socket.broadcast.to(room).emit("addPage",  {user});
    });
    socket.on("deletePage", ( {user}) => {
      socket.broadcast.to(room).emit("deletePage", {user});
    });
    socket.on("chnagePageName", ( {user}) => {
      socket.broadcast.to(room).emit("changePageName",{user});
    });
  });
});


app.get("/", (req, res) => {
  res.send("working");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
