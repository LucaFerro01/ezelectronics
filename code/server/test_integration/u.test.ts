import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import db from "../src/db/db"
import { User,Role } from "../src/components/user"
import crypto from "crypto"
import UserDAO from "../src/dao/userDAO";
import { UserAlreadyExistsError, UserNotFoundError } from "../src/errors/userError";

const userDAO = new UserDAO();

async function createUsers() {
    await userDAO.createUser("Username1", "test", "test", "test", Role.ADMIN);}

    //dao
describe("UserDAO integration tests", () => {


    test("createUser should create a new user in the database", async () => {
        // Assuming you have a function to delete the test user after the test is done
        const newUser = {
            username: "usernameUtente",
            name: "John",
            surname: "Doe",
            password: "password123",
            role: "Customer"
        };

        // Creating a new user
        const result = await userDAO.createUser(newUser.username, newUser.name, newUser.surname, newUser.password, newUser.role);
        expect(result).toBe(true);
    });

    test("getIsUserAuthenticated should return true for valid username and password", async () => {
        // Assuming you have a valid user in your test database with username "validUsername" and password "validPassword"
        const validUsername = "usernameUtente";
        const validPassword = "password123";

        const isAuth = await userDAO.getIsUserAuthenticated(validUsername, validPassword);
        expect(isAuth).toBe(true);
    });

    test("getUsers should return an array of users from the database", async () => {
        const users = await userDAO.getUsers();
        expect(Array.isArray(users)).toBe(true);
    });

    test("getUsersByRole should return an array of users with the specified role from the database", async () => {
        const users = await userDAO.getUsersByRole("Admin");
        expect(Array.isArray(users)).toBe(true);
    });

    test("getUserByUsername should return the user with the specified username from the database", async () => {
        const user = await userDAO.getUserByUsername("usernameUtente");
        expect(user.username).toBe("usernameUtente");
    });


    test("update user", async () => {
        const user = await userDAO.updateUserInfo("nome", "cognome", "indirizzo2", "15/15/2022", "usernameUtente");
        expect(user).toBe(true);
    });
    
    

    test("deleteUser should delete the user with the specified username from the database", async () => {
        const result = await userDAO.deleteUser("usernameUtente");
        expect(result).toBe(true);
    });
    
    test("deleteUser should throw UserNotFoundError if the user does not exist", async () => {
        await expect(userDAO.deleteUser("usernameUtente")).rejects.toThrow(UserNotFoundError);
    });
    
    test("deleteAll should delete all non-Admin users from the database", async () => {
        const result = await userDAO.deleteAll();
        expect(result).toBe(true);
    });
    
});

