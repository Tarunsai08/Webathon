const express = require('express')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose');

dotenv.config()

const port = process.env.PORT || 8000
const db = require("./model");
const Role = db.role;

//app.use(cors())
app.use(express.json());

require('./routes/auth.routes')(app)
require('./routes/user.routes')(app);

app.use('*',(req, res) => res.status(404).json({error:"Not Found"}))

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.DATABASE_URI).then(() => {
        initial()
        app.listen(port, () => console.log(`Server is running on port ${port}`))
    })
}

async function initial() {
    const count = await Role.estimatedDocumentCount();
    if (Number(count) === 0) {
        await new Role({
            name: "user"
        }).save().then(() => {
            console.log("added 'user' to roles collection");
        });

        await new Role({
            name: "moderator"
        }).save().then(() => {
            console.log("added 'moderator' to roles collection");
        });

        await new Role({
            name: "admin"
        }).save().then(() => {
            console.log("added 'admin' to roles collection");
        });
    }

}