# Recruweb: Hostinger deploy (ek hi Node.js app, same origin)

Ye ek hi Node.js app hai: `recruweb.com` pe frontend (`frontend/dist`) + `/api` + Socket.IO sab yahi serve karta hai.

## Deploy
1. hPanel -> Websites -> recruweb.com -> **Redeploy** -> is zip ko upload karo.
2. **public_html mein koi purani frontend files mat rakho** (index.html, assets, .htaccess). Node app domain handle karta hai.
3. Startup file: `start.cjs` (ya `index.js`). Node 20 / 22 / 24.
4. **Environment variables** (hPanel) mein Hostinger MySQL ki asli values daalo:
   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   (zip ke `.env` mein localhost/root local-dev values hain; Hostinger ke environment variables unhe override karte hain.)
   Saath mein `HRMS_BRIDGE_URL` aur `WB_BRIDGE_KEY` (HRMS wali key ke exactly same).
5. Redeploy ke baad test karo:
   - https://recruweb.com/api/health  -> `{"status":"OK", ... "db":"connected"}`
   - https://recruweb.com/#/jobs

## Health check ka matlab
- `OK` + `db: connected`  -> sab theek
- `503 DB_UNAVAILABLE`    -> app chal raha hai, DB_* values galat hain (Runtime logs mein exact error milega)
- Hostinger ka 404 page   -> Node app start hi nahi hui ya domain se attach nahi hai; Runtime logs dekho

## Frontend dobara build karna ho
`Recruweb_FRONTEND_UPDATED_FINAL/.env` mein VITE_API_URL / VITE_SOCKET_URL **set mat karo** (same-origin).
`npm run build` chalao, phir naye `dist` ko `frontend/dist` mein copy karo.

Purane contradictory notes `docs-old/` mein hain (api.recruweb.com wale notes ab lagu nahi).
