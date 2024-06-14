import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from 'supertest';
import { app } from "../index"; // Assuming app is exported from index.js
import { cleanup } from "../src/db/cleanup";
import ProductDAO from "../src/dao/productDAO";
import CartDAO from "../src/dao/cartDAO";
import UserDAO from "../src/dao/userDAO";
import { User, Role } from "../src/components/user";
import ReviewDAO from "../src/dao/reviewDAO";
import { create } from "domain";

const productDao = new ProductDAO();
const cartDao = new CartDAO();
const userDao = new UserDAO();
const reviewDao = new ReviewDAO();

const baseURL = "/ezelectronics";

async function createUsers() {
    await userDao.createUser("customer1", "test", "test", "test", Role.CUSTOMER);
    await userDao.createUser("admin", "test", "test", "test", Role.ADMIN);
    await userDao.createUser("manager", "test", "test", "test", Role.MANAGER);
    await userDao.createUser("customer2", "test", "test", "test", Role.CUSTOMER);
}

// Creazione prodotti
async function createProducts() {
    await productDao.insertProduct("model1", "Smartphone", 1000,  "It is a test details", 100, "2024-06-04");
    await productDao.insertProduct("model2", "Laptop", 1000, "It is a test details", 300, "2024-06-04");
    await productDao.insertProduct("model3", "Appliance",  1000, "It is a test details", 40, "2024-06-04");
}

// Aggiungi prodotti al carrello
async function addCartProducts(sessionID: any) {
    await cartDao.addCartProduct(1, "model1", 100, "Smartphone");
}

async function createReviews() {
    // Recupera l'oggetto User dal database
    const user = await userDao.getUserByUsername("customer1");

    await reviewDao.newReview("model1", user, 5, "ciao");
}

// Pago il carrello del customer1
async function payCart() {
    await cartDao.updateCartToPaid("customer1");
}

