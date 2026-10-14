# Blush ♡

**Your space. Your rules.**

Blush is a privacy-themed social media website I made for my web development midterm. It's a pink, soft-looking feed where people can post their thoughts, like posts, and make a demo account.

## Pages

- `index.html`: the home feed where you can post and like
- `pages/login.html`: log in page
- `pages/signup.html`: sign up page
- `pages/profile.html`: shows the logged-in user's name and email
- `pages/about.html`: about Blush and the privacy promise

## Features

- Create posts (saved in the browser, so they stay after refresh)
- Like and unlike posts
- Demo sign up and log in
- Password check using a salted SHA-256 hash (the real password is never saved)
- Profile page and log out
- Responsive design for phone, tablet, and desktop

## Built with

- HTML
- CSS
- JavaScript (vanilla)
- VS Code + Live Server

## How to run

1. Download or clone this project.
2. Open the `webdev-midterm` folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server**.

## Folder structure

webdev-midterm
├── assets
├── pages
│ ├── about.html
│ ├── login.html
│ ├── profile.html
│ └── signup.html
├── src
│ ├── css
│ │ └── style.css
│ └── js
│ └── main.js
├── index.html
└── README.md


## Important note

Blush is a **frontend-only school project**. Accounts and posts are stored in the browser's localStorage, which is not secure, and nothing is sent to a server. Please don't use a real password or personal information.
