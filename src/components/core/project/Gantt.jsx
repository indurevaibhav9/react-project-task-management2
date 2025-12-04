import React from 'react';
import { Calendar } from 'lucide-react';

const Index = ({ tasks }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const toDate = (d) => {
    if (!d) return new Date();
    if (d instanceof Date) return d;
    // handle numeric timestamps
    if (typeof d === 'number') return new Date(d);
    // handle string dates
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date(d.replace(/-/g, '/')) : parsed;
  };

  const normalizePriority = (p) => {
    if (!p && p !== 0) return 'Medium';
    if (typeof p === 'number') {
      // Map numeric priority (1=High, 2=Medium, 3=Low)
      return p === 1 ? 'High' : p === 3 ? 'Low' : 'Medium';
    }
    if (typeof p === 'string') {
      const s = p.trim().toLowerCase();
      if (s === 'high' || s === '1') return 'High';
      if (s === 'low' || s === '3') return 'Low';
      return 'Medium';
    }
    return 'Medium';
  };

  const normalizeStatus = (s) => {
    if (!s && s !== 0) return 'Todo';
    if (typeof s === 'number') {
      // Map numeric status (0=Todo, 1=Inprogress, 2=Done)
      return s === 2 ? 'Done' : s === 1 ? 'Inprogress' : 'Todo';
    }
    if (typeof s === 'string') {
      const st = s.trim().toLowerCase();
      if (st === 'done' || st === '2') return 'Done';
      if (st === 'inprogress' || st === 'in-progress' || st === '1') return 'Inprogress';
      if (st === 'todo' || st === '0') return 'Todo';
      return 'Todo';
    }
    return 'Todo';
  };

  // Normalize incoming tasks safely (accept single task or different shapes)
  const normalizedTasks = Array.isArray(tasks)
    ? tasks.map((t) => ({
        ...t,
        taskCreatedAt: toDate(t.taskCreatedAt),
        taskDueDate: toDate(t.taskDueDate),
        taskPriority: normalizePriority(t.taskPriority),
        taskStatus: normalizeStatus(t.taskStatus),
      }))
    : [];

  console.log('Tasks in Gantt Chart (normalized):', normalizedTasks);

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const sortedTasks = [...normalizedTasks].sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return (priorityOrder[a.taskPriority] ?? 1) - (priorityOrder[b.taskPriority] ?? 1);
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-400';
      case 'Medium': return 'bg-amber-400';
      case 'Low': return 'bg-emerald-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-500';
      case 'Inprogress': return 'bg-blue-500';
      case 'Todo': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getDateRange = () => {
    const allDates = normalizedTasks.flatMap((task) => [task.taskCreatedAt, task.taskDueDate]);
    if (allDates.length === 0) {
      const now = new Date();
      return { minDate: addDays(now, -30), maxDate: addDays(now, 30) };
    }

    const minDate = new Date(Math.min(...allDates.map((d) => toDate(d).getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => toDate(d).getTime())));

    // Ensure the current date is included in the range
    const today = new Date();
    if (today < minDate) minDate.setTime(today.getTime());
    if (today > maxDate) maxDate.setTime(today.getTime());

    // Add padding to the date range
    minDate.setDate(1);
    minDate.setMonth(minDate.getMonth() - 1);
    maxDate.setMonth(maxDate.getMonth() + 2);
    maxDate.setDate(0);

    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getDateRange();
  
  const generateMonths = () => {
    const months = [];
    let current = new Date(minDate);
    
    while (current <= maxDate) {
      months.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        name: current.toLocaleDateString('en-US', { month: 'short' }),
        fullName: current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startDate: new Date(current),
        endDate: new Date(current.getFullYear(), current.getMonth() + 1, 0)
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const months = generateMonths();
  
  const getTotalMilliseconds = () => {
    return maxDate.getTime() - minDate.getTime();
  };

  const getTaskPosition = (task) => {
    const totalMs = getTotalMilliseconds();
    const taskStartMs = task.taskCreatedAt.getTime() - minDate.getTime();
    const taskEndMs = task.taskDueDate.getTime() - minDate.getTime();
    
    const left = (taskStartMs / totalMs) * 100;
    const width = ((taskEndMs - taskStartMs) / totalMs) * 100;
    
    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.max(2, width)}%`
    };
  };

  const getTodayPosition = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const totalMs = getTotalMilliseconds();
    const todayMs = today.getTime() - minDate.getTime();
    
    const position = (todayMs / totalMs) * 100;
    
    return Math.max(0, Math.min(100, position));
  };

  const getQuarters = () => {
    const quarters = [];
    const startYear = minDate.getFullYear();
    const endYear = maxDate.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      for (let q = 1; q <= 4; q++) {
        const quarterStart = new Date(year, (q - 1) * 3, 1);
        const quarterEnd = new Date(year, q * 3, 0);
        
        if (quarterEnd >= minDate && quarterStart <= maxDate) {
          quarters.push({
            quarter: q,
            year,
            label: `Q${q} ${year}`,
            startMonth: (q - 1) * 3,
            endMonth: q * 3 - 1
          });
        }
      }
    }
    return quarters;
  };

  const quarters = getQuarters();

  const getQuarterSpans = () => {
    const spans = [];
    
    quarters.forEach(quarter => {
      const quarterMonths = months.filter(month => 
        month.year === quarter.year && 
        month.month >= quarter.startMonth && 
        month.month <= quarter.endMonth
      );
      
      if (quarterMonths.length > 0) {
        const startIndex = months.findIndex(m => 
          m.year === quarterMonths[0].year && 
          m.month === quarterMonths[0].month
        );
        
        spans.push({
          quarter: quarter.label,
          span: quarterMonths.length,
          startIndex: startIndex
        });
      }
    });
    
    return spans;
  };

  const quarterSpans = getQuarterSpans();

  const todayPosition = getTodayPosition();

  return (
     <div className=" bg-linear-to-br from-slate-50 to-slate-100 p-8 ">
    <div className=" bg-gray-50 p-8 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gantt Chart</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Legend */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-6 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Priority:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-emerald-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Quarter Header */}
              <div className="flex border-b border-gray-200 bg-gray-100">
                <div className="w-64 shrink-0 border-r border-gray-300"></div>
                <div className="flex-1 flex">
                  {quarterSpans.map((span, idx) => (
                    <div
                      key={idx}
                      className="text-center py-2 text-sm font-semibold text-gray-700 border-r border-gray-300"
                      style={{ width: `${(span.span / months.length) * 100}%` }}
                    >
                      {span.quarter}
                    </div>
                  ))}
                </div>
              </div>

              {/* Month Header */}
              <div className="flex border-b-2 border-gray-300 bg-gray-50">
                <div className="w-64 shrink-0 p-3 font-semibold text-gray-700 border-r border-gray-300">
                  Task Name
                </div>
                <div className="flex-1 flex">
                  {months.map((month, index) => (
                    <div
                      key={index}
                      className="flex-1 text-center py-2 text-sm font-medium text-gray-600 border-r border-gray-200"
                    >
                      {month.name} '{month.year.toString().slice(-2)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Rows */}
              <div className="flex">
                {/* Task Names Column */}
                <div className="w-64 shrink-0">
                  {sortedTasks.map((task, index) => {
                    const priorityColor = getPriorityColor(task.taskPriority);
                    const statusColor = getStatusColor(task.taskStatus);
                    
                    return (
                      <div
                        key={task.taskId}
                        className={`px-4 border-r border-b border-gray-100 flex items-center ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                        style={{ height: '60px' }}
                      >
                        <div>
                          <div className="font-medium text-gray-800 text-sm mb-1">
                            {task.taskTitle}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${priorityColor} bg-opacity-20 font-medium`}>
                              {task.taskPriority}
                            </span>
                            <span className="text-xs text-gray-500">
                              User {task.userId}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${statusColor}`} title={task.taskStatus}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline Area */}
                <div className="flex-1 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {months.map((_, index) => (
                      <div
                        key={index}
                        className="flex-1 border-r border-gray-100"
                      ></div>
                    ))}
                  </div>

                  {/* Task Bars */}
                  {sortedTasks.map((task, index) => {
                    const priorityColor = getPriorityColor(task.taskPriority);
                    const position = getTaskPosition(task);
                    
                    return (
                      <div
                        key={task.taskId}
                        className={`relative px-2 border-b border-gray-100 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                        style={{ height: '60px' }}
                      >
                        <div
                          className="absolute h-4"
                          style={{ 
                            left: position.left, 
                            width: position.width,
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          {/* Start Marker */}
                          <div className="absolute left-0 w-1.5 h-1.5 bg-gray-700 rounded-full -translate-x-1 z-10" 
                               style={{ top: '50%', transform: 'translate(-50%, -50%)' }}></div>
                          
                          {/* Bar */}
                          <div className={`h-full ${priorityColor} rounded shadow-sm relative overflow-hidden flex items-center`}>
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-30"></div>
                            {task.taskStatus === 'Done' && (
                              <div className="absolute inset-0 bg-green-200 opacity-40"></div>
                            )}
                            {task.taskStatus === 'Inprogress' && (
                              <div className="absolute inset-0 bg-blue-200 opacity-40"></div>
                            )}
                          </div>
                          
                          {/* End Marker */}
                          <div className="absolute right-0 w-1.5 h-1.5 bg-gray-700 rounded-full translate-x-1 z-10" 
                               style={{ top: '50%', transform: 'translate(50%, -50%)' }}></div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Today Marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-800 z-20 pointer-events-none shadow-lg"
                    style={{ 
                      left: `${todayPosition}%`
                    }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-blue-500"></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-sm">
                      Today
                      <div className="text-xs opacity-90">{currentDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>Total Tasks: <strong className="text-gray-800">{normalizedTasks.length}</strong></span>
                <span className="text-gray-300">•</span>
                <span>High Priority: <strong className="text-red-600">{normalizedTasks.filter(t => t.taskPriority === 'High').length}</strong></span>
                <span className="text-gray-300">•</span>
                <span>Medium Priority: <strong className="text-amber-600">{normalizedTasks.filter(t => t.taskPriority === 'Medium').length}</strong></span>
                <span className="text-gray-300">•</span>
                <span>Low Priority: <strong className="text-emerald-600">{normalizedTasks.filter(t => t.taskPriority === 'Low').length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{months[0]?.fullName} - {months[months.length - 1]?.fullName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Index;
