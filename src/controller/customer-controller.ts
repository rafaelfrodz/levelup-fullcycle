import { Router } from "express";
import { CustomerService } from "../services/customer-service";

export const customerRoutes = Router();

customerRoutes.post("/register", async (req, res) => {
    const {name, email, password, phone, address} = req.body;
    const customerService = new CustomerService();
    const customerResult = await customerService.register({
        name,
        email,
        password,
        phone,
        address
    });
    res.status(201).json(customerResult);
});