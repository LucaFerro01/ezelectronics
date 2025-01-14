import { test, expect, jest, describe, beforeEach } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import { User, Role } from "../../src/components/user";
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

jest.mock("../../src/dao/userDAO")

//oggetti per il testing:
const testUserAdmin = new User("UsernameAdmin", "nameAdmin", "surnameAdmin", Role.ADMIN, "AddrAdmin", "02/02/02");
const testUserManager = new User("usernamemanager", "nameManager", "surnameManager", Role.MANAGER, "", "");
const testUserCustomer = new User("usernamecustomer", "nameCustomer", "surnameCustomer", Role.CUSTOMER, "", "");

//-----
const mockUserDAO = UserDAO.prototype as jest.Mocked<typeof UserDAO.prototype>;
mockUserDAO.createUser.mockResolvedValue(true);
mockUserDAO.getUsers.mockResolvedValue([testUserAdmin, testUserManager, testUserCustomer]);
mockUserDAO.getUsersByRole.mockImplementation(async (role: string) => {
    const users = [testUserAdmin, testUserManager, testUserCustomer];
    return users.filter(user => user.role === role);
});

mockUserDAO.getUserByUsername.mockImplementation((username: string) => {
    switch (username) {
        case "admin":
            return Promise.resolve(testUserAdmin);
        case "manager":
            return Promise.resolve(testUserManager);
        case "customer":
            return Promise.resolve(testUserCustomer);
        case "usernamemanager":
            return Promise.resolve(testUserManager);
        case "usernameToDelete":
            return Promise.resolve(new User("usernameToDelete", "nameToDelete", "surnameToDelete", Role.MANAGER, "", ""));
        default:
            return Promise.reject(new UserNotFoundError());
    }
});


mockUserDAO.deleteUser.mockImplementation((username: string) => {
    switch (username) {
        case "admin":
            return Promise.reject(new UserIsAdminError());
        case "manager":
        case "customer":
        case "usernameToDelete":
            return Promise.resolve(true);
        default:
            return Promise.reject(new UserNotFoundError());
    }
});



mockUserDAO.deleteAll.mockResolvedValue(true);


// Mocka il metodo updateUserInfo per restituire un oggetto User invece di true
jest.spyOn(UserDAO.prototype, "updateUserInfo").mockImplementationOnce(
    async (name, surname, address, birthdate, username) => {
        // Simula una query o un'operazione di aggiornamento
        // Qui puoi inserire la logica che simula l'aggiornamento nel tuo mock
        const updatedUser = {
            username: username,
            name: name,
            surname: surname,
            role: Role.MANAGER, // Aggiungi il ruolo appropriato
            address: address,
            birthdate: birthdate
        };

        // Qui puoi fare altri controlli o simulare altri comportamenti necessari

        return updatedUser; // Restituisci l'oggetto User aggiornato
    }
);










//---


describe("UserController", () => {
    let userController: UserController;

    beforeEach(() => {
        userController = new UserController();
    });

    describe("createUser", () => {
        test("should create a new user", async () => {
            const result = await userController.createUser("test", "Test", "User", "password", "Manager");
            expect(result).toBe(true);
        });
    });

    describe("getUsers", () => {
        test("should return all users", async () => {
            const result = await userController.getUsers();
            expect(result).toEqual([testUserAdmin, testUserManager, testUserCustomer]);
        });
    });

    describe("getUsersByRole", () => {
        test("should return users by role", async () => {
            const result = await userController.getUsersByRole("Customer");
            expect(result).toEqual([testUserCustomer]);
        });
    });

    describe("getUserByUsername", () => {
        test("should return a specific user", async () => {
            const result = await userController.getUserByUsername(testUserAdmin, "admin");
            expect(result).toEqual(testUserAdmin);
        });

        test("should throw UnauthorizedUserError if user is not authorized", async () => {
            await expect(userController.getUserByUsername(testUserCustomer, "admin")).rejects.toThrow(UnauthorizedUserError);
        });
    });

    describe("deleteUser", () => {

        test("should throw UnauthorizedEditError if user is not authorized", async () => {
            // Creare a new user that is not an admin and not the same user
            const userToDelete = new User("usernameToDelete", "nameToDelete", "surnameToDelete", Role.MANAGER, "", "");
            await expect(userController.deleteUser(userToDelete, "manager")).rejects.toThrow(UnauthorizedEditError);
        });
        
        test("should throw UserNotFoundError if user does not exist", async () => {
            // Create a new user that is not an admin and not the same user
            const userToDelete = new User("usernameToDelete", "nameToDelete", "surnameToDelete", Role.MANAGER, "", "");
            await expect(userController.deleteUser(userToDelete, "nonexistent")).rejects.toThrow(UserNotFoundError);
        });

        test("should delete a user if authorized", async () => {
            // Creare un nuovo utente che non sia amministratore e non sia l'utente stesso
            const userToDelete = new User("usernameToDelete", "nameToDelete", "surnameToDelete", Role.MANAGER, "", "");
            const result = await userController.deleteUser(userToDelete, "usernameToDelete");
            expect(result).toBe(true);
        });

       

        test("should throw UserIsAdminError if trying to delete an admin user", async () => {
            await expect(userController.deleteUser(testUserAdmin, "admin")).rejects.toThrow(UserIsAdminError);
        });

        
    });

    describe("deleteAll", () => {
        test("should delete all non-Admin users", async () => {
            const result = await userController.deleteAll();
            expect(result).toBe(true);
        });
    });

    describe("updateUserInfo", () => {
        test("should update user information", async () => {
            const updatedUser = await userController.updateUserInfo(testUserManager, "Updated", "Admin", "Address", "2000-01-01", "usernamemanager");
            
            // Verifica che l'oggetto restituito abbia i dati corretti
            expect(updatedUser.username).toBe("usernamemanager");
            expect(updatedUser.name).toBe("Updated");
            expect(updatedUser.surname).toBe("Admin");
            expect(updatedUser.address).toBe("Address");
            expect(updatedUser.birthdate).toBe("2000-01-01");
            expect(updatedUser.role).toBe("Manager"); // Assicurati che il ruolo sia corretto
        
            // Puoi anche verificare che il metodo sia stato chiamato con i parametri corretti
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith("Updated", "Admin", "Address", "2000-01-01", "usernamemanager");
        
            // Non è necessario verificare direttamente con `true` perché ci si aspetta un oggetto `User`
            // Se vuoi verificare che l'operazione sia stata eseguita correttamente, potresti controllare se `updatedUser` è definito
            expect(updatedUser).toBeDefined();
        });
        

        

        test("should throw InvalidBirthdateError if birthdate is in the future", async () => {
            await expect(userController.updateUserInfo(testUserManager, "Updated", "User", "Address", "3000-01-01", "manager")).rejects.toThrow(InvalidBirthdateError);
        });
        
        test("should throw UnauthorizedEditError if user is not authorized to edit", async () => {
            await expect(userController.updateUserInfo(testUserCustomer, "Updated", "User", "Address", "2000-01-01", "Admin")).rejects.toThrow(UnauthorizedEditError);
        });


    });
});

