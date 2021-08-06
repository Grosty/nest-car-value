import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
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
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'test@email.com', password: 'pass' } as User,
      ]);

    service.signup('test@email.com', 'pass').catch((err) => {
      done();
    });
  });

  it('throws if signin is called with an unused email', (done) => {
    service.signin('dawdwd@dwadw.wad', 'dsad').catch((err) => {
      done();
    });
  });

  it('throws if an invalid password is provided', (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: 'dasd@dadwd.daw', password: 'dsada' } as User]);
    service.signin('vcxv@vxcv.xcv', 'vxcv').catch((err) => {
      done();
    });
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('test@email.com', 'pass');
    const user = await service.signin('test@email.com', 'pass');
    expect(user).toBeDefined();
  });
});
