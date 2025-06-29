# TaskFlow

A modern, responsive task management app designed for productivity and ease of use.  
**Live Demo:** [taskflow.bwtechh.in](https://taskflow.bwtechh.in)

---

## Overview

TaskFlow is a web-based to-do and task management application that helps you organize your day, track progress, and stay focused. With a clean interface, smooth animations, and thoughtful features, TaskFlow is built for anyone who wants to get more done—students, professionals, or teams.

---

## Features

- **User Registration & Age Verification**  
  Sign up with your name and date of birth. Only users over 10 years old can register, ensuring a safe experience for younger users.

- **Persistent User Data**  
  Your tasks and profile are saved in your browser, so you can pick up where you left off—even after closing the tab.

- **Task Stages**  
  Organize tasks into "To Do", "Completed", and "Archived" lists. Move tasks between stages with a click.

- **Priority & Search**  
  Assign priorities (High, Medium, Low) to tasks. Instantly filter and search your tasks by keyword or priority.

- **API Integration**  
  On first use, TaskFlow loads sample tasks from the DummyJSON API. If the API is unavailable, fallback demo data is provided.

- **Export & Import**  
  Back up your tasks or move them between browsers with the export/import feature.

- **Keyboard Shortcuts & Touch Support**  
  Navigate quickly with keyboard shortcuts or swipe between tabs on mobile.

- **Responsive Design**  
  TaskFlow looks and works great on desktops, tablets, and smartphones.

- **Modern UI**  
  Enjoy a visually appealing interface with glassmorphism, gradients, and micro-interactions.

---

## Getting Started

### Quick Start

1. Visit [taskflow.bwtechh.in](https://taskflow.bwtechh.in)  
   _or_
2. Clone/download this repository and open `index.html` in your browser.

### Requirements

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or backend required

---

## Project Structure

```
Taskflow app/
├── index.html          # Landing page (registration & age verification)
├── app.html            # Main task management UI
├── css/
│   └── styles.css      # Custom styles (if any)
├── js/
│   ├── index.js        # Landing page logic
│   └── app.js          # Main app logic
└── README.md           # Project documentation
```

---

## How It Works

- **Registration:**  
  Enter your name and date of birth. If you're old enough, you'll be taken to the main app.

- **Task Management:**  
  Add new tasks, set their priority, and move them between stages. All changes are saved automatically.

- **Data Persistence:**  
  Your data is stored locally in your browser, tied to your user profile.

- **API Demo Data:**  
  On first use, sample tasks are loaded from an external API for a quick start.

- **Export/Import:**  
  Download your tasks as a JSON file or import them into another browser.

---

## Deployment

TaskFlow is live at:  
**[https://taskflow.bwtechh.in](https://taskflow.bwtechh.in)**

To deploy your own version:
- Host the contents of `Taskflow app/` on any static web server (GitHub Pages, Netlify, Vercel, etc.)
- No build step or backend required.

---

## Screenshots

<!-- Add screenshots here if desired -->

---

## Contributing

Contributions are welcome!  
If you have ideas, bug reports, or want to add features, feel free to open an issue or submit a pull request.

---

## Credits

- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [DummyJSON](https://dummyjson.com/) for sample task data
- [UI Avatars](https://ui-avatars.com/) for avatar generation

---

**TaskFlow – Where productivity meets simplicity.**
