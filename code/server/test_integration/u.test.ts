import { describe, test, expect, beforeEach, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { Console } from "console"
import { cookie } from "express-validator"
import { resolve } from "path"
import { Role, User } from "../src/components/user"

const routePath = "/ezelectronics" //Base route path for the API


//After executing tests, we remove everything from our test database
beforeEach(async () => {
    // Esegui la funzione di cleanup per pulire il database prima di ogni test
})

afterAll(async () => {
    await cleanup();

})


// creation of a new user in the database
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}


// login of the user and return the cookie
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}



test("Route for retrieving all users", async () => {
    const admin1 = { username: "admin1", name: "admin1", surname: "admin1", password: "admin1", role: "Admin" }

    await postUser(admin1);
    const admin1Cookie = await login(admin1);
    
    // call
    let response = await request(app).get(`${routePath}/users`).set("Cookie", admin1Cookie);

    // expect statements
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect((response.body[0]).username).toEqual(admin1.username);
    await cleanup();
});



test("Route for retrieving all users", async () => {
    const customer1 = { username: "customer1", name: "customer1", surname: "customer1", password: "customer1", role: "Customer" }

    await postUser(customer1);
    const customerCookie = await login(customer1);
    
    // call
    let response = await request(app).get(`${routePath}/users`).set("Cookie", customerCookie);

    // expect statements
    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("User is not an admin");
    await cleanup();
});



test("Route for retrieving all users of a specific role", async () => {
    const user1 = { username: "user1", name: "user1", surname: "user1", password: "user1", role: "Customer" };
    const user2 = { username: "user2", name: "user2", surname: "user2", password: "user2", role: "Manager" };
    const user3 = { username: "user3", name: "user3", surname: "user3", password: "user3", role: "Customer" };
    const admin1 = { username: "admin1", name: "admin1", surname: "admin1", password: "admin1", role: "Admin" };
    const targetRole = "Customer";

    // register users
    await postUser(admin1);
    await postUser(user1);
    await postUser(user2);
    await postUser(user3);

    // log in admin
    const admin1Cookie = await login(admin1);

    // call
    let response = await request(app).get(`${routePath}/users/roles/${targetRole}`).set("Cookie", admin1Cookie);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].username).toEqual("user1");
    expect(response.body[1].username).toEqual("user3");
    await cleanup();
});



test("Route for retrieving all users of a specific role", async () => {
    const user1 = { username: "user1", name: "user1", surname: "user1", password: "user1", role: "Customer" };
    const user2 = { username: "user2", name: "user2", surname: "user2", password: "user2", role: "Manager" };
    const user3 = { username: "user3", name: "user3", surname: "user3", password: "user3", role: "Customer" };
    const admin1 = { username: "admin1", name: "admin1", surname: "admin1", password: "admin1", role: "Admin" };
    const targetRole = "Customer";

    // register users
    await postUser(admin1);
    await postUser(user1);
    await postUser(user2);
    await postUser(user3);

    // log in admin
    const user1Cookie = await login(user1);

    // call
    let response = await request(app).get(`${routePath}/users/roles/${targetRole}`).set("Cookie", user1Cookie);
    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("User is not an admin");
    await cleanup();
});


test("Route for retrieving a user by its username", async() => {
    const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
    await postUser(customer)
    const userCookie = await login(customer)
    const targetUsername = "customer"; // target username

    // call
    let response = await request(app).get(`${routePath}/users/` + targetUsername).set("Cookie", userCookie);


    //expect statements
    expect(response.status).toBe(200);
    await cleanup();
})



test("Route for retrieving a user by its username", async () => {
    const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
    await postUser(customer)
    const userCookie = await login(customer)
    const targetUsername = "wrong"; // target username wrong

    // call
    let response = await request(app).get(`${routePath}/users/` + targetUsername).set("Cookie", userCookie);

    //expect statements
    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("You cannot access the information of other users");
    await cleanup();
});


