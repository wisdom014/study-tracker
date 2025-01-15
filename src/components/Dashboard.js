import React, { useState, useEffect } from 'react';
import { Button, Typography, Card, CardContent, Grid, TextField, IconButton, Modal, Checkbox, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Checked icon
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NoteIcon from '@mui/icons-material/Note'; // Note icon
import './Dashboard.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currentSubtaskId, setCurrentSubtaskId] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtaskVisibility, setSubtaskVisibility] = useState({});

  useEffect(() => {
    // Simulate fetching data with a timeout
    setTimeout(() => {
      const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
      setTasks(storedTasks);
      setLoading(false); // Set loading to false once data is fetched
    }, 1500); // delay
  }, []);

  useEffect(() => {
    // load from localstorage
    if (!loading) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  // Load screen
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  const toggleSubtaskVisibility = (taskId) => {
    setSubtaskVisibility(prevState => ({
      ...prevState,
      [taskId]: !prevState[taskId]
    }));
  };

  // Add task
  const handleAddTask = () => {
    const newTask = { id: Date.now(), title: `Course ${tasks.length + 1}`, completed: false, subtasks: [] };
    setTasks([...tasks, newTask]);
    setEditingTaskId(newTask.id);
    setEditingTaskTitle(newTask.title);
  };

  // Remove Task
  const handleRemoveTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };

  // Edit Task 
  const handleEditTask = (taskId, title) => {
    setEditingTaskId(taskId);
    setEditingTaskTitle(title);
  };

  const handleUpdateTask = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, title: editingTaskTitle } : task
    );
    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  // Add Subtask
  const handleAddSubtask = (taskId) => {
    const newSubtask = { id: Date.now(), title: `Week ${tasks.find(task => task.id === taskId).subtasks.length + 1}`, completed: false, notes: [] };
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        // Set task completion to false when adding a new subtask
        return { ...task, subtasks: [...task.subtasks, newSubtask], completed: false };
      }
      return task;
    });
    handleEditSubtask(newSubtask.id, newSubtask.title);
    setTasks(updatedTasks);
  };

  // Remove Subtask
  const handleRemoveSubtask = (taskId, subtaskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.filter((subtask) => subtask.id !== subtaskId);
        // Check if all remaining subtasks are completed
        const allSubtasksCompleted = newSubtasks.every((subtask) => subtask.completed);
        return { ...task, subtasks: newSubtasks, completed: allSubtasksCompleted };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  // Edit Subtask
  const handleEditSubtask = (subtaskId, title) => {
    setEditingSubtaskId(subtaskId);
    setEditingSubtaskTitle(title);
  };

  const handleUpdateSubtask = (taskId, subtaskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, title: editingSubtaskTitle } : subtask
          ),
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const completed = !task.completed; // Toggle task completion
        const subtasks = task.subtasks.map((subtask) => {
          // Toggle completion
          const updatedNotes = subtask.notes.map(note => {
            // Toggle note completion if the task is completed
            return task.completed ? { ...note, completed: false } : { ...note, completed: true };
          });
          return { ...subtask, completed, notes: updatedNotes };
        });
        return { ...task, completed, subtasks }; // Update task
      }
      return task; // Return unchanged task
    });
    setTasks(updatedTasks);
  };

  //Subtask Toggle Completion
  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const subtasks = task.subtasks.map((subtask) => {
          if (subtask.id === subtaskId) {
            // Toggle subtask completion
            const isCompleted = !subtask.completed;
            const updatedNotes = subtask.notes.map(note => ({ ...note, completed: isCompleted }));
            return { ...subtask, completed: isCompleted, notes: updatedNotes };
          }
          return subtask;
        });
        const allSubtasksCompleted = subtasks.every((subtask) => subtask.completed);
        return { ...task, subtasks, completed: allSubtasksCompleted };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  // Progress  Calculation
  const calculateProgress = (subtasks, completed) => {
    if (subtasks.length === 0) {
      return completed ? 100 : 0; // If no subtasks, return 100% if completed, else 0%
    }
    const completedCount = subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
  };

  // Total progress calculation
  const calculateOverallProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Open modal
  const handleOpenModal = (subtaskId) => {
    const taskWithSubtask = tasks.find(task =>
      task.subtasks.some(sub => sub.id === subtaskId)
    );

    if (taskWithSubtask) {
      const currentSubtask = taskWithSubtask.subtasks.find(sub => sub.id === subtaskId);
      setCurrentSubtaskId(subtaskId);
      setCurrentTaskId(taskWithSubtask.id);
      setNotes(currentSubtask.notes || []);
      setOpenModal(true);
    } else {
      console.error("Subtask not found");
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentSubtaskId(null);
    setNotes([]);
  };

  // Add note
  const handleAddNote = () => {
    const newNoteId = Date.now();
    const newNote = { id: newNoteId, text: `Note ${notes.length + 1}`, completed: false };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setEditingNoteId(newNoteId);
    setEditingNoteText(`Note ${notes.length + 1}`);

    // Change the subtask's completion status to false when a new note is added
    const updatedTasks = tasks.map(task => {
      return {
        ...task,
        subtasks: task.subtasks.map(subtask => {
          if (subtask.id === currentSubtaskId) {
            return { ...subtask, completed: false, notes: updatedNotes };
          }
          return subtask;
        })
      };
    });
    setTasks(updatedTasks);
  };

  // Edit note
  const handleEditNote = (noteId, text) => {
    setEditingNoteId(noteId);
    setEditingNoteText(text);
  };

  const handleNoteChange = (text) => {
    setEditingNoteText(text);
  };

  // Note completion toggle
  const toggleNoteCompletion = (noteId) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return { ...note, completed: !note.completed }; // Toggle note completion
      }
      return note; // Return unchanged note
    });
    setNotes(updatedNotes);

    // Check if notes in the current subtask are completed
    const allNotesCompleted = updatedNotes.every(note => note.completed);

    const updatedTasks = tasks.map(task => {
      return {
        ...task,
        subtasks: task.subtasks.map(subtask => {
          if (subtask.id === currentSubtaskId) {
            // Update subtask completion status
            return { ...subtask, completed: allNotesCompleted, notes: updatedNotes };
          }
          return subtask; // Return unchanged subtask
        })
      };
    });

    // Check if all subtasks in the task are completed
    const allSubtasksCompleted = updatedTasks.find(task => task.id === currentTaskId).subtasks.every(subtask => subtask.completed);

    // Update the task's completion status
    const finalUpdatedTasks = updatedTasks.map(task => {
      if (task.id === currentTaskId) {
        return { ...task, completed: allSubtasksCompleted };
      }
      return task; // Return unchanged task
    });

    setTasks(finalUpdatedTasks);
  };

  //Delete note
  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    const updatedTasks = tasks.map(task => {
      return {
        ...task,
        subtasks: task.subtasks.map(subtask => {
          if (subtask.id === currentSubtaskId) {
            const allNotesCompleted = updatedNotes.every(note => note.completed);
            return { ...subtask, completed: allNotesCompleted, notes: updatedNotes };
          }
          return subtask;
        })
      };
    });
    setTasks(updatedTasks);
  };

  // Save note
  const handleSaveNotes = () => {
    const updatedTasks = tasks.map(task => {
      if (task.subtasks.some(subtask => subtask.id === currentSubtaskId)) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask => {
            if (subtask.id === currentSubtaskId) {
              const updatedNotes = notes.map(note => {
                if (note.id === editingNoteId) {
                  return { ...note, text: editingNoteText };
                }
                return note;
              });
              setNotes(updatedNotes);
              setEditingNoteId(null);
              setEditingNoteText('');
            }
            return subtask;
          })
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    // handleCloseModal();
  };

  return (
    <div className="container">
      <Typography variant="h4" style={{ fontSize: '30px', textAlign: 'center', fontWeight: '700' }} gutterBottom>
        Welcome to Your Study Tracker
      </Typography>
      <IconButton className='task-icon' style={{ position: 'fixed' }} onClick={handleAddTask}>
        <AddIcon className="add-task" style={{ width: '50px', height: '50px' }} />
      </IconButton>
      {/* Total progress */}
      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Overall Progress: {calculateOverallProgress()}%
      </Typography>
      {/* container */}
      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        <Grid item xs={12}>
          <Card>
            <CardContent style={{ padding: '20px 10px' }}>
              {/* Task */}
              <Typography variant="h5" style={{ fontWeight: '700' }}>Your Courses</Typography>
              {tasks.length === 0 ? (
                <Typography>No course available.</Typography>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="task-container">
                    <div className="task-header">
                      {/* task toggle completion */}
                      <div className="task-details">
                        {task.completed ? (
                          <CancelIcon
                            onClick={() => toggleTaskCompletion(task.id)}
                            style={{ cursor: 'pointer', color: 'red', width: '18px', height: '18px', marginRight: '4px' }}
                          />
                        ) : (
                          <CheckCircleIcon
                            onClick={() => toggleTaskCompletion(task.id)}
                            style={{ cursor: 'pointer', color: 'green', width: '18px', height: '18px', marginRight: '4px' }}
                          />
                        )}
                        <Typography
                          variant="h6"
                          style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', wordWrap: 'break-word', textWrap: 'wrap', wordBreak: 'break-word', cursor: 'pointer' }}
                          className={`task-title ${task.completed ? 'completed' : ''}`}
                        >
                          {editingTaskId === task.id ? (
                            <TextField
                              value={editingTaskTitle}
                              onChange={(e) => setEditingTaskTitle(e.target.value)}
                              onBlur={() => handleUpdateTask(task.id)}
                              autoFocus
                            />
                          ) : (
                            task.title
                          )}
                        </Typography>
                        <IconButton onClick={() => toggleSubtaskVisibility(task.id)}>
                          {subtaskVisibility[task.id] ? <ExpandLessIcon style={{ width: '15px', height: '15px' }} /> : <ExpandMoreIcon style={{ width: '15px', height: '15px' }} />}
                        </IconButton>
                        {/* task progress */}
                        <Typography variant="body2" className="task-progress" style={{ textAlign: 'center', margin: '0 auto', fontSize: '12px' }}>
                          Progress: {calculateProgress(task.subtasks, task.completed)}%
                        </Typography>
                      </div>
                      <div>
                        {/* task icons */}
                        <IconButton onClick={() => handleAddSubtask(task.id)}>
                          <AddIcon style={{ width: '20px', height: '20px' }} />
                        </IconButton>
                        <IconButton onClick={() => handleEditTask(task.id, task.title)}>
                          <EditIcon style={{ width: '20px', height: '20px' }} />
                        </IconButton>
                        <IconButton onClick={() => handleRemoveTask(task.id)}>
                          <DeleteIcon style={{ width: '20px', height: '20px' }} />
                        </IconButton>
                      </div>
                    </div>

                    {subtaskVisibility[task.id] && (
                      <div className="subtask-container">
                        {task.subtasks && task.subtasks.length > 0 ? (
                          task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="subtask">
                              <div className="sub-subtask">
                                {/* toggle completion */}
                                {subtask.completed ? (
                                  <CancelIcon
                                    onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                    style={{ cursor: 'pointer', color: 'red', marginLeft: '15px', width: '18px', height: '18px', marginRight: '5px' }}
                                  />
                                ) : (
                                  <CheckCircleIcon
                                    onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                    style={{ cursor: 'pointer', color: 'green', marginLeft: '15px', width: '18px', height: '18px', marginRight: '5px' }}
                                  />
                                )}
                                <Typography
                                  style={{ wordWrap: 'break-word', textWrap: 'wrap', wordBreak: 'break-word', cursor: 'pointer', fontSize: '15px', width: '' }}
                                  className={`subtask-title ${subtask.completed ? 'completed' : ''}`}
                                  onClick={() => handleEditSubtask(subtask.id, subtask.title)}
                                >
                                  {/* edit subtask */}
                                  {editingSubtaskId === subtask.id ? (
                                    <TextField
                                      value={editingSubtaskTitle}
                                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                      onBlur={() => handleUpdateSubtask(task.id, subtask.id)}
                                      autoFocus
                                    />
                                  ) : (
                                    subtask.title
                                  )}
                                </Typography>
                              </div>
                              <div>
                                {/* subtask icons */}
                                <IconButton onClick={() => handleOpenModal(subtask.id)}>
                                  <NoteIcon style={{ width: '20px', height: '20px' }} />
                                </IconButton>
                                <IconButton onClick={() => handleEditSubtask(subtask.id, subtask.title)}>
                                  <EditIcon style={{ width: '20px', height: '20px' }} />
                                </IconButton>
                                <IconButton onClick={() => handleRemoveSubtask(task.id, subtask.id)}>
                                  <DeleteIcon style={{ width: '20px', height: '20px' }} />
                                </IconButton>
                              </div>
                            </div>
                          ))
                        ) : (
                          <Typography>No Week available.</Typography>
                        )}
                      </div>
                    )}

                    {/* subtask container */}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal for Notes */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <div className="modal">
          <IconButton
            onClick={handleCloseModal}
            style={{ position: 'absolute', right: '0', top: '0', color: 'black' }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" style={{ fontWeight: '700' }}>Notes for Weeks</Typography>
          {notes.map((note) => (
            <div key={note.id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
              {/* Note completion status */}
              <Checkbox
                checked={note.completed}
                onChange={() => toggleNoteCompletion(note.id)}
              />
              {/* Edit the note text */}
              {editingNoteId === note.id ? (
                <TextField
                  value={editingNoteText}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  onBlur={handleSaveNotes}
                  autoFocus
                  fullWidth
                />
              ) : (
                // Display the note text
                <Typography
                  style={{ flexGrow: 1, textAlign: 'left', wordWrap: 'break-word', textWrap: 'wrap', wordBreak: 'break-word', cursor: 'pointer', textDecoration: note.completed ? 'line-through' : 'none' }}
                  onClick={() => handleEditNote(note.id, note.text)}
                >
                  {note.text}
                </Typography>
              )}
              {/* Delete and Edit icons */}
              <IconButton onClick={() => handleEditNote(note.id, note.text)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteNote(note.id)}>
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
          {/* Note buttons */}
          <Button onClick={handleAddNote} variant="contained" color="primary" style={{ marginTop: '10px' }}>
            Add Note
          </Button>
          <Button onClick={() => { handleSaveNotes(); handleCloseModal(); }} variant="contained" color="secondary" style={{ marginTop: '10px', marginLeft: '10px' }}>
            Save Notes
          </Button>
        </div>
      </Modal >
    </div >
  );
}

export default Dashboard;