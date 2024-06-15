import { test, expect, jest, describe, afterEach} from "@jest/globals";
import request from "supertest";
import Authenticator from "../../src/routers/auth"
import { app } from "../../index"; // Ensure this is the correct path to your Express app
import UserController from "../../src/controllers/userController";
import AuthService from "../../src/routers/auth"; // Ensure this is the correct path to your AuthService
import { User, Role} from "../../src/components/user"
import UserDAO from "../../src/dao/userDAO";
import { UserAlreadyExistsError, UserNotAdminError, UserNotFoundError, UnauthorizedUserError , UnauthorizedEditError} from "../../src/errors/userError";

jest.mock("../../src/dao/userDAO");

const baseURL = "/ezelectronics";

//Example of a unit test for the POST ezelectronics/users route
//The test checks if the route returns a 200 success code
//The test also expects the createUser method of the controller to be called once with the correct parameters

test("It should return a 200 success code", async () => {
    const testUser = { //Define a test user object sent to the route
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: "Manager"
    }
    jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true) //Mock the createUser method of the controller
    const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
    expect(response.status).toBe(200) //Check if the response status is 200
    expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1) //Check if the createUser method has been called once
    //Check if the createUser method has been called with the correct parameters
    expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
        testUser.name,
        testUser.surname,
        testUser.password,
        testUser.role)
})


describe("Create User", () => {
    test("Dovrebbe restituire true se l'utente viene creato con successo", async () => {
        const datiUtenteTest = {
            username: "test",
            nome: "test",
            cognome: "test",
            password: "test",
            ruolo: Role.MANAGER
        };

        jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true);

        const controller = new UserController();

        const risposta = await controller.createUser(
            datiUtenteTest.username,
            datiUtenteTest.nome,
            datiUtenteTest.cognome,
            datiUtenteTest.password,
            datiUtenteTest.ruolo
        );

        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(
            datiUtenteTest.username,
            datiUtenteTest.nome,
            datiUtenteTest.cognome,
            datiUtenteTest.password,
            datiUtenteTest.ruolo
        );

        expect(risposta).toBe(true);
    }); 
    
    test("Dovrebbe rifiutare con UserAlreadyExistError se l'utente esiste già", async () => {
        const datiUtenteTest = {
            username: "test",
            nome: "test",
            cognome: "test",
            password: "test",
            ruolo: Role.MANAGER
        };

        jest.spyOn(UserDAO.prototype, "createUser").mockRejectedValueOnce(new UserAlreadyExistsError);

        const controller = new UserController();

        await expect(controller.createUser(
            datiUtenteTest.username,
            datiUtenteTest.nome,
            datiUtenteTest.cognome,
            datiUtenteTest.password,
            datiUtenteTest.ruolo
        )).rejects.toThrow(UserAlreadyExistsError);
    });
    test("Errore quando fallisce", async () => {
        const utenteDiTest = {
            username: "test",
            nome: "test",
            cognome: "test",
            password: "test",
            ruolo: Role.MANAGER
        };
    
        const controller = new UserController();
    
        jest.spyOn(UserDAO.prototype, "createUser").mockRejectedValueOnce(new Error);
    
        await expect(controller.createUser(utenteDiTest.username, utenteDiTest.nome, utenteDiTest.cognome, utenteDiTest.password, utenteDiTest.ruolo))
            .rejects.toThrow(Error);
    });});



describe("Ottenere gli Utenti", () => {
    test("Dovrebbe restituire una lista di utenti", async () => {
        const utenteDiTest1: User = {
            username: "utente1",
            name: "Utente Uno",
            surname: "Uno",
            role: Role.MANAGER,
            address: "Indirizzo Uno",
            birthdate: "2000-01-01",
        };
        const utenteDiTest2: User = {
            username: "utente2",
            name: "Utente Due",
            surname: "Due",
            role: Role.CUSTOMER,
            address: "Indirizzo Due",
            birthdate: "1990-02-02",
        };

        jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce([utenteDiTest1, utenteDiTest2]);

        const controller = new UserController();

        const risposta = await controller.getUsers();

        expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
        expect(risposta).toEqual([utenteDiTest1, utenteDiTest2]);

        jest.clearAllMocks();
    
    });

    test("Errore per il fail", async () => {
        jest.spyOn(UserDAO.prototype, "getUsers").mockRejectedValueOnce(new Error());
        const controller = new UserController();
        await expect(controller.getUsers()).rejects.toThrow(Error);
    });
    
});

