const express = require("express");
// lets connect to our database first
require("./db/mongoose");
const userRouter = require("./routes/user-routes");
const taskRouter = require("./routes/task-routes");

const app = express();
const port = process.env.PORT;

// use JSON data recieved from server
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// in localhost:3000/tasks

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
