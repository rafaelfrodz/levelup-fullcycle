import { Router } from "express";
import { createConnection } from "../database";
import * as mysql from "mysql2/promise";

export const eventRoutes = Router();

eventRoutes.get("/", async (req, res) => {
    const connection = await createConnection();
    try {
      const [eventsRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM events", 
      );
      
      res.status(200).json(eventsRows);
  
    } finally {
      await connection.end();
    }
  
  
  });
  
  eventRoutes.get("/:eventId", async (req, res) => {
    const {eventId} = req.params;
    const connection = await createConnection();
    try {
      const [eventsRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT id, name, description, date, location, created_at FROM events WHERE id = ?", 
        [eventId]
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