module.exports = (requisitions, process) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>ViKLAR | Employee Dashboard</title>
    <link rel="icon" href="/logo.png" type="image/png">
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
                        "label-sm": ["Inter"],
                        "outfit": ["Outfit", "sans-serif"]
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
        body { background-color: #F1F5F9; font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .custom-card-shadow { box-shadow: 0px 4px 12px rgba(30, 41, 59, 0.05); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .view { display: none; animation: fadeIn 0.3s ease; }
        .view.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .nav-item.active { background: rgba(255,255,255,0.2); }
        .hidden { display: none !important; }
        .auth-input:focus { outline: none; border-color: var(--viklar-blue); box-shadow: 0 0 0 3px rgba(46, 49, 146, 0.1); }
        .badge-success { background: #DCFCE7; color: #166534; }
        .badge-pending { background: #FEF3C7; color: #92400E; }
        .badge-blue { background: #DBEAFE; color: #1E40AF; }
    </style>
</head>
<body class="min-h-screen text-on-surface">

    <!-- 1. LOGIN OVERLAY -->
    <div id="login-flow" class="fixed inset-0 bg-primary z-[1000] flex items-center justify-center">
        <div class="flex bg-surface w-[1000px] h-[650px] rounded-[1.5rem] overflow-hidden shadow-2xl">
            <div class="w-[35%] bg-primary flex flex-col items-center justify-center p-12 text-white relative">
                <img src="/logo.png" style="height: 80px; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <div class="mt-8 text-center relative z-10">
                    <h2 class="font-outfit text-2xl font-bold">ViKLAR Technologies</h2>
                    <p class="opacity-70 text-sm mt-2">Automating Operations for Africa's Infrastructure</p>
                </div>
            </div>
            <div class="flex-1 p-16 flex flex-col justify-center" id="login-step-1">
                <h1 class="font-outfit text-3xl text-primary font-bold mb-2">Welcome Back</h1>
                <p class="text-on-surface-variant text-sm mb-10">Enter your phone number to access the ViKLAR Command Center.</p>
                
                <div class="mb-6">
                    <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">Phone Number</label>
                    <div class="flex gap-2">
                        <input type="text" value="+234" disabled class="w-20 text-center px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface">
                        <input type="text" id="login-phone" placeholder="803 000 0000" class="flex-1 px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" onkeypress="if(event.key==='Enter') sendOTP()">
                    </div>
                </div>
                
                <button class="bg-secondary-container text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:brightness-95 transition-all w-max" onclick="sendOTP()">Send OTP Code</button>
                <p class="mt-8 text-xs text-on-surface-variant">By continuing, you agree to ViKLAR's Terms of Service and Privacy Policy.</p>
            </div>

            <div class="flex-1 p-16 flex flex-col justify-center hidden" id="login-step-2">
                <h1 class="font-outfit text-3xl text-primary font-bold mb-2">Verify Identity</h1>
                <p class="text-on-surface-variant text-sm mb-10">We've sent a 4-digit code to your WhatsApp. <br><span id="otp-phone-display" class="text-primary font-bold"></span></p>
                
                <div class="flex gap-3 mb-8" id="otp-inputs">
                    <input type="text" maxlength="1" class="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-outline-variant focus:border-secondary-container focus:outline-none" onkeyup="moveNext(this, 'otp2')">
                    <input type="text" maxlength="1" id="otp2" class="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-outline-variant focus:border-secondary-container focus:outline-none" onkeyup="moveNext(this, 'otp3')">
                    <input type="text" maxlength="1" id="otp3" class="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-outline-variant focus:border-secondary-container focus:outline-none" onkeyup="moveNext(this, 'otp4')">
                    <input type="text" maxlength="1" id="otp4" class="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-outline-variant focus:border-secondary-container focus:outline-none" onkeyup="verifyOTP()">
                </div>
                
                <div class="flex justify-between items-center">
                    <p id="resend-timer" class="text-sm text-on-surface-variant">Resend code in 30s</p>
                    <button class="bg-secondary-container text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:brightness-95 transition-all" onclick="verifyOTP()">Continue →</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. PROFILE SETUP FLOW -->
    <div id="setup-flow" class="fixed inset-0 bg-primary z-[1000] flex items-center justify-center hidden">
        <div class="flex bg-surface w-[800px] h-[700px] rounded-[1.5rem] overflow-hidden shadow-2xl">
            <div class="flex-1 p-20 flex flex-col justify-center">
                <div class="flex items-center gap-4 mb-12">
                    <div class="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                        <h2 class="font-outfit text-2xl text-primary font-bold">Complete Your Profile</h2>
                        <p class="text-sm text-on-surface-variant">Step 1 of 3: Basic Information</p>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">FULL NAME *</label>
                    <input type="text" id="setup-name" placeholder="e.g. John Doe" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                </div>
                
                <div class="mb-6">
                    <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">EMAIL ADDRESS *</label>
                    <input type="email" id="setup-email" placeholder="john.doe@viklar.com" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                </div>

                <div class="mb-8">
                    <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">DEPARTMENT *</label>
                    <select id="setup-dept" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                        <option value="Management">Management</option>
                    </select>
                </div>

                <div class="flex justify-end gap-4 mt-8">
                    <button class="px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-all" onclick="skipSetup()">Skip</button>
                    <button class="bg-secondary-container text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:brightness-95 transition-all" onclick="completeSetup()">Next →</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 3. MAIN DASHBOARD -->
    <div id="app-layout" class="hidden h-screen w-full">
        <!-- NavigationDrawer -->
        <aside id="sidebar" class="hidden lg:flex flex-col py-6 px-4 w-[260px] h-screen fixed left-0 top-0 bg-primary dark:bg-primary-container shadow-md z-50 transition-all">
            <div class="mb-10 px-4 flex items-center gap-3">
                <img src="/logo.png" style="height: 32px; filter: brightness(0) invert(1);">
                <span class="font-outfit text-2xl font-bold text-white tracking-tight">ViKLAR</span>
            </div>
            <nav class="flex flex-col gap-2" id="nav-menu">
                <a class="nav-item active flex items-center gap-3 px-4 py-3 text-white font-label-bold rounded-lg cursor-pointer" onclick="showView('home', this)">
                    <span class="material-symbols-outlined">dashboard</span>
                    <span class="font-body-md">Dashboard</span>
                </a>
                <a class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors cursor-pointer" onclick="showView('requisitions', this)">
                    <span class="material-symbols-outlined">list_alt</span>
                    <span class="font-body-md">Requisitions</span>
                </a>
                <a class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors cursor-pointer" onclick="showView('chat', this)">
                    <span class="material-symbols-outlined">forum</span>
                    <span class="font-body-md">Intercompany Chat</span>
                </a>
                <a class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors cursor-pointer" onclick="showView('automation', this)">
                    <span class="material-symbols-outlined">bolt</span>
                    <span class="font-body-md">Automated Messages</span>
                </a>
                <a class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors cursor-pointer" onclick="showView('jobforms', this)">
                    <span class="material-symbols-outlined">cloud_upload</span>
                    <span class="font-body-md">Job Completion</span>
                </a>
                <a class="nav-item role-ceo role-admin flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors cursor-pointer" onclick="showView('users', this)">
                    <span class="material-symbols-outlined">group</span>
                    <span class="font-body-md">User Management</span>
                </a>
                <a class="nav-item flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors cursor-pointer" onclick="showView('settings', this)">
                    <span class="material-symbols-outlined">settings</span>
                    <span class="font-body-md">Settings</span>
                </a>
            </nav>
            <div class="mt-auto px-4">
                <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 relative">
                    <div id="user-avatar" class="w-10 h-10 rounded-full bg-secondary-container text-white flex items-center justify-center font-bold">JD</div>
                    <div class="overflow-hidden">
                        <p id="user-display-name" class="text-white font-label-bold text-label-bold truncate">John Doe</p>
                        <p id="user-display-role" class="text-white/50 text-label-sm font-label-sm truncate uppercase">Employee</p>
                    </div>
                    <button onclick="logout()" class="absolute right-3 text-white/40 hover:text-white"><i class="fa-solid fa-right-from-bracket"></i></button>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="lg:ml-[260px] min-h-screen flex flex-col w-full" style="max-width: calc(100% - 260px);">
            <!-- TopAppBar -->
            <header class="flex justify-between items-center h-16 px-6 sticky top-0 z-40 bg-surface dark:bg-surface-dim shadow-sm flex-shrink-0">
                <div class="flex items-center gap-4">
                    <button class="lg:hidden text-on-surface" onclick="toggleSidebar()">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <h1 id="view-title" class="font-outfit text-xl font-bold text-on-surface">Hello, John 👋</h1>
                </div>
                <div class="flex items-center gap-4">
                    <div class="relative hidden sm:block">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                        <input class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-body-md focus:ring-2 focus:ring-primary w-64" placeholder="Search resources..." type="text"/>
                    </div>
                    <button class="p-2 hover:bg-surface-container-low rounded-full transition-colors relative">
                        <span class="material-symbols-outlined text-on-surface-variant">notifications</span>
                        <span class="absolute top-2 right-2 w-2 h-2 bg-secondary-container rounded-full"></span>
                    </button>
                    <div class="h-8 w-[1px] bg-outline-variant mx-2"></div>
                    <div class="text-right hidden md:block">
                        <div class="text-sm font-bold">ViKLAR Bot</div>
                        <div class="text-[10px] text-success font-bold uppercase">● LIVE</div>
                    </div>
                </div>
            </header>

            <div class="flex-1 overflow-y-auto p-6 lg:p-gutter max-w-container-max mx-auto space-y-gutter w-full">
                <!-- Home View -->
                <div id="view-home" class="view active space-y-gutter">
                    <!-- Quick Action Bento Grid -->
                    <section class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                        <button class="group flex flex-col items-start text-left p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow transition-all hover:-translate-y-1 hover:shadow-lg" onclick="showView('requisitions', document.querySelectorAll('.nav-item')[1])">
                            <div class="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container mb-4">
                                <span class="material-symbols-outlined">add_circle</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-on-surface mb-1">New Requisition</h3>
                            <p class="font-body-md text-body-md text-on-surface-variant">Initiate a new resource or budget request.</p>
                        </button>
                        <button class="group flex flex-col items-start text-left p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow transition-all hover:-translate-y-1 hover:shadow-lg" onclick="showView('jobforms', document.querySelectorAll('.nav-item')[4])">
                            <div class="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary mb-4">
                                <span class="material-symbols-outlined">cloud_upload</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Upload Job Form</h3>
                            <p class="font-body-md text-body-md text-on-surface-variant">Submit completed job verification documents.</p>
                        </button>
                        <button class="group flex flex-col items-start text-left p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow transition-all hover:-translate-y-1 hover:shadow-lg" onclick="showView('chat', document.querySelectorAll('.nav-item')[2])">
                            <div class="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary mb-4">
                                <span class="material-symbols-outlined">forum</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Team Chat</h3>
                            <p class="font-body-md text-body-md text-on-surface-variant">Coordinate with the requisition review team.</p>
                        </button>
                    </section>

                    <!-- Main Workspace Grid -->
                    <div class="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
                        <!-- Left: Recent Requisitions Table & Analytics -->
                        <div class="xl:col-span-8 space-y-gutter">
                            <!-- Statistics Overview Row -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-gutter" id="home-stats">
                                <!-- Dynamic Stats Injected Here -->
                            </div>

                            <!-- Requisitions Table -->
                            <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow overflow-hidden">
                                <div class="p-6 flex justify-between items-center">
                                    <h2 class="font-headline-md text-headline-md">Your Recent Requisitions</h2>
                                    <button class="text-primary font-label-bold text-label-bold hover:underline" onclick="showView('requisitions', document.querySelectorAll('.nav-item')[1])">View All</button>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left" id="recent-reqs-table">
                                        <thead class="bg-surface-container-low border-y border-outline-variant/20">
                                            <tr>
                                                <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">ID</th>
                                                <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Date</th>
                                                <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Amount</th>
                                                <th class="px-6 py-4 font-label-bold text-label-bold text-outline uppercase">Status</th>
                                                <th class="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-outline-variant/20">
                                            ${requisitions.slice(0, 5).map(r => \`
                                                <tr class="hover:bg-surface-container-low transition-colors group">
                                                    <td class="px-6 py-4 font-label-bold text-primary">#\${r.requestId}</td>
                                                    <td class="px-6 py-4 text-body-md font-body-md text-on-surface-variant">\${r.timestamp.split(',')[0]}</td>
                                                    <td class="px-6 py-4 font-label-bold text-on-surface">\${r.amount}</td>
                                                    <td class="px-6 py-4">
                                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold \${
                                                            (r.status||'').toLowerCase() === 'approved' ? 'bg-success/10 text-success' :
                                                            (r.status||'').toLowerCase() === 'rejected' ? 'bg-error/10 text-error' :
                                                            'bg-warning/10 text-warning'
                                                        }">\${r.status || 'Pending'}</span>
                                                    </td>
                                                    <td class="px-6 py-4 text-right">
                                                        <button class="p-1 hover:bg-surface-container-highest rounded transition-colors text-outline group-hover:text-primary">
                                                            <span class="material-symbols-outlined">more_vert</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            \`).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Messages & Quick Create -->
                        <div class="xl:col-span-4 space-y-gutter">
                            <!-- Quick Create Requisition Card -->
                            <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                                <h3 class="font-headline-md text-headline-md mb-4">Quick Create</h3>
                                <form class="space-y-4">
                                    <div>
                                        <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Item Category</label>
                                        <select class="w-full rounded-lg border border-outline-variant/50 text-body-md p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                                            <option>Office Supplies</option>
                                            <option>Hardware/IT</option>
                                            <option>Travel/Expenses</option>
                                            <option>Software Licensing</option>
                                        </select>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Quantity</label>
                                            <input class="w-full rounded-lg border border-outline-variant/50 text-body-md p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="number" value="1"/>
                                        </div>
                                        <div>
                                            <label class="block text-label-sm font-label-sm text-on-surface-variant mb-1">Estimated Cost</label>
                                            <input class="w-full rounded-lg border border-outline-variant/50 text-body-md p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="$0.00" type="text"/>
                                        </div>
                                    </div>
                                    <button class="w-full bg-secondary-container text-white py-3 rounded-lg font-label-bold text-label-bold transition-all active:translate-y-0.5 hover:brightness-95" type="button" onclick="alert('Proceed to WhatsApp to finalize details.')">
                                        Submit Requisition
                                    </button>
                                </form>
                            </div>

                            <!-- Recent Updates Feed -->
                            <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow flex flex-col">
                                <div class="p-6 border-b border-outline-variant/20 flex justify-between items-center">
                                    <h3 class="font-headline-md text-headline-md">Recent Updates</h3>
                                    <button class="p-1 hover:bg-surface-container-low rounded-full">
                                        <span class="material-symbols-outlined text-outline">sync</span>
                                    </button>
                                </div>
                                <div class="p-0">
                                    <div class="p-4 border-b border-outline-variant/20">
                                        <div class="text-xs text-on-surface-variant mb-1">2:30 PM</div>
                                        <div class="text-sm font-semibold">Admin approved REQ-A1B2</div>
                                    </div>
                                    <div class="p-4 border-b border-outline-variant/20">
                                        <div class="text-xs text-on-surface-variant mb-1">1:15 PM</div>
                                        <div class="text-sm font-semibold">Team: Standup at 9am tomorrow</div>
                                    </div>
                                    <div class="p-4 text-center">
                                        <a href="#" class="text-primary text-sm font-bold hover:underline">View All Notifications</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Requisitions View -->
                <div id="view-requisitions" class="view">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex gap-4">
                            <div class="relative">
                                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                                <input type="text" placeholder="Search ID, purpose..." class="pl-10 pr-4 py-2 border border-outline-variant/50 rounded-lg outline-none focus:border-primary">
                            </div>
                            <select class="px-4 py-2 border border-outline-variant/50 rounded-lg outline-none focus:border-primary">
                                <option>Filter: ALL</option>
                                <option>Pending</option>
                                <option>Approved</option>
                            </select>
                        </div>
                        <button class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">add</span> New Request
                        </button>
                    </div>
                    
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow overflow-hidden">
                        <table class="w-full text-left">
                            <thead class="bg-surface-container-low border-b border-outline-variant/20">
                                <tr>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">ID</th>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Requester</th>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Purpose</th>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Amount</th>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-outline-variant/20">
                                ${requisitions.map(r => \`
                                    <tr class="hover:bg-surface-container-low transition-colors">
                                        <td class="px-6 py-4 font-bold text-primary">#\${r.requestId}</td>
                                        <td class="px-6 py-4">+\${r.phone}</td>
                                        <td class="px-6 py-4 max-w-[200px] truncate" title="\${r.purpose}">\${r.purpose}</td>
                                        <td class="px-6 py-4 font-bold">\${r.amount}</td>
                                        <td class="px-6 py-4">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold \${
                                                (r.status||'').toLowerCase() === 'approved' ? 'bg-success/10 text-success' :
                                                (r.status||'').toLowerCase() === 'rejected' ? 'bg-error/10 text-error' :
                                                'bg-warning/10 text-warning'
                                            }">\${r.status || 'Pending'}</span>
                                        </td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Chat View -->
                <div id="view-chat" class="view">
                    <div class="flex h-[calc(100vh-140px)] bg-surface rounded-xl border border-outline-variant/30 overflow-hidden custom-card-shadow">
                        <div class="w-[300px] border-r border-outline-variant/20 flex flex-col bg-surface-container-lowest">
                            <div class="p-4 border-b border-outline-variant/20">
                                <input type="text" placeholder="Search chats..." class="w-full px-4 py-2 border border-outline-variant/50 rounded-lg outline-none focus:border-primary text-sm">
                            </div>
                            <div class="flex-1 overflow-y-auto">
                                <div class="p-4 border-b border-outline-variant/20 bg-surface-container-low cursor-pointer border-l-4 border-l-secondary-container">
                                    <div class="font-bold text-sm">Company Broadcast</div>
                                    <div class="text-xs text-on-surface-variant truncate mt-1">Admin: Hi team, meeting at 3pm...</div>
                                </div>
                                <div class="p-4 border-b border-outline-variant/20 hover:bg-surface-container-low cursor-pointer">
                                    <div class="font-bold text-sm">Engineering Dept</div>
                                    <div class="text-xs text-on-surface-variant truncate mt-1">Sarah: Site A is ready...</div>
                                </div>
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col bg-[#F8FAFC]">
                            <div class="p-4 bg-surface border-b border-outline-variant/20 flex justify-between items-center">
                                <div>
                                    <div class="font-bold">Company Broadcast</div>
                                    <div class="text-[10px] text-success font-bold uppercase mt-1">Broadcast Mode</div>
                                </div>
                                <i class="fa-solid fa-ellipsis-vertical text-outline cursor-pointer"></i>
                            </div>
                            <div class="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                                <div class="max-w-[70%] bg-surface border border-outline-variant/20 p-4 rounded-2xl rounded-tl-none self-start shadow-sm">
                                    <div class="text-xs font-bold text-secondary-container mb-1">ADMIN</div>
                                    <p class="text-sm">Hi team, just a reminder for the safety standup at 3:00 PM today. Please be on time.</p>
                                    <div class="text-[10px] text-outline mt-2 text-right">10:30 AM</div>
                                </div>
                                <div class="max-w-[70%] bg-primary p-4 rounded-2xl rounded-tr-none self-end text-white shadow-sm">
                                    <p class="text-sm">Thanks! I'll be there.</p>
                                    <div class="text-[10px] text-white/70 mt-2 text-right">10:45 AM</div>
                                </div>
                            </div>
                            <div class="p-4 bg-surface border-t border-outline-variant/20 flex gap-4 items-center">
                                <button class="text-outline hover:text-primary"><i class="fa-solid fa-paperclip"></i></button>
                                <input type="text" placeholder="Type a message..." class="flex-1 bg-surface-container-low px-4 py-3 rounded-full outline-none focus:ring-1 focus:ring-primary">
                                <button class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-90"><i class="fa-solid fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Automation View -->
                <div id="view-automation" class="view">
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow p-8 max-w-[800px] mx-auto">
                        <h3 class="font-outfit text-2xl font-bold mb-6">Create Automated Reminder</h3>
                        
                        <div class="mb-6">
                            <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">MESSAGE NAME</label>
                            <input type="text" placeholder="e.g. Weekly Safety Reminder" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                        </div>
                        
                        <div class="mb-6">
                            <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">TEMPLATE</label>
                            <textarea class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none h-32" placeholder="Hello {name}, please remember to..."></textarea>
                            <div class="flex gap-2 mt-2">
                                <span class="bg-surface-container-high text-primary px-2 py-1 rounded text-xs font-bold cursor-pointer hover:bg-primary hover:text-white transition-colors">{name}</span>
                                <span class="bg-surface-container-high text-primary px-2 py-1 rounded text-xs font-bold cursor-pointer hover:bg-primary hover:text-white transition-colors">{dept}</span>
                                <span class="bg-surface-container-high text-primary px-2 py-1 rounded text-xs font-bold cursor-pointer hover:bg-primary hover:text-white transition-colors">{date}</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">FREQUENCY</label>
                                <select class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">TIME</label>
                                <input type="time" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" value="08:00">
                            </div>
                        </div>

                        <button class="w-full bg-secondary-container text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:brightness-95 transition-all">Schedule Automation</button>
                    </div>
                </div>

                <!-- Job Forms View -->
                <div id="view-jobforms" class="view">
                    <div class="max-w-[600px] mx-auto">
                        <form id="upload-form" class="bg-surface border-2 border-dashed border-outline-variant rounded-xl p-12 text-center relative hover:bg-surface-container-lowest transition-colors">
                            <i class="fa-solid fa-cloud-arrow-up text-5xl text-primary/30 mb-6"></i>
                            <h3 class="font-outfit text-xl font-bold mb-2">Upload Completion Form</h3>
                            <p class="text-sm text-on-surface-variant mb-8">Drag and drop your scan or image here, or click to browse.</p>
                            
                            <input type="file" id="job-file" class="hidden" onchange="handleFile(this)">
                            <button type="button" class="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors" onclick="document.getElementById('job-file').click()">Select File</button>
                            
                            <div id="file-name-display" class="mt-4 font-bold text-primary text-sm"></div>
                            
                            <div class="text-left mt-8">
                                <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">JOB NAME</label>
                                <input type="text" id="job-name-input" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Site A Power Installation">
                            </div>
                            
                            <button type="button" class="w-full bg-secondary-container text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:brightness-95 transition-all mt-6" onclick="uploadJobFile()">Upload →</button>
                        </form>
                    </div>
                </div>

                <!-- Users View -->
                <div id="view-users" class="view">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-outfit text-2xl font-bold">User Management</h3>
                        <button class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">add</span> Add User
                        </button>
                    </div>
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow overflow-hidden">
                        <table id="users-table" class="w-full text-left">
                            <thead class="bg-surface-container-low border-b border-outline-variant/20">
                                <tr>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Name</th>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Phone</th>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Department</th>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Role</th>
                                    <th class="px-6 py-4 font-label-bold text-outline uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="users-tbody" class="divide-y divide-outline-variant/20">
                                <!-- Dynamic -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Settings View -->
                <div id="view-settings" class="view">
                    <div class="bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow p-8 max-w-[700px] mx-auto">
                        <h3 class="font-outfit text-2xl font-bold mb-8">System Settings</h3>
                        
                        <div class="space-y-6">
                            <div>
                                <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">GOOGLE SHEETS ID</label>
                                <input type="text" class="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low outline-none text-on-surface-variant font-mono text-sm" value="\${process.env.GOOGLE_SHEETS_ID}" readonly>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">WHATSAPP PHONE ID</label>
                                <input type="text" class="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low outline-none text-on-surface-variant font-mono text-sm" value="\${process.env.PHONE_ID || 'Connected'}" readonly>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">PRIMARY ADMIN PHONE</label>
                                <input type="text" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" value="\${process.env.PRIMARY_ADMIN || ''}" placeholder="+234...">
                            </div>
                        </div>

                        <hr class="my-8 border-t border-outline-variant/30">
                        
                        <button class="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all">Save Changes</button>
                    </div>
                </div>

            </div>
        </main>
        
        <!-- Floating Action Button -->
        <button class="fixed bottom-8 right-8 w-14 h-14 bg-secondary-container text-white shadow-xl rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group z-50" onclick="showView('requisitions', document.querySelectorAll('.nav-item')[1])">
            <span class="material-symbols-outlined text-[28px]">add</span>
            <span class="absolute right-full mr-4 bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                New Requisition
            </span>
        </button>
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

        function skipSetup() {
            currentUser = {
                name: 'Guest User',
                email: '',
                department: 'Operations',
                role: 'Employee',
                phone: '234' + document.getElementById('login-phone').value
            };
            localStorage.setItem('viklar_user', JSON.stringify(currentUser));
            initApp();
        }

        function initApp() {
            document.getElementById('login-flow').classList.add('hidden');
            document.getElementById('setup-flow').classList.add('hidden');
            document.getElementById('app-layout').classList.remove('hidden');
            
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
            
            let html = '';
            if (currentUser.role === 'CEO' || currentUser.role === 'Admin') {
                html = \`
                    <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Spend (Q3)</span>
                            <span class="text-success text-xs font-bold flex items-center bg-success/10 px-2 py-1 rounded-full">
                                <span class="material-symbols-outlined text-[14px] mr-1">arrow_upward</span> 12%
                            </span>
                        </div>
                        <p class="text-3xl font-bold text-primary">$142,500.00</p>
                        <div class="mt-4 h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                            <div class="h-full bg-primary w-[65%]"></div>
                        </div>
                    </div>
                    <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Requests</span>
                            <span class="text-warning text-xs font-bold bg-warning/10 px-2 py-1 rounded-full">4 Pending</span>
                        </div>
                        <p class="text-3xl font-bold text-primary">28</p>
                        <div class="flex gap-1 mt-4">
                            <div class="h-2 flex-1 rounded-full bg-success"></div>
                            <div class="h-2 flex-1 rounded-full bg-success"></div>
                            <div class="h-2 flex-1 rounded-full bg-warning"></div>
                            <div class="h-2 flex-1 rounded-full bg-surface-container-highest"></div>
                            <div class="h-2 flex-1 rounded-full bg-surface-container-highest"></div>
                        </div>
                    </div>
                \`;
            } else {
                html = \`
                    <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">My Requisitions</span>
                            <span class="text-warning text-xs font-bold bg-warning/10 px-2 py-1 rounded-full">3 Pending</span>
                        </div>
                        <p class="text-3xl font-bold text-primary">12</p>
                        <div class="mt-4 h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                            <div class="h-full bg-primary w-[45%]"></div>
                        </div>
                    </div>
                    <div class="p-6 bg-surface border border-outline-variant/30 rounded-xl custom-card-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Forms Uploaded</span>
                            <span class="text-success text-xs font-bold bg-success/10 px-2 py-1 rounded-full">All Verified</span>
                        </div>
                        <p class="text-3xl font-bold text-primary">5</p>
                        <div class="flex gap-1 mt-4">
                            <div class="h-2 flex-1 rounded-full bg-success"></div>
                            <div class="h-2 flex-1 rounded-full bg-success"></div>
                            <div class="h-2 flex-1 rounded-full bg-success"></div>
                            <div class="h-2 flex-1 rounded-full bg-success"></div>
                            <div class="h-2 flex-1 rounded-full bg-success"></div>
                        </div>
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
                    <tr class="hover:bg-surface-container-low transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-secondary-container text-white flex items-center justify-center font-bold text-xs">\${u.name[0]}</div>
                                <span class="font-bold">\${u.name}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">\${u.phone}</td>
                        <td class="px-6 py-4">\${u.department}</td>
                        <td class="px-6 py-4"><span class="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold">\${u.role}</span></td>
                        <td class="px-6 py-4">
                            <i class="fa-solid fa-pen-to-square text-outline hover:text-primary cursor-pointer mr-4"></i>
                            <i class="fa-solid fa-trash text-error/70 hover:text-error cursor-pointer"></i>
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
                n.classList.remove('active');
                n.classList.remove('bg-surface-container-highest/20');
            });
            
            document.getElementById('view-' + id).classList.add('active');
            btn.classList.add('active', 'bg-surface-container-highest/20');
            document.getElementById('view-title').innerText = btn.querySelector('span:nth-child(2)').innerText;
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('flex');
        }

        function logout() {
            localStorage.removeItem('viklar_user');
            location.reload();
        }
    </script>
</body>
</html>
`;
