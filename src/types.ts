export interface User {
  email: string;
  username: string;
  password: string;
}

export interface TodoCreate {
  email: string;
  username: string;
  description: string;
}

export interface resError {
  param: string;
  message: string;
}

export interface authRes {
  jwt: string;
}
