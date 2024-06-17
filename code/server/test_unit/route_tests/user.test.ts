import { test, expect, jest, describe, beforeEach, beforeAll, afterEach, afterAll} from "@jest/globals";
import request from "supertest";
import Authenticator from "../../src/routers/auth"
import { app } from "../../index"; // Ensure this is the correct path to your Express app
import UserController from "../../src/controllers/userController";
import { cleanup } from "../../src/db/cleanup";
import AuthService from "../../src/routers/auth"; // Ensure this is the correct path to your AuthService
import { User, Role} from "../../src/components/user"
import UserDAO from "../../src/dao/userDAO";
import { UserAlreadyExistsError, UserNotAdminError, UserNotFoundError, UnauthorizedUserError , UnauthorizedEditError, InvalidBirthdateError} from "../../src/errors/userError";

const baseURL = "/ezelectronics";

const userDao = new UserDAO();
let customerSessionId: any;
let adminSessionId: any;
let managerSessionId: any;

async function createUsers() {
    await userDao.createUser("customer", "test", "test", "test", "Customer")
    await userDao.createUser("admin", "test", "test", "test", "Admin")
    await userDao.createUser("manager", "test", "test", "test", "Manager")
}

beforeEach(async () => {
    await cleanup()
    await createUsers()

    jest.resetAllMocks();
});

beforeAll(async () => {
   
    await cleanup()
    await createUsers()
    const customerResponse = await request(app).post(`${baseURL}/sessions`).send({
        username: "customer",
        password: "test"
    })
    const adminResponse = await request(app).post(`${baseURL}/sessions`).send({
        username: "admin",
        password: "test"
    })
    const managerResponse = await request(app).post(`${baseURL}/sessions`).send({
        username: "manager",
        password: "test"
    })
    customerSessionId = customerResponse.headers['set-cookie'];
    adminSessionId = adminResponse.headers['set-cookie'];
    managerSessionId = managerResponse.headers['set-cookie'];

});

afterEach(async () => {
    await cleanup();
    jest.clearAllMocks();
});

afterAll(async () => {
    jest.clearAllMocks();
});


