// =====================================
// BLUSH — SHARED HELPERS
// Frontend only. This is NOT real authentication.
// =====================================

const ACCOUNTS_KEY = "blushDemoAccounts";
const SESSION_KEY = "blushCurrentUser";
const POSTS_KEY = "blushPosts";
const DEFAULT_COLOR = "#f7a8c4";

function getAccounts() {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
    } catch {
        return [];
    }
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

function findAccount(email) {
    return getAccounts().find(function (account) {
        return account.email === email;
    }) || null;
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = "form-message show " + type;
}

function clearMessage(element) {
    element.textContent = "";
    element.className = "form-message";
}

function isValidColor(color) {
    return typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color);
}

function makeHandle(name) {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return "@" + (clean || "yourspace");
}

// Shows a photo if there is one, otherwise the first letter of the name.
function setAvatar(element, name, src) {
    element.textContent = "";

    if (typeof src === "string" && src.startsWith("data:image/")) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = name + "'s profile picture";
        element.append(img);
    } else {
        element.textContent = name.charAt(0);
    }
}

// Crops the image to a square and shrinks it so it's small enough to save.
function resizeImage(file, size) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onerror = reject;
        reader.onload = function () {
            const img = new Image();

            img.onerror = reject;
            img.onload = function () {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;

                const side = Math.min(img.width, img.height);
                const sx = (img.width - side) / 2;
                const sy = (img.height - side) / 2;

                canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, size, size);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };

            img.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}

function getSavedPosts() {
    try {
        const posts = JSON.parse(localStorage.getItem(POSTS_KEY));
        return Array.isArray(posts) ? posts : [];
    } catch {
        return [];
    }
}

function savePosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

// Removes every saved post that belongs to this user.
function removeUserPosts(user) {
    const remaining = getSavedPosts().filter(function (post) {
        // Older posts don't have an email, so fall back to the name.
        const isMine = post.email ? post.email === user.email : post.name === user.name;
        return !isMine;
    });

    savePosts(remaining);
}

function timeAgo(timestamp) {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + " min ago";

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");

    const days = Math.floor(hours / 24);
    return days + (days === 1 ? " day ago" : " days ago");
}

function buildPostElement(post) {
    // Use the author's latest profile (name, photo, color) if they still have an account.
    const author = post.email ? findAccount(post.email) : null;
    const name = author ? author.name : post.name;
    const handle = author ? makeHandle(author.name) : post.handle;

    const article = document.createElement("article");
    article.className = "post-card";
    article.dataset.id = post.id;

    const user = document.createElement("div");
    user.className = "post-user";

    const avatar = document.createElement("div");
    avatar.className = "avatar avatar-pink";
    setAvatar(avatar, name, author ? author.avatar : null);

    if (author && isValidColor(author.color)) {
        avatar.style.boxShadow = "0 0 0 3px " + author.color;
    }

    const userInfo = document.createElement("div");

    const username = document.createElement("strong");
    username.textContent = name + " ♡";

    const timestamp = document.createElement("p");
    timestamp.textContent = handle + " · " + timeAgo(post.time);

    userInfo.append(username, timestamp);
    user.append(avatar, userInfo);

    const postText = document.createElement("p");
    postText.className = "post-text";
    postText.textContent = post.text;

    const actions = document.createElement("div");
    actions.className = "post-actions";

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.className = "like-button" + (post.liked ? " liked" : "");
    likeButton.setAttribute("aria-pressed", String(Boolean(post.liked)));
    likeButton.append("♡ ");

    const likeCount = document.createElement("span");
    likeCount.textContent = post.likes;
    likeButton.append(likeCount);

    const commentButton = document.createElement("button");
    commentButton.type = "button";
    commentButton.className = "comment-button";
    commentButton.textContent = "comment";

    actions.append(likeButton, commentButton);
    article.append(user, postText, actions);

    return article;
}


// =====================================
// BLUSH — FEED (posts are saved in this browser)
// =====================================

const postForm = document.querySelector("#post-form");
const postContent = document.querySelector("#post-content");
const postList = document.querySelector("#post-list");

if (postForm && postContent && postList) {
    // Show saved posts (oldest first, so the newest ends up on top).
    getSavedPosts().forEach(function (post) {
        postList.prepend(buildPostElement(post));
    });

    postForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const content = postContent.value.trim();

        if (!content) return;

        const user = getCurrentUser();
        const name = user ? user.name : "you";

        const post = {
            id: Date.now(),
            name: name,
            email: user ? user.email : null,
            handle: makeHandle(name),
            text: content,
            time: Date.now(),
            likes: 0,
            liked: false
        };

        const posts = getSavedPosts();
        posts.push(post);
        savePosts(posts);

        postList.prepend(buildPostElement(post));
        postForm.reset();
    });
}

