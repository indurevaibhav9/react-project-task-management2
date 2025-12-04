import React, { useEffect } from 'react'
import KanbanBoard from '../project/Kanban'
import { useSelector } from 'react-redux'
import { getAllTasksForUser } from '../../../services/operations/taskAPI'

const Tasks = () => {
  const { userData } = useSelector((state) => state.auth || {});
  const {token} = useSelector((state) => state.auth || {})
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
   useEffect(() => {
      const fetchTasks = async () => {
        if (!userData) return;
  
        const userId = userData.userId;
        console.log("Fetching projects for userId:", userId);
        if (!userId) return;
  
        setLoading(true);
        setError(null);
        try {
          const response = await getAllTasksForUser({ userId,token })();
          const data = response.data;
          const tasksList = data || [];
          setTasks(Array.isArray(tasksList) ? tasksList : []);
        } catch (err) {
          console.error('Failed to fetch tasks for user', err);
          setError(err.message || 'Failed to fetch tasks');
        } finally {
          setLoading(false);
        }
      };
      fetchTasks();
    }, []);

  return (
    <div className="mx-16 flex items-center justify-center z-50 p-4 ">
    <div className='p-6 m-4 w-full'>
      <h2 className='text-3xl font-bold text-gray-800 mb-4'>Your Tasks</h2>
      <div className='text-gray-600'>
        <KanbanBoard tasksArray={tasks} />
      </div>
    </div>
    </div>
  )
}

export default Tasks
