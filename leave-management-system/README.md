# Leave Management System

Extracted and cleaned from Experiment 3, *Leave Management System*, in the uploaded FSWD lab manual (pages 88–104). Files are separated and formatting/syntax issues from the document extraction are cleaned up.

## Requirements
- Node.js and npm
- MongoDB Community Server running locally

## Run
1. Open this folder in VS Code.
2. In the terminal, run `npm install`.
3. Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017`.
4. Run `npm start`.
5. Open `http://localhost:5050`.
6. Create a user, then log in with the registered email.

## Features
- Register user with username, email and roll number
- Log in by email (simple lab-demo flow, not production authentication)
- View/refresh casual and medical leave balances
- Apply for leave; requested days are deducted from the selected balance

## Note about the source manual
The route shown in the manual adds leave days when a user applies. This version corrects that behavior to deduct the requested days and checks that the user has enough balance. The manual's email-only login is suitable only for a classroom demo; use password-based authentication and authorization before deploying a real system.
