import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../../../domain/entities/User';
import { UserModel, IUserDocument } from '../models/UserModel';
import { hashPassword } from '../../../../shared/utils/password';

/**
 * MongoDB implementation of User Repository
 */
export class MongoUserRepository implements IUserRepository {
  private mapToEntity(doc: IUserDocument): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      role: doc.role,
      isActive: doc.isActive,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? this.mapToEntity(user) : null;
  }

  async findAll(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find({ isActive: true }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments({ isActive: true }),
    ]);
    return {
      users: users.map((user) => this.mapToEntity(user)),
      total,
    };
  }

  async create(data: CreateUserDTO): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    const user = await UserModel.create({
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    });
    return this.mapToEntity(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return user ? this.mapToEntity(user) : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
}