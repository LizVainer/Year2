// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const methodOverride = require("method-override");
const User = require("./models/user"); // Your user model

// Initialize Express
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // For PUT and DELETE requests from forms
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend

// MongoDB connection setup
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1:27017/UsersDb")
  .then(() => {
    console.log("Mongo connection open!");
  })
  .catch((err) => {
    console.log("Mongo connection error:");
    console.log(err);
  });

// Routes

// 1. Homepage or Root Route (e.g., redirect to login)
app.get("/", (req, res) => {
  res.redirect("/login");
});

// 2. Login Route
app.get("/login", (req, res) => {
  res.send("Login page here"); // Your login page here (can be rendered or just send a message)
});

// 3. Handle Login POST request
app.post("/users/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name });

    if (!user) {
      return res.status(400).json({ message: "Wrong name" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Wrong password" });
    }

    return res.json({ message: "Login successful", id: user.id });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route 4: New User Creation (Render New User Form)
app.get("/users/new", (req, res) => {   
  res.render("users/new", { categories });  // Render the form for creating a new user, passing the categories as options
});

// Route 5: Show User Profile
app.get("/users/:id", async (req, res) => {    
  const { id } = req.params;  // Get the user ID from the URL parameters
  const user = await User.findById(id);   
  res.render("users/profile", { user });    // Render the user's profile page
});

// Route 6: List All Users or Filtered by Category
app.get("/users", async (req, res) => {   
  const { category } = req.query;   // Get the category from the query string (e.g., /users?category=Gobnik)
  if (category) {
    const users = await User.find({ category });  // Find users by the selected category
    res.render("users/index", { users, category });  // Render the list of users filtered by category
  } else {      // If no category is provided, show all users
    const users = await User.find({});
    res.render("users/index", { users, category: "All" });  // Show all users, and set category as "All"
  }
});

// Route 7: Handle POST request for creating a new user
// Route 7: Handle POST request for creating a new user
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  // Hash the password with bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);  // 10 salt rounds

  // Create a new user with hashed password
  const newUser = new User({
    name: name,  // Name of the user
    email: email,  // Email of the user
    password: hashedPassword  // Store hashed password in the database
  });

  await newUser.save();  // Save the new user
  res.redirect(`/users/${newUser.id}`);    // Redirect to the new user's profile page
});

// 4. Create new user (SignUp)
app.post("/users/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ name });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Create new user
  const newUser = new User({
    name,
    email,
    password,
  });

  try {
    await newUser.save(); // Save user to MongoDB
    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser.id });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 5. Get user profile
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 6. Update user
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 7. Delete user
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
