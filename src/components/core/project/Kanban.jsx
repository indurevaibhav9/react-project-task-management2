import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { GripVertical, Calendar, User, AlertCircle } from 'lucide-react';
import { updateTasksStatus } from '../../../services/operations/taskAPI'; // Assume this function is defined to call the API
import { useSelector } from 'react-redux';
import { getTaskById } from '../../../services/operations/taskAPI';
import TaskComments from '../dashboard/TaskComments';

const KanbanBoard = forwardRef(({ tasksArray,setIsTaskModalOpen}, ref) => {
  const { userRole, userData, token } = useSelector((state) => state.auth || {});
  const toDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d === 'number') return new Date(d);
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date(d.replace(/-/g, '/')) : parsed;
  };

  const normalizePriority = (p) => {
    if (typeof p === 'number') return p === 2 ? 'High' : p === 0 ? 'Low' : 'Medium';
    if (typeof p === 'string') {
      const s = p.trim().toLowerCase();
      if (s === '2' || s === 'high') return 'High';
      if (s === '0' || s === 'low') return 'Low';
      return 'Medium';
    }
    return 'Medium';
  };

  const normalizeStatus = (s) => {
    if (typeof s === 'number') return s === 2 ? 'Done' : s === 1 ? 'Inprogress' : 'Todo';
    if (typeof s === 'string') {
      const st = s.trim().toLowerCase();
      if (st === '2' || st === 'done') return 'Done';
      if (st === '1' || st === 'inprogress' || st === 'in-progress') return 'Inprogress';
      // accept already normalized values
      if (st === 'todo' || st === 'inprogress' || st === 'done') return st === 'todo' ? 'Todo' : st === 'inprogress' ? 'Inprogress' : 'Done';
    }
    return 'Todo';
  };

  const normalizeTasks = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((t) => ({
      ...t,
      taskCreatedAt: toDate(t.taskCreatedAt) || null,
      taskDueDate: toDate(t.taskDueDate) || null,
      taskPriority: normalizePriority(t.taskPriority),
      taskStatus: normalizeStatus(t.taskStatus),
      taskId: typeof t.taskId === 'string' ? Number(t.taskId) || t.taskId : t.taskId,
    }));
  };

  const [tasks, setTasks] = useState(() => normalizeTasks(tasksArray));
  const [originalTasks, setOriginalTasks] = useState(() => normalizeTasks(tasksArray));

  useEffect(() => {
    const normalized = normalizeTasks(tasksArray);
    setTasks(normalized);
    setOriginalTasks(normalized);
  }, [tasksArray]);

  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Map status label to numeric value for API
  const statusToNumeric = (status) => {
    return status === 'Todo' ? 0 : status === 'Inprogress' ? 1 : 2;
  };
  // Get changed task IDs grouped by new status
  const getChangedTasks = () => {
    const TodoTaskIdUpdate = [];
    const InProgressTaskIdUpdate = [];
    const DoneTaskIdUpdate = [];

    tasks.forEach((currentTask) => {
      const originalTask = originalTasks.find(t => t.taskId === currentTask.taskId);
      
      // Only include if status changed
      if (originalTask && originalTask.taskStatus !== currentTask.taskStatus) {
        if (currentTask.taskStatus === 'Todo') {
          TodoTaskIdUpdate.push(currentTask.taskId);
        } else if (currentTask.taskStatus === 'Inprogress') {
          InProgressTaskIdUpdate.push(currentTask.taskId);
        } else if (currentTask.taskStatus === 'Done') {
          DoneTaskIdUpdate.push(currentTask.taskId);
        }
      }
    });
    console.log("Changed Tasks:", {
      todoTaskidUpdate:TodoTaskIdUpdate,
      inProgressTaskidUpdate:InProgressTaskIdUpdate,
      doneTaskidUpdate:DoneTaskIdUpdate,
    });
    return {
      todoTaskidUpdate:TodoTaskIdUpdate,
      inProgressTaskidUpdate:InProgressTaskIdUpdate,
      doneTaskidUpdate:DoneTaskIdUpdate,
    };
  };

  // removed unused taskView state
  const [isTaskCommentsOpen, setIsTaskCommentsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleTaskSelected = async (taskId) => {
    try {
      if (!taskId) return;
      // prefetch task details (TaskComments will also fetch, but we prefetch to validate)
      const resp = await getTaskById({ taskId, token })();
      if (!resp || resp === false) {
        console.error('Failed to fetch task details');
        return;
      }
      // Extract projectId from the task card (all tasks on this board share same project)
      const clickedTask = tasks.find(t => t.taskId === taskId);
      const projectId = clickedTask?.projectId;
      setSelectedProjectId(projectId);
      // Open comments/view for the task
      setSelectedTaskId(taskId);
      setIsTaskCommentsOpen(true);
    } catch (err) {
      console.error('Error selecting task:', err);
    }
  };
  // Expose getChangedTasks via ref for parent component to call
  useImperativeHandle(ref, () => ({
    getChangedTasks,
  }), [tasks, originalTasks]);

  const columns = [
    { id: 'Todo', title: 'To Do', color: 'bg-[#FCD5CF]' },
    { id: 'Inprogress', title: 'In Progress', color: 'bg-[#FFFACC]' },
    { id: 'Done', title: 'Done', color: 'bg-[#D4FFED]' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-400';
      case 'Medium': return 'bg-amber-400';
      case 'Low': return 'bg-emerald-400';
      default: return 'bg-gray-400';
    }
  };

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };

  const handleDragStart = (task, e) => {
    // start drag instantly using native dragEvent
    e.dataTransfer.setData("taskId", task.taskId);

    // defer state update so it doesn't block drag start UI
    requestAnimationFrame(() => {
      setDraggedTask(task);
    });
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnter = (columnId) => {
    requestAnimationFrame(() => {
      setDragOverColumn(columnId);
    });
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget === e.target) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (columnId, e) => {
    const nativeTaskId = e.dataTransfer.getData("taskId");

    if (nativeTaskId) {
      setTasks(prev =>
        prev.map(t =>
          t.taskId === Number(nativeTaskId)
            ? { ...t, taskStatus: columnId }
            : t
        )
      );
    }

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const formatDate = (dateString) => {
    const date = dateString ? (dateString instanceof Date ? dateString : new Date(dateString)) : null;
    if (!date || isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const TaskCard = ({ task }) => (
    <div
      draggable="true"
      onDragStart={(e) => handleDragStart(task, e)}
      onDragEnd={handleDragEnd}
      className={` bg-white rounded-lg shadow-sm border border-[#9CA3AF] p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        draggedTask?.taskId === task.taskId ? 'opacity-40 scale-95' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 text-sm flex-1">{task.taskTitle}</h3>
        <GripVertical className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </div>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.taskDescription}</p>

      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded-full border text-white font-bold border-[#1111115b] ${getPriorityColor(task.taskPriority)}`}>
          {task.taskPriority}
        </span>

          <div className="flex items-center gap-3 text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>User {task.userId}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.taskDueDate)}</span>
          </div>
          <button onClick={() => handleTaskSelected(task.taskId)} className='bg-black text-white p-2 rounded-lg cursor-pointer'>Details</button>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
        Project {task.projectId} • Task #{task.taskId}
      </div>
    </div>
  );

  const onClickHandler = async (e) => {
    e.preventDefault();
    console.log("Update Kanban clicked");
    const changedTasksBody = getChangedTasks();
    try {
      await updateTasksStatus({body:changedTasksBody, token})();
      // Optionally update originalTasks to reflect new state after successful update
      setOriginalTasks(tasks.map(t => ({ ...t })));
    } catch (err) {
      console.error("Failed to update tasks status", err);
    }
  };

  return (
    <>
      <div className="bg-linear-to-br from-slate-50 to-slate-100 p-8 ">
        <div className="max-w-7xl mx-auto border border-[#1111] shadow-lg p-6 rounded-lg bg-zinc-50">
          <div className='w-full flex justify-between'>
             <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Kanban Board</h1>
              </div>
              <div className='flex items-center gap-4'>
                {userRole === 1 && (
                      <button
                          onClick={() => setIsTaskModalOpen(true)}
                          className="px-4 py-4 bg-gray-900 text-white rounded-lg hover:bg-white hover:text-black transition text-sm font-medium cursor-pointer border "
                      >
                          + Create Task
                      </button>
                )}
                <button className="px-4 py-4 bg-gray-900 text-white rounded-lg hover:bg-white hover:text-black transition text-sm font-medium cursor-pointer border" onClick={onClickHandler}>Update Kanban</button></div>
              </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => {
              const columnTasks = tasks
                .filter(t => t.taskStatus === column.id)
                .sort((a, b) => (priorityOrder[a.taskPriority] ?? 1) - (priorityOrder[b.taskPriority] ?? 1));
              const isOver = dragOverColumn === column.id;

              return (
                <div key={column.id} className="flex flex-col">
                  <div className="">
                    <div className="flex items-center justify-between ml-2">
                      <h2 className="text-xl font-bold text-gray-800">{column.title}</h2>
                    </div>
                    <div className="h-1 bg-linear-to-r rounded-full"></div>
                  </div>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => handleDragEnter(column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(column.id, e)}
                    className={`${column.color} border border-[#1111] [&::-webkit-scrollbar]:bg-gray-50 [&::-webkit-scrollbar]:border [&::-webkit-scrollbar]:border-[#1111] [&::-webkit-scrollbar-thumb]:border-[#1111] [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-[3px] rounded-lg p-4 h-[400px] overflow-y-auto transition-all duration-200 ${
                      isOver ? "" : ""
                    }`}
                  >
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p className="text-sm">No tasks</p>
                        <p className="text-xs mt-1">Drag tasks here</p>
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <TaskCard key={task.taskId} task={task} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {isTaskCommentsOpen && (
        <TaskComments
          isOpen={isTaskCommentsOpen}
          onClose={() => setIsTaskCommentsOpen(false)}
          taskId={selectedTaskId}
          projectId={selectedProjectId}
          currentUserId={userData?.userId}
        />
      )}
    </>
  );
});

KanbanBoard.displayName = 'KanbanBoard';
export default KanbanBoard;
