// Hostinger Passenger/Node.js startup entry.
// The application reads PORT from Hostinger (default 5000).
import('./index.js').catch((error) => {
  console.error('Failed to start Recruweb API:', error);
  process.exit(1);
});
