import { Pool, Client } from "pg";
import { TodoCreate, User } from "./types";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.PG_PORT) {
  throw "no pg port";
}

// const client = new Client(process.env.DATABASE_URL);
// pool.connect();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: parseInt(process.env.PG_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

export const checkIfUserExists = async (user: User) => {
  try {
    const { rowCount } = await pool.query(
      `SELECT id FROM "user" WHERE email = '${user.email}' OR username = '${user.username}'`
    );

    return rowCount !== 0;
  } catch (err) {
    console.error(err);
    return true;
  }
};

export const createUser = async (user: User) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO "user" (email, username, password) values ('${user.email}','${user.username}', '${user.password}') RETURNING id`
    );

    return rows[0].id;
  } catch (err) {
    console.error(err);
  }
};

export const getUserByEmail = async (user: User) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, password, admin FROM "user" WHERE email = '${user.email}'`
    );

    return rows[0];
  } catch (err) {
    console.error(err);
  }
};

export const getUserByUsername = async (user: User) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, password, admin FROM "user" WHERE username = '${user.username}'`
    );

    return rows[0];
  } catch (err) {
    console.error(err);
  }
};

export const createTodoQuery = async (createTodo: TodoCreate) => {
  try {
    const { rows } = await pool.query(`
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
  } catch (err) {
    console.error(err);
  }
};

export const deleteTodoQuery = async (id: number) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM "todo" WHERE id = ${id}`
    );

    return rowCount === 1;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const editTodoQuery = async (id: number, description: string) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE "todo" SET description = '${description}', edited = true WHERE id = ${id}`
    );

    return rowCount === 1;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateTodoState = async (id: number) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE "todo" SET complete = NOT complete  WHERE id = ${id}`
    );

    return rowCount === 1;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getTodosQuery = async (
  page: number,
  parameters: { usernameOrEmail: string; complete: boolean; order: string }
) => {
  try {
    let rows: any = [];
    let todosCount = 0;
    if (parameters.complete && parameters.usernameOrEmail === "") {
      rows = (
        await pool.query(
          `SELECT 
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
      OFFSET ${3 * page}`
        )
      ).rows;

      todosCount = (
        await pool.query(
          `SELECT COUNT(id) as "todoCount" FROM "todo" WHERE "complete" = true`
        )
      ).rows[0].todoCount;
    } else if (parameters.complete && parameters.usernameOrEmail !== "") {
      rows = (
        await pool.query(
          `SELECT 
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
      OFFSET ${3 * page}`
        )
      ).rows;

      todosCount = (
        await pool.query(
          `SELECT COUNT(id) as "todoCount" FROM "todo" WHERE "complete" = true AND (LOWER(email) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%' 
          OR LOWER(username) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%')`
        )
      ).rows[0].todoCount;
    } else if (parameters.usernameOrEmail !== "") {
      rows = (
        await pool.query(
          `SELECT 
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
      OFFSET ${3 * page}`
        )
      ).rows;

      todosCount = (
        await pool.query(
          `SELECT COUNT(id) as "todoCount" FROM "todo" WHERE LOWER(email) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%' 
          OR LOWER(username) LIKE '%${parameters.usernameOrEmail.toLocaleLowerCase()}%'`
        )
      ).rows[0].todoCount;
    } else {
      rows = (
        await pool.query(
          `SELECT 
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
    OFFSET ${3 * page}`
        )
      ).rows;

      todosCount = (
        await pool.query(`SELECT COUNT(id) as "todoCount" FROM "todo"`)
      ).rows[0].todoCount;
    }

    return { rows, todosCount };
  } catch (err) {
    console.error(err);
    return null;
  }
};
