const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const subjectInput = document.getElementById("subjectInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterInput = document.getElementById("filterInput");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const progressMessage = document.getElementById("progressMessage");
const taskCount = document.getElementById("taskCount");
const currentDate = document.getElementById("currentDate");
const focusText = document.getElementById("focusText");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

function setCurrentDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        month: "short",
        day: "numeric"
    };

    currentDate.textContent =
        today.toLocaleDateString("en-US", options);
}


function setMinimumDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    dateInput.min = `${year}-${month}-${day}`;

}


function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );

}

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const taskName = taskInput.value.trim();

    const subject = subjectInput.value;

    const priority = priorityInput.value;

    const dueDate = dateInput.value;


    if (taskName === "" || dueDate === "") {

        showToast("Please complete all fields.");

        return;

    }


    const newTask = {

        id: Date.now(),

        name: taskName,

        subject: subject,

        priority: priority,

        dueDate: dueDate,

        completed: false

    };


    tasks.push(newTask);


    saveTasks();

    renderTasks();

    updateStats();


    taskForm.reset();

    priorityInput.value = "Medium";


    showToast("Study task added successfully!");

});


function renderTasks() {

    const searchTerm =
        searchInput.value.toLowerCase().trim();

    const filter =
        filterInput.value;


    let filteredTasks = tasks.filter(function(task) {

        const matchesSearch =
            task.name.toLowerCase().includes(searchTerm) ||
            task.subject.toLowerCase().includes(searchTerm);


        let matchesFilter = true;


        if (filter === "completed") {

            matchesFilter = task.completed;

        }

        else if (filter === "pending") {

            matchesFilter = !task.completed;

        }

        else if (
            filter === "High" ||
            filter === "Medium" ||
            filter === "Low"
        ) {

            matchesFilter =
                task.priority === filter;

        }


        return matchesSearch && matchesFilter;

    });


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    }

    else {

        emptyState.style.display = "none";

    }


    filteredTasks.forEach(function(task) {

        const taskElement =
            createTaskElement(task);

        taskList.appendChild(taskElement);

    });


    updateTaskCount(filteredTasks.length);

}

function createTaskElement(task) {

    const taskItem = document.createElement("div");

    taskItem.className = "task-item";


    if (task.completed) {

        taskItem.classList.add("completed");

    }


    const checkButton =
        document.createElement("button");

    checkButton.className = "task-check";

    checkButton.innerHTML =
        task.completed
            ? '<i class="fa-solid fa-check"></i>'
            : "";


    checkButton.addEventListener(
        "click",
        function() {

            toggleTask(task.id);

        }
    );


    const taskInfo =
        document.createElement("div");

    taskInfo.className = "task-info";


    const taskName =
        document.createElement("div");

    taskName.className = "task-name";

    taskName.textContent = task.name;


    const taskMeta =
        document.createElement("div");

    taskMeta.className = "task-meta";


    const subjectBadge =
        document.createElement("span");

    subjectBadge.className =
        "badge subject-badge";

    subjectBadge.textContent =
        task.subject;


    const priorityBadge =
        document.createElement("span");

    priorityBadge.className =
        `badge priority-${task.priority.toLowerCase()}`;

    priorityBadge.textContent =
        `${task.priority} Priority`;


    const dueDate =
        document.createElement("span");

    dueDate.className = "due-date";

    dueDate.innerHTML =
        `<i class="fa-regular fa-calendar"></i>
         ${formatDate(task.dueDate)}`;


    taskMeta.appendChild(subjectBadge);

    taskMeta.appendChild(priorityBadge);

    taskMeta.appendChild(dueDate);


    taskInfo.appendChild(taskName);

    taskInfo.appendChild(taskMeta);


    const deleteButton =
        document.createElement("button");

    deleteButton.className = "delete-btn";

    deleteButton.innerHTML =
        '<i class="fa-solid fa-trash"></i>';


    deleteButton.addEventListener(
        "click",
        function() {

            deleteTask(task.id);

        }
    );


    taskItem.appendChild(checkButton);

    taskItem.appendChild(taskInfo);

    taskItem.appendChild(deleteButton);


    return taskItem;

}

function toggleTask(id) {

    tasks = tasks.map(function(task) {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };

        }

        return task;

    });


    saveTasks();

    renderTasks();

    updateStats();


    const task =
        tasks.find(function(item) {

            return item.id === id;

        });


    if (task.completed) {

        showToast("Great job! Task completed 🎉");

    }

    else {

        showToast("Task moved back to pending.");

    }

}


function deleteTask(id) {

    tasks = tasks.filter(function(task) {

        return task.id !== id;

    });


    saveTasks();

    renderTasks();

    updateStats();

    showToast("Task deleted.");

}


function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function updateStats() {

    const total = tasks.length;


    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;


    const pending =
        total - completed;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round((completed / total) * 100);

    }


    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;


    progressPercent.textContent =
        `${progress}%`;

    progressText.textContent =
        `${progress}%`;


    progressBar.style.width =
        `${progress}%`;


    updateProgressMessage(progress);

    updateFocusText(pending);

}

function updateProgressMessage(progress) {

    if (progress === 0) {

        progressMessage.textContent =
            "Start completing tasks to see your progress.";

    }

    else if (progress < 50) {

        progressMessage.textContent =
            "Good start! Keep working and stay consistent.";

    }

    else if (progress < 100) {

        progressMessage.textContent =
            "You're doing great! Keep pushing forward.";

    }

    else {

        progressMessage.textContent =
            "Amazing! You completed all your tasks! 🎉";

    }

}


function updateFocusText(pending) {

    if (pending === 0 && tasks.length > 0) {

        focusText.textContent =
            "Everything completed! 🎉";

    }

    else if (pending === 1) {

        focusText.textContent =
            "Finish your final task!";

    }

    else if (pending > 1) {

        focusText.textContent =
            `${pending} tasks waiting for you`;

    }

    else {

        focusText.textContent =
            "Let's get started!";

    }

}


function updateTaskCount(count) {

    taskCount.textContent =
        `${count} ${count === 1 ? "Task" : "Tasks"}`;

}


searchInput.addEventListener(
    "input",
    renderTasks
);


filterInput.addEventListener(
    "change",
    renderTasks
);


function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 2500);

}


setCurrentDate();

setMinimumDate();

renderTasks();

updateStats();