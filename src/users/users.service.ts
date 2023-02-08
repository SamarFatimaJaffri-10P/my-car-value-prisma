import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';

const scrypt = promisify(_scrypt);
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(email: string, password: string): Promise<User> {
    // create a user entity
    const user = this.prisma.user.create({
      data: { email, password, admin: false },
    });

    return user;
  }

  findOne(id: number): Promise<User> {
    if (!id) {
      return null;
    }
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  find(email: string): Promise<User[]> {
    return this.prisma.user.findMany({ where: { email: email } });
  }

  /**
   * Update user properties provided by the user
   * @param id id of the user to be updated
   * @param attrs attributes of user to be updated
   */
  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (attrs.password) {
      // hash the users password
      // Generate a salt
      const salt = randomBytes(8).toString('hex');

      // Hash the salt and the password together
      const hash = (await scrypt(attrs.password, salt, 32)) as Buffer; // help ts know that it is a buffer

      // Join the hashed result and the salt together
      attrs.password = `${salt}.${hash.toString('hex')}`;
    }

    Object.assign(user, attrs);
    return this.prisma.user.update({
      where: { id: user.id },
      data: { ...attrs },
    });
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.prisma.user.delete({ where: { id: id } });
  }
}
