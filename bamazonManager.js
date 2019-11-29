var mysql = require("mysql");
var inquirer = require("inquirer");
var AsciiTable = require("ascii-table");

function start(){
    inquirer
        .prompt([
            {
                type:"list",
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
        ]).then(function(result){
            console.log(result);
        });
}

start();