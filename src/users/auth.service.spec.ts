import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

// organizing tests using describe
describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  // making our fake service available for all tests
  beforeEach(async () => {
    // creating a fake copy of users service
    fakeUsersService = {
      find: () => Promise.resolve([]), // fake find method
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User), // fake create method
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
    // mocking find() method call
    fakeUsersService.find = () =>
      Promise.resolve([
        // any string can be used here as email / password as we just check length in signup method
        { id: 1, email: 'email@domain.com', password: 'pw' } as User,
      ]);

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
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'email@domain.com', password: 'different_password' } as User,
      ]);
    await expect(
      service.signin('email@domain.com', 'password'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        {
          email: 'email@domain.com',
          password:
            '258e2208f45846f0.986261126151a3cfd4daec2a9f6a14542ee11b7fdcc69b8b120d43166aa74d85',
        } as User,
      ]);

    const user = await service.signin('email.domain.com', 'password');
    expect(user).toBeDefined();
  });
});
