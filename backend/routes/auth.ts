import express, { Router, Request, Response } from "express";
import User from "../database/models/user";
import jwtGenerator from "../utils/jwtGenerator";

const router: Router = express.Router();
const bcrypt: any = require("bcrypt");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

interface UserDetails {
  name: string;
  address: string;
  email: string;
  password: string;
  role: string
}

interface LoginDetails {
  email: string;
  password: string;
}

interface tokenDetails{ 
  token: string; 
}

router.post("/register", validInfo, async (req: Request, res: Response) => {
  try {
    const userDetails: UserDetails = req.body;

    // Error when user already exists
    const user: User | null = await User.findOne({
      where: { email: userDetails.email },
    });
    if (user) {
      return res.status(401).send({
        error: "The user already exists",
      });
    }

    // Hashing password
    const saltRounds: number = 10;
    const salt: any = await bcrypt.genSalt(saltRounds);
    const cryptedPassword: string = await bcrypt.hash(
      userDetails.password,
      salt
    );
    userDetails.password = cryptedPassword;

    // Insert new User
    await User.create(userDetails).then(user => {
      // Create JWT access token
      const token: string = jwtGenerator(user.id, userDetails.role);
      return res.status(202).json({token});
    }).catch((error: any) => {
      return res.status(400).send(error);
    })
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/login", validInfo, async(req: Request, res: Response) => {
  try {
    const loginDetails: LoginDetails = req.body;

    // Error user does not exist
    const user: User | null = await User.findOne({where: {email: loginDetails.email}});
    if(!user){
      return res.status(401).send({
        "error": "The user does not exist" 
      });
    }

    // Error wrong password
    const match = await bcrypt.compare(loginDetails.password, user.password);
    if(!match){
      return res.status(403).send({
        "error": "Invalid user credentials"
      })
    }

    // Generate JWT token
    const token = jwtGenerator(user.id, user.role);
    res.status(200).json({token});
  } catch (error) {
    return res.status(500).send(error);
  }
})

router.get("/is-verify", authorization, async(req: Request, res: Response) => {
  try {
    return res.send({
      result: true
    })
  } catch (error) {
    return res.status(500).send(error);
  }
})

export default router;
