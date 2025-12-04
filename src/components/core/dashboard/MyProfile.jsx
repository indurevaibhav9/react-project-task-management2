import React from 'react';
import { useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Calendar, Briefcase, Award } from 'lucide-react';

const MyProfile = () => {
  const { userData, userRole } = useSelector((state) => state.auth || {});

  const roleLabel = userRole === 1 ? 'Project Manager' : userRole === 2 ? 'Team Member' : 'User';

  // Dummy stats
  const stats = [
    { label: 'Projects', value: 8, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Tasks Completed', value: 42, icon: Award, color: 'text-green-600' },
    { label: 'Active Tasks', value: 5, icon: Calendar, color: 'text-orange-600' },
  ];

  // Dummy recent activities
  const recentActivities = [
    { id: 1, type: 'task', title: 'Completed "Fix login bug"', time: '2 hours ago' },
    { id: 2, type: 'project', title: 'Joined "E-commerce Platform"', time: '1 day ago' },
    { id: 3, type: 'comment', title: 'Commented on "API Integration"', time: '3 days ago' },
    { id: 4, type: 'task', title: 'Started "Design UI mockups"', time: '5 days ago' },
  ];

  return (
    <div className="w-full min-h-full bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {userData?.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userData?.userName || 'User'}
                </h1>
                <p className="text-lg text-gray-600 mb-3">{roleLabel}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{userData?.email || 'email@example.com'}</span>
                  </div>
                </div>
              </div>
            </div>
          
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <IconComponent className={`w-10 h-10 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                Experienced project manager with a passion for delivering high-quality software solutions. 
                Skilled in team collaboration, agile methodologies, and stakeholder management. Currently leading 
                multiple cross-functional projects with a focus on innovation and excellence.
              </p>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {['Project Management', 'Agile', 'Leadership', 'React', 'Node.js', 'Design', 'Communication'].map((skill) => (
                  <span key={skill} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Details */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{userData?.email || 'email@example.com'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Member Since</h2>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Joined on</p>
                  <p className="text-lg font-bold text-gray-900">January 15, 2024</p>
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <p className="text-xs text-blue-600 mb-2">Current Role</p>
              <p className="text-2xl font-bold text-blue-900">{roleLabel}</p>
              <p className="text-sm text-blue-700 mt-2">
                {userRole === 1 ? 'Full access to project management features' : 'Access to assigned projects and tasks'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;