var mysql = require("mysql");
var inquirer = require("inquirer");
var AsciiTable = require("ascii-table");

// Create the connection information for the sql database
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

// Connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;

    // Display items from bamazon database
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        // Create a list of arrays with item's ids, names and prices from query result
        let tableItems = results.map(item => {
            return [item.item_id, item.product_name, `$${item.price.toFixed(2)}`];
        });

        // Table instant creator
        var table = AsciiTable.factory({
            title: 'BAMAZON'
            , heading: ['ID', 'Name', 'Price']
            , rows: tableItems
        });

        console.log(table.toString());
        start();
    });
});

function start() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "id",
                message: "Enter Product ID you would like to buy"
            },
            {
                type: "number",
                name: "quantity",
                message: "How many units would you like to buy?"
            }
        ]).then(function (customerRequest) {
            connection.query(
                "SELECT stock_quantity, price FROM products WHERE item_id=?", [customerRequest.id], function (err, product) {
                if (err) throw err;

                if (customerRequest.quantity <= product[0].stock_quantity) {
                    placeOrder(customerRequest, product);
                } else {
                    console.log("\n***** Insufficient Quantity *****\n");
                }
            });
        });
}

function placeOrder(customerRequest, product) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: product[0].stock_quantity - customerRequest.quantity
            },
            {
                item_id: customerRequest.id
            }
        ],
        function (error) {
            if (error) throw err;
            var totalCost = product[0].price * customerRequest.quantity;

            var table = new AsciiTable();
            table
                .setHeading('Order Total')
                .addRow(totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' }))
                .setAlign(0, AsciiTable.CENTER);

            console.log(table.toString());
        }
    );
}