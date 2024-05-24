import { Category, Product, getCategory } from "./../components/product";
import db from "./../db/db";
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
                const sql = "INSERT INTO Products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)";
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

    async changeProductQuantity(model: string, newQuantity: number, changeDate: string | null) : Promise<void>{
        
    }

    async getAllProducts(){
        return new Promise<Product[]>((resolve, reject) => {
            try{
                const SQL = "SELECT * FROM products";
                db.run(SQL, (err : Error | null, rows: any[]) => {
                    if(err){
                        reject(err);
                    } else {
                        const products = rows.map(pr => new Product(pr.sellingPrice, pr.model, pr.category, pr.arrivalDate, pr.details, pr.quantity));
                        resolve(products);
                    }
                })
            } catch(error){
                resolve(error);
            }
        })
    }
}

export default ProductDAO