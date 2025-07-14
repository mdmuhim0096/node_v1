// const express = require("express");

// const app = express();

// const cors = require("cors");

// const Chat = require("./model/chat");

// const http = require('http');
// const { Server } = require('socket.io');
// const server = http.createServer(app);

// const io = new Server(server);

// let onlineUser = {};

// io.on('connection', (socket) => {

//   socket.on("groupvideocall", data => {
//     socket.broadcast.emit("groupvideocall", data);
//   })

//   socket.on("register", userId => {
//     onlineUser[userId] = socket.id;
//   });

//   socket.on("incoming_call", userId => {
//     socket.broadcast.emit("incoming_call", userId);
//   })

//   socket.on("____incoming_call____", data => {
//     socket.broadcast.emit("____incoming_call____", data);
//   })

//   socket.on("____recive_call____", data => {
//     socket.broadcast.emit("____recive_call____", data);
//   })

//   socket.on("callend", userId => {
//     socket.broadcast.emit("callend", userId);
//   })

//   socket.on('send_message', async (data) => {

//     const messageObject = {
//       recevireId: data.riciver,
//       senderId: data.sender,
//       user: data.sender,
//       time: data.realtime,
//       messageText: null,
//     }

//     if (data.message.includes("https://") || data.message.includes("http://")) {
//       messageObject["link.link"] = data.message;
//       messageObject["link.isLink"] = true
//     }

//     const isLoop = data.message.match(/^\$(\d+)\s\{(.+)\}$/) || data.message.match(/^\$(\d+)\{(.+)\}$/);
//     let loopText = "",
//       next = ", ";
//     if (isLoop) {
//       messageObject.messageText = isLoop[1];
//       for (let i = 0; i < isLoop[1]; i++) {
//         if (i == isLoop[1] - 1) next = ".";
//         loopText += isLoop[2] + next;
//       }
//       messageObject.messageText = loopText;
//     } else {
//       messageObject.messageText = data.message;
//     }

//     if (data.mediaUrl) {
//       messageObject["mediaUrl"] = data.mediaUrl;
//     }

//     try {
//       if (data.call.type && data.call.duration) {
//         messageObject["call.callType"] = data.call.type;
//         messageObject["call.duration"] = data.call.duration;
//       }
//     } catch (error) {
//       console.log(error.message)
//     }

//     const newChat = new Chat(messageObject);
//     const user = await newChat.save();
//     const realchat = await Chat.findById(user.id).populate("user");
//     io.emit('receive_message', realchat);
//   });

//   socket.on("send_replay", async data => {
//     await Chat.findByIdAndUpdate(data.chatId, {
//       "replay.text": data.replay,
//       "replay.image": data.image, isReplay: true
//     }, { new: true });
//     io.emit("replay", null)
//   })

//   socket.on("__load_data__", async data => {
//     socket.broadcast.emit("__load_data__", data);
//   })

//   socket.on("see", async data => {
//     socket.broadcast.emit("see", data);
//   })

//   socket.on('disconnect', () => {
//     socket.broadcast.emit("__load_data__", null)
//     delete onlineUser;
//   });
// });

// const morgan = require("morgan");

// const databas = require("./databas/databas");

// const userRouter = require("./router/people");
// const postRouter = require("./router/post");
// const saveRouter = require("./router/save");
// const friendRouter = require("./router/friend");
// const messageRouter = require("./router/chat");
// const notificatioRouter = require("./router/notification");
// const createNotificatioRouter = require("./router/createNotifications");
// const createGroupRouter = require("./router/createGroup");
// const groupChatRouter = require("./router/groupChat");
// const shareRouter = require("./router/share");
// const cookieParser = require("cookie-parser");

// app.use(express.json());
// app.use(cookieParser())
// app.use(express.static("public"));

// app.use(cors({
//   origin: "https://mdmuhim0096.github.io/v3",
//   methods: 'GET,POST,PUT,DELETE',
//   credentials: true
// }));

// app.use("/api/people", userRouter);
// app.use("/api/post", postRouter);
// app.use("/api/save", saveRouter);
// app.use("/api/friend", friendRouter);
// app.use("/api/chat", messageRouter);
// app.use("/api/noti", notificatioRouter);
// app.use("/api/addNoti", createNotificatioRouter);
// app.use("/api/group", createGroupRouter);
// app.use("/api/gchat", groupChatRouter);
// app.use("/api/share", shareRouter);

// app.get("/ok", (req, res) =>{res.send('<h1>All Right</h1>')})

// const port = 4000;
// server.listen(port, () => { console.log(`http://localhost:${port}`) });


