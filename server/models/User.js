import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'educator', 'admin'], default: 'student' },
    imageUrl: { type: String, default: '' },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    refreshToken: { type: String, default: null },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User
