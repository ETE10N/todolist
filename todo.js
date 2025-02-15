const fs = require('fs');
const readline = require('readline');

// File path for tasks
const TASKS_FILE = 'tasks.json';

// Load tasks from file
function loadTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks file:', error.message);
    return [];
  }
}

// Save tasks to file
function saveTasks(tasks) {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing tasks file:', error.message);
  }
}

// Find a task by ID
function findTaskById(tasks, id) {
  return tasks.find(task => task.id === id);
}

// Add a new task
async function addTask(tasks, rl) {
  const answer = await askQuestion(rl, 'Enter task description: ');
  if (answer.trim() === '') {
    console.log('Task description cannot be empty.');
    return;
  }
  const lastId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) : 0;
  const newTask = {
    id: lastId + 1,
    description: answer,
    completed: false
  };
  tasks.push(newTask);
  saveTasks(tasks);
  console.log(`Task "${newTask.description}" added successfully.`);
}

// Remove a task by ID
async function removeTask(tasks, rl) {
  const answer = await askQuestion(rl, 'Enter task ID to remove: ');
  const id = parseInt(answer);
  if (isNaN(id)) {
    console.log('Invalid task ID. Please enter a number.');
    return;
  }
  const task = findTaskById(tasks, id);
  if (!task) {
    console.log('Task not found.');
    return;
  }
  tasks = tasks.filter(task => task.id !== id);
  saveTasks(tasks);
  console.log(`Task "${task.description}" removed successfully.`);
}

// Mark a task as complete by ID
async function completeTask(tasks, rl) {
  const answer = await askQuestion(rl, 'Enter task ID to mark as complete: ');
  const id = parseInt(answer);
  if (isNaN(id)) {
    console.log('Invalid task ID. Please enter a number.');
    return;
  }
  const task = findTaskById(tasks, id);
  if (!task) {
    console.log('Task not found.');
    return;
  }
  if (task.completed) {
    console.log('Task is already completed.');
    return;
  }
  task.completed = true;
  saveTasks(tasks);
  console.log(`Task "${task.description}" marked as complete.`);
}

// List all tasks
function listTasks(tasks) {
  if (tasks.length === 0) {
    console.log('No tasks to display.');
    return;
  }
  console.log('Tasks:');
  tasks.forEach(task => {
    const checkbox = task.completed ? '[X]' : '[ ]';
    console.log(`${task.id}. ${checkbox} ${task.description}`);
  });
}

// Exit the application
function exitApp(tasks, rl) {
  saveTasks(tasks);
  console.log('Goodbye!');
  rl.close();
}

// Ask a question and return the answer
function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

// Command map
const commandMap = {
  'add': addTask,
  'remove': removeTask,
  'complete': completeTask,
  'list': listTasks,
  'exit': exitApp
};

// Main function to run the application
async function main() {
  const tasks = loadTasks();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Welcome to Task Manager!');

  while (true) {
    console.log('\nCommands:');
    console.log('add - Add a task');
    console.log('remove - Remove a task');
    console.log('complete - Mark a task as complete');
    console.log('list - List all tasks');
    console.log('exit - Exit the application');

    const command = await askQuestion(rl, 'Enter a command: ');
    const cmd = command.toLowerCase();
    if (commandMap.hasOwnProperty(cmd)) {
      if (cmd === 'exit') {
        commandMap[cmd](tasks, rl);
        break;
      } else {
        await commandMap[cmd](tasks, rl);
      }
    } else {
      console.log('Invalid command. Please try again.');
    }
  }
}

// Run the main function
main().catch(console.error);