# Forgot Password production fix
Replace the backend with this package and restart the Node.js application.

Required environment variables:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your Gmail address>
SMTP_PASS=<16-character Gmail App Password>
FROM_EMAIL=<reply-to address>
FROM_NAME=Recruweb
FRONTEND_URL=https://recruweb.com

The code strips spaces from Gmail App Passwords and tries SMTP ports 587 and 465 automatically. It also uses the authenticated Gmail address as FROM (reply-to can remain your domain address), avoiding Gmail sender mismatch rejection.

After restart, test Forgot Password and inspect Runtime Logs. Successful send logs: [email] accepted by SMTP. If both ports fail, Runtime Logs now show the exact SMTP code for each attempt.
