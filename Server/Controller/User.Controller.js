import userModel from "../Model/User.model.js";
import catchAsyncError from "../Middleware/CatchAsyncError.js";
import jwt from "jsonwebtoken";
import sendmail from "../Utils/sendMail.js";
import { sendTokens } from "../Utils/jwt.js";
// register a new user => /api/v1/register
export const registerUser = catchAsyncError(async (req, res) => {
    const { name, email, password } = req.body;
    const isEmailExist  = await userModel.findOne({ email });
    if (isEmailExist){
        return res.status(400).json({ message: "Email already exists" });
    }
    const user = { name, email, password };
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;

    const data ={
        user:{name:user.name },
        activationCode
    }
    try {
        await sendmail({
            email: user.email,
            subject: "Account Activation Link",
            template: "activation-mail.ejs",
            data 
        });
        res.status(200).json({ 
            message: "Account activation code sent to your email",
            activationToken: activationToken.token});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET, { expiresIn: '10m' });
    return { activationCode, token };
}

export const activaUserAccount = catchAsyncError(async (req, res) => {
    const {activationToken, activationCode} = req.body;
    if (!activationToken || !activationCode) {
        return res.status(400).json({ message: "Please provide activation code" });
    }
    let newUser 
    try {
        newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
    } catch (error) {
       return res.status(400).json({ message: "Invalid token or token expired" }); 
    }
    if (newUser.activationCode !== activationCode) {
        return res.status(400).json({ message: "Invalid activation code" });
    }
    const{ name, email, password } = newUser.user;
    const existsUser = await userModel.findOne({ email });
    if (existsUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    await userModel.create({ name, email, password });
    return res.status(201).json({
        message: "Account activated successfully",
        success: true
    })
});

// login user => /api/v1/login

export const loginUser = catchAsyncError(async (req, res) => {
    const {email, password} =req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }
    const user = await userModel.findOne({email}).select("+password");
    if(!user){
        return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    sendTokens(user, 200, res);
});