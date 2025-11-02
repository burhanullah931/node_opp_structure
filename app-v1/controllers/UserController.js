const ApiResponse = require('./../../utils/responses/ApiResponse');
const UserService = require('../services/UserService');
class UserController {
    static async login(req, res, next) {
      try {
        // Your login logic here
        const { email, password } = req.body;

        const response = await UserService.login(email, password);
        new ApiResponse(res, 200, response, 'Login successful').send();

      } catch (error) {
        console.error('Login error:', error);
        next(error);
      }
    }

    static async me(req, res, next) {
      try {
        const data = { user: req.auth?.user || null };
        new ApiResponse(res, 200, data, 'Authenticated user').send();
      } catch (error) {
        next(error);
      }
    }
  }
  
  module.exports = UserController;
