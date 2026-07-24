# ============================================================
#  MikroTik RouterOS Hotspot Setup Script
#  App: Menu Al-Tailandi (React SPA)
#  Target directory: /flash/hotspot/
# ============================================================
# HOW TO RUN:
#   1. Open Winbox -> Terminal (or SSH into the router)
#   2. Import this file:
#        /import file=hotspot_setup.rsc
#   OR paste commands one by one into the terminal.
# ============================================================

# --- Step 1: Create hotspot folder structure ---
# (MikroTik creates directories automatically on file upload;
#  these commands ensure the paths exist)
/file print where name~"hotspot"

# --- Step 2: Configure DNS Static Entry ---
# This allows devices connected to the hotspot to reach the menu
# by typing http://menu.local in their browser.
# Change 192.168.88.1 to your router's hotspot gateway IP.

/ip dns static
add name="menu.local" address=192.168.88.1 comment="Thai Menu App"
add name="www.menu.local" address=192.168.88.1 comment="Thai Menu App"

# --- Step 3: Allow DNS resolution (make sure DNS is enabled) ---
/ip dns
set allow-remote-requests=yes

# --- Step 4: Hotspot Walled Garden (allow unauthenticated access to menu) ---
# If you want guests to access the menu WITHOUT logging in first:
/ip hotspot walled-garden
add dst-host="menu.local" comment="Thai Menu - no auth required"
add dst-host="www.menu.local" comment="Thai Menu - no auth required"

# --- Step 5: Hotspot Server Profile - serve files from /flash/hotspot/ ---
# The default hotspot profile already serves from /flash/hotspot/
# Verify your hotspot server is using the default profile:
/ip hotspot print
/ip hotspot profile print

# ============================================================
#  UPLOAD INSTRUCTIONS (After running npm run build)
# ============================================================
#
#  Your dist/ folder will contain:
#    dist/
#      index.html
#      assets/
#        index-XXXXXXXX.js
#        index-XXXXXXXX.css
#        (other chunks)
#
#  Upload via FTP or Winbox Files panel:
#
#  METHOD A - Winbox Files Panel (easiest):
#    1. Open Winbox -> Files
#    2. Drag and drop ALL contents of your dist/ folder
#       into /flash/hotspot/
#    3. Also drag your dist/assets/ folder into
#       /flash/hotspot/assets/
#
#  METHOD B - FTP (command line):
#    ftp 192.168.88.1
#    (login with your admin credentials)
#    cd flash/hotspot
#    put index.html
#    mkdir assets
#    cd assets
#    mput dist/assets/*
#
#  METHOD C - SCP (if SSH is enabled):
#    scp -r dist/* admin@192.168.88.1:/flash/hotspot/
#
#  FINAL FILE STRUCTURE ON MIKROTIK:
#    /flash/hotspot/index.html
#    /flash/hotspot/assets/index-XXXXXXXX.js
#    /flash/hotspot/assets/index-XXXXXXXX.css
#    /flash/hotspot/logo.png          (if any images in public/)
#    /flash/hotspot/menu.json         (your menu data file)
#    /flash/hotspot/favicon.ico       (if present)
#
# ============================================================
#  ACCESS THE APP
# ============================================================
#
#  After upload, connected devices can access the menu at:
#    http://menu.local               (if DNS static is configured)
#    http://192.168.88.1             (direct IP, always works)
#
#  The app uses HashRouter, so navigation will look like:
#    http://menu.local/#/
#    http://menu.local/#/admin
#
#  This works 100% on MikroTik's static file server.
#
# ============================================================
#  IMPORTANT NOTES
# ============================================================
#  1. The menu.json file in public/ is copied to dist/ by Vite.
#     Upload it to /flash/hotspot/menu.json
#
#  2. If your app fetches menu.json from Firebase, no changes
#     are needed - Firebase calls will still work if guests
#     have internet access through the hotspot.
#
#  3. If you want the app to work OFFLINE (no internet), you
#     need to make sure menu.json is served locally and update
#     the fetch URL to be relative ('./menu.json').
#
#  4. MikroTik RouterOS has no HTTPS on the hotspot portal.
#     Firebase (HTTPS) calls may be blocked without internet.
# ============================================================
