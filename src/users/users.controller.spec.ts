import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        const user = { id, email: 'test@email.com', password: 'pass' } as User;
        return Promise.resolve(user);
      },
      find: (email: string) => {
        const user = { id: 1, email, password: 'pass' } as User;
        return Promise.resolve([user]);
      },
      // remove: async (id: number): Promise<User> => {
      //   return {} as User;
      // },
      // update: async (id: number, attrs: Partial<User>): Promise<User> => {
      //   return {} as User;
      // },
    };
    fakeAuthService = {
      // signup: async (email: string, password: string): Promise<User> => {
      //   return {} as User;
      // },
      signin: (email: string, password: string): Promise<User> => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@email.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@email.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', (done) => {
    fakeUsersService.findOne = () => null;
    controller.findUser('1').catch((e) => {
      done();
    });
  });

  it('signIn updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'test@email.com', password: 'pass' } as User,
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
