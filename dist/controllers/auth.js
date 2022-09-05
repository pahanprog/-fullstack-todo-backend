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
const queries_1 = require("../queries");
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postRegister = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    if (yield (0, queries_1.checkIfUserExists)(user)) {
        const error = [
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
    const hashedPassword = yield argon2_1.default.hash(user.password);
    user.password = hashedPassword;
    const id = yield (0, queries_1.createUser)(user);
    const token = jsonwebtoken_1.default.sign({ id: id, admin: false }, process.env.JWTSECRET);
    const result = {
        jwt: token,
    };
    res.send(result);
});
const postLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = {
        email: req.body.usernameOrEmail
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            ? req.body.usernameOrEmail
            : "",
        username: req.body.usernameOrEmail
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            ? ""
            : req.body.usernameOrEmail,
        password: req.body.password,
    };
    if (!(yield (0, queries_1.checkIfUserExists)(user))) {
        const error = [
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
        check = yield (0, queries_1.getUserByEmail)(user);
    }
    else {
        check = yield (0, queries_1.getUserByUsername)(user);
    }
    const valid = yield argon2_1.default.verify(check.password, user.password);
    if (!valid) {
        const error = [
            {
                param: "password",
                message: "Wrong password",
            },
        ];
        res.send({ error: error });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: check.id, admin: check.admin }, process.env.JWTSECRET);
    const result = {
        jwt: token,
    };
    res.send(result);
});
exports.default = { postRegister, postLogin };
//# sourceMappingURL=auth.js.map