// Like and unlike posts.
document.addEventListener("click", function (event) {
    const button = event.target.closest(".like-button");

    if (!button) return;

    const count = button.querySelector("span");

    if (!count) return;

    const liked = button.classList.toggle("liked");
    const newCount = Number(count.textContent) + (liked ? 1 : -1);

    count.textContent = newCount;
    button.setAttribute("aria-pressed", String(liked));

    // If this is one of your saved posts, remember the like too.
    const article = button.closest(".post-card");
    const id = article ? article.dataset.id : null;

    if (id) {
        const posts = getSavedPosts();
        const target = posts.find(function (p) {
            return String(p.id) === id;
        });

        if (target) {
            target.liked = liked;
            target.likes = newCount;
            savePosts(posts);
        }
    }
});

// Demo comment interaction.
document.addEventListener("click", function (event) {
    const button = event.target.closest(".comment-button");

    if (!button) return;

    const post = button.closest(".post-card");
    if (!post) return;

    let comment = post.querySelector(".comment-input");

    if (comment) {
        comment.focus();
        return;
    }

    comment = document.createElement("textarea");
    comment.className = "comment-input";
    comment.placeholder = "write a comment...";
    comment.rows = 2;
    comment.setAttribute("aria-label", "Write a comment");

    post.append(comment);
    comment.focus();
});


// =====================================
// BLUSH — DEMO ACCOUNT FLOW
// =====================================

// ---------- PASSWORD HELPERS ----------
function makeSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, function (b) {
        return b.toString(16).padStart(2, "0");
    }).join("");
}

async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(salt + password);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer), function (b) {
        return b.toString(16).padStart(2, "0");
    }).join("");
}

// ---------- SIGNUP ----------
const signupForm = document.querySelector("#signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.querySelector("#signup-name").value.trim();
        const email = document.querySelector("#signup-email").value.trim().toLowerCase();
        const password = document.querySelector("#signup-password").value;
        const confirm = document.querySelector("#signup-confirm").value;
        const message = document.querySelector("#signup-message");

        if (password.length < 8) {
            showMessage(message, "your password needs at least 8 characters.", "error");
            return;
        }

        if (password !== confirm) {
            showMessage(message, "your passwords don't match. try again?", "error");
            return;
        }

        const accounts = getAccounts();

        if (accounts.some(function (account) { return account.email === email; })) {
            showMessage(message, "that email already has an account. try logging in instead.", "error");
            return;
        }

        const salt = makeSalt();
        const passwordHash = await hashPassword(password, salt);

        accounts.push({ name: name, email: email, salt: salt, passwordHash: passwordHash });
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        localStorage.setItem(SESSION_KEY, JSON.stringify({ name: name, email: email }));

        showMessage(message, "account created! taking you to your space ♡", "success");

        setTimeout(function () {
            window.location.href = "../index.html";
        }, 1200);
    });
}

// ---------- LOGIN ----------
const loginForm = document.querySelector("#login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.querySelector("#login-email").value.trim().toLowerCase();
        const password = document.querySelector("#login-password").value;
        const message = document.querySelector("#login-message");

        const account = findAccount(email);

        // Same message for both cases, so it doesn't reveal which emails exist.
        const failText = "wrong email or password. try again?";

        if (!account || !account.passwordHash) {
            showMessage(message, failText, "error");
            return;
        }

        const attempt = await hashPassword(password, account.salt);

        if (attempt !== account.passwordHash) {
            showMessage(message, failText, "error");
            return;
        }

        localStorage.setItem(SESSION_KEY, JSON.stringify({ name: account.name, email: account.email }));
        showMessage(message, "welcome back, " + account.name + " ♡", "success");

        setTimeout(function () {
            window.location.href = "../index.html";
        }, 1000);
    });
}

// ---------- LOGGED-IN STATE ON HOMEPAGE ----------
const loginLink = document.querySelector('.login-link[href="pages/login.html"]');
const currentUser = getCurrentUser();

if (loginLink && currentUser) {
    loginLink.textContent = "log out, " + currentUser.name + " ↗";
    loginLink.href = "#";

    loginLink.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem(SESSION_KEY);
        window.location.reload();
    });
}


// =====================================
// BLUSH — PROFILE PAGE
// =====================================

const profileCard = document.querySelector("#profile-card");
const profileGuest = document.querySelector("#profile-guest");

