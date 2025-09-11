const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const usersPath = path.join(__dirname, '../data/users.json');

// Helper functions to work with user.json
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersPath, 'utf8');
    return JSON.parse(data).users;
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersPath, JSON.stringify({ users }, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.enrollment, 
      isAdmin: user.isAdmin 
    }, 
    process.env.JWT_SECRET || 'mockplacementsecret', 
    {
      expiresIn: '7d',
    }
  );
};

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    const { enrollment, password } = req.body;

    // Validate input
    if (!enrollment || !password) {
      return res.status(400).json({ message: 'Enrollment and password are required' });
    }

    if (!/^\d{12}$/.test(enrollment)) {
      return res.status(400).json({ message: 'Enrollment must be exactly 12 digits' });
    }

    if (!/^\d{3}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be exactly 3 digits' });
    }

    // Check if user exists
    const users = readUsers();
    const user = users.find(u => u.enrollment === enrollment);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password (plain text comparison as per requirement)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is approved
    if (!user.approved && !user.isAdmin) {
      return res.status(403).json({ message: 'Waiting for admin approval' });
    }

    // Return token and user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token: generateToken(user),
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { enrollment, password } = req.body;

    // Check if user exists and is admin
    const users = readUsers();
    const user = users.find(u => u.enrollment === enrollment && u.isAdmin);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Return token and user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token: generateToken(user),
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending approvals (for admin)
exports.getPendingApprovals = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = readUsers();
    const pendingUsers = users.filter(user => !user.approved && !user.isAdmin);
    
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve student (for admin)
exports.approveStudent = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { enrollment } = req.body;
    
    if (!enrollment) {
      return res.status(400).json({ message: 'Enrollment is required' });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.enrollment === enrollment);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex].approved = true;
    const success = writeUsers(users);
    
    if (!success) {
      return res.status(500).json({ message: 'Error saving user data' });
    }
    
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.enrollment === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, contact } = req.body;
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.enrollment === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user data
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (contact) users[userIndex].contact = contact;
    
    const success = writeUsers(users);
    
    if (!success) {
      return res.status(500).json({ message: 'Error saving user data' });
    }
    
    // Remove password from response
    const { password, ...updatedUser } = users[userIndex];
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = readUsers();
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { enrollment, password, name, email, contact, isAdmin, approved } = req.body;
    
    // Validate input
    if (!enrollment || !password || !name || !email || !contact) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^\d{12}$/.test(enrollment)) {
      return res.status(400).json({ message: 'Enrollment must be exactly 12 digits' });
    }

    if (!/^\d{3}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be exactly 3 digits' });
    }

    const users = readUsers();
    
    // Check if user already exists
    if (users.find(u => u.enrollment === enrollment)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = {
      enrollment,
      password,
      name,
      email,
      contact,
      isAdmin: isAdmin || false,
      approved: approved || false
    };

    users.push(newUser);
    const success = writeUsers(users);
    
    if (!success) {
      return res.status(500).json({ message: 'Error saving user data' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { enrollment } = req.params;
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.enrollment === enrollment);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(userIndex, 1);
    const success = writeUsers(users);
    
    if (!success) {
      return res.status(500).json({ message: 'Error saving user data' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};