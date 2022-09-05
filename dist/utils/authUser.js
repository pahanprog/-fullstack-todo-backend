"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authUser = (req, res, next) => {
    console.log(req.headers.authorization);
    if (!req.headers.authorization) {
        return;
    }
    const decoded = jsonwebtoken_1.default.decode(req.headers.authorization.replace("Bearer ", ""));
    if (!decoded) {
        return;
    }
    return decoded;
};
exports.authUser = authUser;
//# sourceMappingURL=authUser.js.map