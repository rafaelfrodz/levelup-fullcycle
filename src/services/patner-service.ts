import { Database } from "../database";
import { UserModel } from "../models/user-model";
import { PartnerModel } from "../models/partner-model";

export class PartnerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    company_name: string;
  }) {
    const { name, email, password, company_name } = data;
    const connection = await Database.getInstance().getConnection();
    try {
      await connection.beginTransaction();
      const userResult = await UserModel.create(
        {
          name,
          email,
          password,
        },
        { connection }
      );
      const partnerResults = await PartnerModel.create(
        {
          user_id: userResult.id,
          company_name,
        },
        { connection }
      );
      await connection.commit();
      return {
        id: partnerResults.id,
        name,
        user_id: userResult.id,
        company_name,
        created_at: userResult.created_at,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  async findByUserId(userId: number) {
    return PartnerModel.findByUserId(userId);
  }
}
