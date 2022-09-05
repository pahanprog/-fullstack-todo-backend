import { Request, Response, NextFunction } from "express";
import {
  createTodoQuery,
  deleteTodoQuery,
  editTodoQuery,
  getTodosQuery,
  updateTodoState,
} from "../queries";
import { TodoCreate } from "../types";

const createTodo = async (req: Request, res: Response) => {
  const todoCreate: TodoCreate = req.body;

  const result = await createTodoQuery(todoCreate);

  res.send(result);
};

const deleteTodo = async (req: Request, res: Response) => {
  const id = req.body.id;

  const result = await deleteTodoQuery(id);

  res.send(result);
};

const editTodo = async (req: Request, res: Response) => {
  const id = req.body.id;
  const description = req.body.description;

  const result = await editTodoQuery(id, description);

  res.send(result);
};

const updateTodoStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.body.id;

  const result = await updateTodoState(id);

  res.send(result);
};

const getTodos = async (req: Request, res: Response) => {
  const result = await getTodosQuery(
    req.body.page,
    req.body.parameters as {
      usernameOrEmail: string;
      complete: boolean;
      order: string;
    }
  );

  res.send({ todos: result?.rows, todoCount: result?.todosCount });
};

export default { createTodo, deleteTodo, editTodo, updateTodoStatus, getTodos };
