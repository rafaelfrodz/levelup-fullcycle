import { Router } from "express";
import bcryot from "bcrypt";
import { createConnection } from "../database";
import * as mysql from "mysql2/promise";

export const customerRoutes = Router();

customerRoutes.post("/register", async (req, res) => {
    const {name, email, password, phone, address} = req.body;

    const connection = await createConnection();
    try {
        const createdAt = new Date();
        const hashedPassword = bcryot.hashSync(password, 10);
  
        const [userResult] = await connection.execute<mysql.ResultSetHeader>('INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)', [
          name, 
          email, 
          hashedPassword, 
          createdAt
        ]);
  
        const userId = userResult.insertId;
  
        const [customersResults] = await connection.execute<mysql.ResultSetHeader>('INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)',[
          userId, 
          address,
          phone, 
          createdAt
        ]);
        res.status(201).json({ id: customersResults.insertId, name, user_id: userId, address, phone, created_at: createdAt});
    } finally {
      await connection.end();
    }
});