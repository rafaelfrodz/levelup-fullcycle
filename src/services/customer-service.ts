import { Database } from "../database";
import { UserModel } from "../models/user-model";
import { CustomerModel } from "../models/customer-model";

export class CustomerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) {
    const { name, email, password, phone, address } = data;
    const connection = await Database.getInstance().getConnection();
    try {
      await connection.beginTransaction();
      const user = await UserModel.create(
        {
          name,
          email,
          password: password,
        },
        { connection }
      );
      const customer = await CustomerModel.create(
        {
          user_id: user.id,
          address,
          phone,
        },
        { connection }
      );
      await connection.commit();
      return {
        id: customer.id,
        name,
        user_id: user.id,
        address,
        phone,
        created_at: customer.created_at,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
}
