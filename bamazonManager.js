var mysql = require("mysql");
var inquirer = require("inquirer");
var AsciiTable = require("ascii-table");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    inquirer
        .prompt([
            {
                type: "list",
                choices: [
                    {
                        name: "View Products for Sale",
                        value: "viewProducts"
                    },
                    {
                        name: "View Low Inventory",
                        value: "viewLowInventory"
                    },
                    {
                        name: "Add to Inventory",
                        value: "addToInventory"
                    },
                    {
                        name: "Add New Product",
                        value: "addNewProduct"
                    }
                ],
                name: "menuChoice",
                message: ">>>> MANAGEMENT MENU <<<<"
            }
        ]).then(function (result) {
            switch (result.menuChoice) {
                case "viewProducts":
                    viewProductsTable();
                    break;
                case "viewLowInventory":
                    viewLowInventory();
                    break;
                case "addToInventory":
                    addToInventory();
                    break;
                case "addNewProduct":
                    addNewProduct();
                    break;
            }
        });
}

// Function will display all the items from the products table
function viewProductsTable() {
    let query = "SELECT * FROM products";
    connection.query(query, function (err, result) {
        if (err) throw err;
        // Create list of products to be use by AsciTable rows
        var tableItems = result.map(item => {
            return [
                item.item_id,
                item.product_name,
                item.department_name,
                `$${item.price.toFixed(2)}`,
                item.stock_quantity
            ];
        });
        // Create table with result data from query
        var table = AsciiTable.factory({
            title: 'BAMAZON',
            heading: ['ID', 'Name', 'Department', 'Price', 'Quantity'],
            rows: tableItems
        }).setAlign(4, AsciiTable.CENTER);

        console.log(table.toString());
        start();
    });
}

// Function displays all low inventory 
function viewLowInventory() {
    let query = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(query, function (err, result) {
        if (err) throw err;
        var tableItems = result.map(item => {
            return [
                item.item_id,
                item.product_name,
                item.department_name,
                `$${item.price.toFixed(2)}`,
                item.stock_quantity
            ];
        });

        var table = AsciiTable.factory({
            title: 'BAMAZON',
            heading: ['ID', 'Name', 'Department', 'Price', 'Quantity'],
            rows: tableItems
        }).setAlign(4, AsciiTable.CENTER);

        console.log(table.toString());
        start();
    });
}

// Function prompt users to add more to current inventory product
function addToInventory() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "itemId",
                message: "Enter Product ID"
            },
            {
                type: "number",
                name: "quantity",
                message: "Enter Quantity"
            }
        ]).then(function (result) {
            // Update database with users input data
            let query = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id=?";
            connection.query(query, [result.quantity, result.itemId], function (err) {
                if (err) throw err;
                // Select new added data to be use by AsciiTable row
                let query = "SELECT item_id, product_name, stock_quantity FROM products WHERE item_id=?";
                connection.query(query, [result.itemId], function(err, response){
                    if (err) throw err;

                    var table = new AsciiTable("Updated Item");
                    table
                        .setHeading('ID', 'Name', 'Quantity')
                        .addRow([response[0].item_id, response[0].product_name, response[0].stock_quantity])
                        .setAlign(2, AsciiTable.CENTER);

                    console.log(table.toString());
                    start();
                });
            });
        });
}

// Function prompts the user to add a new product to database
function addNewProduct() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "productName",
                message: "Enter product's name"
            },
            {
                type: "input",
                name: "departmentName",
                message: "Enter department's name"
            },
            {
                type: "number",
                name: "price",
                message: "Enter item's price"
            },
            {
                type: "number",
                name: "stockQuantity",
                message: "Enter Quantity"
            }
        ]).then(function(result){
            // Query insert new product to database using user input
            let query = "INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES(?,?,?,?)";
            connection.query(query, [result.productName, result.departmentName, result.price, result.stockQuantity], function(err, response){
                if (err) throw err;
                // Query select the new data added to database to be use by AsciiTable rows
                connection.query("SELECT * FROM products WHERE item_id =?", [response.insertId], function(err, response){
                    if (err) throw err;
                    
                    var table = new AsciiTable("New Product Added");
                    table
                        .setHeading('ID', 'Name', 'Department', 'Price', 'Quantity')
                        .addRow([response[0].item_id, response[0].product_name, response[0].department_name, "$" + response[0].price, response[0].stock_quantity])
                        .setAlign(4, AsciiTable.CENTER);

                    console.log(table.toString());
                    start();
                })
            });
        });
}