if (profileCard && profileGuest) {
    const avatarEl = document.querySelector("#profile-avatar");
    const nameEl = document.querySelector("#profile-name");
    const bioEl = document.querySelector("#profile-bio");
    const emailEl = document.querySelector("#profile-email");
    const profileMessage = document.querySelector("#profile-message");

    const editButton = document.querySelector("#edit-profile-button");
    const editForm = document.querySelector("#edit-profile-form");
    const nameInput = document.querySelector("#edit-name");
    const bioInput = document.querySelector("#edit-bio");
    const photoInput = document.querySelector("#edit-photo");
    const removePhotoButton = document.querySelector("#remove-photo-button");
    const avatarPreview = document.querySelector("#avatar-preview");
    const editMessage = document.querySelector("#edit-message");
    const cancelEditButton = document.querySelector("#cancel-edit-button");

    // null = photo unchanged, "" = photo removed, text = new photo
    let pendingAvatar = null;

    const renderProfile = function () {
        const user = getCurrentUser();
        if (!user) return;

        const account = findAccount(user.email) || user;
        const color = isValidColor(account.color) ? account.color : DEFAULT_COLOR;

        profileCard.style.setProperty("--profile-color", color);
        setAvatar(avatarEl, account.name, account.avatar);
        nameEl.textContent = account.name;
        emailEl.textContent = account.email;

        bioEl.textContent = account.bio || "";
        bioEl.hidden = !account.bio;
    };

    const selectColor = function (color) {
        const radios = editForm.querySelectorAll('input[name="profile-color"]');
        let matched = false;

        radios.forEach(function (radio) {
            const hit = radio.value.toLowerCase() === color.toLowerCase();
            radio.checked = hit;
            if (hit) matched = true;
        });

        if (!matched && radios[0]) radios[0].checked = true;
    };

    const openEditor = function () {
        const user = getCurrentUser();
        if (!user) return;

        const account = findAccount(user.email) || user;

        nameInput.value = account.name;
        bioInput.value = account.bio || "";
        photoInput.value = "";
        pendingAvatar = null;

        setAvatar(avatarPreview, account.name, account.avatar);
        selectColor(isValidColor(account.color) ? account.color : DEFAULT_COLOR);
        clearMessage(editMessage);
        clearMessage(profileMessage);

        editForm.hidden = false;
        editButton.hidden = true;
        nameInput.focus();
    };

    const closeEditor = function () {
        editForm.hidden = true;
        editButton.hidden = false;
    };

    if (getCurrentUser()) {
        renderProfile();
        profileCard.hidden = false;
    } else {
        profileGuest.hidden = false;
    }

    editButton.addEventListener("click", openEditor);
    cancelEditButton.addEventListener("click", closeEditor);

    // ---------- CHOOSE A PHOTO ----------
    photoInput.addEventListener("change", async function () {
        const file = photoInput.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showMessage(editMessage, "please pick an image file.", "error");
            photoInput.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage(editMessage, "that photo is too big. pick one under 5 MB.", "error");
            photoInput.value = "";
            return;
        }

        try {
            pendingAvatar = await resizeImage(file, 240);
            setAvatar(avatarPreview, nameInput.value.trim() || "?", pendingAvatar);
            clearMessage(editMessage);
        } catch {
            showMessage(editMessage, "couldn't read that photo. try another one?", "error");
            photoInput.value = "";
        }
    });

    removePhotoButton.addEventListener("click", function () {
        pendingAvatar = "";
        photoInput.value = "";
        setAvatar(avatarPreview, nameInput.value.trim() || "?", "");
    });

    // ---------- SAVE PROFILE ----------
    editForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const user = getCurrentUser();
        if (!user) return;

        const newName = nameInput.value.trim();

        if (!newName) {
            showMessage(editMessage, "your display name can't be empty.", "error");
            return;
        }

        const accounts = getAccounts();
        const account = accounts.find(function (item) {
            return item.email === user.email;
        });

        if (!account) {
            showMessage(editMessage, "couldn't find your account. try logging in again.", "error");
            return;
        }

        const chosen = editForm.querySelector('input[name="profile-color"]:checked');

        account.name = newName;
        account.bio = bioInput.value.trim();
        account.color = chosen ? chosen.value : DEFAULT_COLOR;

        if (pendingAvatar === "") {
            delete account.avatar;
        } else if (pendingAvatar) {
            account.avatar = pendingAvatar;
        }

        try {
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
            localStorage.setItem(SESSION_KEY, JSON.stringify({ name: account.name, email: account.email }));
        } catch {
            showMessage(editMessage, "couldn't save. the browser storage might be full.", "error");
            return;
        }

        renderProfile();
        closeEditor();
        showMessage(profileMessage, "profile updated ♡", "success");
    });

    // ---------- LOG OUT ----------
    const logoutButton = document.querySelector("#logout-button");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = "../index.html";
        });
    }

    // ---------- PRIVACY CONTROLS ----------
    const deletePostsButton = document.querySelector("#delete-posts-button");
    const deleteAccountButton = document.querySelector("#delete-account-button");
    const privacyMessage = document.querySelector("#privacy-message");

    if (deletePostsButton && privacyMessage) {
        deletePostsButton.addEventListener("click", function () {
            const user = getCurrentUser();
            if (!user) return;

            if (!confirm("Delete all your posts? This can't be undone.")) return;

            const before = getSavedPosts().length;
            removeUserPosts(user);
            const removed = before - getSavedPosts().length;

            showMessage(
                privacyMessage,
                removed + (removed === 1 ? " post deleted." : " posts deleted."),
                "success"
            );
        });
    }

    if (deleteAccountButton) {
        deleteAccountButton.addEventListener("click", function () {
            const user = getCurrentUser();
            if (!user) return;

            if (!confirm("Delete your account and all your posts? This can't be undone.")) return;

            removeUserPosts(user);

            const accounts = getAccounts().filter(function (account) {
                return account.email !== user.email;
            });

            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
            localStorage.removeItem(SESSION_KEY);

            window.location.href = "../index.html";
        });
    }
}