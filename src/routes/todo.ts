import { Router } from "express";
import { authUser } from "../utils/authUser";
import todoController from "../controllers/todo";

const router = Router();

router.use(["/edit", "/update", "/delete"], (req, res, next) => {
  const user = authUser(req, res, next);

  if (!user || !user.admin) {
    res.send("Not authenticated");
    return;
  }

  req.user = user;

  next();
});

router.post("/", todoController.getTodos);

router.post("/create", todoController.createTodo);

router.post("/delete", todoController.deleteTodo);

router.post("/edit", todoController.editTodo);

router.post("/update", todoController.updateTodoStatus);

export default router;
