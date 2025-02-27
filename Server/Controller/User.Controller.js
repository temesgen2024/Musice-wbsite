import userModel from "../Model/User.model";
import catchAsyncError from "../Middleware/CatchAsyncError";

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
        await sendMail({
            email: user.email,
            subject: "Account Activation Link",
            template: `Your account activation code is ${activationCode}`,
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
    const token = jwt.sign({ user, activationCode }, process.env.JWT_SECRET, { expiresIn: '10m' });
    return { activationCode, token };
}