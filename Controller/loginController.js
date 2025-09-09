const adminSchema = require("../model/adminSchema");
const jwt = require("jsonwebtoken");

module.exports.logIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username, password });

        const admin = await adminSchema.findOne({ username, password });
        console.log('admin:', admin);

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username
            },
            'your_secret_key',
            { expiresIn: '1h' }
        );
        console.log("token", token);

        return res.json({ success: true, token, message: 'Login Successful.' });
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports.getAdmin = async (req, res) => {
    try {
        const adminData = await adminSchema.findById(req.user.id);

        console.log("adminData", adminData);


        return res.status(200).json(adminData);
    } catch (error) {
        console.log(error);

    }
}

module.exports.logOut = (req, res) => {
    return res.json({ success: true, message: 'Logged Out Successfully.' });
};