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
                        name: "View Products Sales by Department",
                        value: "viewSalesByDepartment"
                    },
                    {
                        name: "Create New Department",
                        value: "createNewDepartment"
                    }
                ],
                name: "menuChoice",
                message: ">>>> SUPERVISOR MENU <<<<"
            }
        ]).then(function (result) {
            switch (result.menuChoice) {
                case "viewSalesByDepartment":
                    viewSalesByDepartment();
                    break;
                case "createNewDepartment":
                    createNewDepartment();
                    break;
            }
        });
}

function viewSalesByDepartment() {
    let query = "SELECT department_id, departments.department_name, over_head_costs,";
    query += " SUM(product_sales) AS product_sales, (SUM(product_sales) - over_head_costs)";
    query += " AS total_profit FROM departments INNER JOIN products";
    query += " ON departments.department_name = products.department_name GROUP BY department_id";

    connection.query(query, function (err, result) {
        var tableItems = result.map(item => {
            return [
                item.department_id,
                item.department_name,
                `$${item.over_head_costs.toFixed(2)}`,
                `$${item.product_sales.toFixed(2)}`,
                `$${item.total_profit.toFixed(2)}`
            ];
        });

        var table = AsciiTable.factory({
            title: "Sales by Department",
            heading: ['Department ID', 'Department Name', 'Overhead Costs', 'Product Sales', 'Total Profit'],
            rows: tableItems
        }).setAlignCenter(0)
            .setAlignCenter(2)
            .setAlignCenter(3)
            .setAlignCenter(4);

        console.log(table.toString());
        start();
    });
}

function createNewDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "departmentName",
                message: "Enter new department name"
            },
            {
                type: "number",
                name: "overHeadCost",
                message: "Enter Overhead Cost"
            }
        ]).then(function (result) {
            let query = "INSERT INTO departments (department_name, over_head_costs)";
            query += " values(?, ?)";
            connection.query(query, [result.departmentName, result.overHeadCost], function (err, response) {
                if (err) throw err;
                connection.query("SELECT * FROM departments WHERE department_id=?", [response.insertId], function (err, result) {
                    if (err) throw err;
                    //console.log(result);
                    var table = new AsciiTable("New Department added");
                    table
                        .setHeading('Department ID', 'Department Name', 'Overhead Cost')
                        .addRow(result[0].department_id, result[0].department_name, "$" + result[0].over_head_costs.toFixed(2))
                        .setAlignCenter(0)
                        .setAlignCenter(1)

                    console.log(table.toString());
                    start();
                });
            });
        });
}
