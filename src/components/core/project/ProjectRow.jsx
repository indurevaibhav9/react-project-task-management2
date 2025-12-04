const ProjectRow = ({ project, maxDescriptionLength = 150, onClickProject }) => {
  const description = project.projectDescription || "";
  const trimmedDescription =
    description.length > maxDescriptionLength
      ? description.slice(0, maxDescriptionLength).trimEnd() + "..."
      : description;

  return (
    <div className="px-4 py-6 bg-white rounded shadow-sm mb-3 cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-[#1111]" onClick={() => onClickProject(project.projectId)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{project.projectName}</h3>
          {description && (
            <p className="text-md text-gray-600">{trimmedDescription}</p>
          )}
        </div>
        <div className="text-md text-gray-500">
          {project.projectStartDate && <div>Start: {new Date(project.projectStartDate).toLocaleDateString()}</div>}
          {project.projectEndDate && <div>End: {new Date(project.projectEndDate).toLocaleDateString()}</div>}
        </div>
      </div>
    </div>
  );
};

export default ProjectRow;