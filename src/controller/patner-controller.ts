import { Router } from "express";
import bcryot from "bcrypt";
import { createConnection } from "../database";
import * as mysql from "mysql2/promise";

export const partnerRoutes = Router();

partnerRoutes.post("/register", async (req, res) => {
  const {name, email, password, company_name} = req.body;

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

      const [partnerResults] = await connection.execute<mysql.ResultSetHeader>('INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)',[
        userId, 
        company_name, 
        createdAt
      ]);
      res.status(201).json({ id: partnerResults.insertId, name, user_id: userId, company_name, created_at: createdAt});
  } finally {
    await connection.end();
  }
});

partnerRoutes.post("/events", async (req, res) => {
    const {name, description, date, location} = req.body;
    const userId = req.user!.id;
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM partners WHERE user_id = ?", 
        [userId]
      );
      const partner = rows.length ? rows[0]: null;
      if (!partner) {
        res.status(403).json({message: "Not authorized"});
        return;
      }
      const eventDate = new Date(date);
      const createdAt = new Date();
      const [eventResults] = await connection.execute<mysql.ResultSetHeader>('INSERT INTO events (name, description, date, location, created_at, partners_id) VALUES (?, ?, ?, ?, ?, ?)',[
        name, 
        description, 
        eventDate,
        location,
        createdAt,
        partner.id,
  
      ]);
      res.status(201).json({ id: eventResults.insertId, name, description, date: eventDate, location, created_at: createdAt, partner_id: partner.id});
  
    } finally {
      await connection.end();
    }
  
  });
  
  partnerRoutes.get("/events", async (req, res) => {
    const partnerId = req.user!.id;
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM partners WHERE user_id = ?", 
        [partnerId]
      );
      const partner = rows.length ? rows[0]: null;
      if (!partner) {
        res.status(403).json({message: "Not authorized"});
        return;
      }
  
      const [eventsRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT id, name, description, date, location, created_at FROM events WHERE partners_id = ?", 
        [partnerId]
      );
      
      if (eventsRows.length === 0) {
        res.status(204).json([]);
        return;
      }
      
      res.status(200).json(eventsRows);
  
    } finally {
      await connection.end();
    }
  });
  
  partnerRoutes.get("/events/:eventId", async (req, res) => {
    const {eventId} = req.params;
    const partnerId = req.user!.id;
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM partners WHERE user_id = ?", 
        [partnerId]
      );
      const partner = rows.length ? rows[0]: null;
      if (!partner) {
        res.status(403).json({message: "Not authorized"});
        return;
      }
  
      const [eventsRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT id, name, description, date, location, created_at FROM events WHERE partners_id = ? and id = ?", 
        [partner.id, eventId]
      );
      const event = eventsRows.length? eventsRows[0]: null;
      
      if (!event) {
        res.status(404).json({message: "Event not found"});
        return;
      }
      
      res.status(200).json(event);
  
    } finally {
      await connection.end();
    }
  });