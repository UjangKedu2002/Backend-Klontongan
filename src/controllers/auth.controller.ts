import { Request, Response } from "express";

import prisma from "../lib/prisma";

import { comparePassword, hashPassword } from "../utils/bcrypt";

import { generateToken } from "../lib/jwt";

import { AuthRequest } from "../middleware/auth.middleware";

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    // VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // CHECK EMAIL
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await hashPassword(password);

    // CREATE USER
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // GENERATE TOKEN
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return res.status(201).json({
      success: true,

      message: "Register success",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Internal server error",

      error: error?.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // VALIDATION
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // FIND USER
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // CHECK PASSWORD
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // GENERATE TOKEN
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return res.status(200).json({
      success: true,

      message: "Login success",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Internal server error",

      error: error?.message,
    });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("ME ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Internal server error",

      error: error?.message,
    });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error: any) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Internal server error",

      error: error?.message,
    });
  }
};
