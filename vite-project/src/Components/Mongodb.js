import mongoose from 'mongoose';

mongoose.connect("mongodb://localhost:27017/yourDatabaseName", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected!");
})
.catch(err => {
    console.log("Failed to connect:", err);
});


const LogInSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


const LogInModel = mongoose.model('LogIn', LogInSchema);


export default LogInModel;
