// Format price to Indian Rupees
export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};
// formatPrice(12000) → "₹12,000"

// Format date nicely
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
// formatDate("2025-06-15") → "15 June 2025"

// Get full image URL from filename
export const getImageUrl = (filename) => {
  if (!filename) return "/placeholder.jpg";
  // if it's already a full URL return as is
  if (filename.startsWith("http")) return filename;
  return `http://localhost:5000/uploads/${filename}`;
};
// getImageUrl("image-123.jpg") → "http://localhost:5000/uploads/image-123.jpg"

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    pending: "#f59e0b",
    confirmed: "#10b981",
    cancelled: "#ef4444",
    paid: "#10b981",
    refunded: "#6366f1",
  };
  return colors[status] || "#6b7280";
};
