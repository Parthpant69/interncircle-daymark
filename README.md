# Daymark | To-do list

InternCircle Fullstack Web Development, Project 02.

## Run the app

Serve the directory containing `index.html`, `style.css`, and `app.js` with VS Code Live Server or another local HTTP server. Open the URL it displays. The app runs without dependencies or a build step.

Click **Add task** or press **Enter** to add a task. Use its checkbox to toggle completion and **Delete** to remove it. Use **All**, **Active**, or **Done** to filter the list, and **Clear completed** to remove every finished task.

## How saving and loading works

Each task has an ID, text, and a completion flag. After an add, toggle, delete, or clear action, I use `JSON.stringify()` to save the task array in `localStorage`. When the app opens, I use `JSON.parse()` to restore and validate that data, then rebuild the list and counter. Missing or invalid data starts an empty list, and a storage error shows a message while keeping the app usable.

Tasks are stored for the current browser and site URL.

## InternCircle submission

Include the publicly viewable live app link, the publicly viewable code link, and the saving and loading description above.
