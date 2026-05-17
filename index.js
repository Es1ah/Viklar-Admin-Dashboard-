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
const { connectWhatsApp, sendText, sendButtons } = require('./src/whatsapp');
const { handleWebhook } = require('./src/handler');
const { listRequisitions, listUsers, logAudit } = require('./src/sheets');
const { initAutomation } = require('./src/automation');
const { authenticate } = require('./src/auth');
const { uploadToDrive } = require('./src/drive');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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
        }
    } catch (err) {
        error = err.message;
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ViKLAR Bot | Command Center</title>
        <link rel="icon" href="/logo.png" type="image/png">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            :root {
                --viklar-blue: #2E3192;
                --viklar-orange: #F7941D;
                --bg-main: #F1F5F9;
                --bg-card: #FFFFFF;
                --text-primary: #1E293B;
                --text-secondary: #64748B;
                --border-gray: #E2E8F0;
                --success: #10B981;
                --pending: #F59E0B;
                --approved: #3B82F6;
                --sidebar-width: 260px;
                --sidebar-collapsed: 70px;
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: var(--bg-main); color: var(--text-primary); height: 100vh; overflow: hidden; }

            /* --- Login & Setup Flows --- */
            .auth-overlay { position: fixed; inset: 0; background: var(--viklar-blue); z-index: 1000; display: flex; align-items: center; justify-content: center; }
            .auth-container { display: flex; background: white; width: 1000px; height: 650px; border-radius: 1.5rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
            .auth-sidebar { width: 35%; background: var(--viklar-blue); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: white; position: relative; }
            .auth-sidebar::after { content: ''; position: absolute; inset: 0; background: url('/logo.png') no-repeat center; opacity: 0.1; background-size: 80%; }
            .auth-content { flex: 1; padding: 4rem; display: flex; flex-direction: column; justify-content: center; position: relative; }
            
            .auth-title { font-family: 'Outfit', sans-serif; font-size: 1.75rem; color: var(--viklar-blue); margin-bottom: 0.5rem; font-weight: 700; }
            .auth-subtitle { color: var(--text-secondary); margin-bottom: 2.5rem; font-size: 0.95rem; }

            .input-group { margin-bottom: 1.5rem; }
            .input-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
            .auth-input { width: 100%; padding: 0.875rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border-gray); font-family: inherit; font-size: 1rem; background: #F8FAFC; transition: all 0.2s; }
            .auth-input:focus { outline: none; border-color: var(--viklar-blue); box-shadow: 0 0 0 3px rgba(46, 49, 146, 0.1); }

            .otp-container { display: flex; gap: 0.75rem; margin-bottom: 2rem; }
            .otp-input { width: 3.5rem; height: 3.5rem; text-align: center; font-size: 1.5rem; font-weight: 700; border-radius: 0.75rem; border: 2px solid var(--border-gray); background: #F8FAFC; }
            .otp-input:focus { border-color: var(--viklar-orange); outline: none; }

            .btn-primary { background: var(--viklar-orange); color: white; border: none; padding: 0.875rem 2rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; }
            .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(247, 148, 29, 0.3); }
            .btn-primary:disabled { background: var(--border-gray); cursor: not-allowed; transform: none; box-shadow: none; }

            /* --- Main App Layout --- */
            #app-layout { display: none; height: 100vh; width: 100%; }
            
            .sidebar { width: var(--sidebar-width); background: var(--viklar-blue); display: flex; flex-direction: column; padding: 1.5rem; flex-shrink: 0; position: relative; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 50; }
            .sidebar.collapsed { width: var(--sidebar-collapsed); }
            
            .logo-area { display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem; overflow: hidden; }
            .logo-img { height: 32px; width: 32px; background: white; padding: 2px; border-radius: 6px; flex-shrink: 0; }
            .logo-text { color: white; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.1rem; white-space: nowrap; }
            
            .nav-group { flex: 1; }
            .nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; color: rgba(255,255,255,0.7); text-decoration: none; border-radius: 0.5rem; margin-bottom: 0.25rem; cursor: pointer; transition: 0.2s; white-space: nowrap; }
            .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
            .nav-item.active { background: rgba(255,255,255,0.1); color: white; border-left: 4px solid var(--viklar-orange); }
            .nav-item i { width: 20px; font-size: 1.1rem; }
            
            .user-snip { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 0.75rem; overflow: hidden; }
            .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--viklar-orange); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
            .user-info { white-space: nowrap; }
            .user-name { color: white; font-size: 0.9rem; font-weight: 600; }
            .user-role-badge { font-size: 0.7rem; color: rgba(255,255,255,0.5); font-weight: 700; text-transform: uppercase; }

            .main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--bg-main); }
            .header { height: 70px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; border-bottom: 1px solid var(--border-gray); flex-shrink: 0; }
            
            .view-container { flex: 1; padding: 2rem; overflow-y: auto; }
            .view { display: none; animation: fadeIn 0.3s ease; }
            .view.active { display: block; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

            /* --- Cards & Components --- */
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
            .card { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid var(--border-gray); }
            .card-title { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
            
            .stat-val { font-size: 2rem; font-weight: 700; color: var(--viklar-blue); margin-bottom: 0.25rem; }
            .stat-delta { font-size: 0.8rem; font-weight: 600; }
            .delta-up { color: var(--success); }

            /* --- Tables --- */
            .table-wrap { background: white; border-radius: 0.75rem; border: 1px solid var(--border-gray); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 1rem 1.5rem; font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; border-bottom: 1px solid var(--border-gray); background: #F8FAFC; }
            td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-gray); font-size: 0.9rem; color: var(--text-primary); }
            tr:last-child td { border-bottom: none; }
            tr:hover td { background: #F8FAFC; }

            .badge { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
            .badge-success { background: #DCFCE7; color: #166534; }
            .badge-pending { background: #FEF3C7; color: #92400E; }
            .badge-blue { background: #DBEAFE; color: #1E40AF; }

            /* --- Quick Action Cards --- */
            .action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
            .action-card { background: white; border: 1px solid var(--border-gray); padding: 1.25rem; border-radius: 0.75rem; text-align: center; cursor: pointer; transition: all 0.2s; }
            .action-card:hover { border-color: var(--viklar-orange); transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .action-card i { font-size: 1.5rem; color: var(--viklar-orange); margin-bottom: 0.75rem; }
            .action-card span { display: block; font-size: 0.85rem; font-weight: 600; }

            /* --- Chat Layout --- */
            .chat-view { display: flex; height: calc(100vh - 150px); background: white; border-radius: 0.75rem; border: 1px solid var(--border-gray); overflow: hidden; }
            .chat-sidebar { width: 300px; border-right: 1px solid var(--border-gray); display: flex; flex-direction: column; }
            .chat-main { flex: 1; display: flex; flex-direction: column; background: #F8FAFC; }
            .chat-list { flex: 1; overflow-y: auto; }
            .chat-item { padding: 1rem; border-bottom: 1px solid var(--border-gray); cursor: pointer; transition: 0.2s; }
            .chat-item:hover { background: #F1F5F9; }
            .chat-item.active { background: #EFF6FF; border-left: 4px solid var(--viklar-orange); }
            
            .msg-container { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
            .msg { max-width: 70%; padding: 1rem; border-radius: 1rem; font-size: 0.95rem; line-height: 1.5; }
            .msg-sent { align-self: flex-end; background: var(--viklar-blue); color: white; border-bottom-right-radius: 0.25rem; }
            .msg-received { align-self: flex-start; background: white; color: var(--text-primary); border-bottom-left-radius: 0.25rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

            .chat-input-bar { padding: 1.5rem; background: white; border-top: 1px solid var(--border-gray); display: flex; gap: 1rem; }

            .hidden { display: none !important; }
        </style>
    </head>
    <body>
        <!-- 1. LOGIN OVERLAY -->
        <div id="login-flow" class="auth-overlay">
            <div class="auth-container">
                <div class="auth-sidebar">
                    <img src="/logo.png" style="height: 80px; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                    <div style="margin-top: 2rem; text-align: center; position: relative; z-index: 1;">
                        <h2 style="font-family: 'Outfit';">ViKLAR Technologies</h2>
                        <p style="opacity: 0.7; font-size: 0.9rem;">Automating Operations for Africa's Infrastructure</p>
                    </div>
                </div>
                <div class="auth-content" id="login-step-1">
                    <h1 class="auth-title">Welcome Back</h1>
                    <p class="auth-subtitle">Enter your phone number to access the ViKLAR Command Center.</p>
                    
                    <div class="input-group">
                        <label class="input-label">PHONE NUMBER</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" value="+234" disabled style="width: 70px; text-align: center;" class="auth-input">
                            <input type="text" id="login-phone" placeholder="803 000 0000" class="auth-input" onkeypress="if(event.key==='Enter') sendOTP()">
                        </div>
                    </div>
                    
                    <button class="btn-primary" onclick="sendOTP()">Send OTP Code</button>
                    <p style="margin-top: 2rem; font-size: 0.8rem; color: var(--text-secondary);">By continuing, you agree to ViKLAR's Terms of Service and Privacy Policy.</p>
                </div>

                <div class="auth-content hidden" id="login-step-2">
                    <h1 class="auth-title">Verify Identity</h1>
                    <p class="auth-subtitle">We've sent a 4-digit code to your WhatsApp. <br><span id="otp-phone-display" style="color: var(--viklar-blue); font-weight: 600;"></span></p>
                    
                    <div class="otp-container" id="otp-inputs">
                        <input type="text" maxlength="1" class="otp-input" onkeyup="moveNext(this, 'otp2')">
                        <input type="text" maxlength="1" id="otp2" class="otp-input" onkeyup="moveNext(this, 'otp3')">
                        <input type="text" maxlength="1" id="otp3" class="otp-input" onkeyup="moveNext(this, 'otp4')">
                        <input type="text" maxlength="1" id="otp4" class="otp-input" onkeyup="verifyOTP()">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <p id="resend-timer" style="font-size: 0.85rem; color: var(--text-secondary);">Resend code in 30s</p>
                        <button class="btn-primary" onclick="verifyOTP()">Continue →</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. PROFILE SETUP FLOW -->
        <div id="setup-flow" class="auth-overlay hidden">
            <div class="auth-container" style="height: 700px;">
                <div class="auth-content" style="padding: 5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem;">
                        <div class="badge badge-blue" style="width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;">1</div>
                        <div>
                            <h2 style="font-family: 'Outfit';">Complete Your Profile</h2>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">Step 1 of 3: Basic Information</p>
                        </div>
                    </div>

                    <div class="input-group">
                        <label class="input-label">FULL NAME *</label>
                        <input type="text" id="setup-name" placeholder="e.g. John Doe" class="auth-input">
                    </div>
                    
                    <div class="input-group">
                        <label class="input-label">EMAIL ADDRESS *</label>
                        <input type="email" id="setup-email" placeholder="john.doe@viklar.com" class="auth-input">
                    </div>

                    <div class="input-group">
                        <label class="input-label">DEPARTMENT *</label>
                        <select id="setup-dept" class="auth-input" style="appearance: none; background: #F8FAFC url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E') no-repeat right 1rem center;">
                            <option value="Engineering">Engineering</option>
                            <option value="Operations">Operations</option>
                            <option value="Finance">Finance</option>
                            <option value="HR">HR</option>
                            <option value="Management">Management</option>
                        </select>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
                        <button style="background: none; border: 1px solid var(--border-gray); color: var(--text-secondary);" class="btn-primary" onclick="skipSetup()">Skip</button>
                        <button class="btn-primary" onclick="completeSetup()">Next →</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. MAIN DASHBOARD -->
        <div id="app-layout">
            <aside class="sidebar" id="sidebar">
                <div class="logo-area">
                    <img src="/logo.png" class="logo-img">
                    <span class="logo-text">ViKLAR Bot</span>
                </div>

                <nav class="nav-group" id="nav-menu">
                    <div class="nav-item active" onclick="showView('home', this)">
                        <i class="fa-solid fa-house"></i> <span>Dashboard</span>
                    </div>
                    <div class="nav-item" onclick="showView('requisitions', this)">
                        <i class="fa-solid fa-list-check"></i> <span>Requisitions</span>
                    </div>
                    <div class="nav-item" onclick="showView('chat', this)">
                        <i class="fa-solid fa-comment-dots"></i> <span>Intercompany Chat</span>
                    </div>
                    <div class="nav-item" onclick="showView('automation', this)">
                        <i class="fa-solid fa-bolt-lightning"></i> <span>Automated Messages</span>
                    </div>
                    <div class="nav-item" onclick="showView('jobforms', this)">
                        <i class="fa-solid fa-file-arrow-up"></i> <span>Job Completion</span>
                    </div>
                    <div class="nav-item role-ceo role-admin" onclick="showView('users', this)">
                        <i class="fa-solid fa-users-gear"></i> <span>User Management</span>
                    </div>
                    <div class="nav-item" onclick="showView('settings', this)">
                        <i class="fa-solid fa-sliders"></i> <span>Settings</span>
                    </div>
                </nav>

                <div class="user-snip">
                    <div class="avatar" id="user-avatar">JD</div>
                    <div class="user-info">
                        <div class="user-name" id="user-display-name">John Doe</div>
                        <div class="user-role-badge" id="user-display-role">Employee</div>
                    </div>
                    <div style="margin-left: auto; cursor: pointer; color: rgba(255,255,255,0.4);" onclick="logout()">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </div>
                </div>
            </aside>

            <main class="main-content">
                <header class="header">
                    <div style="display: flex; align-items: center; gap: 1.5rem;">
                        <button style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.25rem;" onclick="toggleSidebar()">
                            <i class="fa-solid fa-bars-staggered"></i>
                        </button>
                        <h2 id="view-title" style="font-family: 'Outfit'; font-size: 1.25rem;">Hello, John 👋</h2>
                    </div>

                    <div style="display: flex; align-items: center; gap: 1.5rem;">
                        <div style="position: relative; cursor: pointer;">
                            <i class="fa-regular fa-bell" style="font-size: 1.25rem; color: var(--text-secondary);"></i>
                            <span style="position: absolute; top: -5px; right: -5px; background: var(--viklar-orange); color: white; font-size: 0.6rem; padding: 2px 5px; border-radius: 10px; font-weight: 700;">3</span>
                        </div>
                        <div style="width: 1px; height: 30px; background: var(--border-gray);"></div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="text-align: right;">
                                <div style="font-size: 0.85rem; font-weight: 700;">ViKLAR Bot</div>
                                <div style="font-size: 0.7rem; color: var(--success); font-weight: 800; text-transform: uppercase;">● LIVE</div>
                            </div>
                        </div>
                    </div>
                </header>

                <div class="view-container">
                    <!-- Home View -->
                    <div id="view-home" class="view active">
                        <div id="home-stats" class="stats-grid hidden">
                            <!-- Injected by JS based on role -->
                        </div>

                        <div class="card-title">Quick Actions</div>
                        <div class="action-grid" id="quick-actions">
                            <div class="action-card" onclick="showView('requisitions', document.querySelector('[onclick*=\"requisitions\"]'))">
                                <i class="fa-solid fa-plus-circle"></i>
                                <span>New Requisition</span>
                            </div>
                            <div class="action-card" onclick="showView('jobforms', document.querySelector('[onclick*=\"jobforms\"]'))">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                                <span>Upload Job Form</span>
                            </div>
                            <div class="action-card" onclick="showView('chat', document.querySelector('[onclick*=\"chat\"]'))">
                                <i class="fa-solid fa-message"></i>
                                <span>Send Broadcast</span>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                            <div>
                                <div class="card-title">Your Recent Requisitions</div>
                                <div class="table-wrap">
                                    <table id="recent-reqs-table">
                                        <thead>
                                            <tr><th>ID</th><th>Date</th><th>Amount</th><th>Status</th></tr>
                                        </thead>
                                        <tbody>
                                            ${requisitions.slice(0, 5).map(r => `
                                                <tr>
                                                    <td style="font-weight: 700; color: var(--viklar-blue);">#\${r.requestId}</td>
                                                    <td>\${r.timestamp.split(',')[0]}</td>
                                                    <td style="font-weight: 700;">\${r.amount}</td>
                                                    <td><span class="badge badge-\${(r.status || 'pending').toLowerCase()}">\${r.status}</span></td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div>
                                <div class="card-title">Recent Updates</div>
                                <div class="card" style="padding: 0;">
                                    <div style="padding: 1rem; border-bottom: 1px solid var(--border-gray);">
                                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">2:30 PM</div>
                                        <div style="font-size: 0.9rem; font-weight: 600;">Admin approved REQ-A1B2</div>
                                    </div>
                                    <div style="padding: 1rem; border-bottom: 1px solid var(--border-gray);">
                                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">1:15 PM</div>
                                        <div style="font-size: 0.9rem; font-weight: 600;">Team: Standup at 9am tomorrow</div>
                                    </div>
                                    <div style="padding: 1rem; text-align: center;">
                                        <a href="#" style="color: var(--viklar-blue); font-size: 0.85rem; font-weight: 700; text-decoration: none;">View All Notifications</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Requisitions View -->
                    <div id="view-requisitions" class="view">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <div style="display: flex; gap: 1rem;">
                                <div class="auth-input" style="width: 300px; display: flex; align-items: center; gap: 0.5rem; background: white;">
                                    <i class="fa-solid fa-magnifying-glass" style="color: var(--text-secondary);"></i>
                                    <input type="text" placeholder="Search ID, purpose..." style="border:none; background:none; flex:1; outline:none;">
                                </div>
                                <select class="auth-input" style="width: 150px; background: white;">
                                    <option>Filter: ALL</option>
                                    <option>Pending</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                            <button class="btn-primary">+ New Request</button>
                        </div>
                        <div class="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>ID</th><th>Requester</th><th>Purpose</th><th>Amount</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    ${requisitions.map(r => `
                                        <tr>
                                            <td style="font-weight: 700; color: var(--viklar-blue);">#\${r.requestId}</td>
                                            <td>+\${r.phone}</td>
                                            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${r.purpose}</td>
                                            <td style="font-weight: 700;">\${r.amount}</td>
                                            <td><span class="badge badge-\${(r.status || 'pending').toLowerCase()}">\${r.status}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Other views placeholders -->
                    <div id="view-chat" class="view">
                        <div class="chat-view">
                            <div class="chat-sidebar">
                                <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-gray);">
                                    <input type="text" placeholder="Search chats..." class="auth-input" style="font-size: 0.85rem;">
                                </div>
                                <div class="chat-list">
                                    <div class="chat-item active">
                                        <div style="font-weight: 700; font-size: 0.9rem;">Company Broadcast</div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Admin: Hi team, meeting at 3pm...</div>
                                    </div>
                                    <div class="chat-item">
                                        <div style="font-weight: 700; font-size: 0.9rem;">Engineering Dept</div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Sarah: Site A is ready...</div>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-main">
                                <div style="padding: 1rem 2rem; background: white; border-bottom: 1px solid var(--border-gray); display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <div style="font-weight: 700;">Company Broadcast</div>
                                        <div style="font-size: 0.75rem; color: var(--success); font-weight: 600;">Broadcast Mode</div>
                                    </div>
                                    <i class="fa-solid fa-ellipsis-vertical" style="color: var(--text-secondary); cursor: pointer;"></i>
                                </div>
                                <div class="msg-container">
                                    <div class="msg msg-received">
                                        <div style="font-size: 0.7rem; font-weight: 800; color: var(--viklar-orange); margin-bottom: 0.25rem;">ADMIN</div>
                                        Hi team, just a reminder for the safety standup at 3:00 PM today. Please be on time.
                                        <div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.5rem; text-align: right;">10:30 AM</div>
                                    </div>
                                    <div class="msg msg-sent">
                                        Thanks! I'll be there.
                                        <div style="font-size: 0.65rem; opacity: 0.7; margin-top: 0.5rem; text-align: right;">10:45 AM</div>
                                    </div>
                                </div>
                                <div class="chat-input-bar">
                                    <button style="background: none; border: none; font-size: 1.25rem; color: var(--text-secondary); cursor: pointer;"><i class="fa-solid fa-paperclip"></i></button>
                                    <input type="text" placeholder="Type a message..." class="auth-input" style="flex:1; background: #F8FAFC;">
                                    <button class="btn-primary" style="padding: 0 1.5rem;"><i class="fa-solid fa-paper-plane"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="view-automation" class="view">
                        <div class="card" style="max-width: 800px; margin: 0 auto;">
                            <h3 style="margin-bottom: 1.5rem;">Create Automated Reminder</h3>
                            <div class="input-group">
                                <label class="input-label">MESSAGE NAME</label>
                                <input type="text" placeholder="e.g. Weekly Safety Reminder" class="auth-input">
                            </div>
                            <div class="input-group">
                                <label class="input-label">TEMPLATE</label>
                                <textarea class="auth-input" placeholder="Hello {name}, please remember to..."></textarea>
                                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                    <span class="badge badge-blue" style="cursor: pointer;">{name}</span>
                                    <span class="badge badge-blue" style="cursor: pointer;">{dept}</span>
                                    <span class="badge badge-blue" style="cursor: pointer;">{date}</span>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                                <div class="input-group">
                                    <label class="input-label">FREQUENCY</label>
                                    <select class="auth-input">
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                </div>
                                <div class="input-group">
                                    <label class="input-label">TIME</label>
                                    <input type="time" class="auth-input" value="08:00">
                                </div>
                            </div>
                            <button class="btn-primary" style="width: 100%;">Schedule Automation</button>
                        </div>
                    </div>

                    <div id="view-jobforms" class="view">
                        <div style="max-width: 600px; margin: 0 auto;">
                            <form id="upload-form" class="card" style="border: 2px dashed var(--border-gray); background: #F8FAFC; text-align: center; padding: 4rem;">
                                <i class="fa-solid fa-cloud-arrow-up" style="font-size: 3rem; color: var(--viklar-blue); opacity: 0.3; margin-bottom: 1.5rem;"></i>
                                <h3 style="margin-bottom: 0.5rem;">Upload Completion Form</h3>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 2rem;">Drag and drop your scan or image here, or click to browse.</p>
                                <input type="file" id="job-file" class="hidden" onchange="handleFile(this)">
                                <button type="button" class="btn-primary" onclick="document.getElementById('job-file').click()">Select File</button>
                                <div id="file-name-display" style="margin-top: 1rem; font-weight: 600; color: var(--viklar-blue);"></div>
                                <div class="input-group" style="margin-top: 2rem; text-align: left;">
                                    <label class="input-label">JOB NAME</label>
                                    <input type="text" id="job-name-input" class="auth-input" placeholder="e.g. Site A Power Installation">
                                </div>
                                <button type="button" class="btn-primary" style="width: 100%;" onclick="uploadJobFile()">Upload →</button>
                            </form>
                        </div>
                    </div>

                    <div id="view-users" class="view">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <h3 style="font-family: 'Outfit';">User Management</h3>
                            <button class="btn-primary">+ Add User</button>
                        </div>
                        <div class="table-wrap">
                            <table id="users-table">
                                <thead>
                                    <tr><th>Name</th><th>Phone</th><th>Department</th><th>Role</th><th>Actions</th></tr>
                                </thead>
                                <tbody id="users-tbody">
                                    <!-- Dynamic -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div id="view-settings" class="view">
                        <div class="card" style="max-width: 700px; margin: 0 auto;">
                            <h3 style="margin-bottom: 2rem; font-family: 'Outfit';">System Settings</h3>
                            <div class="input-group">
                                <label class="input-label">GOOGLE SHEETS ID</label>
                                <input type="text" class="auth-input" value="${process.env.GOOGLE_SHEETS_ID}" readonly>
                            </div>
                            <div class="input-group">
                                <label class="input-label">MTN SIM PHONE (WHATSAPP)</label>
                                <input type="text" class="auth-input" value="${process.env.PHONE_ID || 'Connected'}" readonly>
                            </div>
                            <div class="input-group">
                                <label class="input-label">PRIMARY ADMIN</label>
                                <input type="text" class="auth-input" value="${process.env.PRIMARY_ADMIN || ''}" placeholder="+234...">
                            </div>
                            <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--border-gray);">
                            <button class="btn-primary">Save Changes</button>
                        </div>
                    </div>

                </div>
            </main>
        </div>

        <script>
            let currentUser = null;

            window.onload = () => {
                const stored = localStorage.getItem('viklar_user');
                if (stored) {
                    currentUser = JSON.parse(stored);
                    initApp();
                }
            };

            function sendOTP() {
                const phone = document.getElementById('login-phone').value;
                if (!phone) return alert('Enter phone number');
                
                document.getElementById('otp-phone-display').innerText = '+234 ' + phone;
                document.getElementById('login-step-1').classList.add('hidden');
                document.getElementById('login-step-2').classList.remove('hidden');
                
                // Simulate focus on first OTP input
                setTimeout(() => document.querySelector('.otp-input').focus(), 100);
            }

            function moveNext(el, nextId) {
                if (el.value.length === 1) {
                    document.getElementById(nextId).focus();
                }
            }

            async function verifyOTP() {
                // For this migration demo, we accept any 4 digits
                const phone = document.getElementById('login-phone').value;
                
                try {
                    const res = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: '234' + phone })
                    });
                    
                    if (res.ok) {
                        currentUser = await res.json();
                        localStorage.setItem('viklar_user', JSON.stringify(currentUser));
                        initApp();
                    } else {
                        // If not found, show setup
                        document.getElementById('login-flow').classList.add('hidden');
                        document.getElementById('setup-flow').classList.remove('hidden');
                    }
                } catch (e) {
                    alert('Connection error');
                }
            }

            function completeSetup() {
                const name = document.getElementById('setup-name').value;
                const email = document.getElementById('setup-email').value;
                const dept = document.getElementById('setup-dept').value;
                
                if (!name || !email) return alert('Name and Email are required');
                
                currentUser = {
                    name,
                    email,
                    department: dept,
                    role: 'Employee',
                    phone: '234' + document.getElementById('login-phone').value
                };
                
                localStorage.setItem('viklar_user', JSON.stringify(currentUser));
                initApp();
            }

            function initApp() {
                document.getElementById('login-flow').classList.add('hidden');
                document.getElementById('setup-flow').classList.add('hidden');
                document.getElementById('app-layout').style.display = 'flex';
                
                document.getElementById('user-display-name').innerText = currentUser.name;
                document.getElementById('user-display-role').innerText = currentUser.role;
                document.getElementById('user-avatar').innerText = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
                document.getElementById('view-title').innerText = \`Hello, \${currentUser.name.split(' ')[0]} 👋\`;

                // Handle Role Visibility
                const roleClass = 'role-' + currentUser.role.toLowerCase();
                document.querySelectorAll('.nav-item[class*="role-"]').forEach(el => {
                    if (!el.classList.contains(roleClass)) el.classList.add('hidden');
                });

                // Load Stats based on role
                renderStats();
                if (currentUser.role !== 'Employee') fetchUsers();
            }

            function renderStats() {
                const stats = document.getElementById('home-stats');
                stats.classList.remove('hidden');
                
                let html = '';
                if (currentUser.role === 'CEO' || currentUser.role === 'Admin') {
                    html = \`
                        <div class="card">
                            <div class="card-title">Bot Status</div>
                            <div class="stat-val" style="color: var(--success);">LIVE</div>
                            <div class="stat-delta">Uptime: 14d 2h</div>
                        </div>
                        <div class="card">
                            <div class="card-title">Total Reqs</div>
                            <div class="stat-val">342</div>
                            <div class="stat-delta delta-up">+12% this week</div>
                        </div>
                        <div class="card">
                            <div class="card-title">Pending</div>
                            <div class="stat-val" style="color: var(--pending);">45</div>
                            <div class="stat-delta">Action required</div>
                        </div>
                    \`;
                } else {
                    html = \`
                        <div class="card">
                            <div class="card-title">My Requisitions</div>
                            <div class="stat-val">12</div>
                            <div class="stat-delta">3 pending</div>
                        </div>
                        <div class="card">
                            <div class="card-title">Forms Uploaded</div>
                            <div class="stat-val">5</div>
                            <div class="stat-delta">All verified</div>
                        </div>
                    \`;
                }
                stats.innerHTML = html;
            }

            async function fetchUsers() {
                try {
                    const res = await fetch('/api/users');
                    const users = await res.json();
                    const tbody = document.getElementById('users-tbody');
                    tbody.innerHTML = users.map(u => \`
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div class="avatar" style="width: 30px; height: 30px; font-size: 0.7rem;">\${u.name[0]}</div>
                                    <span style="font-weight: 600;">\${u.name}</span>
                                </div>
                            </td>
                            <td>\${u.phone}</td>
                            <td>\${u.department}</td>
                            <td><span class="badge badge-blue">\${u.role}</span></td>
                            <td>
                                <i class="fa-solid fa-pen-to-square" style="color: var(--text-secondary); cursor: pointer; margin-right: 1rem;"></i>
                                <i class="fa-solid fa-trash" style="color: #ef4444; cursor: pointer;"></i>
                            </td>
                        </tr>
                    \`).join('');
                } catch (e) {}
            }

            function handleFile(input) {
                if (input.files && input.files[0]) {
                    document.getElementById('file-name-display').innerText = 'Selected: ' + input.files[0].name;
                }
            }

            async function uploadJobFile() {
                const fileInput = document.getElementById('job-file');
                const jobName = document.getElementById('job-name-input').value;
                
                if (!fileInput.files[0] || !jobName) return alert('File and Job Name are required');
                
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                formData.append('jobName', jobName);
                formData.append('phone', currentUser.phone);
                
                try {
                    const res = await fetch('/api/upload-form', { method: 'POST', body: formData });
                    const data = await res.json();
                    if (data.success) {
                        alert('Form uploaded successfully! Link: ' + data.link);
                        location.reload();
                    } else {
                        alert('Upload failed: ' + data.error);
                    }
                } catch (e) {
                    alert('Error connecting to server');
                }
            }

            function showView(id, btn) {
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                
                document.getElementById('view-' + id).classList.add('active');
                btn.classList.add('active');
                document.getElementById('view-title').innerText = btn.querySelector('span').innerText;
            }

            function toggleSidebar() {
                document.getElementById('sidebar').classList.toggle('collapsed');
            }

            function logout() {
                localStorage.removeItem('viklar_user');
                location.reload();
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// ── API: Job Forms (Upload) ──────────────────────────────────────────────────
app.post('/api/upload-form', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
        
        const { jobName, phone } = req.body;
        const fileLink = await uploadToDrive(req.file.path, `JobForm_${jobName}_${phone}`, req.file.mimetype);
        
        // Cleanup local temp file
        fs.unlinkSync(req.file.path);
        
        await logAudit(phone, 'Upload', `Uploaded job form for ${jobName}`);
        res.json({ success: true, link: fileLink });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Auth ──────────────────────────────────────────────────────────────
app.post('/api/auth', async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await authenticate(phone);
        if (user) {
            await logAudit(user.phone, 'Login', `User logged in as ${user.role}`);
            res.json(user);
        } else {
            res.status(401).json({ error: 'User not found or not authorized.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Users ──────────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
    try {
        const users = await listUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Automated Messages ──────────────────────────────────────────────────
app.get('/api/automated-messages', async (req, res) => {
    try {
        const messages = await listAutomatedMessages();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: Update Settings ─────────────────────────────────────────────────────
app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        const isServerless = !!process.env.VERCEL || !!process.env.AWS_REGION;

        if (!isServerless) {
            const envPath = path.join(__dirname, '.env');
            let envContent = '';
            for (const [key, value] of Object.entries(settings)) {
                envContent += `${key}=${value}\n`;
            }
            fs.writeFileSync(envPath, envContent);
        }
        
        for (const [key, value] of Object.entries(settings)) {
            process.env[key] = value;
        }

        res.sendStatus(200);
    } catch (err) {
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
        
        try {
            await connectWhatsApp(handleWebhook);
            initAutomation();
        } catch (err) {
            console.error('❌ Failed to initialize WhatsApp:', err.message);
        }
    });
}

module.exports = app;
