const path = require("path");

const TerminusClient = require("@terminusdb/terminusdb-client");


// Connecting to TerminusX
// TODO: Change teamname
const client = new TerminusClient.WOQLClient(
  "http://localhost:6363",
    { user: "admin", key: "root", organization: "admin", db: "GettingStartedDB"}
);

//Assign your key to environment variable TERMINUSDB_ACCESS_TOKEN
//client.setApiKey(process.env.TERMINUSDB_ACCESS_TOKEN);

const runQuery = async () => {
    const WOQL = TerminusClient.WOQL;

//    await client.deleteDatabase("GettingStartedDB");

//    await client.createDatabase("GettingStartedDB", {
//        label: "GettingStartedDB",
//        comment: "Created new GettingStartedDB",
//    });
//    console.log("Database created successfully!");

    client.db("GettingStartedDB");

    // read Contact.csv
    const result = await client.query(
        WOQL.and(
            WOQL.get(
                WOQL.as('Name', 'v:Name')
                    .as('Manager', 'v:Manager')
                    .as('Title', 'v:Title')
            ).post("Employees.csv"),
            //WOQL.triple('v:Name','v:any2',"v:any3")
        )
    )
    console.log(result.bindings);
};

runQuery();
