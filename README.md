# Blush ♡

**Your space. Your rules.**

Blush is a privacy-themed social media prototype I made for my web development midterm. It's a soft pink feed where people can post their thoughts, like posts, make a demo account, and control their own data. It's built with only HTML, CSS, and vanilla JavaScript, with no backend, database, or API.

## Pages

- `index.html`: the main feed where you can post and like
- `pages/login.html`: log in page
- `pages/signup.html`: sign up page
- `pages/profile.html`: your profile, log out, and privacy controls
- `pages/about.html`: about Blush and the privacy promise

## Features

- Create posts (saved in the browser, so they stay after refresh)
- Like and unlike posts
- Demo sign up and log in
- Password check using a salted SHA-256 hash (the real password is never saved)
- Profile page and log out
- Privacy controls: delete your own posts or your whole account from the profile page
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

```
webdev-midterm
├── assets
│   └── img
├── pages
│   ├── about.html
│   ├── login.html
│   ├── profile.html
│   └── signup.html
├── src
│   ├── css
│   │   └── style.css
│   └── js
│       └── main.js
├── index.html
└── README.md
```

## How the privacy part works

- No ads, no trackers, and no data is sent to a server.
- Accounts and posts are stored only in your own browser (localStorage).
- Only your name, email, and a salted hash of your password are stored.
- You can delete your posts or your account anytime from the profile page.

## Notes on AI use

I used AI (Claude and ChatGPT) as a guide while building this project. It helped me with the page layouts, the CSS, and the JavaScript for posting, likes, and the demo login. I pasted, tested, and fixed the code myself, including a wrong file path that was breaking my JavaScript. I still want to understand how everything works properly in our next lessons.

## Limitations

- Everything is saved in the browser's localStorage, so nothing is shared between devices or browsers.
- The demo login only stores a salted SHA-256 hash of the password. A real app needs a backend with proper password hashing, so please don't use a real password.
- The posts from other users in the feed are fake demo posts.
