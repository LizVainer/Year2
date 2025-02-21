import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: false },
    password: { type: String, required: true },
    favorites: [
      {
        id: String,
        name: String,
        lat: Number,
        lng: Number,
      },
    ],
    age: { type: Number, min: 10, max: 100, required: false },
    religion: { type: String, required: false },
    ethnicity: { type: String, required: false },
    interest: { type: String, required: false },
    gender: { type: String, required: false },
    profilePic: { type: String, required: false, default: "" },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    joinedEvents: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
