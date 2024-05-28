import { resolve } from "path";
import { Category, Product, getCategory } from "./../components/product";
import db from "./../db/db";
import { rejects } from "assert";
/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
    /*async insertProduct(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null) : Promise<Product> {
        const query = "INSERT INTO Products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)";
        const cat = getCategory(category);

        return new Promise((resolve, reject) => {
            
            db.run(query, [model, category, quantity, details, sellingPrice, arrivalDate], (err) => {
                if(err){
                    reject(err);
                } else {
                    const p = new Product(sellingPrice, model, cat, arrivalDate, details, quantity);
                    resolve(p);
                }
            })
        })
    }*/

    insertProduct(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null) : Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            try{
                const sql = "INSERT INTO Products (model, category, quantity, details, price, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)";
                db.run(sql, [model, category, quantity, details, sellingPrice, arrivalDate], (err : Error | null) => {
                    if(err){
                        reject(err);
                    } else {
                        resolve(true);
                    }
                })
            } catch(error){
                reject(error)
            }
        })
    }

    changeProductQuantity(model: string, newQuantity: number, changeDate: string | null) : Promise<number>{
        return new Promise<number>((resolve, reject) => {
            try{
                let SQL = "UPDATE Products SET quantity = quantity + ? WHERE model = ?";
                if(changeDate !== null)
                    SQL = SQL + `AND arrivalDate = ${changeDate}`;
                db.run(SQL, [newQuantity, model], (err : Error) => {
                    if(err){
                        reject(err);
                    } else {
                        this.getAllProducts("model", null, model).then(
                            p => resolve(p[0].quantity)
                        )
                    }
                })
            } catch (error){
                reject(error);
            }
        })
    }

    getAllProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]>{
        return new Promise<Product[]>((resolve, reject) => {
            try{
                let SQL = "SELECT * FROM Products";
                if(grouping == 'model'){
                    SQL = SQL + `WHERE model = ${model}`;
                } else if (grouping == 'category'){
                    SQL = SQL + `WHERE category = ${category}`;
                }
                db.all(SQL, (err : Error | null, rows: any[] | null) => {
                    if(err){
                        reject(err);
                    } else {
                        const products = rows.map(pr => new Product(pr.price, pr.model, pr.category, pr.arrivalDate, pr.details, pr.quantity));
                        resolve(products);
                    }
                })
            } catch(error){
                reject(error);
            }
        })
    }

    sellProduct(model: string, quantity: number, sellingDate: string | null): Promise<Number>{
        return new Promise<Number>((resolve, reject) => {
            try{
                const SQL = "UPDATE Products SET quantity = quantity - ? WHERE model = ?";
                db.run(SQL, [model, quantity], (err : Error | null) => {
                    if(err !== null){
                        reject(err)
                    } else {
                        this.getAllProducts("model", null, model).then(
                            p => resolve(p[0].quantity)
                        )
                    }
                })
            } catch(error){
                reject(error)
            }
        })
    }

    availableProducts(grouping: string | null, category: string | null, model: string | null){
        return new Promise<Product[]>((resolve, reject) => {
            try{
                let SQL = "SELECT * FROM Products";
                if(grouping === 'model'){
                    SQL = SQL + `WHERE model = ${model}`;
                } else if(grouping === 'category'){
                    SQL = SQL + `WHERE category = ${category}`
                }
                db.all(SQL, (err : Error | null, rows : any[]) => {
                    if(err !== null){
                        reject(err);
                    } else {
                        const availableProducts = rows.map(pr => new Product(pr.price, pr.model, pr.category, pr.arrivalDate, pr.details, pr.quantity));
                        resolve(availableProducts);
                    }
                    
                })
            } catch(error){ 
                reject(error)
            }
        })
    }
}

export default ProductDAO