import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

// organizing tests using describe
describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  // making our fake service available for all tests
  beforeEach(async () => {
    // creating a fake copy of users service
    const users: User[] = [];
    fakeUsersService = {
      // fake find method
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      // fake create method
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService }, // if anyone ask for `UsersService`, provide them the value `fakeUsersService`
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const user = await service.signup('new.email@domain.com', 'password');

    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    // creating an account
    await service.signup('email@domain.com', 'password');

    await expect(
      service.signup('email@domain.com', 'password'),
    ).rejects.toThrow(BadRequestException);
  });

  it("throws if signin is called with an email which doesn't exist in system", async () => {
    await expect(
      service.signin('email@domain.com', 'password'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    // creating an account
    await service.signup('email@domain.com', 'password');

    await expect(
      service.signin('email@domain.com', 'another_password'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('email.domain.com', 'password');

    const user = await service.signin('email.domain.com', 'password');
    expect(user).toBeDefined();
  });
});
