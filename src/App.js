import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false); // State to control the edit modal visibility
  const [editingTaskIndex, setEditingTaskIndex] = useState(null); // State to track the task being edited

  const [taskState, setTaskState] = useState("Not done");

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef(null); // Ref to task title input
  const taskSummary = useRef(null); // Ref to task summary input
  const taskDeadline = useRef(null); // Ref to task deadline input

  const [sortState, setSortState] = useState(""); // State for sorting
  const [filterState, setFilterState] = useState(""); // State for filtering

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState,
      deadline: taskDeadline.current ? taskDeadline.current.value : "", // Add the deadline field
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  }

  function deleteTask(index) {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((_, i) => i !== index);
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  }

  function loadTasks() {
    const loadedTasks = localStorage.getItem("tasks");
    if (loadedTasks) {
      setTasks(JSON.parse(loadedTasks));
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Filter tasks based on selected filter state
  const filteredTasks = tasks.filter((task) => {
    if (filterState === "Done") return task.state === "Done";
    if (filterState === "Doing") return task.state === "Doing right now";
    if (filterState === "Not done") return task.state === "Not done";
    return true; // No filtering if no state is selected
  });

  // Sort tasks based on selected sorting state
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortState === "Done") {
      return b.state === "Done" ? 1 : a.state === "Done" ? -1 : 0;
    } else if (sortState === "Doing") {
      return b.state === "Doing right now" ? 1 : a.state === "Doing right now" ? -1 : 0;
    } else if (sortState === "Not done") {
      return b.state === "Not done" ? 1 : a.state === "Not done" ? -1 : 0;
    } else if (sortState === "Deadline") {
      const deadlineA = new Date(a.deadline);
      const deadlineB = new Date(b.deadline);
      return deadlineA - deadlineB; // Sort by deadline ascending
    }
    return 0; // No sorting if no state is selected
  });

  // Function to open the edit modal and pre-fill the form fields with the task data
  function openEditModal(index) {
    setEditingTaskIndex(index);
    const task = tasks[index];
    setTaskState(task.state); // Set the task state to pre-select it in the dropdown
    setEditOpened(true);
  }

  // Function to save edited task
  function saveEditedTask() {
    const updatedTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState,
      deadline: taskDeadline.current ? taskDeadline.current.value : "", // Update the deadline
    };
    const updatedTasks = [...tasks];
    updatedTasks[editingTaskIndex] = updatedTask;
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditOpened(false);
  }

  useEffect(() => {
    if (editOpened && taskTitle.current && taskSummary.current && taskDeadline.current) {
      const task = tasks[editingTaskIndex];
      if (task) {
        taskTitle.current.value = task.title; // Set title input field
        taskSummary.current.value = task.summary; // Set summary input field
        taskDeadline.current.value = task.deadline; // Set deadline input field
      }
    }
  }, [editOpened, editingTaskIndex, tasks]);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          {/* New Task Modal */}
          <Modal
            opened={opened}
            size={"md"}
            title={"New Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle} // Ref to input
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary} // Ref to input
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              label="State"
              value={taskState}
              onChange={setTaskState}
              data={["Done", "Not done", "Doing right now"]}
              mt="md"
            />
            {/* Standard Date input */}
            <input
              ref={taskDeadline}
              type="date"
              label="Deadline"
              placeholder="Pick a date"
              className="mantine-TextInput-input"
              style={{ marginTop: '12px' }}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createTask();
                  setOpened(false);
                }}
              >
                Create Task
              </Button>
            </Group>
          </Modal>

          {/* Edit Task Modal */}
          <Modal
            opened={editOpened}
            size={"md"}
            title={"Edit Task"}
            withCloseButton={false}
            onClose={() => setEditOpened(false)}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle} // Ref to input
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary} // Ref to input
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              label="State"
              value={taskState}
              onChange={setTaskState}
              data={["Done", "Not done", "Doing right now"]}
              mt="md"
            />
            {/* Standard Date input */}
            <input
              ref={taskDeadline}
              type="date"
              label="Deadline"
              placeholder="Pick a date"
              className="mantine-TextInput-input"
              style={{ marginTop: '12px' }}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setEditOpened(false);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button onClick={saveEditedTask}>Save Changes</Button>
            </Group>
          </Modal>

          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>

            <Group position="apart" mt="md">
              <Button onClick={() => setSortState("Done")}>Show 'Done' first</Button>
              <Button onClick={() => setSortState("Doing")}>Show 'Doing' first</Button>
              <Button onClick={() => setSortState("Not done")}>Show 'Not done' first</Button>
              <Button onClick={() => setSortState("Deadline")}>Sort by deadline</Button>
            </Group>

            <Group position="apart" mt="md">
              <Button onClick={() => setFilterState("Done")}>Show only 'Done'</Button>
              <Button onClick={() => setFilterState("Doing")}>Show only 'Doing'</Button>
              <Button onClick={() => setFilterState("Not done")}>Show only 'Not done'</Button>
            </Group>

            {sortedTasks.length > 0 ? (
              sortedTasks.map((task, index) => {
                if (task.title) {
                  return (
                    <Card withBorder key={index} mt={"sm"}>
                      <Group position={"apart"}>
                        <Text weight={"bold"}>{task.title}</Text>
                        <Group>
                          {/* Edit Button */}
                          <ActionIcon
                            onClick={() => openEditModal(index)}
                            color={"blue"}
                            variant={"transparent"}
                          >
                            <Edit />
                          </ActionIcon>
                          {/* Delete Button */}
                          <ActionIcon
                            onClick={() => {
                              deleteTask(index);
                            }}
                            color={"red"}
                            variant={"transparent"}
                          >
                            <Trash />
                          </ActionIcon>
                        </Group>
                      </Group>
                      <Text color={"dimmed"} size={"md"} mt={"sm"}>
                        {task.summary
                          ? task.summary
                          : "No summary was provided for this task"}
                      </Text>
                      <Text mt={"md"} color={"dimmed"}>
                        <strong>State: </strong>{task.state}
                      </Text>
                      <Text mt={"md"} color={"dimmed"}>
                        <strong>Deadline: </strong>{task.deadline || "No deadline set"}
                      </Text>
                    </Card>
                  );
                }
              })
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}

            <Button
              onClick={() => {
                setOpened(true);
              }}
              fullWidth
              mt={"md"}
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
