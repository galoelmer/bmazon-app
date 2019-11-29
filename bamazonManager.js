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
    password: "Tg2005",
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
                default:
                    console.log("No Choice");
                    break;
            }
        });
}

function viewProductsTable() {
    let query = "SELECT * FROM products";
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
            let query = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id=?";
            connection.query(query, [result.quantity, result.itemId], function (err) {
                if (err) throw err;

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