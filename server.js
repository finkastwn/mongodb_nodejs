const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://mongo:27017/jt_mongodb_nodejs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const DataSchema = new mongoose.Schema({
    name: String,
    email: String
});
const Data = mongoose.model('Data', DataSchema);

app.get('/', async (req, res) => {
    const data = await Data.find();
    let dataHtml = `
        <h2 class="mt-4">Stored Data</h2>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach(item => {
        dataHtml += `
            <tr>
                <td>${item.name}</td>
                <td>${item.email}</td>
            </tr>
        `;
    });
    dataHtml += `
            </tbody>
        </table>
    `;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Form Input</title>
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h1 class="mb-4">Form Input</h1>
                <form action="/submit" method="POST">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" class="form-control" id="name" name="name">
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" class="form-control" id="email" name="email">
                    </div>
                    <button type="submit" class="btn btn-primary">Submit</button>
                </form>
                ${dataHtml}
            </div>
        </body>
        </html>
    `);
});

app.post('/submit', async (req, res) => {
    const { name, email } = req.body;
    const newData = new Data({ name, email });
    await newData.save();
    res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
