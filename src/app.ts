import express from "express";
import * as mysql from "mysql2/promise";
import bcryot from "bcrypt";
import * as jwt from "jsonwebtoken";

function createConnection(){
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tickets",
    port: 33060
  });
}

const app = express();

app.use(express.json());

const unprotectedRoutes = [
  {method: "POST", path: "/auth/login"},
  {method: "POST", path: "/customers/register"},
  {method: "POST", path: "/partners/register"},
  {method: "GET", path: "/events"},
]

app.use(async (req, res, next) => {
  const isUnprotectedRoute = unprotectedRoutes.some(
    (route) => route.method === req.method && req.path.startsWith(route.path)
  );

  if (isUnprotectedRoute) {
    return next(); // Permite que o usuário acesse a rota sem autenticação, por exemplo, a rota de login.
  }

  const token = req.headers['authorization']?.split(" ")[1];

  if (!token) {
    res.status(401).json({message: "No token provided"});
    return;
  }
  try {
    const connection = await createConnection();
    const payload = jwt.verify(token, "123456") as {id: number, email: string};
    console.log(payload.id);
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?", 
      [payload.id]
    );
    const user = rows.length ? rows[0]: null;
    if (!user) {
      res.status(401).json({message: "Failed to authenticate token"});
      return;
    }
    req.user = user as {id: number, email: string};
    next(
      
    )
  }
  catch (error) {
    res.status(401).json({message: "Failed to authenticate token"});
  }
})

app.get("/", (req, res) => {
  res.json({message: "Hello World!"});

});

app.post("/auth/login", async (req, res, next) => {

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

  console.log(email, password);
  res.send()
});

app.post("/partners/register", async (req, res) => {
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

app.post("/customers/register", async (req, res) => {
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

app.get("/events", async (req, res) => {



});

app.get("/events/:eventId", (req, res) => {
  const {eventId} = req.params;
  console.log(eventId);
  res.send()
});

app.post("/partners/events", async (req, res) => {
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

app.get("/partners/events", async (req, res) => {
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

app.get("/partners/events/:eventId", async (req, res) => {
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

app.listen(3000, async () => {
  const connection = await createConnection();
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Server started on port 3000");
});