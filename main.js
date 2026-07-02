/*alert("hello");*/
document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const emptyImage = document.querySelector(".empty-image");
  const todoscontainer = document.querySelector(".todos-container");
  const progressBar = document.getElementById("progress");
  const progressNumbers = document.getElementById("numbers");
  const priorityInput = document.getElementById("priority-input");
  const dueDateInput = document.getElementById("due-date-input");
  const detailInput = document.getElementById("task-detail-input");
  const searchInput = document.getElementById("search-input");
  const noResultsMessage = document.getElementById("no-results");
  const searchBtn = document.getElementById("search-btn");
  const hideNoResults = () => {
    noResultsMessage.style.display = "none";
  };

  const searchTasks = () => {
    const query = searchInput.value.toLowerCase().trim();
    const tasks = taskList.querySelectorAll("li");
    let found = false;

    tasks.forEach((li) => {
      const taskText = li.querySelector(".task-text").textContent.toLowerCase();
      const matches = taskText.includes(query);

      li.style.display = matches || query === "" ? "flex" : "none";

      if (matches) {
        found = true;
      }
    });

    if (found || query === "") {
      noResultsMessage.style.display = "none";
    } else {
      noResultsMessage.style.display = "block";

      setTimeout(() => {
        noResultsMessage.style.display = "slide-down";
        searchInput.value = "";

        taskList.querySelectorAll("li").forEach((li) => {
          li.style.display = "flex";
        });
      }, 4000);
    }
  };
  searchBtn.addEventListener("click", searchTasks);
  taskInput.addEventListener("input", hideNoResults);
  detailInput.addEventListener("input", hideNoResults);
  const toggleEmptyState = () => {
    emptyImage.style.display =
      taskList.children.length === 0 ? "block" : "none";
    todoscontainer.style.width = taskList.children.length > 0 ? "100%" : "50%";
  };

  const updateProgress = (checkCompletion = true) => {
    const totalTasks = taskList.children.length;
    const completedTasks =
      taskList.querySelectorAll(".checkbox:checked").length;
    progressBar.style.width = totalTasks
      ? `${(completedTasks / totalTasks) * 100}%`
      : "0%";
    progressNumbers.textContent = `${completedTasks}/${totalTasks}`;
    if (checkCompletion && totalTasks > 0 && completedTasks === totalTasks) {
      Confetti();
    }
  };

  const saveTaskToLocal = () => {
    const tasks = Array.from(taskList.querySelectorAll("li")).map((li) => ({
      text: li.querySelector(".task-text").textContent,
      detail: li.querySelector(".task-detail")?.textContent || "",
      completed: li.querySelector(".checkbox").checked,
      priority: li.querySelector(".priority")?.textContent || "Medium",
      dueDate: li.querySelector(".due-date")?.getAttribute("data-due") || "",
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const loadTaskfromLocal = () => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    savedTasks.forEach(({ text, detail, completed, priority, dueDate }) =>
      addTask(text, completed, true, priority, dueDate, detail),
    );
    toggleEmptyState();
    updateProgress();
  };

  const addTask = (
    text,
    completed = false,
    checkCompletion = true,
    priority = "Medium",
    dueDate = "",
    detail = "",
  ) => {
    const taskText = text || taskInput.value.trim();
    const priorityValue = text ? priority : priorityInput.value;
    const dueDateValue = text ? dueDate : dueDateInput.value;
    const detailValue = text ? detail : detailInput.value.trim();
    if (!taskText) return;

    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.flexDirection = "row";
    li.style.alignItems = "flex-start";
    li.style.flexWrap = "wrap";
    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${completed ? "checked" : ""}/>
      <div class="task-content" style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px;">
        <span class="task-text" style="word-break: break-word; overflow-wrap: break-word; cursor: pointer;">${taskText}</span>
        <div class="task-details" style="display: none;">
          <p class="task-detail" style="margin: 0; color: #ccc;">${detailValue}</p>
          <div class="task-meta" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <p class="priority ${priorityValue.toLowerCase()}" style="margin: 0;">${priorityValue}</p>
            <p class="due-date" data-due="${dueDateValue}" style="margin: 0;">
              ${dueDateValue ? new Date(dueDateValue).toLocaleString() : ""}
            </p>
          </div>
        </div>
      </div>
      <div class="task-buttons" style="display: flex; gap: 5px; margin-left: auto;">
        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    const checkbox = li.querySelector(".checkbox");
    const editBtn = li.querySelector(".edit-btn");
    const taskTextElement = li.querySelector(".task-text");
    const taskDetailsElement = li.querySelector(".task-details");

    taskTextElement.addEventListener("click", () => {
      taskDetailsElement.style.display =
        taskDetailsElement.style.display === "none" ? "block" : "none";
    });

    if (completed) {
      li.classList.add("completed");
      editBtn.disabled = true;
      editBtn.style.opacity = "0.5";
      editBtn.style.pointerEvents = "none";
    }

    checkbox.addEventListener("change", () => {
      const isChecked = checkbox.checked;
      li.classList.toggle("completed", isChecked);
      editBtn.disabled = isChecked;
      editBtn.style.opacity = isChecked ? "0.5" : "1";
      editBtn.style.pointerEvents = isChecked ? "none" : "auto";
      updateProgress();
      saveTaskToLocal();
    });

    editBtn.addEventListener("click", () => {
      if (!checkbox.checked) {
        taskInput.value = li.querySelector(".task-text").textContent;
        detailInput.value = li.querySelector(".task-detail")?.textContent || "";
        priorityInput.value = li.querySelector(".priority").textContent.trim();
        dueDateInput.value =
          li.querySelector(".due-date")?.getAttribute("data-due") || "";
        li.remove();
        toggleEmptyState();
        updateProgress(false);
        saveTaskToLocal();
      }
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      li.remove();
      hideNoResults();
      toggleEmptyState();
      updateProgress();
      saveTaskToLocal();
    });

    taskList.appendChild(li);
    taskInput.value = "";
    priorityInput.value = "Medium";
    dueDateInput.value = "";
    detailInput.value = "";
    toggleEmptyState();
    updateProgress(checkCompletion);
    saveTaskToLocal();
  };

  addTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addTask();
  });

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  });

  toggleEmptyState();
  loadTaskfromLocal();
});

const Confetti = () => {
  const count = 200,
    defaults = {
      origin: { y: 0.7 },
    };

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      }),
    );
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
