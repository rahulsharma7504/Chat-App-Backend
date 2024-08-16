const User = require('../Model/userModel');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const cloudinary = require('../Config/Cloudinary');
const jwt = require('jsonwebtoken');
const ChatModel = require('../Model/chatModel');
const chatModel = require('../Model/chatModel');

// Function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Register new user
const Register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if email already exists in the database
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const file = req.file;
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.path);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,  // Use 'password' field here
      image: result.secure_url,
      refreshToken: null,  // Initialize refresh token field
    });


    await newUser.save();

    const { password: userPassword, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log('Registration failed', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email: email });
    if (!user) {

      return res.status(401).json({ message: 'Invalid email or password' });

    }

    const isMatch = await bcrypt.compare(password, user.password);  // Use 'password' field here
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to user model
    user.refreshToken = refreshToken;
    await user.save();

    // Exclude password from the user object
    const { password: userPassword, ...userWithoutPassword } = user.toObject();

    res.status(200).json({ message: 'Login Successfully', accessToken, refreshToken, user: userWithoutPassword });
  } catch (error) {
    console.log('Login failed', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const id = req.body.id; // Assuming `id` is an array of IDs

    const users = await User.find({ _id: { $nin: id } }).select('-password')


    res.status(200).json(users); // Send the users as the response
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
};

const userInfo = async (req, res) => {
  try {
    const id = req.body.id;
    const user = await User.findById(id).select('-password');
    res.status(200).send(user);  // Send the user as the response
  } catch (error) {
    if (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }

  }
}


const SearchUser = async (req, res) => {
  try {
    const query = req.query.search;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }  // Search for name and email fields in both cases
      ]
    })
    console.log(users);
  } catch (error) {
    if (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }

  }
}



const chatUser = async (req, res) => {
  try {
    const { senderId, reciverId, message } = req.body;
    console.log(senderId, reciverId, message);
    const SaveChat = new ChatModel({
      senderId: senderId,
      receiverId: reciverId,
      message: message
    })
    const newChat = await SaveChat.save();
    res.status(200).send(newChat);  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the


  } catch (error) {
    if (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }

  }
}

const deleteMessage = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id)
    const deleteChat = await ChatModel.findByIdAndDelete(id);
    res.status(200).send({ msg: 'Deleted' });  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the response  // Send the chat as the   

  } catch (error) {
    if (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }

  }
}


const updateMessage = async (req, res) => {
  try {
    const { id, message } = req.body;
    const updatedMessage = await chatModel.findByIdAndUpdate(
      id,
      { message: message },  // Update the message field
      { new: true }  // Return the updated document
    );

    res.status(200).send({ msg: 'Updated', updatedMessage });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  } 
};



module.exports = {
  Register,
  Login,
  getAllUsers,
  userInfo,
  SearchUser,
  chatUser,
  deleteMessage,
  updateMessage

};