test("Route for deleting a user", async () => {
    const user1 = { username: "user1", name: "user1", surname: "user1", password: "user1", role: "Customer" };
    const user2 = { username: "user2", name: "user2", surname: "user2", password: "user2", role: "Manager" };
    const user3 = { username: "user3", name: "user3", surname: "user3", password: "user3", role: "Customer" };
    const admin1 = { username: "admin1", name: "admin1", surname: "admin1", password: "admin1", role: "Admin" };
    const targetUsername = "user1";

    // register users
    await postUser(admin1);
    await postUser(user1);
    await postUser(user2);
    await postUser(user3);

    // log in admin
    const admin1Cookie = await login(admin1);

    // call
    let response = await request(app).get(`${routePath}/users/${targetUsername}`).set("Cookie", admin1Cookie);
    expect(response.status).toBe(200);
    expect(response.body.username).toEqual(user1.username);
    await cleanup();
});


test("Route for deleting a user", async () => {
    const user1 = { username: "user1", name: "user1", surname: "user1", password: "user1", role: "Customer" };
    const user2 = { username: "user2", name: "user2", surname: "user2", password: "user2", role: "Manager" };
    const user3 = { username: "user3", name: "user3", surname: "user3", password: "user3", role: "Customer" };
    const admin1 = { username: "admin1", name: "admin1", surname: "admin1", password: "admin1", role: "Admin" };
    const targetUsername = "wrong";  // targer username not in the db

    // register users
    await postUser(admin1);
    await postUser(user1);
    await postUser(user2);
    await postUser(user3);

    // log in admin
    const admin1Cookie = await login(admin1);

    // call
    let response = await request(app).get(`${routePath}/users/${targetUsername}`).set("Cookie", admin1Cookie);
    expect(response.status).toBe(404);
    expect(response.body.error).toEqual("The user does not exist");
    await cleanup();
});



test("Route for deleting a user", async () => {
    const user1 = { username: "user1", name: "user1", surname: "user1", password: "user1", role: "Customer" };
    const user2 = { username: "user2", name: "user2", surname: "user2", password: "user2", role: "Manager" };
    const user3 = { username: "user3", name: "user3", surname: "user3", password: "user3", role: "Customer" };
    const admin1 = { username: "admin1", name: "admin1", surname: "admin1", password: "admin1", role: "Admin" };
    const targetUsername = "user1";

    // register users
    await postUser(admin1);
    await postUser(user1);
    await postUser(user2);
    await postUser(user3);

    // log in admin
    const user3Cookie = await login(user3);

    // call
    let response = await request(app).get(`${routePath}/users/${targetUsername}`).set("Cookie", user3Cookie);
    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("You cannot access the information of other users");
    await cleanup();
});



test("Route for deleting a user", async () => {
    //first create another admin 
    const testAdmin2= { username: "testAdmin2", name: "test", surname: "test", password: "test", role: Role.ADMIN }
    const testAdmin= { username: "testAdmin", name: "test", surname: "test", password: "test", role: Role.ADMIN }

    await postUser(testAdmin2)
    await postUser(testAdmin)
    let adminCookie2 = await login(testAdmin2)

    //try to delete an admin with another admin
    const response = await request(app).delete(`${routePath}/users/${testAdmin.username}`).set("Cookie", adminCookie2).send();
    expect(response.status).toBe(401);
    await cleanup();
});



test("Route for deleting all users", async () => {
    const user1 = { username: "user1", name: "user1", surname: "user1", password: "user1", role: Role.CUSTOMER };
    const admin1 = { username: "admin1", name: "admin1", surname: "admin1", password: "admin1", role: Role.ADMIN };
    const admin2 = { username: "admin2", name: "admin2", surname: "admin2", password: "admin2", role: Role.ADMIN };

    // register users
    await postUser(admin2);
    await postUser(admin1);
    await postUser(user1);

    // log in
    const admin1Cookie = await login(admin1);

    // call
    let response = await request(app).get(`${routePath}/users`).set("Cookie", admin1Cookie);
    expect(response.status).toBe(200);
    await cleanup();
});



test("Route for updating the information of a user", async () => {
    const user1 = { username: "user1", name: "user1", surname: "user1", password: "user1", role: "Customer", address: "user1" };
    const bodyCall = {name: "user1", surname: "user1", address: "user1", birthdate: "1969-01-01"};
    const wrongUsername = "wrong";

    // call
    let response = await request(app).patch(`${routePath}/users/${user1.username}`).send(bodyCall);
    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("Unauthenticated user");
    await cleanup();
});

