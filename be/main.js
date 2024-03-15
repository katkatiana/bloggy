const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const PORT = 3030;

const app = express();

//import routes
const usersRoute = require('./routes/users');
const blogPostRoute = require('./routes/blogpost');
console.log(blogPostRoute)

//middleware
app.use(express.json());
app.use('/', usersRoute);
app.use('/', blogPostRoute);
app.use(cors());



/* app.get("/", (req, res) => {
    res
    .status(200)
    .send({
        title: 'Katia',
        isServerActive: true
    })
})

app.post("/createUser", (req, res) => {

})

app.patch("/updateUser", (req, res) => {

})

app.delete("/deleteUser", (req, res) => {
    
}) */


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Db connection error'));
db.once('open', () => {
    console.log('Database succesfully connected')
})



app.listen(PORT, () => console.log(`Server connected and listening on port ${PORT}`))