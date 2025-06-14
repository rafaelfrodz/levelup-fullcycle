import express from "express";
import { Database } from "./database";
import * as jwt from "jsonwebtoken";
import { authRoutes } from "./controller/auth-controller";
import { partnerRoutes } from "./controller/patner-controller";
import { customerRoutes } from "./controller/customer-controller";
import { eventRoutes } from "./controller/event-controller";
import { UserService } from "./services/user-service";
import { ticketRoutes } from "./controller/ticket-controller";

const app = express();

app.use(express.json());

const unprotectedRoutes = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/customers/register" },
  { method: "POST", path: "/partners/register" },
  { method: "GET", path: "/events" },
];

app.use(async (req, res, next) => {
  const isUnprotectedRoute = unprotectedRoutes.some(
    (route) => route.method === req.method && req.path.startsWith(route.path)
  );

  if (isUnprotectedRoute) {
    return next(); // Permite que o usuário acesse a rota sem autenticação, por exemplo, a rota de login.
  }

  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const payload = jwt.verify(token, "123456") as {
      id: number;
      email: string;
    };
    const userService = new UserService();
    const userResult = await userService.findById(payload.id);
    if (!userResult) {
      res.status(401).json({ message: "Failed to authenticate token" });
      return;
    }
    req.user = userResult as { id: number; email: string };
    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use("/auth", authRoutes);
app.use("/partners", partnerRoutes);
app.use("/customers", customerRoutes);
app.use("/events", eventRoutes);
app.use("/events/", ticketRoutes);

app.listen(3000, async () => {
  const connection = Database.getInstance();
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE tickets");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Server started on port 3000");
});
