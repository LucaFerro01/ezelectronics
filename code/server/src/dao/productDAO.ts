import { resolve } from "path";
import { Category, Product} from "./../components/product";
import db from "./../db/db";
import { rejects } from "assert";
import dayjs from "dayjs";
import { EmptyProductStockError, LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError, DatePrecedesArrivalError } from "../errors/productError";
/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {

    insertProduct(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null) : Promise<void>{
        return new Promise<void>((resolve, reject) => {
            try{
                const sql = "INSERT INTO Products (model, category, quantity, details, price, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)";
                db.run(sql, [model, category, quantity, details, sellingPrice, arrivalDate], (err : Error | null) => {
                    if(err){
                        if(err.message.includes("UNIQUE constraint failed: Products.model"))
                            reject(new ProductAlreadyExistsError());
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            } catch(error){
                reject(error)
            }
        })
    }

    changeProductQuantity(model: string, newQuantity: number, changeDate: string | null) : Promise<Number>{
        return new Promise<Number>(async (resolve, reject) => {
            try{
                const product = await this.getAllProducts("model", null, model);

                if(product.length === 0){
                    reject(new ProductNotFoundError());
                    return;
                }
                if(changeDate !== null && dayjs(changeDate).isBefore(dayjs(product[0].arrivalDate))){
                    reject(new DatePrecedesArrivalError());
                    return;
                }
                let SQL = `UPDATE Products SET quantity = quantity + ${newQuantity} WHERE model = \'${model}\'`;
                //if(changeDate !== null && changeDate !== undefined)
                //    SQL = `UPDATE Products SET quantity = quantity + ${newQuantity}, arrivalDate = \'${changeDate}\'  WHERE model = \'${model}\'`
                db.run(SQL, async (err : Error) => {
                    if(err){
                        reject(err);
                    } else {
                        const newQty = product[0].quantity + newQuantity;
                        const final = await this.getAllProducts("model", null, model);
                        resolve(final[0].quantity);
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
                if(grouping === 'model'){
                    SQL = SQL + ` WHERE model = \'${model}\'`;
                }
                if(grouping === 'category'){
                    SQL = SQL + ` WHERE category = \'${category}\'`;
                }
                db.all(SQL, (err : Error | null, rows: any[] | null) => {
                    if(err){
                        reject(err);
                    } else {
                        if((rows === null || rows.length == 0) && model !== null && grouping === "model"){
                            reject(new ProductNotFoundError());
                            return;
                        }
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
        return new Promise<Number>(async (resolve, reject) => {
            try{
                const p = await this.getAllProducts("model", null, model)
                if(p.length === 0){
                    reject(new ProductNotFoundError);
                    return;
               }
                if(sellingDate !== null && dayjs(sellingDate).isBefore(dayjs(p[0].arrivalDate))){
                    reject(new DatePrecedesArrivalError());
                    return;
                }
                else if(p[0].quantity === 0){
                    reject(new EmptyProductStockError);
                    return;
                }
                else if(p[0].quantity < quantity){ 
                    reject(new LowProductStockError);
                    return;
                }
                let SQL = `UPDATE Products SET quantity = quantity - ${quantity} WHERE model = \'${model}\'`;
                //if(sellingDate !== null && sellingDate !== undefined)
                //    SQL = `UPDATE Products SET quantity = quantity - ${quantity}, arrivalDate = \'${sellingDate}\' WHERE model = \'${model}\'`
                db.run(SQL, async (err : Error | null) => {
                    if(err !== null){
                        reject(err)
                    } else {
                        const prod = await this.getAllProducts("model", null, model);
                        resolve(prod[0].quantity);
                    }
                })
            } catch(error){
                reject(error)
            }
        })
    }

    availableProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]>{
        return new Promise<Product[]>(async (resolve, reject) => {
            try{
                const allProducts = await this.getAllProducts(grouping, category, model);
                let SQL = "SELECT * FROM Products WHERE quantity > 0";
                if(grouping === 'model'){
                    SQL = SQL + ` AND model = \'${model}\'`;
                } else if(grouping === 'category'){
                    SQL = SQL + ` AND category = \'${category}\'`
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

    deleteAllProducts(): Promise<Boolean>{
        return new Promise<Boolean>((resolve, reject) => {
            try{
                const SQL = "DELETE FROM Products"
                db.run(SQL, (err : Error | null) => {
                    if(err !== null){
                        reject(err)
                    } else {
                        resolve(true);
                    }
                })
            } catch(error){
                resolve(error);
            }
        })
    }

    deleteProduct(model: string): Promise<Boolean>{
        return new Promise<boolean>(async (resolve, reject) => {
            try{
                const product = await this.getAllProducts("model", null, model);
                if(product.length === 0){
                    reject(new ProductNotFoundError());
                    return;
                }
                const SQL = `DELETE FROM Products WHERE model = \'${model}\'`;
                db.run(SQL, (err: Error | null) => {
                    if(err !== null){
                        reject(err);
                    } else {
                        resolve(true);
                    }
                })
            } catch(error){
                reject(error);
            }
        })
    }
}


export default ProductDAO