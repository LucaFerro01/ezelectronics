import { test, expect, jest } from "@jest/globals";
import request from 'supertest';
import { app } from "../../index";
import UserController from "../../src/controllers/userController";
import { User, Role } from "../../src/components/user";

const baseURL = "/ezelectronics";




//creazione utente

test("It should return a 200 success code for creating a user", async () => {
    const testUser = {
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.MANAGER
    };

    jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true);

    const response = await request(app).post(baseURL + "/users").send(testUser);

    expect(response.status).toBe(200);
    expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
    expect(UserController.prototype.createUser).toHaveBeenCalledWith(
        testUser.username,
        testUser.name,
        testUser.surname,
        testUser.password,
        testUser.role
    );
});

//recupero tutti utenti
test("It should return a 200 success code for retrieving all users", async () => {
    const testUsers = [
        new User("user1", "User One", "Surname One", Role.MANAGER, "Address One", "2000-01-01"),
        new User("user2", "User Two", "Surname Two", Role.CUSTOMER, "Address Two", "2000-02-02")
    ];

    jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce(testUsers);

    const response = await request(app).get(baseURL + "/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(testUsers);
    expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
});

//recupero utenti ruolo
test("It should return a 200 success code for retrieving users by role", async () => {
    const role = Role.MANAGER;
    const testUsers = [
        new User("user1", "User One", "Surname One", Role.MANAGER, "Address One", "2000-01-01")
    ];

    jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce(testUsers);

    const response = await request(app).get(`${baseURL}/users/roles/${role}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(testUsers);
    expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
    expect(UserController.prototype.getUsersByRole).toHaveBeenCalledWith(role);
});


//recupero username
test("It should return a 200 success code for retrieving a user by username", async () => {
    const username = "testUser";
    const testUser = new User("testUser", "Test", "User", Role.MANAGER, "Test Address", "2000-01-01");

    jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(testUser);

    const response = await request(app).get(`${baseURL}/users/${username}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(testUser);
    expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
    expect(UserController.prototype.getUserByUsername).toHaveBeenCalledWith(expect.any(Object), username);
});


//delete
test("It should return a 200 success code for deleting a user", async () => {
    const username = "testUser";

    jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true);

    const response = await request(app).delete(`${baseURL}/users/${username}`);

    expect(response.status).toBe(200);
    expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
    expect(UserController.prototype.deleteUser).toHaveBeenCalledWith(expect.any(Object), username);
});

//aggiornamento info
test("It should return a 200 success code for updating a user", async () => {
    const username = "testUser";
    const updateData = {
        name: "Updated Name",
        surname: "Updated Surname",
        address: "Updated Address",
        birthdate: "2000-01-01"
    };

    // Il mock del metodo updateUserInfo restituisce true
    jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(true);

    const response = await request(app).patch(`${baseURL}/users/${username}`).send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(true);
    expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
    expect(UserController.prototype.updateUserInfo).toHaveBeenCalledWith(
        expect.any(Object),
        updateData.name,
        updateData.surname,
        updateData.address,
        updateData.birthdate,
        username
    );
});