const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const http = require('http');
const { Server } = require('socket.io');
const Chat = require("./model/chat");

// Express app and HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Socket.IO with cross-origin support
const io = new Server(server, {
  cors: {
    origin: [
      "https://mdmuhim0096.github.io/v2",
      "https://mdmuhim0096.github.io/v3",
      "https://mdmuhim0096.github.io/v4",
      "https://mdmuhim0096.github.io/v5",
      "https://mdmuhim0096.github.io/v6",
      "https://mdmuhim0096.github.io/v7"
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Online users tracking
let onlineUser = {};

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  socket.on("groupvideocall", data => {
    socket.broadcast.emit("groupvideocall", data);
  });

  socket.on("register", userId => {
    onlineUser[userId] = socket.id;
  });

  socket.on("incoming_call", userId => {
    socket.broadcast.emit("incoming_call", userId);
  });

  socket.on("____incoming_call____", data => {
    socket.broadcast.emit("____incoming_call____", data);
  });

  socket.on("____recive_call____", data => {
    socket.broadcast.emit("____recive_call____", data);
  });

  socket.on("callend", userId => {
    socket.broadcast.emit("callend", userId);
  });

  socket.on('send_message', async (data) => {
    const messageObject = {
      recevireId: data.riciver,
      senderId: data.sender,
      user: data.sender,
      time: data.realtime,
      messageText: null,
    };

    if (data.message.includes("https://") || data.message.includes("http://")) {
      messageObject["link.link"] = data.message;
      messageObject["link.isLink"] = true;
    }

    const isLoop = data.message.match(/^\$(\d+)\s?\{(.+)\}$/);
    if (isLoop) {
      const count = parseInt(isLoop[1]);
      const text = isLoop[2];
      messageObject.messageText = Array(count).fill(text).join(", ") + ".";
    } else {
      messageObject.messageText = data.message;
    }

    if (data.mediaUrl) {
      messageObject.mediaUrl = data.mediaUrl;
    }

    try {
      if (data.call?.type && data.call?.duration) {
        messageObject["call.callType"] = data.call.type;
        messageObject["call.duration"] = data.call.duration;
      }
    } catch (error) {
      console.log(error.message);
    }

    try {
      const newChat = new Chat(messageObject);
      const user = await newChat.save();
      const realchat = await Chat.findById(user.id).populate("user");
      io.emit('receive_message', realchat);
    } catch (err) {
      console.log("Chat Save Error:", err.message);
    }
  });

  socket.on("send_replay", async data => {
    await Chat.findByIdAndUpdate(data.chatId, {
      "replay.text": data.replay,
      "replay.image": data.image,
      isReplay: true
    }, { new: true });
    io.emit("replay", null);
  });

  socket.on("__load_data__", data => {
    socket.broadcast.emit("__load_data__", data);
  });

  socket.on("see", data => {
    socket.broadcast.emit("see", data);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit("__load_data__", null);
    delete onlineUser;
  });
});

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://mdmuhim0096.github.io", // deployed GitHub Pages root
  "https://mdmuhim0096.github.io/v3",
  "https://mdmuhim0096.github.io/v4",
  "https://mdmuhim0096.github.io/v5",
  "https://mdmuhim0096.github.io/v6",
  "https://mdmuhim0096.github.io/v7" // optional if subpath used
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`❌ CORS blocked: ${origin}`);
      return callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
}));


// ✅ Routers
const databas = require("./databas/databas");
const userRouter = require("./router/people");
const postRouter = require("./router/post");
const saveRouter = require("./router/save");
const friendRouter = require("./router/friend");
const messageRouter = require("./router/chat");
const notificatioRouter = require("./router/notification");
const createNotificatioRouter = require("./router/createNotifications");
const createGroupRouter = require("./router/createGroup");
const groupChatRouter = require("./router/groupChat");
const shareRouter = require("./router/share");

app.use("/api/people", userRouter);
app.use("/api/post", postRouter);
app.use("/api/save", saveRouter);
app.use("/api/friend", friendRouter);
app.use("/api/chat", messageRouter);
app.use("/api/noti", notificatioRouter);
app.use("/api/addNoti", createNotificatioRouter);
app.use("/api/group", createGroupRouter);
app.use("/api/gchat", groupChatRouter);
app.use("/api/share", shareRouter);

// ✅ Health check
app.get("/ok", (req, res) => {
  res.send('<h1>All Right</h1>');
});

// ✅ Start server
const port = 4000;
server.listen(port, () => {
  console.log(`✅ Server running: http://localhost:${port}`);
});
