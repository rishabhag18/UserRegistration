import express from "express";
import pg from "pg";

//********************************************************************************************* */

const app = express();
const port = 3000;

let data = [];
let isPresent = false;
let notPresent = false;

//*************************    U S I N G   M I D D L E W A R E S    *************************** */

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//********************     D A T A B A S E   C O N N E C T I O N    ************************* */

const dataBase = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "student",
    password: "password",
    port: 5432
})
dataBase.connect();

//************************    H O M E  P A G E  R O U T E     ********************************* */

app.get("/", (req, res) => {
    if (isPresent) {
        res.render("index.ejs", { isPresent: isPresent });
        isPresent=false;
    }
    else if (notPresent) {
        res.render("index.ejs", { notPresent: notPresent });
        notPresent=false;
    }
    else {
        isPresent = false;
        res.render("index.ejs");
    }
})

//**********************   D A T A   I N S E R T I O N   R O U T E    *********************** */

app.post("/submit", async (req, res) => {
    const name = req.body["fname"].concat(" ", req.body["lname"]).toUpperCase();
    const contact = parseInt(req.body["number"]);
    const email = req.body["email"];
    const reg_no = req.body["regNo"].toUpperCase();
    try {
        const check = await dataBase.query(`SELECT * FROM studentdata WHERE reg_no = '${reg_no}';`);
        const checkData = check.rows;
        if (checkData[0].reg_no == reg_no) {
            console.log(reg_no);
            isPresent = true;
            res.redirect("/");
        }

    } catch (err) {
        console.log("Error : User Already Registered");
        const insertQuery = `INSERT INTO studentdata VALUES('${name}', ${contact}, '${email}', '${reg_no}');`;
        dataBase.query(nsertQuery);
        const selectQuery = `SELECT * FROM studentdata WHERE reg_no = '${reg_no}';`;
        const result = await dataBase.query(selectQuery);
        data = result.rows;
        console.log(data);
        res.render("showData.ejs", { data: data });
    }
})

//***************************    R E G I S T E R E D   U S E R   C H E C K    ************************* */

app.get("/search", (req, res) => {
    res.render("showData.ejs");
})

app.post("/search", async (req, res) => {
    try {
        const regNo = req.body["search"].toUpperCase();;
        let data = [];
        const result = await dataBase.query(`SELECT * FROM studentdata WHERE reg_no = '${regNo}';`);
        data = result.rows;
        if (data[0].reg_no == regNo) {
            console.log(data);
            res.render("showData.ejs", { data: data });
            notPresent = false;

        }
    } catch (err) {
        console.log(`Registration Number Not Found In Records.`);
        notPresent = true;
        res.redirect("/");
    }
})

//******************   V I E W   A L L   D A T A   P A G E   R O U T E    *********************** */

app.get("/allData",async(req,res)=>{
    const query = `SELECT * FROM studentdata;`;
    let data=[];
    const result = await dataBase.query(query);
    data=result.rows;
    res.render("allData.ejs",{data:data});
})

//*******************************   S E R V E R   C O N N E C T I O N   *************************** */

app.listen(port, () => {
    console.log(`server is up and running at https://localhost:${port}`);
})