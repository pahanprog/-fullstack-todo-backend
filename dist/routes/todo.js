"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authUser_1 = require("../utils/authUser");
const todo_1 = __importDefault(require("../controllers/todo"));
const router = (0, express_1.Router)();
router.use(["/edit", "/update", "/delete"], (req, res, next) => {
    const user = (0, authUser_1.authUser)(req, res, next);
    if (!user || !user.admin) {
        res.send("Not authenticated");
        return;
    }
    req.user = user;
    next();
});
router.post("/", todo_1.default.getTodos);
router.post("/create", todo_1.default.createTodo);
router.post("/delete", todo_1.default.deleteTodo);
router.post("/edit", todo_1.default.editTodo);
router.post("/update", todo_1.default.updateTodoStatus);
exports.default = router;
//# sourceMappingURL=todo.js.map