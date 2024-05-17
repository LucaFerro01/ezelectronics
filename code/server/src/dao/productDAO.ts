import { Category, Product, getCategory } from "./../components/product";
import db from "./../db/db";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
    async insertProduct(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null) : Promise<Product> {
        const query = "INSERT INTO PRODUCTS (model, category, quantity, details, sellingPrice, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)";
        const cat = getCategory(category);

        return new Promise((resolve, reject) => {
            
            db.run(query, [model, category, quantity, details, sellingPrice, arrivalDate], (err) => {
                if(err || cat === null){
                    reject(err);
                } else {
                    const p = new Product(sellingPrice, model, cat, arrivalDate, details, quantity);
                    resolve(p);
                }
            })
        })
    }
}

export default ProductDAO