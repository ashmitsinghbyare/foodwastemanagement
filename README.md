# Food Waste Management System

A comprehensive web application that connects food donors with receivers to reduce waste and serve those in need.

## Key Features

- **Multi-role System**: Supports donors, receivers, and admin roles
- **Food Donation Management**: List, manage, and track food donations
- **Request System**: Receivers can request food items from donors
- **Notification System**: Real-time notifications for all users
- **Feedback & Testimonials**: Users can leave feedback and view testimonials
- **Profile Management**: Comprehensive user profile management
- **Admin Dashboard**: Complete administrative control over the system

## Technologies

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: EJS templates, JavaScript, Bootstrap
- **Authentication**: Passport.js with local strategy
- **File Uploads**: Multer
- **Notifications**: Custom notification system

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/food-waste-management.git
   cd food-waste-management
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   ```

4. Start the application
   ```bash
   npm start
   ```

5. Visit `http://localhost:5000` in your browser

## Project Structure

```
├── config              # Configuration files
├── controllers         # Route controllers
├── middleware          # Custom middleware
├── models              # Mongoose models
├── public              # Static assets
│   ├── css             # Stylesheets
│   ├── images          # Images
│   ├── js              # JavaScript files
│   └── uploads         # User uploaded files
├── routes              # Express routes
├── utils               # Utility functions
├── views               # EJS templates
└── app.js              # Entry point
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
