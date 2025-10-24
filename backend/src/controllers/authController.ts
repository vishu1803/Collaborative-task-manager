import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../types';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      
      const result = await AuthService.register(name, email, password);
      
      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: result
      };
      
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      res.status(400).json(response);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);
      
      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: result
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      res.status(401).json(response);
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      
      const user = await AuthService.getUserProfile(userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: user
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      res.status(404).json(response);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user._id.toString();
      const updates = req.body;
      
      const user = await AuthService.updateUserProfile(userId, updates);
      
      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: user
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      res.status(400).json(response);
    }
  }
}
