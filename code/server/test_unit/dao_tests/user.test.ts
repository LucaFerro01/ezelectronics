import { describe, test, expect, jest } from "@jest/globals";
import UserDAO from "../../src/dao/userDAO"
import db from "../../src/db/db"
import crypto from "crypto";
import {
    UserNotFoundError,
    UserNotAdminError,
    UserIsAdminError,
    UserNotCustomerError,
    UserNotManagerError,
    UnauthorizedUserError, 
    UserAlreadyExistsError,
    InvalidBirthdateError, 
    UnauthorizedEditError
} from "../../src/errors/userError";
import { Database } from "sqlite3";

jest.mock("crypto")
jest.mock("../../src/db/db.ts")

describe("UserDAO", () => {
    let userDAO: UserDAO;

    beforeAll(() => {
        userDAO = new UserDAO();
    });

    describe("createUser", () => {
        test("It should resolve true when user is created", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null); return {} as Database;
            });
            const result = await userDAO.createUser("test", "John", "Doe", "password", "Customer");
            expect(result).toBe(true);
            mockDbRun.mockRestore();
        });

        test("It should reject with error when username already exists", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("UNIQUE constraint failed: users.username")); return {} as Database;
            });
            await expect(userDAO.createUser("existing", "John", "Doe", "password", "Customer")).rejects.toThrow(UserAlreadyExistsError);
            mockDbRun.mockRestore();
        });

        test("It should reject with error when database operation fails", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error")); return {} as Database;
            });
            await expect(userDAO.createUser("test", "John", "Doe", "password", "Customer")).rejects.toThrow("Database error");
            mockDbRun.mockRestore();
        });
    });

    describe("getIsUserAuthenticated", () => {
        
        test("getIsUserAuthenticated - Should resolve true for correct credentials", async () => {
            const userDAO = new UserDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, { username: "username", password: "hashedPassword", salt: "salt" });
                return {} as unknown as Database;
            });
            const mockScryptSync = jest.spyOn(crypto, "scryptSync").mockReturnValue(Buffer.from("hashedPassword"));
            const mockTimingSafeEqual = jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(true);
    
            const result = await userDAO.getIsUserAuthenticated("username", "password");
            expect(result).toBe(true);
    
            mockDBGet.mockRestore();
            mockScryptSync.mockRestore();
            mockTimingSafeEqual.mockRestore();
        });
    
        

        test("It should resolve false when user is not found", async () => {
            const mockDbGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, null); return {} as Database;
            });
            const result = await userDAO.getIsUserAuthenticated("nonexistent", "password");
            expect(result).toBe(false);
            mockDbGet.mockRestore();
        });

        test("It should resolve false when password does not match", async () => {
            const mockDbGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, { username: "test", password: "hashedPassword", salt: "salt" }); return {} as Database;
            });
            const result = await userDAO.getIsUserAuthenticated("test", "wrongPassword");
            expect(result).toBe(false);
            mockDbGet.mockRestore();
        });

        test("It should reject with error when database operation fails", async () => {
            const mockDbGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); return {} as Database;
            });
            await expect(userDAO.getIsUserAuthenticated("test", "password")).rejects.toThrow("Database error");
            mockDbGet.mockRestore();
        });

        
    });

   

    describe("getUsers", () => {
        test("It should resolve with user information when users exist", async () => {
            const mockDbAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, [
                    { username: "user1", name: "John", surname: "Doe", role: "Customer", address: "123 Main St", birthdate: "1990-01-01" },
                    { username: "user2", name: "Jane", surname: "Smith", role: "Manager", address: "456 Elm St", birthdate: "1985-05-05" }
                ]); return {} as Database;
            });
            const result = await userDAO.getUsers();
            expect(result).toEqual([
                { username: "user1", name: "John", surname: "Doe", role: "Customer", address: "123 Main St", birthdate: "1990-01-01" },
                { username: "user2", name: "Jane", surname: "Smith", role: "Manager", address: "456 Elm St", birthdate: "1985-05-05" }
            ]); return {} as Database;
            mockDbAll.mockRestore();
        });

        test("It should reject with error when database operation fails", async () => {
            const mockDbAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); return {} as Database;
            });
            await expect(userDAO.getUsers()).rejects.toThrow("Database error");
            mockDbAll.mockRestore();
        });
    });

    describe("getUsersByRole", () => {
        test("It should resolve with users of specified role", async () => {
            const mockDbAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, [
                    { username: "user1", name: "John", surname: "Doe", role: "Customer", address: "123 Main St", birthdate: "1990-01-01" },
                    { username: "user2", name: "Jane", surname: "Smith", role: "Customer", address: "456 Elm St", birthdate: "1985-05-05" }
                ]); return {} as Database;
            });
            const result = await userDAO.getUsersByRole("Customer");
            expect(result).toEqual([
                { username: "user1", name: "John", surname: "Doe", role: "Customer", address: "123 Main St", birthdate: "1990-01-01" },
                { username: "user2", name: "Jane", surname: "Smith", role: "Customer", address: "456 Elm St", birthdate: "1985-05-05" }
            ]); return {} as Database;
            mockDbAll.mockRestore();
        });

        test("It should reject with error when database operation fails", async () => {
            const mockDbAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); return {} as Database;
            }); 
            await expect(userDAO.getUsersByRole("Customer")).rejects.toThrow("Database error");
            mockDbAll.mockRestore();
        });
    });

    describe("getUserByUsername", () => {
        test("It should resolve with user information when user exists", async () => {
            const mockDbGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, {
                    username: "user1", name: "John", surname: "Doe", role: "Customer", address: "123 Main St", birthdate: "1990-01-01"
                }); return {} as Database;
            });
            const result = await userDAO.getUserByUsername("user1");
            expect(result).toEqual({ username: "user1", name: "John", surname: "Doe", role: "Customer", address: "123 Main St", birthdate: "1990-01-01" });
            mockDbGet.mockRestore();
        });

        test("It should reject with error when user does not exist", async () => {
            const mockDbGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, undefined); return {} as Database;
            }); 
            await expect(userDAO.getUserByUsername("nonexistent")).rejects.toThrow(UserNotFoundError);
            mockDbGet.mockRestore();
        });

        test("It should reject with error when database operation fails", async () => {
            const mockDbGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); return {} as Database;
            });
            await expect(userDAO.getUserByUsername("user1")).rejects.toThrow("Database error");
            mockDbGet.mockRestore();
        });
    });


    describe("deleteUser", () => {
        test("It should resolve with true when user is deleted by admin", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback.call({ changes: 1 }, null); 
                return {} as Database;
            });
            const result = await userDAO.deleteUser("userToDelete");
            expect(result).toBe(true);
            mockDbRun.mockRestore();
        });
    
        test("It should reject with UserNotFoundError when user does not exist", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback.call({ changes: 0 }, null); 
                return {} as Database;
            });
            await expect(userDAO.deleteUser("nonexistentUser")).rejects.toThrow(UserNotFoundError);
            mockDbRun.mockRestore();
        });
    
        test("It should reject with error when database operation fails", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error")); 
                return {} as Database;
            });
            await expect(userDAO.deleteUser("userToDelete")).rejects.toThrow("Database error");
            mockDbRun.mockRestore();
        });
    });
    

    describe("deleteAll", () => {
        test("It should resolve with true when all non-Admin users are deleted", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null); return {} as Database;
            });
            const result = await userDAO.deleteAll();
            expect(result).toBe(true);
            mockDbRun.mockRestore();
        });

        test("It should reject with error when database operation fails", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error")); return {} as Database;
            });
            await expect(userDAO.deleteAll()).rejects.toThrow("Database error");
            mockDbRun.mockRestore();
        });
    });

    describe("updateUserInfo", () => {
        test("It should resolve with true when user info is updated successfully", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback.call({ changes: 1 }, null); 
                return {} as Database;
            });
            const result = await userDAO.updateUserInfo("John", "Doe", "123 Main St", "1990-01-01", "john.doe");
            expect(result).toBe(true);
            mockDbRun.mockRestore();
        });
    
        test("It should reject with UserNotFoundError when user does not exist", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback.call({ changes: 0 }, null); 
                return {} as Database;
            });
            await expect(userDAO.updateUserInfo("John", "Doe", "123 Main St", "1990-01-01", "nonexistentUser")).rejects.toThrow(UserNotFoundError);
            mockDbRun.mockRestore();
        });
    
        test("It should reject with error when database operation fails", async () => {
            const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error")); 
                return {} as Database;
            });
            await expect(userDAO.updateUserInfo("John", "Doe", "123 Main St", "1990-01-01", "john.doe")).rejects.toThrow("Database error");
            mockDbRun.mockRestore();
        });
    });
    

});