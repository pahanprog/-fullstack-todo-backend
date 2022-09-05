"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const queries_1 = require("../queries");
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const todoCreate = req.body;
    const result = yield (0, queries_1.createTodoQuery)(todoCreate);
    res.send(result);
});
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.id;
    const result = yield (0, queries_1.deleteTodoQuery)(id);
    res.send(result);
});
const editTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.id;
    const description = req.body.description;
    const result = yield (0, queries_1.editTodoQuery)(id, description);
    res.send(result);
});
const updateTodoStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.id;
    const result = yield (0, queries_1.updateTodoState)(id);
    res.send(result);
});
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, queries_1.getTodosQuery)(req.body.page, req.body.parameters);
    res.send({ todos: result === null || result === void 0 ? void 0 : result.rows, todoCount: result === null || result === void 0 ? void 0 : result.todosCount });
});
exports.default = { createTodo, deleteTodo, editTodo, updateTodoStatus, getTodos };
//# sourceMappingURL=todo.js.map