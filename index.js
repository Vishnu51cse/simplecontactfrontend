// Creating a server
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Schema
const schemaData = mongoose.Schema({
    name: String,
    email: { type: String, unique: true },  // Ensure email is unique
    mobile: { type: String, unique: true },  // Ensure mobile is unique
}, {
    timestamps: true
});

const userModel = mongoose.model("user", schemaData);

// Read - Get all users
app.get("/", async (req, res) => {
    const data = await userModel.find({});
    res.json({ success: true, data: data });
});

// Create data - Save data in MongoDB
app.post("/create", async (req, res) => {
    try {
        console.log(req.body);

        const existingEmail = await userModel.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).send({ success: false, message: "Email already exists" });
        }

        const existingMobile = await userModel.findOne({ mobile: req.body.mobile });
        if (existingMobile) {
            return res.status(400).send({ success: false, message: "Mobile number already exists" });
        }

        const data = new userModel(req.body);
        await data.save();
        res.send({ success: true, message: "Data Saved Successfully", data: data });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "An error occurred", error: error.message });
    }
});

// Update data
app.put("/update", async (req, res) => {
    try {
        console.log(req.body);
        const { _id, email, mobile, ...rest } = req.body;

        // Check for duplicate email
        const existingEmail = await userModel.findOne({ email, _id: { $ne: _id } });
        if (existingEmail) {
            return res.status(400).send({ success: false, message: "Email already exists" });
        }

        // Check for duplicate mobile
        const existingMobile = await userModel.findOne({ mobile, _id: { $ne: _id } });
        if (existingMobile) {
            return res.status(400).send({ success: false, message: "Mobile number already exists" });
        }

        const data = await userModel.updateOne({ _id: _id }, { email, mobile, ...rest });
        res.send({ success: true, message: "Data Updated Successfully", data: data });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "An error occurred", error: error.message });
    }
});

// Delete data
app.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        const data = await userModel.deleteOne({ _id: id });
        res.send({ success: true, message: "Data Deleted Successfully", data: data });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "An error occurred", error: error.message });
    }
});

mongoose.connect("mongodb+srv://admin1:vishnu@cluster0.xru4n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("Connected to DB");
        app.listen(PORT, () => console.log("Server is running"));
    })
    .catch((err) => console.log(err));
