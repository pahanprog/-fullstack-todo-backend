// task  (username, email, description)
// user (username,password,admin)
//

import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth";
import todoRoute from "./routes/todo";
import cors from "cors";

dotenv.config();

const corsOptions = {
  origin: ["https://ps-todo.herokuapp.com"],
  credentials: true,
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", authRoute);
app.use("/todo", todoRoute);

app.listen(process.env.PORT, () => {
  console.log("Server listening on port: ", process.env.PORT);
});
