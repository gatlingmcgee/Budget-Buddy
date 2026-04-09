# Budget-Buddy - Finance Tracker

A full-stack web application that helps users manage their personal finances by tracking income, expenses, and category based spending. The application includes a dashboard with visual information to help users understand their financial habits and profile set up for multiple users.

Installation & Setup

1. Clone the repository
2. Install dependencies
   • npm install
3. Set up environment variables
   • Create a .env file in the root directory:
   • DATABASE_URL=postgresql://postgres:IbztEICsbNtErvQnGawqYOGHUIfICaOx@yamanote.proxy.rlwy.net:10412/railway
   • NEXTAUTH_SECRET="9w00wiejnrbdkjfbfjkbfu38239282938hrbd%$32"
   • NEXTAUTH_URL="http://localhost:3000"
4. Run database migrations
   • npx prisma migrate dev
5. Start development server
   • npm run dev
   Then open:
   http://localhost:3000

Features
User Account Management
• Secure user registration and login
• Passwords hashed using bcrypt
• Authentication handled with NextAuth.js
• User-specific data protection (each user sees only their own data)
Budget Management
• Set monthly budget (or total available funds)
• Define spending limits by category
• Edit and update budgets at any time
• Helps users plan monthly spending
Expense Tracking
• Add new expenses with category assignment
• View full list of expenses
• Edit or delete existing expenses
• Track spending history by month
Dashboard Overview
The dashboard provides a full financial summary of the user’s activity.
• Total income or budget
• Total expenses
• Remaining balance
• Recent transactions
• Visual pie chart
Technology Used
Next.js, React, Next.js API Routes, Node.js, Prisma ORM, SQL, NextAuth.js

Angel Lugo - My Favorite Quote:
“The Dalai Lama, when asked what surprised him most about humanity, answered "Man! Because he sacrifices his health in order to make money. Then he sacrifices money to recuperate his health. And then he is so anxious about the future that he does not enjoy the present; the result being that he does not live in the present or the future; he lives as if he is never going to die, and then dies having never really lived.” - Dalai Lama

Andrea's quote:
"All who call on God in true faith will certanly be heard." Martin Luther

Sean Sonderegger
“Let your light so shine before men, that they may see your good works.”
"All who call on God in true faith will certanly be heard." Martin Luther

Brandon's quote:
“It always seems impossible until it’s done.” Nelson Mandela.

<img src = "images/dashboardwireframe.png">
<img src = "images/expensewireframe.png">
<img src = "images/profilewireframe.png">
