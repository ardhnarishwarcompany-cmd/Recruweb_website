// Recruweb SAME-ORIGIN Hostinger configuration
// Frontend and backend are served by the same Node.js application/domain.
(function () {
  const origin = window.location.origin.replace(/\/+$/, "");
  window.__RECRUWEB_API_BASE__ = origin + "/api";
})();
