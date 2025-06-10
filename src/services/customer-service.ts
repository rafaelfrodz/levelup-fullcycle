import { Database } from "../database";
import * as mysql from "mysql2/promise";
import bcryot from "bcrypt";
import { UserModel } from "../models/user-models";

export class CustomerService {
    async register(data: {
        name: string; 
        email: string; 
        password: string; 
        phone: number;
        address: string 
    }){
        const {name, email, password, phone, address} = data;
        const connection = Database.getInstance();
        try {
            const createdAt = new Date();
            const hashedPassword = bcryot.hashSync(password, 10);
            const userModel = await UserModel.create({
              name, 
              email, 
              password: hashedPassword
            });
            const userId = userModel.id;
            const [customersResults] = await connection.execute<mysql.ResultSetHeader>('INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)',[
              userId, 
              address,
              phone, 
              createdAt
            ]);
            return { id: customersResults.insertId, name, user_id: userId, address, phone, created_at: createdAt};
        } finally {
          await connection.end();
        }
    }
}