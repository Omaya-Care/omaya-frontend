export function getSeverityBadgeClass(severity: string) {
  switch (severity) {
    case "crisis":
      return "bg-red-100 text-red-600 border-red-100";
    case "elevated":
      return "bg-orange-100 text-orange-600 border-orange-100";
    case "routine":
      return "bg-green-100 text-green-600 border-green-100";
    case "monitor":
      return "bg-yellow-100 text-yellow-600 border-yellow-100";
    case "inactive":
      return "bg-gray-100 text-gray-500 border-gray-100";
    default:
      return "bg-gray-100 text-gray-600 border-gray-100";
  }
}

export function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-gray-100 text-gray-600 border-gray-100";
    case "in_progress":
      return "bg-green-100 text-green-600 border-green-100";
    case "upcoming":
      return "bg-blue-100 text-blue-600 border-blue-100";
    case "missed":
      return "bg-red-100 text-red-600 border-red-100";
    default:
      return "bg-gray-100 text-gray-600 border-gray-100";
  }
}