describe('UserRoutes', () => {

    test('POST /users should create a user', async () => {
        jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true);

        const response = await request(app)
            .post(`${baseURL}/users/`)
            .set('Cookie', customerSessionId)
            .send({
                username: 'testuser',
                name: 'Test',
                surname: 'User',
                password: 'password',
                role: Role.CUSTOMER,
            });

        expect(response.status).toBe(200);
    });

    test('POST /users should return 422 if the username is missing', async () => {
        jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true);

        const response = await request(app)
            .post(`${baseURL}/users/`)
            .set('Cookie', customerSessionId)
            .send({
                name: 'Test',
                surname: 'User',
                password: 'password',
                role: Role.CUSTOMER,
            });

        expect(response.status).toBe(422);
    });

    test('POST /users should return 422 if the name is missing', async () => {
        jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true);

        const response = await request(app)
            .post(`${baseURL}/users/`)
            .set('Cookie', customerSessionId)
            .send({
                username: 'testuser',
                surname: 'User',
                password: 'password',
                role: Role.CUSTOMER,
            });

        expect(response.status).toBe(422);
    });

    test('POST /users should return 422 if the surname is missing', async () => {
        jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true);

        const response = await request(app)
            .post(`${baseURL}/users/`)
            .set('Cookie', customerSessionId)
            .send({
                username: 'testuser',
                name: 'Test',
                password: 'password',
                role: Role.CUSTOMER,
            });

        expect(response.status).toBe(422);
    });

    test('POST /users should return 422 if the password is missing', async () => {
        jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true);

        const response = await request(app)
            .post(`${baseURL}/users/`)
            .set('Cookie', customerSessionId)
            .send({
                username: 'testuser',
                name: 'Test',
                surname: 'User',
                role: Role.CUSTOMER,
            });

        expect(response.status).toBe(422);
    });

    test('POST /users should return 422 if the role is missing', async () => {
        jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true);

        const response = await request(app)
            .post(`${baseURL}/users/`)
            .set('Cookie', customerSessionId)
            .send({
                username: 'testuser',
                name: 'Test',
                surname: 'User',
                password: 'password',
            });

        expect(response.status).toBe(422);
    });


    test('GET /users should return all users', async () => {
        jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([
            {
                username: 'customer',
                name: 'Test',
                surname: 'User',
                role: Role.CUSTOMER,
                address: 'Test Address',
                birthdate: '2000-01-01',
            },
            {
                username: 'admin',
                name: 'Test',
                surname: 'User',
                role: Role.ADMIN,
                address: 'Test Address',
                birthdate: '2000-01-01',
            },
            {
                username: 'manager',
                name: 'Test',
                surname: 'User',
                role: Role.MANAGER,
                address: 'Test Address',
                birthdate: '2000-01-01',
            },
        ]);

        const response = await request(app)
            .get(`${baseURL}/users/`)
            .set('Cookie', adminSessionId);

        expect(response.status).toBe(200);
    });

    test('GET /users should return 401 if the user is not authenticated', async () => {
        jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([]);

        const response = await request(app)
            .get(`${baseURL}/users/`);

        expect(response.status).toBe(401);
    });

    test('GET /users should return 401 if the user is not an admin', async () => {
        jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([]);

        const response = await request(app)
            .get(`${baseURL}/users/`)
            .set('Cookie', customerSessionId);

        expect(response.status).toBe(401);
    });

    test('GET /users/roles should return all users with a specific role', async () => {
        jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce([
            {
                username: 'customer',
                name: 'Test',
                surname: 'User',
                role: Role.CUSTOMER,
                address: 'Test Address',
                birthdate: '2000-01-01',
            },
        ]);

        const response = await request(app)
            .get(`${baseURL}/users/roles/Customer`)
            .set('Cookie', adminSessionId);

        expect(response.status).toBe(200);
    });

    test('GET /users/roles should return 401 if the user is not authenticated', async () => {
        jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce([]);

        const response = await request(app)
            .get(`${baseURL}/users/roles/Customer`);

        expect(response.status).toBe(401);
    });

 test('GET /users/roles should return 401 if the user is not an admin', async () => {
        jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce([]);

        const response = await request(app)
            .get(`${baseURL}/users/roles/Customer`)
            .set('Cookie', customerSessionId);

        expect(response.status).toBe(401);
    }); 

    test('GET /users/:username should return a user', async () => {
        jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce({
            username: 'customer',
            name: 'Test',
            surname: 'User',
            role: Role.CUSTOMER,
            address: 'Test Address',
            birthdate: '2000-01-01',
        });

        const response = await request(app)
            .get(`${baseURL}/users/customer`)
            .set('Cookie', adminSessionId);

        expect(response.status).toBe(200);
    });

    test('GET /users/:username should return 401 if the user is not authenticated', async () => {
        jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce({
            username: 'customer',
            name: 'Test',
            surname: 'User',
            role: Role.CUSTOMER,
            address: 'Test Address',
            birthdate: '2000-01-01',
        });

        const response = await request(app)
            .get(`${baseURL}/users/customer`);

        expect(response.status).toBe(401);
    });

    test('DELETE /users/:username should delete a user', async () => {
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true);

        const response = await request(app)
            .delete(`${baseURL}/users/customer`)
            .set('Cookie', adminSessionId);

        expect(response.status).toBe(200);
    });

    test('DELETE /users/:username should return 401 if the user is not authenticated', async () => {
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true);

        const response = await request(app)
            .delete(`${baseURL}/users/customer`);

        expect(response.status).toBe(401);
    });

    
    test('DELETE /users should delete all users', async () => {
        jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true);

        const response = await request(app)
            .delete(`${baseURL}/users/`)
            .set('Cookie', adminSessionId);

        expect(response.status).toBe(200);
    });

    test('DELETE /users should return 401 if the user is not authenticated', async () => {
        jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true);

        const response = await request(app)
            .delete(`${baseURL}/users/`);

        expect(response.status).toBe(401);
    });

     test('DELETE /users should return 401 if the user is not an admin', async () => {
        jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true);

        const response = await request(app)
            .delete(`${baseURL}/users/`)
            .set('Cookie', customerSessionId);

        expect(response.status).toBe(401);
    });
 
    test('PATCH /users/:username should update a user', async () => {
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce({
            username: 'customer',
            name: 'Test',
            surname: 'User',
            role: Role.CUSTOMER,
            address: 'Test Address',
            birthdate: '2000-01-01',
        });

        const response = await request(app)
            .patch(`${baseURL}/users/customer`)
            .set('Cookie', adminSessionId)
            .send({
                name: 'New Name',
                surname: 'New Surname',
                address: 'New Address',
                birthdate: '2000-01-01',
            });

        expect(response.status).toBe(200);
    });

    test('PATCH /users/:username should return 401 if the user is not authenticated', async () => {
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce({
            username: 'customer',
            name: 'Test',
            surname: 'User',
            role: Role.CUSTOMER,
            address: 'Test Address',
            birthdate: '2000-01-01',
        });

        const response = await request(app)
            .patch(`${baseURL}/users/customer`)
            .send({
                name: 'New Name',
                surname: 'New Surname',
                address: 'New Address',
                birthdate: '2000-01-01',
            });

        expect(response.status).toBe(401);
    });

    test('PATCH /users/:username should return 422 if the name is missing', async () => {
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce({
            username: 'customer',
            name: 'Test',
            surname: 'User',
            role: Role.CUSTOMER,
            address: 'Test Address',
            birthdate: '2000-01-01',
        });

        const response = await request(app)
            .patch(`${baseURL}/users/customer`)
            .set('Cookie', adminSessionId)
            .send({
                surname: 'New Surname',
                address: 'New Address',
                birthdate: '2000-01-01',
            });

        expect(response.status).toBe(422);
    });

    test('PATCH /users/:username should return 422 if the surname is missing', async () => {
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce({
            username: 'customer',
            name: 'Test',
            surname: 'User',
            role: Role.CUSTOMER,
            address: 'Test Address',
            birthdate: '2000-01-01',
        });

        const response = await request(app)
            .patch(`${baseURL}/users/customer`)
            .set('Cookie', adminSessionId)
            .send({
                name: 'New Name',
                address: 'New Address',
                birthdate: '2000-01-01',
            });

        expect(response.status).toBe(422);
    });

    test('PATCH /users/:username should return 422 if the address is missing', async () => {
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce({
            username: 'customer',
            name: 'Test',
            surname: 'User',
            role: Role.CUSTOMER,
            address: 'Test Address',
            birthdate: '2000-01-01',
        });

        const response = await request(app)
            .patch(`${baseURL}/users/customer`)
            .set('Cookie', adminSessionId)
            .send({
                name: 'New Name',
                surname: 'New Surname',
                birthdate: '2000-01-01',
            });

        expect(response.status).toBe(422);
    });

    
});