describe("Ottieni utente per nome utente", () => { 
    test("Dovrebbe restituire un utente", async () => { 
        const utenteDiTest: User = { 
            username: "test", 
            name: "test", 
            surname: "test", 
            role: Role.MANAGER, 
            address: "test", 
            birthdate: "test", 
        } 
        jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(utenteDiTest); 
        const controller = new UserController(); 
        const risposta = await controller.getUserByUsername(utenteDiTest, utenteDiTest.username); 

        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1); 
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(utenteDiTest.username); 
        expect(risposta).toEqual(utenteDiTest); 
        jest.clearAllMocks();
    }); 

    test("Dovrebbe restituire un errore non autorizzato se l'utente non è un amministratore", async () => {
        const utenteDiTest1: User = { 
            username: "test", 
            name: "test", 
            surname: "test", 
            role: Role.CUSTOMER, 
            address: "test", 
            birthdate: "test", 
        } 
        const utenteDiTest2: User = { 
            username: "test2", 
            name: "test2", 
            surname: "test2", 
            role: Role.MANAGER, 
            address: "test2", 
            birthdate: "test2", 
        }
        jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(utenteDiTest2); 
        const controller = new UserController(); 
        await expect(controller.getUserByUsername(utenteDiTest1, utenteDiTest2.username)).rejects.toThrow(UnauthorizedUserError); 
        jest.clearAllMocks();
    })

    describe("Cancellazione utente", () => {  

        test("Dovrebbe eliminare", async () => {
            const utenteDiTest: User = {
                username: "test",
                name: "test",
                surname: "test",
                role: Role.MANAGER,
                address: "test",
                birthdate: "test",
            };
        
            // Mock the DAO methods
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(utenteDiTest);
        
            const controller = new UserController();
        
            // Call the deleteUser method and check the response
            const risposta = await controller.deleteUser(utenteDiTest, utenteDiTest.username);
        
            // Verify that the mocks were called with the correct arguments
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(utenteDiTest.username);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(utenteDiTest.username);
        
            // Verify the response
            expect(risposta).toBe(true);
        
            // Clear all mocks
            jest.clearAllMocks();
            jest.resetAllMocks();
        });
        
        
        
        test("Dovrebbe eliminare un altro utente se l'utente è un amministratore", async () => { 
            const utenteDiTest1: User = { 
                username: "test", 
                name: "test", 
                surname: "test", 
                role: Role.ADMIN, 
                address: "test", 
                birthdate: "test", 
            } 
            const utenteDiTest2: User = { 
                username: "test2", 
                name: "test2", 
                surname: "test2", 
                role: Role.MANAGER, 
                address: "test2", 
                birthdate: "test2", 
            } 
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); 
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(utenteDiTest2); 
            const controller = new UserController(); 
            const risposta = await controller.deleteUser(utenteDiTest1, utenteDiTest2.username); 
         
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1); 
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(utenteDiTest2.username); 
            expect(risposta).toBe(true); 
            jest.clearAllMocks();
            jest.resetAllMocks();
        });
    
        
        test("Dovrebbe lanciare un errore non autorizzato se l'utente non è un amministratore e cerca di eliminare un altro utente", async () => {
            const utenteDiTest1: User = { 
                username: "test", 
                name: "test", 
                surname: "test", 
                role: Role.CUSTOMER, 
                address: "test", 
                birthdate: "test", 
            } 
            const utenteDiTest2: User = { 
                username: "test2", 
                name: "test2", 
                surname: "test2", 
                role: Role.MANAGER, 
                address: "test2", 
                birthdate: "test2", 
            }
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); 
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(utenteDiTest2); 
            const controller = new UserController(); 
            await expect(controller.deleteUser(utenteDiTest1, utenteDiTest2.username)).rejects.toThrow(new UnauthorizedUserError); 
            jest.clearAllMocks();
            jest.resetAllMocks();
        })
        
        test("Dovrebbe lanciare un errore se la cancellazione fallisce", async () => { 
            const testUser: User = { 
                username: "test", 
                name: "test", 
                surname: "test", 
                role: Role.MANAGER, 
                address: "test", 
                birthdate: "test", 
            } 
            jest.spyOn(UserDAO.prototype, "deleteUser").mockRejectedValueOnce(new Error()); 
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser);  
            const controller = new UserController(); 
            await expect(controller.deleteUser(testUser, testUser.username)).rejects.toThrow(Error); 
            jest.clearAllMocks();
            jest.resetAllMocks();});});

    });

    describe("Cancellazione di tutti gli utenti", () => {
        test("Dovrebbe cancellare tutti gli utenti", async () => {
            jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(true);
            const controller = new UserController();
            const risposta = await controller.deleteAll();
            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
            expect(risposta).toBe(true);
            jest.clearAllMocks();
            jest.resetAllMocks();
        });
        test("Dovrebbe lanciare un errore se la cancellazione fallisce", async () => {
            jest.spyOn(UserDAO.prototype, "deleteAll").mockRejectedValueOnce(new Error());
            const controller = new UserController();
            await expect(controller.deleteAll()).rejects.toThrow(Error);
            jest.clearAllMocks();
            jest.resetAllMocks();
        });
    });

    describe("Aggiornamento delle informazioni dell'utente", () => {
        test("Dovrebbe aggiornare le informazioni dell'utente", async () => {
            const utenteDiTest: User = {
                username: "test",
                name: "test",
                surname: "test",
                role: Role.MANAGER,
                address: "test",
                birthdate: "test",
            };
            const nuoveInformazioni = {
                name: "nuovo nome",
                surname: "nuovo cognome",
                address: "nuovo indirizzo",
                birthdate: "nuova data di nascita",
            };
            const utenteAggiornato = {
                username: utenteDiTest.username,
                name: nuoveInformazioni.name,
                surname: nuoveInformazioni.surname,
                role: utenteDiTest.role,
                address: nuoveInformazioni.address,
                birthdate: nuoveInformazioni.birthdate,
            };
            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValueOnce(utenteAggiornato);
            const controller = new UserController();
            const risposta = await controller.updateUserInfo(
                utenteDiTest,
                utenteDiTest.username,
                nuoveInformazioni.name,
                nuoveInformazioni.surname,
                nuoveInformazioni.address,
                nuoveInformazioni.birthdate
            );
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(
                nuoveInformazioni.name,
                nuoveInformazioni.surname,
                nuoveInformazioni.address,
                nuoveInformazioni.birthdate,
                utenteDiTest.username
            );
            expect(risposta).toEqual(utenteAggiornato);
            jest.clearAllMocks();
            jest.resetAllMocks();
        });
      
        test("Dovrebbe lanciare un errore se l'utente non è autorizzato a modificare le informazioni", async () => {
            const utenteDiTest: User = {
                username: "test",
                name: "test",
                surname: "test",
                role: Role.CUSTOMER,
                address: "test",
                birthdate: "test",
            };
            const nuoveInformazioni = {
                name: "nuovo nome",
                surname: "nuovo cognome",
                address: "nuovo indirizzo",
                birthdate: "nuova data di nascita",
            };
            const controller = new UserController();
            await expect(controller.updateUserInfo(
                utenteDiTest,
                utenteDiTest.username,
                nuoveInformazioni.name,
                nuoveInformazioni.surname,
                nuoveInformazioni.address,
                nuoveInformazioni.birthdate
            )).rejects.toThrow(UnauthorizedEditError);
            jest.clearAllMocks();
            jest.resetAllMocks();
        });

        test("Dovrebbe lanciare un errore se la modifica fallisce", async () => {
            const utenteDiTest: User = {
                username: "test",
                name: "test",
                surname: "test",
                role: Role.MANAGER,
                address: "test",
                birthdate: "test",
            };
            const nuoveInformazioni = {
                name: "nuovo nome",
                surname: "nuovo cognome",
                address: "nuovo indirizzo",
                birthdate: "nuova data di nascita",
            };
            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockRejectedValueOnce(new Error());
            const controller = new UserController();
            await expect(controller.updateUserInfo(
                utenteDiTest,
                utenteDiTest.username,
                nuoveInformazioni.name,
                nuoveInformazioni.surname,
                nuoveInformazioni.address,
                nuoveInformazioni.birthdate
            )).rejects.toThrow(Error);
            jest.clearAllMocks();
            jest.resetAllMocks();
        });

    });







        
