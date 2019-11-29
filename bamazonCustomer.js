var mysql = require("mysql");
var AsciiTable = require('ascii-table');

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

        // Create a list of arrays with items's ids, names and prices from query result
        let tableItems = results.map(item => {
            return
            [
                item.item_id,
                item.product_name,
                `$${item.price.toFixed(2)}`
            ];
        });

        // Table instant creator
        var table = AsciiTable.factory({
            title: 'BAMAZON'
            , heading: ['ID', 'Name', 'Price']
            , rows: tableItems
        });

        console.log(table.toString())
    });
});

