RECRUWEB - "Couldn't Load Jobs" / /api/* 404 FIX
=================================================
Problem: https://recruweb.com/api/jobs returned a 404 *HTML* page from the web
server, not from Express. So the Node.js backend was NOT serving recruweb.com
(the React files were being served as plain static files instead).
This is NOT a real CORS problem - the API simply was not reachable.

Correct Hostinger setup (ONE Node.js app serves site + API):
1. hPanel -> Websites -> recruweb.com -> Node.js (Add Node.js app).
   - Application root : the folder where you upload THIS backend zip
   - Startup file     : start.cjs
   - Node version     : 20 / 22 / 24
2. Upload & extract this backend zip into that folder, click "NPM install".
3. In hPanel -> Node.js -> Environment variables: set the values from .env
   (DB_*, JWT_SECRET, SMTP_*, etc.). Set NODE_ENV=production.
4. IMPORTANT: remove the old React files from public_html (index.html,
   assets/, .htaccess etc.) so they do not override the Node app.
5. Restart the Node.js app.
6. Test in browser:  https://recruweb.com/api/health
   -> must show {"status":"OK","message":"Recruweb API is running (MySQL)"}
   then open https://recruweb.com/#/jobs
If /api/health still shows a Hostinger 404 page, the Node app is not attached
to recruweb.com or it crashed - open Node.js -> Logs and check the error
(usually a wrong DB_NAME / DB_USER / DB_PASSWORD).
