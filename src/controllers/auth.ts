import { Request, Response, NextFunction } from "express";
import {
  checkIfUserExists,
  createUser,
  getUserByEmail,
  getUserByUsername,
} from "../queries";
import { authRes, resError, User } from "../types";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const postRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user: User = req.body;

  if (await checkIfUserExists(user)) {
    const error: resError[] = [
      {
        param: "username",
        message: "Username of email address already registered",
      },
      {
        param: "email",
        message: "Username of email address already registered",
      },
    ];
    res.send(error);
    return;
  }

  const hashedPassword = await argon2.hash(user.password);
  console.log(hashedPassword);
  user.password = hashedPassword;

  const id = await createUser(user);

  const token = jwt.sign({ id: id, admin: false }, process.env.JWTSECRET!);

  const result: authRes = {
    jwt: token,
  };

  res.send(result);
};

const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = {
    email: req.body.usernameOrEmail
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
      ? req.body.usernameOrEmail
      : "",
    username: req.body.usernameOrEmail
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
      ? ""
      : req.body.usernameOrEmail,
    password: req.body.password,
  };

  if (!(await checkIfUserExists(user))) {
    const error: resError[] = [
      {
        param: "usernameOrEmail",
        message: "User not found",
      },
    ];
    res.send({ error: error });
    return;
  }

  let check;

  if (user.email) {
    check = await getUserByEmail(user);
  } else {
    check = await getUserByUsername(user);
  }

  const valid = await argon2.verify(check.password, user.password);

  if (!valid) {
    const error: resError[] = [
      {
        param: "password",
        message: "Wrong password",
      },
    ];
    res.send({ error: error });
    return;
  }

  const token = jwt.sign(
    { id: check.id, admin: check.admin },
    process.env.JWTSECRET!
  );

  const result: authRes = {
    jwt: token,
  };

  res.send(result);
};

export default { postRegister, postLogin };
