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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodosQuery = exports.updateTodoState = exports.editTodoQuery = exports.deleteTodoQuery = exports.createTodoQuery = exports.getUserByUsername = exports.getUserByEmail = exports.createUser = exports.checkIfUserExists = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.PG_PORT) {
    throw "no pg port";
}
const pool = new pg_1.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASS,
    port: parseInt(process.env.PG_PORT),
    ssl: {
        rejectUnauthorized: false,
    },
});
const checkIfUserExists = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rowCount } = yield pool.query(`SELECT id FROM "user" WHERE email = '${user.email}' OR username = '${user.username}'`);
        console.log({ rowCount });
        return rowCount !== 0;
    }
    catch (err) {
        console.error(err);
        return true;
    }
});
exports.checkIfUserExists = checkIfUserExists;
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield pool.query(`INSERT INTO "user" (email, username, password) values ('${user.email}','${user.username}', '${user.password}') RETURNING id`);
        return rows[0].id;
    }
    catch (err) {
        console.error(err);
    }
});
exports.createUser = createUser;
const getUserByEmail = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield pool.query(`SELECT id, password, admin FROM "user" WHERE email = '${user.email}'`);
        return rows[0];
    }
    catch (err) {
        console.error(err);
    }
});
exports.getUserByEmail = getUserByEmail;
const getUserByUsername = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield pool.query(`SELECT id, password, admin FROM "user" WHERE username = '${user.username}'`);
        return rows[0];
    }
    catch (err) {
        console.error(err);
    }
});
exports.getUserByUsername = getUserByUsername;
const createTodoQuery = (createTodo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield pool.query(`
        INSERT INTO "todo" 
        (email,username, description) 
        VALUES ('${createTodo.email}','${createTodo.username}','${createTodo.description}') 
        RETURNING id,description, "createdAt",
        email, 
        username,
        complete,
        edited
    `);
        return rows[0];
    }
    catch (err) {
        console.error(err);
    }
});
exports.createTodoQuery = createTodoQuery;
const deleteTodoQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rowCount } = yield pool.query(`DELETE FROM "todo" WHERE id = ${id}`);
        return rowCount === 1;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.deleteTodoQuery = deleteTodoQuery;
const editTodoQuery = (id, description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rowCount } = yield pool.query(`UPDATE "todo" SET description = '${description}', edited = true WHERE id = ${id}`);
        return rowCount === 1;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.editTodoQuery = editTodoQuery;
const updateTodoState = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rowCount } = yield pool.query(`UPDATE "todo" SET complete = NOT complete  WHERE id = ${id}`);
        return rowCount === 1;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.updateTodoState = updateTodoState;
const getTodosQuery = (page, parameters) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let rows = [];
        let todosCount = 0;
        if (parameters.complete && parameters.usernameOrEmail === "") {
            console.log("COMPLETE ONLY");
            rows = (yield pool.query(`SELECT 
        id, 
        "createdAt",
        description, 
        email, 
        username,
        complete,
        edited
      FROM "todo" 
      WHERE "complete" = true
      ORDER BY "todo"."createdAt" ${parameters.order}
      LIMIT 3
      OFFSET ${3 * page}`)).rows;
            todosCount = (yield pool.query(`SELECT COUNT(id) as "todoCount" FROM "todo" WHERE "complete" = true`)).rows[0].todoCount;
        }
        else if (parameters.complete && parameters.usernameOrEmail !== "") {
            console.log("COMPLETE AND FILTER");
            rows = (yield pool.query(`SELECT 
        id, 
        "createdAt",
        description, 
        email, 
        username,
        complete,
        edited
      FROM "todo" 
      WHERE "complete" = true AND (LOWER(email) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%' 
      OR LOWER(username) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%')
      ORDER BY "todo"."createdAt" ${parameters.order}
      LIMIT 3
      OFFSET ${3 * page}`)).rows;
            todosCount = (yield pool.query(`SELECT COUNT(id) as "todoCount" FROM "todo" WHERE "complete" = true AND (LOWER(email) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%' 
          OR LOWER(username) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%')`)).rows[0].todoCount;
        }
        else if (parameters.usernameOrEmail !== "") {
            console.log("FILTER ONLY");
            rows = (yield pool.query(`SELECT 
        id, 
        "createdAt",
        description, 
        email, 
        username,
        complete,
        edited
      FROM "todo" 
      WHERE LOWER(email) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%' 
      OR LOWER(username) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%'
      ORDER BY "todo"."createdAt" ${parameters.order}
      LIMIT 3
      OFFSET ${3 * page}`)).rows;
            todosCount = (yield pool.query(`SELECT COUNT(id) as "todoCount" FROM "todo" WHERE LOWER(email) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%' 
          OR LOWER(username) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%'`)).rows[0].todoCount;
        }
        else {
            rows = (yield pool.query(`SELECT 
      id, 
      "createdAt",
      description, 
      email, 
      username,
      complete,
      edited
    FROM "todo" 
    ORDER BY "todo"."createdAt" ${parameters.order}
    LIMIT 3
    OFFSET ${3 * page}`)).rows;
            todosCount = (yield pool.query(`SELECT COUNT(id) as "todoCount" FROM "todo"`)).rows[0].todoCount;
        }
        return { rows, todosCount };
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.getTodosQuery = getTodosQuery;
//# sourceMappingURL=queries.js.map