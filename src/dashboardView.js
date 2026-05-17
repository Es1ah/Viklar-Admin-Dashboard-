module.exports = function renderDashboard({ requisitions, env }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>ViKLAR | Employee Dashboard</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-variant": "#d8e3fb",
                        "on-secondary-container": "#663800",
                        "primary": "#15157d",
                        "surface-dim": "#cfdaf2",
                        "surface-bright": "#f9f9ff",
                        "on-primary-fixed": "#04006d",
                        "on-secondary-fixed-variant": "#6b3b00",
                        "on-primary-fixed-variant": "#373a9b",
                        "on-tertiary": "#ffffff",
                        "tertiary": "#491a00",
                        "on-background": "#111c2d",
                        "secondary-fixed": "#ffdcbf",
                        "on-error": "#ffffff",
                        "info": "#3B82F6",
                        "on-surface-variant": "#464652",
                        "workspace-bg": "#F1F5F9",
                        "tertiary-container": "#6c2a00",
                        "surface-container-lowest": "#ffffff",
                        "on-tertiary-fixed": "#341100",
                        "warning": "#F59E0B",
                        "error": "#ba1a1a",
                        "on-secondary-fixed": "#2d1600",
                        "surface-container-highest": "#d8e3fb",
                        "background": "#f9f9ff",
                        "outline-variant": "#c7c5d4",
                        "primary-container": "#2e3192",
                        "tertiary-fixed-dim": "#ffb692",
                        "on-tertiary-container": "#f19160",
                        "on-primary": "#ffffff",
                        "inverse-surface": "#263143",
                        "success": "#10B981",
                        "surface-container-high": "#dee8ff",
                        "surface-container": "#e7eeff",
                        "error-container": "#ffdad6",
                        "primary-fixed": "#e1e0ff",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-container-low": "#f0f3ff",
                        "inverse-on-surface": "#ecf1ff",
                        "on-tertiary-fixed-variant": "#773207",
                        "surface-tint": "#4f54b4",
                        "secondary-container": "#fd9923",
                        "tertiary-fixed": "#ffdbcb",
                        "inverse-primary": "#c0c1ff",
                        "secondary-fixed-dim": "#ffb874",
                        "on-primary-container": "#9da1ff",
                        "on-secondary": "#ffffff",
                        "secondary": "#8c4f00",
                        "on-error-container": "#93000a",
                        "on-surface": "#111c2d",
                        "surface": "#FFFFFF",
                        "outline": "#777683"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "stack-lg": "32px",
                        "stack-sm": "8px",
                        "margin-mobile": "16px",
                        "container-max": "1440px",
                        "stack-md": "16px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "label-bold": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-xl-mobile": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-xl": ["Inter"],
                        "body-md": ["Inter"],
                        "label-sm": ["Inter"]
                    },
                    "fontSize": {
                        "label-bold": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700"}],
                        "body-lg": ["15px", {"lineHeight": "24px", "fontWeight": "400"}],
                        "headline-xl-mobile": ["24px", {"lineHeight": "30px", "fontWeight": "700"}],
                        "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                        "headline-xl": ["28px", {"lineHeight": "34px", "fontWeight": "700"}],
                        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                        "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "500"}]
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #F1F5F9;
            font-family: 'Inter', sans-serif;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .custom-card-shadow {
            box-shadow: 0px 4px 12px rgba(30, 41, 59, 0.05);
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }

        /* --- Auth Flows --- */
        .auth-overlay { position: fixed; inset: 0; background: #2E3192; z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .auth-container { display: flex; background: white; width: 1000px; height: 650px; border-radius: 1.5rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .auth-sidebar { width: 35%; background: #2E3192; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: white; position: relative; }
        .auth-content { flex: 1; padding: 4rem; display: flex; flex-direction: column; justify-content: center; position: relative; }
        .auth-title { font-family: 'Inter', sans-serif; font-size: 1.75rem; color: #2E3192; margin-bottom: 0.5rem; font-weight: 700; }
        .auth-subtitle { color: #64748B; margin-bottom: 2.5rem; font-size: 0.95rem; }
        .input-group { margin-bottom: 1.5rem; }
        .input-label { display: block; font-size: 0.85rem; font-weight: 600; color: #1E293B; margin-bottom: 0.5rem; }
        .auth-input { width: 100%; padding: 0.875rem 1rem; border-radius: 0.5rem; border: 1px solid #E2E8F0; font-family: inherit; font-size: 1rem; background: #F8FAFC; transition: all 0.2s; }
        .otp-container { display: flex; gap: 0.75rem; margin-bottom: 2rem; }
        .otp-input { width: 3.5rem; height: 3.5rem; text-align: center; font-size: 1.5rem; font-weight: 700; border-radius: 0.75rem; border: 2px solid #E2E8F0; background: #F8FAFC; }
        .btn-primary { background: #F7941D; color: white; border: none; padding: 0.875rem 2rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .badge-blue { background: #DBEAFE; color: #1E40AF; }
        .badge-success { background: #DCFCE7; color: #166534; }
        .badge-pending { background: #FEF3C7; color: #92400E; }

        .view { display: none; }
        .view.active { display: block; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="min-h-screen text-on-surface">

    <!-- 1. LOGIN OVERLAY -->
    <div id="login-flow" class="auth-overlay">
        <div class="auth-container">
            <div class="auth-sidebar">
                <img src="/logo.png" style="height: 80px; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <div style="margin-top: 2rem; text-align: center; position: relative; z-index: 1;">
                    <h2>ViKLAR Technologies</h2>
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
            </div>
            <div class="auth-content hidden" id="login-step-2" style="display: none;">
                <h1 class="auth-title">Verify Identity</h1>
                <p class="auth-subtitle">We've sent a 4-digit code to your WhatsApp. <br><span id="otp-phone-display" style="color: #2E3192; font-weight: 600;"></span></p>
                <div class="otp-container" id="otp-inputs">
                    <input type="text" maxlength="1" class="otp-input" onkeyup="moveNext(this, 'otp2')">
                    <input type="text" maxlength="1" id="otp2" class="otp-input" onkeyup="moveNext(this, 'otp3')">
                    <input type="text" maxlength="1" id="otp3" class="otp-input" onkeyup="moveNext(this, 'otp4')">
                    <input type="text" maxlength="1" id="otp4" class="otp-input" onkeyup="verifyOTP()">
                </div>
                <button class="btn-primary" onclick="verifyOTP()">Continue →</button>
            </div>
        </div>
    </div>

    <!-- 2. PROFILE SETUP FLOW -->
    <div id="setup-flow" class="auth-overlay" style="display: none;">
        <div class="auth-container" style="height: 700px;">
            <div class="auth-content" style="padding: 5rem;">
                <h2 style="font-size: 1.5rem; margin-bottom: 2rem; color: #2E3192; font-weight: bold;">Complete Your Profile</h2>
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
                    <select id="setup-dept" class="auth-input">
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                        <option value="Management">Management</option>
                    </select>
                </div>
                <button class="btn-primary" onclick="completeSetup()">Next →</button>
            </div>
        </div>
    </div>

    <!-- MAIN APP LAYOUT -->
    <div id="app-layout" style="display: none;">
        <!-- NavigationDrawer -->
        <aside class="hidden lg:flex flex-col py-6 px-4 w-[260px] h-screen fixed left-0 top-0 bg-primary dark:bg-primary-container shadow-md z-50">
            <div class="mb-10 px-4">
                <span class="font-headline-md text-headline-md font-bold text-white tracking-tight">ViKLAR</span>
            </div>
            <nav class="flex flex-col gap-2">
                <button onclick="showView('home', this)" class="nav-item flex items-center gap-3 px-4 py-3 bg-surface-container-highest/20 text-white font-label-bold rounded-lg transition-colors w-full text-left">
                    <span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                    <span class="font-body-md text-body-md">Dashboard</span>
                </button>
                <button onclick="showView('requisitions', this)" class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-surface-container-highest/10 transition-colors w-full text-left">
                    <span class="material-symbols-outlined" data-icon="description">description</span>
                    <span class="font-body-md text-body-md">Requisitions</span>
                </button>
                <button onclick="showView('chat', this)" class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-surface-container-highest/10 transition-colors w-full text-left">
                    <span class="material-symbols-outlined" data-icon="chat">chat</span>
                    <span class="font-body-md text-body-md">Chat</span>
                </button>
                <button onclick="showView('automation', this)" class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-surface-container-highest/10 transition-colors w-full text-left">
                    <span class="material-symbols-outlined" data-icon="bolt">bolt</span>
                    <span class="font-body-md text-body-md">Automated Messages</span>
                </button>
                <button onclick="showView('jobforms', this)" class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-surface-container-highest/10 transition-colors w-full text-left">
                    <span class="material-symbols-outlined" data-icon="assignment">assignment</span>
                    <span class="font-body-md text-body-md">Job Form</span>
                </button>
                <button onclick="showView('users', this)" class="nav-item role-ceo role-admin flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-surface-container-highest/10 transition-colors w-full text-left">
                    <span class="material-symbols-outlined" data-icon="group">group</span>
                    <span class="font-body-md text-body-md">Users</span>
                </button>
                <button onclick="showView('settings', this)" class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-surface-container-highest/10 transition-colors w-full text-left">
                    <span class="material-symbols-outlined" data-icon="settings">settings</span>
                    <span class="font-body-md text-body-md">Settings</span>
                </button>
            </nav>
            <div class="mt-auto px-4 cursor-pointer" onclick="logout()">
                <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                    <div id="user-avatar" class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">JD</div>
                    <div class="overflow-hidden">
                        <p id="user-display-name" class="text-white font-label-bold text-label-bold truncate">John Doe</p>
                        <p id="user-display-role" class="text-white/50 text-label-sm font-label-sm truncate">Role</p>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="lg:ml-[260px] min-h-screen flex flex-col">
            <!-- TopAppBar -->
            <header class="flex justify-between items-center h-16 px-6 sticky top-0 z-40 bg-surface dark:bg-surface-dim shadow-sm">
                <div class="flex items-center gap-4">
                    <button class="lg:hidden text-on-surface">
                        <span class="material-symbols-outlined" data-icon="menu">menu</span>
                    </button>
                    <h1 id="view-title" class="font-headline-md text-headline-md text-on-surface">Dashboard</h1>
                </div>
                <div class="flex items-center gap-4">
                    <button class="p-2 hover:bg-surface-container-low rounded-full transition-colors relative">
                        <span class="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
                        <span class="absolute top-2 right-2 w-2 h-2 bg-secondary-container rounded-full"></span>
                    </button>
                </div>
            </header>

            <div class="p-6 lg:p-gutter max-w-container-max mx-auto w-full space-y-gutter flex-1">
                
                <!-- VIEW: HOME -->
                <div id="view-home" class="view active">
                    <!-- Quick Action Bento Grid -->
                    <section class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-6">
                        <button onclick="showView('requisitions', document.querySelectorAll('.nav-item')[1])" class="group flex flex-col items-start text-left p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div class="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container mb-4">
                                <span class="material-symbols-outlined" data-icon="add_circle">add_circle</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-on-surface mb-1">New Requisition</h3>
                            <p class="font-body-md text-body-md text-on-surface-variant">Initiate a new resource or budget request.</p>
                        </button>
                        <button onclick="showView('jobforms', document.querySelectorAll('.nav-item')[4])" class="group flex flex-col items-start text-left p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div class="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary mb-4">
                                <span class="material-symbols-outlined" data-icon="upload_file">upload_file</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Upload Job Form</h3>
                            <p class="font-body-md text-body-md text-on-surface-variant">Submit completion forms for your jobs.</p>
                        </button>
                        <button onclick="showView('chat', document.querySelectorAll('.nav-item')[2])" class="group flex flex-col items-start text-left p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div class="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary mb-4">
                                <span class="material-symbols-outlined" data-icon="forum">forum</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Team Chat</h3>
                            <p class="font-body-md text-body-md text-on-surface-variant">Coordinate with the requisition review team.</p>
                        </button>
                    </section>

                    <!-- Main Workspace Grid -->
                    <div class="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
                        <div class="xl:col-span-8 space-y-gutter">
                            <!-- Statistics Overview Row -->
                            <div id="home-stats" class="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
                                <!-- JS injected -->
                            </div>

                            <!-- Requisitions Table -->
                            <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow overflow-hidden">
                                <div class="p-6 flex justify-between items-center">
                                    <h2 class="font-headline-md text-headline-md">Your Recent Requisitions</h2>
                                    <button onclick="showView('requisitions', document.querySelectorAll('.nav-item')[1])" class="text-primary font-label-bold text-label-bold hover:underline">View All</button>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left">
                                        <thead class="bg-surface-container-low border-y border-outline-variant/20">
                                            <tr>
                                                <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">ID</th>
                                                <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Date</th>
                                                <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Amount</th>
                                                <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-outline-variant/20">
                                            \${requisitions.slice(0, 5).map(r => \`
                                                <tr class="hover:bg-surface-container-low transition-colors group">
                                                    <td class="px-6 py-4 font-label-bold text-on-surface">#\${r.requestId}</td>
                                                    <td class="px-6 py-4 text-body-md font-body-md text-on-surface-variant">\${r.timestamp.split(',')[0]}</td>
                                                    <td class="px-6 py-4 font-label-bold text-on-surface">\${r.amount}</td>
                                                    <td class="px-6 py-4">
                                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-highest text-primary">\${r.status}</span>
                                                    </td>
                                                </tr>
                                            \`).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Quick Create -->
                        <div class="xl:col-span-4 space-y-gutter">
                            <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                                <h3 class="font-headline-md text-headline-md mb-4">Quick Create</h3>
                                <form class="space-y-4">
                                    <div>
                                        <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Item Category</label>
                                        <select class="w-full rounded-lg border-outline-variant/30 text-body-md font-body-md focus:border-primary focus:ring-primary p-2">
                                            <option>Office Supplies</option>
                                            <option>Hardware/IT</option>
                                            <option>Travel/Expenses</option>
                                        </select>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Quantity</label>
                                            <input class="w-full rounded-lg border-outline-variant/30 text-body-md font-body-md focus:border-primary focus:ring-primary p-2" type="number" value="1"/>
                                        </div>
                                        <div>
                                            <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Estimated Cost</label>
                                            <input class="w-full rounded-lg border-outline-variant/30 text-body-md font-body-md focus:border-primary focus:ring-primary p-2" placeholder="$0.00" type="text"/>
                                        </div>
                                    </div>
                                    <button class="w-full bg-secondary-container text-on-secondary py-3 rounded-lg font-label-bold text-label-bold transition-all active:translate-y-0.5 hover:brightness-95" type="button">
                                        Submit Requisition
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- VIEW: REQUISITIONS -->
                <div id="view-requisitions" class="view">
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow overflow-hidden">
                        <div class="p-6 flex justify-between items-center border-b border-outline-variant/20">
                            <h2 class="font-headline-md text-headline-md">All Requisitions</h2>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="bg-surface-container-low border-y border-outline-variant/20">
                                    <tr>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">ID</th>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Requester</th>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Purpose</th>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Amount</th>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline-variant/20">
                                    \${requisitions.map(r => \`
                                        <tr class="hover:bg-surface-container-low transition-colors group">
                                            <td class="px-6 py-4 font-label-bold text-on-surface">#\${r.requestId}</td>
                                            <td class="px-6 py-4 text-body-md font-body-md text-on-surface-variant">+\${r.phone}</td>
                                            <td class="px-6 py-4 text-body-md font-body-md text-on-surface-variant max-w-[200px] truncate">\${r.purpose}</td>
                                            <td class="px-6 py-4 font-label-bold text-on-surface">\${r.amount}</td>
                                            <td class="px-6 py-4">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-highest text-primary">\${r.status}</span>
                                            </td>
                                        </tr>
                                    \`).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- VIEW: CHAT -->
                <div id="view-chat" class="view">
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow flex flex-col h-[600px]">
                        <div class="p-6 border-b border-outline-variant/20">
                            <h3 class="font-headline-md text-headline-md">Intercompany Chat</h3>
                        </div>
                        <div class="flex-1 p-6 flex flex-col justify-center items-center text-outline">
                            <span class="material-symbols-outlined text-6xl mb-4">forum</span>
                            <p>Chat system coming soon.</p>
                        </div>
                    </div>
                </div>

                <!-- VIEW: AUTOMATION -->
                <div id="view-automation" class="view">
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow p-6 max-w-2xl mx-auto">
                        <h3 class="font-headline-md text-headline-md mb-6">Create Automated Message</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Message Name</label>
                                <input class="w-full rounded-lg border-outline-variant/30 p-3" type="text" placeholder="e.g. Weekly Update"/>
                            </div>
                            <button class="bg-primary text-white py-3 px-6 rounded-lg font-label-bold">Schedule Automation</button>
                        </div>
                    </div>
                </div>

                <!-- VIEW: JOB FORMS -->
                <div id="view-jobforms" class="view">
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow p-8 text-center max-w-2xl mx-auto">
                        <span class="material-symbols-outlined text-6xl text-primary mb-4 opacity-50">cloud_upload</span>
                        <h3 class="font-headline-md text-headline-md mb-2">Upload Completion Form</h3>
                        <p class="text-on-surface-variant mb-6">Select a scanned document or image of the completed job form.</p>
                        
                        <input type="file" id="job-file" class="hidden" onchange="handleFile(this)">
                        <button type="button" class="bg-surface-container-highest text-primary py-3 px-6 rounded-lg font-label-bold mb-4" onclick="document.getElementById('job-file').click()">Select File</button>
                        <div id="file-name-display" class="text-primary font-bold mb-6"></div>

                        <div class="text-left mb-6">
                            <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Job Name</label>
                            <input type="text" id="job-name-input" class="w-full rounded-lg border-outline-variant/30 p-3" placeholder="e.g. Site A Repair">
                        </div>

                        <button type="button" class="w-full bg-primary text-white py-3 rounded-lg font-label-bold" onclick="uploadJobFile()">Upload Form</button>
                    </div>
                </div>

                <!-- VIEW: USERS -->
                <div id="view-users" class="view">
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow overflow-hidden">
                        <div class="p-6 flex justify-between items-center border-b border-outline-variant/20">
                            <h2 class="font-headline-md text-headline-md">User Management</h2>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="bg-surface-container-low border-y border-outline-variant/20">
                                    <tr>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Name</th>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Phone</th>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Department</th>
                                        <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Role</th>
                                    </tr>
                                </thead>
                                <tbody id="users-tbody" class="divide-y divide-outline-variant/20">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- VIEW: SETTINGS -->
                <div id="view-settings" class="view">
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow p-6 max-w-2xl mx-auto">
                        <h3 class="font-headline-md text-headline-md mb-6">System Settings</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Google Sheets ID</label>
                                <input class="w-full rounded-lg border-outline-variant/30 p-3 bg-surface-container-low" type="text" value="\${env.GOOGLE_SHEETS_ID}" readonly/>
                            </div>
                            <div>
                                <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">WhatsApp Phone ID</label>
                                <input class="w-full rounded-lg border-outline-variant/30 p-3 bg-surface-container-low" type="text" value="\${env.PHONE_ID || 'Connected'}" readonly/>
                            </div>
                        </div>
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
            document.getElementById('login-step-1').style.display = 'none';
            document.getElementById('login-step-2').style.display = 'flex';
            
            setTimeout(() => document.querySelector('.otp-input').focus(), 100);
        }

        function moveNext(el, nextId) {
            if (el.value.length === 1) {
                document.getElementById(nextId).focus();
            }
        }

        async function verifyOTP() {
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
                    document.getElementById('login-flow').style.display = 'none';
                    document.getElementById('setup-flow').style.display = 'flex';
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
            document.getElementById('login-flow').style.display = 'none';
            document.getElementById('setup-flow').style.display = 'none';
            document.getElementById('app-layout').style.display = 'block';
            
            document.getElementById('user-display-name').innerText = currentUser.name;
            document.getElementById('user-display-role').innerText = currentUser.role;
            document.getElementById('user-avatar').innerText = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

            // Role logic
            const roleClass = 'role-' + currentUser.role.toLowerCase();
            document.querySelectorAll('.nav-item.role-ceo, .nav-item.role-admin').forEach(el => {
                if (currentUser.role !== 'CEO' && currentUser.role !== 'Admin') {
                    el.style.display = 'none';
                }
            });

            renderStats();
            if (currentUser.role !== 'Employee') fetchUsers();
        }

        function renderStats() {
            const stats = document.getElementById('home-stats');
            let html = '';
            if (currentUser.role === 'CEO' || currentUser.role === 'Admin') {
                html = \`
                    <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-label-sm font-label-sm text-on-surface-variant">Bot Status</span>
                        </div>
                        <p class="text-headline-xl font-headline-xl text-success">LIVE</p>
                    </div>
                    <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-label-sm font-label-sm text-on-surface-variant">Total Reqs</span>
                        </div>
                        <p class="text-headline-xl font-headline-xl">342</p>
                    </div>
                \`;
            } else {
                html = \`
                    <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-label-sm font-label-sm text-on-surface-variant">My Requisitions</span>
                        </div>
                        <p class="text-headline-xl font-headline-xl">12</p>
                    </div>
                    <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-label-sm font-label-sm text-on-surface-variant">Forms Uploaded</span>
                        </div>
                        <p class="text-headline-xl font-headline-xl">5</p>
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
                    <tr class="hover:bg-surface-container-low transition-colors group">
                        <td class="px-6 py-4 font-label-bold text-on-surface">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <div class="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">\${u.name[0]}</div>
                                <span>\${u.name}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-body-md font-body-md text-on-surface-variant">\${u.phone}</td>
                        <td class="px-6 py-4 text-body-md font-body-md text-on-surface-variant">\${u.department}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-highest text-primary">\${u.role}</span>
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
            document.querySelectorAll('.nav-item').forEach(n => {
                n.classList.remove('bg-surface-container-highest/20', 'text-white', 'font-label-bold');
                n.classList.add('text-white/70');
            });
            
            document.getElementById('view-' + id).classList.add('active');
            btn.classList.add('bg-surface-container-highest/20', 'text-white', 'font-label-bold');
            btn.classList.remove('text-white/70');
            
            const titleSpan = btn.querySelector('span:nth-child(2)');
            if(titleSpan) {
                document.getElementById('view-title').innerText = titleSpan.innerText;
            }
        }

        function logout() {
            localStorage.removeItem('viklar_user');
            location.reload();
        }
    </script>
</body>
</html>`;
};
