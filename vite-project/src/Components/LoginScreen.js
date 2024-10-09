import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import LogInModel from './Mongodb.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const templatePath = path.join(__dirname, '..', 'templates'); 

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'hbs'); 
app.set('views', templatePath); 

console.log("Requirements complete!");

app.get("/", (req, res) => {
    res.render("login"); 
});

app.get("/signup", (req, res) => {
    res.render("signup"); 
});

app.get("/home", (req, res) => {
    res.render("home"); 
});
app.post('/login', async (req, res) => {
    try {
        const user = await LogInModel.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).send("Invalid username or password.");
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid username or password.");
        }

        res.render('home');
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Failed to login, please try again.");
    }
});

app.post('/signup', async (req, res) => {
    console.log("Form submitted:", req.body); 
    try {
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).send("Passwords do not match.");
        }

        const existingUser = await LogInModel.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).send("Username already exists.");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const data = {
            username: req.body.username,
            password: hashedPassword 
        };

        const newUser = new LogInModel(data);
        await newUser.save();
        console.log("New user created:", newUser);  
        res.render('home'); 
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).send("Failed to signup, please try again.");
    }
});
// Start the server on port 300
app.listen(300, () => {
    console.log("port connected");
});
