# Recruweb <-> HRMS live chat (existing HRMS website-bridge use kiya gaya hai)

HRMS mein koi code change nahi. Sirf yeh ek env value dono taraf SAME honi chahiye.

## 1) HRMS backend (VPS) .env
WB_BRIDGE_KEY=<openssl rand -hex 32 se nayi key>
pm2 restart ardhnarishwar-hrms-backend

## 2) Recruweb backend .env
WB_BRIDGE_KEY=<wahi key>
HRMS_BRIDGE_URL=https://ardhnarishwar-hrms-backend.recruweb.com/api/website-bridge   (optional, default yahi hai)

## 3) Files copy karo (same paths par overwrite)
backend/index.js, backend/controllers/websiteChatController.js, backend/routes/websiteChatRoutes.js
frontend/src/components/{ChatAssistant,ContactChat}.jsx, frontend/src/utils/api.js

## 4) Frontend rebuild: npm run build, backend restart.

## Test
https://recruweb.com -> chat assistant -> Contact tab -> form -> Send Message -> HR choose -> chat.
HR portal (/web-forms) mein wahi chat dikhegi; HR Reply karega to visitor ko ~4 sec mein dikhega.
