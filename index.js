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

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("joinRoom", ({ group, page, user }) => {
    const room = `${group}-${page}`;
    userSocketMap[socket.id] = user;
    socket.join(room);

    const clients = getAllConnectedClients(room);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("userJoined", {
        clients: clients.map(client => client.username), // Emit only usernames
        user,
      });
    });

    socket.on("disconnecting", () => {
      const rooms = [...socket.rooms];
      rooms.forEach((roomId) => {
        socket.in(roomId).emit("userLeft", {
          user: userSocketMap[socket.id],
        });
      });
      delete userSocketMap[socket.id];
    });

    socket.on("pageChange", (data) => {
      socket.in(room).emit("pageChange", data);
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("working");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
