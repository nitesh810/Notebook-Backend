import bcrypt from 'bcrypt';
import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import fetchuser from "../middleware/fetchuser.js";
import User from "../models/User.js";

const router = Router();

const JWT_SECRET = "PassWorDISSecurE";

// ROUTE 1: Create a User using: POST "/auth/signup".
router.post('/signup', [
  body('firstName', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {

  // If there are errors, return Bad Request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry, a user with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: secPass,
      email: req.body.email,
    });

    const data = {
      user: {
        id: user.id,
      },
    };

    const authtoken = jwt.sign(data, JWT_SECRET);

    // Send the token in the response body
    res.json({ message: "User signup successfully", token: `Bearer ${authtoken}` });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
  
  // ROUTE 2: Authenticate a User using: POST "/auth/login". No login required
  // use POST in login because it securely sends data (like passwords) in the body of the request,
  // not the URL. This prevents sensitive data from being exposed in browser history, logs, or caches.
  router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ], async (req, res) => {

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Please try to login with correct credentials" });
      }
  
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Please try to login with correct credentials" });
      }
  
      const data = {
        user: {
          id: user.id
        }
      }
      
      // creating token
      const authtoken = jwt.sign(data, JWT_SECRET);

      // Send the token in the response body
      res.json({ message: "User login successfully", token: `Bearer ${authtoken}` });
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }  
  });

  
  // ROUTE 3: Get loggedin User Details using: POST "/auth/getuser". Login required
  router.post('/getuser', fetchuser,  async (req, res) => {
  
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })

export default router;