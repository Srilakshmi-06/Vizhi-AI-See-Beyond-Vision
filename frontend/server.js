/**
 * Vizhi AI Frontend Server
 * Serves the dashboard static files on port 3000.
 * API calls (/api/*) are handled by Kubernetes ingress → backend port 8001
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  maxAge: '1h',
}));

// SPA fallback - always serve index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Vizhi AI Dashboard running at http://${HOST}:${PORT}`);
});
