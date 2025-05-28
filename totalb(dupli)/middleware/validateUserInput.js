const { User } = require("../models/User");

const validateUserInput = async (req, res, next) => {
    try {
        const { username, password, parentName, parentPhone, parentEmail, address } = req.body;

        if (!username || !password || !parentName || !parentPhone || !parentEmail || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@ or $)." 
            });
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(parentPhone)) {
            return res.status(400).json({ message: "Mobile number must be 10 digits." });
        }

        const existingEmail = await User.findOne({ email : parentEmail });
        console.log(existingEmail);
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username is already taken." });
        }

        next(); 
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = validateUserInput;
