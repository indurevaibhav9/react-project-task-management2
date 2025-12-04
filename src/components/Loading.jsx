import React from 'react';

const Loading = () => {
  return (
    <div class="flex items-center justify-center h-screen">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
    </div>
  );
};

export default Loading;