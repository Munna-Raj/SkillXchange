import React from 'react';

const AdminPlaceholder = ({ title }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </header>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
      
      </main>
    </div>
  );
};

export const AdminSkills = () => <AdminPlaceholder title="Skills" />;
export const AdminRequests = () => <AdminPlaceholder title="Requests" />;
export const AdminReports = () => <AdminPlaceholder title="Reports" />;
