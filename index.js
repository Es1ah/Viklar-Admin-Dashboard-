'use strict';

require('dotenv').config();

// Global Repair for Google Credentials
if (process.env.GOOGLE_CREDENTIALS) {
  let raw = process.env.GOOGLE_CREDENTIALS.trim();
  if (raw && !raw.startsWith('{')) raw = '{' + raw;
  if (raw && !raw.endsWith('}')) raw = raw + '}';
  process.env.GOOGLE_CREDENTIALS = raw;
}

const fs = require('fs');
const path = require('path');
const express = require('express');
const { handleWebhook } = require('./src/handler');
const { listRequisitions } = require('./src/sheets');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Dashboard / Health Check ──────────────────────────────────────────────────
app.get('/', async (req, res) => {
    let requisitions = [];
    let error = null;

    try {
        if (process.env.GOOGLE_CREDENTIALS && process.env.GOOGLE_SHEETS_ID) {
            requisitions = await listRequisitions();
        } else {
            error = "Google Sheets credentials not configured. Please check your .env file.";
        }
    } catch (err) {
        error = err.message;
    }

    // Prepare current .env values for settings
    const currentSettings = {
        WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || '',
        PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID || '',
        VERIFY_TOKEN: process.env.VERIFY_TOKEN || '',
        PRIMARY_ADMIN: process.env.PRIMARY_ADMIN || '',
        PH_ADMIN_1: process.env.PH_ADMIN_1 || '',
        PH_ADMIN_2: process.env.PH_ADMIN_2 || '',
        ABUJA_ADMIN_1: process.env.ABUJA_ADMIN_1 || '',
        ABUJA_ADMIN_2: process.env.ABUJA_ADMIN_2 || '',
        GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID || '',
        GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS || '',
        PORT: process.env.PORT || '3000'
    };

    // Determine active tab for navigation
    const activeTab = req.query.tab || 'dashboard';

    // Construct the protocol/host for callback instructions
    const protocol = req.protocol;
    const host = req.get('host');
    const callbackUrl = `${protocol}://${host}/webhook`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard | ViKLAR Bot</title>
        <link rel="icon" href="/logo.png" type="image/png">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            :root {
                --sidebar-bg: #2E3192; /* ViKLAR Blue */
                --main-bg: #F1F5F9;
                --sidebar-text: rgba(255, 255, 255, 0.85);
                --sidebar-active: #FFFFFF;
                --accent: #F7941D; /* ViKLAR Orange */
                --border: #CBD5E1;
                --card-bg: #FFFFFF;
                --text: #1E293B;
                --text-muted: #64748B;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Outfit', sans-serif; display: flex; height: 100vh; overflow: hidden; background: var(--main-bg); color: var(--text); }
            
            /* Sidebar */
            .sidebar { width: 280px; background: var(--sidebar-bg); border-right: none; display: flex; flex-direction: column; padding: 1.5rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; flex-shrink: 0; z-index: 20; }
            .sidebar.collapsed { width: 85px; padding: 1.5rem 1rem; }
            .sidebar::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); }
            
            .logo-area { display: flex; align-items: center; gap: 0.75rem; padding-bottom: 2rem; overflow: hidden; white-space: nowrap; }
            .logo-img { width: auto; height: 32px; border-radius: 4px; background: white; padding: 2px; flex-shrink: 0; }
            .logo-text { color: white; font-weight: 700; font-size: 1.1rem; letter-spacing: -0.5px; transition: opacity 0.2s; white-space: nowrap; }
            .sidebar.collapsed .logo-text { display: none; }
            
            .nav-menu { flex-grow: 1; }
            .nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; color: var(--sidebar-text); text-decoration: none; border-radius: 0.75rem; margin-bottom: 0.5rem; transition: all 0.2s; cursor: pointer; white-space: nowrap; overflow: hidden; }
            .nav-item i { font-size: 1.25rem; width: 24px; text-align: center; flex-shrink: 0; }
            .nav-item span { font-weight: 500; font-size: 0.95rem; white-space: nowrap; }
            .nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; }
            .nav-item.active { background: var(--accent); color: white; box-shadow: 0 4px 12px rgba(247, 148, 29, 0.3); }
            .sidebar.collapsed .nav-item span { display: none; }
            .sidebar.collapsed .nav-item { padding: 0.875rem; justify-content: center; }
            .sidebar.collapsed .nav-item i { margin: 0; }
            
            /* Content Area */
            .main { flex-grow: 1; display: flex; flex-direction: column; min-width: 0; height: 100vh; }
            .top-bar { height: 70px; background: white; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; flex-shrink: 0; }
            .sidebar-toggle { background: #F8FAFC; border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
            .sidebar-toggle:hover { background: #F1F5F9; color: var(--sidebar-bg); border-color: var(--sidebar-bg); }
            
            .scroller { flex-grow: 1; overflow-y: auto; padding: 2rem; }
            .content-section { display: none; }
            .content-section.active { display: block; animation: fadeIn 0.3s ease; }
            
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            /* Stats & Info Cards */
            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
            .info-card-dashboard { background: white; border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; border-top: 4px solid var(--accent); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
            .stat-card { background: var(--card-bg); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.4rem; border-bottom: 4px solid var(--accent); }
            .stat-label { color: var(--text-muted); font-size: 0.875rem; font-weight: 600; }
            .stat-value { font-size: 2rem; font-weight: 700; color: var(--sidebar-bg); }
            
            /* Tables */
            .table-card { background: white; border-radius: 1rem; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 1.25rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); background: #F8FAFC; font-weight: 700; }
            td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #F1F5F9; font-size: 0.95rem; }
            tr:hover { background: #F8FAFC; }
            
            .status-badge { padding: 0.375rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
            .status-pending { background: #FEF3C7; color: #92400E; }
            .status-completed { background: #D1FAE5; color: #065F46; }
            .status-approved { background: #DBEAFE; color: #1E40AF; }

            /* Settings */
            .settings-layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
            .settings-panel { background: white; padding: 2.5rem; border-radius: 1rem; border: 1px solid var(--border); }
            .form-group { margin-bottom: 1.5rem; }
            .form-group label { display: block; margin-bottom: 0.4rem; font-weight: 600; font-size: 0.875rem; color: #475569; }
            .form-group input, .form-group textarea { width: 100%; padding: 0.75rem 0.875rem; border-radius: 0.75rem; border: 1px solid var(--border); background: #FFFFFF; color: var(--text); font-family: inherit; font-size: 0.95rem; }
            .form-group textarea { min-height: 120px; }
            .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(247, 148, 29, 0.1); }
            .form-group small { display: block; margin-top: 0.4rem; color: var(--text-muted); font-size: 0.8rem; line-height: 1.4; }
            
            .btn-save { background: var(--accent); color: white; border: none; padding: 1rem 2rem; border-radius: 2rem; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 14px rgba(247, 148, 29, 0.4); text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem; }
            .btn-save:hover { background: #E0851A; transform: translateY(-1px); }

            /* Important Info sidebar in settings */
            .info-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border); position: sticky; top: 0; }
            .info-card h3 { font-size: 1.1rem; color: var(--sidebar-bg); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
            .info-card h3 i { color: var(--accent); }
            
            .guideline { margin-bottom: 1.25rem; border-left: 2px solid var(--accent); padding-left: 1rem; }
            .guideline h4 { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.25rem; color: #1e293b; }
            .guideline p { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; }
            .code-sample { background: #f8fafc; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.75rem; word-break: break-all; margin-top: 0.5rem; border: 1px solid var(--border); color: var(--sidebar-bg); }

            .toast { position: fixed; bottom: 2rem; right: 2rem; background: #1E293B; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; font-weight: 600; display: none; z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border-left: 4px solid var(--accent); }
            
            @media (max-width: 1024px) {
                .settings-layout { grid-template-columns: 1fr; }
                .info-card { position: static; margin-top: 2rem; }
            }
        </style>
    </head>
    <body onload="initApp()">
        <aside class="sidebar" id="sidebar">
            <div class="logo-area">
                <img src="/logo.png" class="logo-img" alt="Logo">
                <span class="logo-text">ViKLAR Bot</span>
            </div>

            <nav class="nav-menu">
                <div class="nav-item active" id="nav-dashboard" onclick="showSection('dashboard', this)">
                    <i class="fa-solid fa-gauge-high"></i>
                    <span>Dashboard</span>
                </div>
                <div class="nav-item" id="nav-orders" onclick="showSection('orders', this)">
                    <i class="fa-solid fa-list-ul"></i>
                    <span>Requisitions</span>
                </div>
                <div class="nav-item" id="nav-settings" onclick="showSection('settings', this)">
                    <i class="fa-solid fa-cog"></i>
                    <span>Settings</span>
                </div>
            </nav>

            <div class="nav-item" style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; cursor: default;">
                <i class="fa-regular fa-circle-user"></i> <span>ViKLAR Admin</span>
            </div>
        </aside>

        <main class="main">
            <header class="top-bar">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <button class="sidebar-toggle" onclick="toggleSidebar()">
                        <i class="fa-solid fa-bars-staggered"></i>
                    </button>
                    <h1 id="page-title" style="font-size: 1.25rem;">Dashboard Overview</h1>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <span style="background: #ECFDF5; color: #065F46; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-circle" style="font-size: 0.4rem; color: #10B981;"></i> LIVE
                    </span>
                    <div style="text-align: right; border-left: 1px solid var(--border); padding-left: 1.5rem;">
                        <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase;">Bot Number</div>
                        <div style="font-size: 0.95rem; font-weight: 800; color: var(--sidebar-bg);">+${currentSettings.PHONE_NUMBER_ID || 'Not set'}</div>
                    </div>
                </div>
            </header>

            <div class="scroller">
                <!-- Section: Dashboard Stats -->
                <div id="dashboard" class="content-section active">
                    <!-- Priority Info Box -->
                    <div class="info-grid">
                        <div class="info-card-dashboard">
                            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 0.6rem;">Active Bot Phone</div>
                            <div style="font-size: 1.15rem; font-weight: 700; color: var(--sidebar-bg); display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i> +${currentSettings.PHONE_NUMBER_ID || 'Required'}
                            </div>
                        </div>
                        <div class="info-card-dashboard">
                            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 0.6rem;">Webhook Token</div>
                            <div style="font-size: 1.15rem; font-weight: 700; color: var(--sidebar-bg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${currentSettings.VERIFY_TOKEN || 'None'}
                            </div>
                        </div>
                        <div class="info-card-dashboard" style="display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.15rem; font-weight: 700; color: #10B981; display: flex; align-items: center; gap: 0.6rem;">
                                <i class="fa-solid fa-cloud-check"></i> WATI Connected
                            </div>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <span class="stat-label">All Requisitions</span>
                            <span class="stat-value">${requisitions.length}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Pending Review</span>
                            <span class="stat-value">${requisitions.filter(r => r.status.toLowerCase() === 'pending').length}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Completed</span>
                            <span class="stat-value">${requisitions.filter(r => r.status.toLowerCase() === 'completed' || r.status.toLowerCase().includes('sent')).length}</span>
                        </div>
                    </div>
                </div>

                <!-- Section: Orders (Table) -->
                <div id="orders" class="content-section">
                    <div class="table-card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Sender</th>
                                    <th>Persona</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${requisitions.map((r, i) => `
                                    <tr>
                                        <td style="font-family: monospace; font-weight: 700; color: var(--sidebar-bg);">#${r.requestId}</td>
                                        <td>
                                            <div style="font-weight: 600;">+${r.phone}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">${r.timestamp}</div>
                                        </td>
                                        <td><span style="font-weight: 500;">${r.persona}</span></td>
                                        <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.purpose}</td>
                                        <td style="font-weight: 700; color: #10B981;">${r.amount}</td>
                                        <td>
                                            <span class="status-badge status-${(r.status || 'pending').toLowerCase().includes('sent') ? 'completed' : (r.status || 'pending').toLowerCase()}">
                                                ${r.status}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                                ${requisitions.length === 0 ? `
                                    <tr>
                                        <td colspan="6" style="padding: 4rem; text-align: center; color: var(--text-muted);">
                                            <i class="fa-solid fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                                            <p>No activity yet.</p>
                                        </td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Section: Settings -->
                <div id="settings" class="content-section">
                    <div class="settings-layout">
                        <div class="settings-panel">
                            <h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sidebar-bg); margin-bottom: 2rem; border-bottom: 2px solid var(--sidebar-bg); padding-bottom: 0.5rem; display: inline-block;">
                                Bot Configuration
                            </h3>
                            
                            <form id="settings-form">
                                <div class="form-group">
                                    <label>WHATSAPP_TOKEN (API KEY)</label>
                                    <input type="password" name="WHATSAPP_TOKEN" value="${currentSettings.WHATSAPP_TOKEN}" placeholder="••••••••••••••••">
                                    <small>Complete JSON content from your Google Service Account key.</small>
                                </div>
                                <div class="form-group">
                                    <label>PRIMARY_ADMIN (Full Approval & Funds)</label>
                                    <input type="text" name="PRIMARY_ADMIN" value="${currentSettings.PRIMARY_ADMIN}" placeholder="234XXXXXXXXXX">
                                    <small>The ultimate admin who marks funds as sent. <br> Powered by <b>ViKLAR TECHNOLOGIES LTD</b>.</small>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                                    <div class="form-group">
                                        <label>PH_ADMIN_1 (Port Harcourt)</label>
                                        <input type="text" name="PH_ADMIN_1" value="${currentSettings.PH_ADMIN_1}" placeholder="234XXXXXXXXXX">
                                    </div>
                                    <div class="form-group">
                                        <label>PH_ADMIN_2 (Port Harcourt)</label>
                                        <input type="text" name="PH_ADMIN_2" value="${currentSettings.PH_ADMIN_2}" placeholder="234XXXXXXXXXX">
                                    </div>
                                </div>
                                <small style="display: block; margin-top: -0.5rem; margin-bottom: 1.5rem;">First-level approvers for Port Harcourt region.</small>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div class="form-group">
                                        <label>ABUJA_ADMIN_1 (Abuja)</label>
                                        <input type="text" name="ABUJA_ADMIN_1" value="${currentSettings.ABUJA_ADMIN_1}" placeholder="234XXXXXXXXXX">
                                    </div>
                                    <div class="form-group">
                                        <label>ABUJA_ADMIN_2 (Abuja)</label>
                                        <input type="text" name="ABUJA_ADMIN_2" value="${currentSettings.ABUJA_ADMIN_2}" placeholder="234XXXXXXXXXX">
                                    </div>
                                </div>
                                <small style="display: block; margin-top: -0.5rem; margin-bottom: 1.5rem;">First-level approvers for Abuja region.</small>
                                
                                <div style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 2rem;">
                                    <button type="button" class="btn-save" onclick="saveSettings()">Save Configuration</button>
                                </div>
                            </form>
                        </div>

                        <div class="sidebar-info">
                            <div class="info-card">
                                <h3><i class="fa-solid fa-circle-info"></i> Setup Guide</h3>
                                
                                <div class="guideline">
                                    <h4>Meta Webhook Setup</h4>
                                    <p>Login to Developers.facebook.com and use these values under WhatsApp -> Configuration:</p>
                                    <div class="code-sample">
                                        <b>Callback URL:</b><br>${callbackUrl}
                                    </div>
                                    <div class="code-sample">
                                        <b>Verify Token:</b><br>${currentSettings.VERIFY_TOKEN || '(Set it now)'}
                                    </div>
                                </div>

                                <div class="guideline">
                                    <h4>Google Sheet Columns</h4>
                                    <p>Ensure your Sheet has these headers in Row 1 (A to G):</p>
                                    <div class="code-sample">
                                        Timestamp | Phone | Persona | Purpose | Amount | Status | Request ID
                                    </div>
                                </div>

                                <div class="guideline" style="border-left-color: #3b82f6;">
                                    <h4>Admin Commands</h4>
                                    <p>As an admin, reply to any alert with:</p>
                                    <div class="code-sample">
                                        done REQ-1234ABCD
                                    </div>
                                </div>

                                <div style="margin-top: 2rem; text-align: center;">
                                    <img src="/logo.png" style="height: 30px; opacity: 0.5; margin-bottom: 0.5rem;">
                                    <p style="font-size: 0.7rem; color: var(--text-muted);">© 2026 ViKLAR TECHNOLOGIES LTD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div id="toast" class="toast">Settings updated successfully!</div>

        <script>
            function toggleSidebar() {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('collapsed');
                
                // Toggle icon
                const icon = document.querySelector('.sidebar-toggle i');
                if (sidebar.classList.contains('collapsed')) {
                    icon.classList.remove('fa-bars-staggered');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-bars-staggered');
                }
            }

            function showSection(id, element) {
                document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                
                document.getElementById(id).classList.add('active');
                element.classList.add('active');
                
                const titles = { 'dashboard': 'Performance Overview', 'orders': 'Active Requisitions', 'settings': 'System Configurations' };
                document.getElementById('page-title').innerText = titles[id];

                // Auto-collapse sidebar on mobile if needed (optional)
            }

            async function saveSettings() {
                const form = document.getElementById('settings-form');
                const formData = new FormData(form);
                const data = {};
                formData.forEach((value, key) => data[key] = value);

                const btn = document.querySelector('.btn-save');
                btn.innerText = 'Saving...';
                btn.style.opacity = '0.7';

                try {
                    const res = await fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (res.ok) {
                        const toast = document.getElementById('toast');
                        toast.style.display = 'block';
                        setTimeout(() => { 
                            toast.style.display = 'none'; 
                            location.reload(); // Reload to refresh the info card callback URL info if it changed
                        }, 2000);
                    } else {
                        alert("Failed to save settings. Check terminal logs.");
                        btn.innerText = 'Save Configuration';
                        btn.style.opacity = '1';
                    }
                } catch (err) {
                    alert("Error connection: " + err.message);
                    btn.innerText = 'Save Configuration';
                    btn.style.opacity = '1';
                }
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// ── API: Update Settings ─────────────────────────────────────────────────────
app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;

        // Vercel / Serverless check: File system is read-only
        const isServerless = !!process.env.VERCEL || !!process.env.AWS_REGION;

        if (!isServerless) {
            const envPath = path.join(__dirname, '.env');
            let envContent = '';
            for (const [key, value] of Object.entries(settings)) {
                const cleanValue = key === 'GOOGLE_CREDENTIALS' ? value.replace(/\r?\n|\r/g, "") : value;
                envContent += `${key}=${cleanValue}\n`;
            }
            fs.writeFileSync(envPath, envContent);
            console.log('[API] .env file updated locally.');
        } else {
            console.log('[API] Serverless mode: Skipping .env file write.');
        }
        
        // Update process.env for the currently running process (immediate effect)
        for (const [key, value] of Object.entries(settings)) {
            process.env[key] = value;
        }

        if (isServerless) {
            return res.status(200).json({ 
                success: true, 
                message: "Settings updated for this session only. To persist changes on Vercel, please update your Environment Variables in the Vercel Dashboard."
            });
        }

        res.sendStatus(200);
    } catch (err) {
        console.error('[API] Failed to save settings:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Webhook HANDLER (GET) - Verification
// ─────────────────────────────────────────────────────────────────────────────
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[Webhook] Verification successful.');
        return res.status(200).send(challenge);
    }

    if (mode !== 'subscribe') {
        console.warn(`[Webhook] Verification failed. Mode mismatch. Expected 'subscribe', got '${mode}'.`);
    } else if (token !== VERIFY_TOKEN) {
        console.warn(`[Webhook] Verification failed. Token mismatch. Expected '${VERIFY_TOKEN}', got '${token}'.`);
    }

    return res.sendStatus(403);
});

// Webhook HANDLER (POST) - Messages
// ─────────────────────────────────────────────────────────────────────────────
app.post('/webhook', async (req, res) => {
    try {
        await handleWebhook(req, res);
    } catch (err) {
        console.error('[POST /webhook] Error processing message:', err.message);
    }
});

if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`\n🚀 ViKLAR Requisition Bot running on port ${PORT}`);
        console.log(`   Dashboard:   http://localhost:${PORT}/`);
        console.log(`   Webhook URL: http://localhost:${PORT}/webhook\n`);
        
        if (!process.env.VERIFY_TOKEN) {
            console.warn('⚠️  WARNING: VERIFY_TOKEN is not set in .env. Webhook verification will fail.');
        }
    });
}

module.exports = app;