describe("Review routes integration tests", () => {
    
    beforeAll(async () => {
        //await cleanup();
    });

    afterAll(async () => {
        await cleanup();
    });

    test("add Review - OK", async () => {
        // Cancello tutto ciò che è dentro al db
        //await cleanup();
    
        // Creazione customers
        await createUsers();
        const userResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "customer1", password: "test" });
    
        // Verifica la risposta della sessione
        console.log("Session Response:", userResponse.body);
    
        // Creo prodotti di test
        await createProducts();
    
        const sessionID = userResponse.headers['set-cookie'];
    
        // Verifica che la sessione sia stata creata correttamente
        console.log("Session ID:", sessionID);
    
        // Aggiungo prodotti nel carrello del customer1
        let response = await request(app).post(`${baseURL}/carts`)
            .set("Cookie", sessionID)
            .send({ model: "model1" });
        console.log("Add to cart response:", response.body);
    
        response = await request(app).post(`${baseURL}/carts`)
            .set("Cookie", sessionID)
            .send({ model: "model2" });
        console.log("Add to cart response:", response.body);
    
        // Pago il carrello
        await payCart();
    
        // Definisco una review di test
        const reviewTest = { score: 5, comment: "A very cool smartphone!" };
    
        // Inserisco una review di model1
        response = await request(app)
            .post(`${baseURL}/reviews/model1`)
            .send(reviewTest)
            .set("Cookie", sessionID);
    
        // Verifica la risposta del server
        console.log("Review Response:", response.body);
    
        // Verifichiamo che la risposta sia stata restituita con successo (codice di stato 200)
        expect(response.status).toBe(200);
    });
    
    test("add review - already existing review (409)", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();

        // Creazione customers
        await createUsers();
        const userResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "customer1", password: "test" });

        // Creo prodotti di test
        await createProducts();

        const sessionID = userResponse.headers['set-cookie'];

        // Aggiungo prodotti nel carrello del customer1
        await request(app).post(`${baseURL}/carts`).set("Cookie", sessionID).send({ model: "model1" });
        await request(app).post(`${baseURL}/carts`).set("Cookie", sessionID).send({ model: "model2" });

        // Pago il carrello
        await payCart();

        // Definisco una review di test
        const reviewTest = { score: 5, comment: "A very cool smartphone!" };

        // Inserisco una review di model1
        const response1 = await request(app).post(`${baseURL}/reviews/model1`).set("Cookie", sessionID).send(reviewTest);

        // Inserisco una review di model1
        const response2 = await request(app).post(`${baseURL}/reviews/model1`).set("Cookie", sessionID).send(reviewTest);

        // Verifichiamo che la risposta sia stata restituita con errore (codice di stato 409)
        expect(response2.status).toBe(409);
    });

    test("add review - insert an error of score (422)", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();

        // Creazione customers
        await createUsers();
        const userResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "customer1", password: "test" });

        // Creo prodotti di test
        await createProducts();

        const sessionID = userResponse.headers['set-cookie'];

        // Aggiungo prodotti nel carrello del customer1
        await request(app).post(`${baseURL}/carts`)
            .set("Cookie", sessionID)
            .send({ model: "model1" });
        await request(app).post(`${baseURL}/carts`)
            .set("Cookie", sessionID)
            .send({ model: "model2" });

        // Pago il carrello
        await payCart();

        // Definisco una review di test con un punteggio non valido
        const reviewTest = { score: "a", comment: "A very cool smartphone!" };

        // Inserisco una review di model1
        const response = await request(app).post(`${baseURL}/reviews/model1`).send(reviewTest).set("Cookie", sessionID);

        // Verifichiamo che la risposta sia stata restituita con errore (codice di stato 422)
        expect(response.status).toBe(422);
    });

    test("get reviews - OK", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();

        // Creazione customers
        await createUsers();
        const userResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "customer1", password: "test" });

        // Creo prodotti di test
        await createProducts();

        const sessionID = userResponse.headers['set-cookie'];

        // Aggiungo prodotti nel carrello del customer1
        await request(app).post(`${baseURL}/carts`)
            .set("Cookie", sessionID)
            .send({ model: "model1" });
        await request(app).post(`${baseURL}/carts`)
            .set("Cookie", sessionID)
            .send({ model: "model2" });

        // Pago il carrello
        await payCart();

        // Recupera l'oggetto User dal database
        const user = await userDao.getUserByUsername("customer1");

        // Aggiungo una review al prodotto model1
        await reviewDao.newReview("model1", user, 4, "Comment test");

        // Recupero le review del prodotto model1
        const response = await request(app)
            .get(`${baseURL}/reviews/model1`)
            .set("Cookie", sessionID);

        // Verifichiamo che la risposta sia stata restituita con successo (codice di stato 200)
        expect(response.status).toBe(200);
    });

    test("delete review - OK", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();

        // Creazione customers
        await createUsers();
        const userResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "customer1", password: "test" });

        // Creo prodotti di test
        await createProducts();

        const sessionID = userResponse.headers['set-cookie'];

        // Aggiungo prodotti nel carrello del customer1
        await request(app).post(`${baseURL}/carts`).set("Cookie", sessionID).send({ model: "model1" });
        await request(app).post(`${baseURL}/carts`).set("Cookie", sessionID).send({ model: "model2" });

        // Pago il carrello
        await payCart();

        // Definisco una review di test
        const reviewTest = { score: 5, comment: "A very cool smartphone!" };

        // Inserisco una review di model1
        await request(app).post(`${baseURL}/reviews/model1`).send(reviewTest).set("Cookie", sessionID);

        // Cancello la review di model1
        const response = await request(app).delete(`${baseURL}/reviews/model1`).set("Cookie", sessionID);

        // Verifica la risposta del server
        console.log("Delete review response:", response.body);

        // Verifichiamo che la risposta sia stata restituita con successo (codice di stato 200)
        expect(response.status).toBe(200);
    });

    test("delete review - review not found (404)", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();

        // Creazione customers
        await createUsers();
        const userResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "customer1", password: "test" });

        // Creo prodotti di test
        await createProducts();

        const sessionID = userResponse.headers['set-cookie'];

        // Aggiungo prodotti nel carrello del customer1
        await request(app).post(`${baseURL}/carts`).set("Cookie", sessionID).send({ model: "model1" });
        await request(app).post(`${baseURL}/carts`).set("Cookie", sessionID).send({ model: "model2" });

        // Pago il carrello
        await payCart();

        // Cancello la review di model1
        const response = await request(app).delete(`${baseURL}/reviews/model1`).set("Cookie", sessionID);

        // Verifica la risposta del server
        console.log("Delete review response:", response.body);

        // Verifichiamo che la risposta sia stata restituita con errore (codice di stato 404)
        expect(response.status).toBe(404);
    });

    test("delete review - unauthorized (401)", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();

        // Creazione customers
        await createUsers();
        const userResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "customer1", password: "test" });

        // Creo prodotti di test
        await createProducts();

        const sessionID = userResponse.headers['set-cookie'];

        // Aggiungo prodotti nel carrello del customer1
        await request(app).post(`${baseURL}/carts`).send({ model: "model1" });
        await request(app).post(`${baseURL}/carts`).send({ model: "model2" });

        // Pago il carrello
        await payCart();

        // Definisco una review di test
        const reviewTest = { score: 5, comment: "A very cool smartphone!" };

        // Inserisco una review di model1
        await request(app).post(`${baseURL}/reviews/model1`).send(reviewTest);

        // Cancello la review di model1
        const response = await request(app).delete(`${baseURL}/reviews/model1`);

        // Verifica la risposta del server
        console.log("Delete review response:", response.body);

        // Verifichiamo che la risposta sia stata restituita con errore (codice di stato 403)
        expect(response.status).toBe(401);
    });

    test("delete all reviews for a product - OK", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();
    
        // Creazione customers
        await createUsers();
    
        // Autentica come admin
        const adminResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "admin", password: "test" });
        const adminSessionID = adminResponse.headers['set-cookie'];
    
        // Creo prodotti di test
        await createProducts();
    
        // Aggiungo review al prodotto model1
        await createReviews();
    
        // Cancello tutte le review di model1 come admin
        const response = await request(app)
            .delete(`${baseURL}/reviews/model1/all`)
            .set("Cookie", adminSessionID);
    
        // Verifica la risposta del server
        console.log("Delete all reviews response:", response.body);
    
        // Verifichiamo che la risposta sia stata restituita con successo (codice di stato 200)
        expect(response.status).toBe(200);
    });
    

    test("delete all reviews for a product - unauthorized (401)", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();
    
        // Creazione customers
        await createUsers();
    
        // Autentica come admin
        const customerResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "customer", password: "test" });
        const customerSessionID = customerResponse.headers['set-cookie'];
    
        // Creo prodotti di test
        await createProducts();
    
        // Aggiungo review al prodotto model1
        await createReviews();
    
        // Cancello tutte le review di model1 come admin
        const response = await request(app)
            .delete(`${baseURL}/reviews/model1/all`);
    
        // Verifica la risposta del server
        console.log("Delete all reviews response:", response.body);
    
        // Verifichiamo che la risposta sia stata restituita con successo (codice di stato 200)
        expect(response.status).toBe(401);
    });

    test("delete all reviews - ok", async () => {
        // Cancello tutto ciò che è dentro al db
        await cleanup();
    
        // Creazione customers
        await createUsers();
    
        // Autentica come admin
        const adminResponse = await request(app).post(`${baseURL}/sessions`).send({ username: "admin", password: "test" });
        const adminSessionID = adminResponse.headers['set-cookie'];
    
        // Creo prodotti di test
        await createProducts();
    
        // Aggiungo review al prodotto model1
        await createReviews();
    
        // Cancello tutte le review di model1 come admin
        const response = await request(app)
            .delete(`${baseURL}/reviews/`)
            .set("Cookie", adminSessionID);
    
        // Verifica la risposta del server
        console.log("Delete all reviews response:", response.body);
    
        // Verifichiamo che la risposta sia stata restituita con successo (codice di stato 200)
        expect(response.status).toBe(200);
    });

});


    