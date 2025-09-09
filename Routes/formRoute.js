const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/send-brochure-detail", async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: "All fields (name, email, contact) are required." });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "zanordbath@gmail.com",
            pass: "zlfsphfdbfddsswk",
        },
    });

    const mailOptions = {
        from: `"${name} via Brochure Request" <zanordbath@gmail.com>`, // Display user's name in the "from" field
        to: "zanordbath@gmail.com", // Your email as recipient
        replyTo: `${email}`, // User's email for replying
        subject: `New Brochure Request from ${name}`,
        text: `You have a new brochure request!\n\nDetails:\nName: ${name}\nEmail: ${email}\nContact: ${phone}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully from ${email}`);
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("❌ Email Error:", error);
        res.status(500).json({ error: "Failed to send email." });
    }
})

// Contact form submission route
router.post("/contact-form", async (req, res) => {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Nodemailer transporter setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "zanordbath@gmail.com",
                pass: "zlfsphfdbfddsswk",
            },
        });

        const mailOptions = {
            from: `"${name}" <zanordbath@gmail.com>`, // Still uses your email to send
            to: "zanordbath@gmail.com", // Your email where you receive messages
            subject: "New Contact Form Submission",
            replyTo: email, // This makes replies go to the user
            html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
        };


        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

module.exports = router;