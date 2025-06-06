import { Router } from "express";
import bcryot from "bcrypt";
import * as jwt from "jsonwebtoken";
import { createConnection } from "../database";
import * as mysql from "mysql2/promise";

export const authRoutes = Router();

authRoutes.post("/login", async (req, res) => {

    const {email, password} = req.body;
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ?", 
        [email]
      );
      const user = rows.length ? rows[0]: null;
      if (user && bcryot.compareSync(password, user.password)) {
        const token = jwt.sign({id: user.id, email: user.email}, "123456", {expiresIn: "1h"});
        res.json({token});
      }else {
        res.status(401).json({message: "Invalid credentials"});
      }
      
      
    }finally {
      await connection.end();
    }
  });
