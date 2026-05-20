export const COMPONENT_PROMPTS: string[] = [
  // 1 — CTA button, dark theme, blue accent
  `Build a primary call-to-action button component showing three states: default, hover (simulated with a lighter shade), and disabled. Page background bg-gray-950. Default button: bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg inline-flex items-center gap-2 with an inline SVG right-arrow icon, label "Start Your Free Trial". Hover variant: bg-blue-500 shadow-lg shadow-blue-500/30 same label. Disabled: bg-gray-700 text-gray-500 cursor-not-allowed opacity-60 same label. Present all three states side by side inside a dark bg-gray-900 card with a small text-gray-400 caption below each. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 2 — Email signup form, light theme, green accent
  `Build an email newsletter signup form for a design publication called "Craft Weekly". Light bg-gray-50 background. Show three stacked states: (1) Default — headline "Get weekly design insights" in text-gray-900 font-bold text-2xl, subtitle "Join 12,400 designers. No spam, ever." in text-gray-500, email input with placeholder "you@company.com" and focus:ring-green-500, submit button "Subscribe Free" in bg-green-600 hover:bg-green-700 text-white rounded-lg. (2) Error — ring-red-500 border on input, red message "Please enter a valid email address" in text-red-600 text-sm below. (3) Success — green checkmark SVG, "You're in! Check your inbox to confirm." in text-green-700 bg-green-50 rounded-lg p-4, no form fields. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 3 — Pricing card Pro, dark theme, purple gradient
  `Build a pricing card for the "Pro" tier of a SaaS app called "Shipfast". Dark bg-gray-950 background. Card: bg-gradient-to-b from-purple-900/40 to-gray-900 border border-purple-500/30 rounded-2xl p-8 shadow-xl w-80. Badge "Most Popular" in bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full at top. Price: "$49" in text-5xl font-black text-white with "/month" in text-gray-400 text-lg. Feature list (5 items, checkmark SVG in text-purple-400 per row): "Unlimited projects", "Priority support (24h SLA)", "Custom domain", "Advanced analytics", "Team collaboration up to 10 seats". CTA button: bg-purple-600 hover:bg-purple-500 text-white w-full py-3 rounded-xl font-semibold text-base "Get Pro Access". Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 4 — Responsive navbar, light theme
  `Build a responsive navbar for a SaaS product called "Flowdesk". bg-white border-b border-gray-200 w-full px-6 py-4 flex items-center justify-between. Left: a small blue square SVG icon + "Flowdesk" in font-semibold text-gray-900 text-lg. Center: navigation links "Features", "Pricing", "Docs", "Blog" in text-gray-600 hover:text-gray-900 font-medium gap-6 — hidden on mobile via hidden md:flex. Right: "Sign in" link in text-gray-600 font-medium and "Get Started" button in bg-blue-600 text-white px-4 py-2 rounded-lg font-medium. Include a mobile hamburger icon (three-line SVG) visible via md:hidden. Below the navbar, show a white page area with "Build better products faster" in text-3xl font-bold text-gray-900 as mock page content. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 5 — User profile card, dark theme, slate/cyan
  `Build a user profile card for a developer named "Alex Rivera". Dark bg-slate-900 background. Card: bg-slate-800 rounded-2xl p-6 shadow-lg w-80. Avatar: 72px circle bg-cyan-600 text-white text-2xl font-bold initials "AR". Name "Alex Rivera" in text-white font-bold text-xl mt-3. Role "Senior Frontend Engineer" in text-cyan-400 text-sm. Location "San Francisco, CA" with a map-pin SVG in text-slate-400 text-sm mt-1. Stats row (3 items in bg-slate-700 rounded-lg px-4 py-2): "128" / "Projects", "4.2k" / "Followers", "891" / "Following" — numbers in text-white font-semibold, labels in text-slate-400 text-xs. Action buttons: "Follow" in bg-cyan-600 text-white px-5 py-2 rounded-lg font-medium and "Message" in bg-slate-700 text-slate-200 px-5 py-2 rounded-lg font-medium, side by side. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 6 — Toast stack, light theme
  `Build a toast notification stack with three distinct toasts. Light bg-gray-100 background. Each toast: bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-start gap-3 w-96. (1) Success toast: border-green-500, green checkmark-circle SVG in text-green-500, title "Payment successful" in text-gray-900 font-medium text-sm, body "Your invoice #INV-2847 has been paid." in text-gray-500 text-sm, ✕ close button in text-gray-400 ml-auto. (2) Error toast: border-red-500, red x-circle SVG, title "Upload failed", body "File exceeds the 10 MB size limit." (3) Warning toast: border-amber-500, amber triangle-warning SVG in text-amber-500, title "Storage almost full", body "You are using 92% of your 5 GB storage." All three stacked vertically with gap-3. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 7 — Stats dashboard card, dark theme, emerald
  `Build a stats dashboard card for a SaaS product metrics overview. Dark bg-gray-950 background. Card: bg-gray-900 rounded-2xl p-6 border border-gray-800 w-full max-w-lg. Header: "Performance Overview" in text-white font-bold text-xl and "May 2026" in text-gray-400 text-sm, space-between. Four stat tiles in a 2x2 grid, each in bg-gray-800 rounded-xl p-4: (a) "Monthly Revenue" / "$48,290" text-3xl font-black text-white / "+12.4%" text-emerald-400 text-sm; (b) "Active Users" / "3,847" / "+8.1%" text-emerald-400; (c) "Churn Rate" / "2.3%" / "-0.4%" text-emerald-400; (d) "Avg Session" / "4m 32s" / "+23s vs last month" text-emerald-400. Each tile has label in text-gray-400 text-xs uppercase tracking-wide above the number, and a simple 5-bar SVG sparkline in emerald-500/40 tones at the bottom of the tile. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 8 — Login form, light theme, minimal
  `Build a minimal login form styled like Notion's login page. Light bg-gray-50 background. Centered card: bg-white border border-gray-200 shadow-sm rounded-2xl p-8 w-80. Logo: a 32px black rounded square SVG with a white "N". Heading: "Log in to Notion" in text-gray-900 font-semibold text-xl text-center mt-4. Two social auth buttons (full width, rounded-lg border border-gray-300 text-gray-700 font-medium py-2.5): Google (Google "G" colored SVG icon + "Continue with Google") and Apple (Apple SVG icon + "Continue with Apple"). Divider: horizontal line with "or" in text-gray-400 text-sm. Email input: label "Email" in text-gray-700 text-sm font-medium, input with placeholder "Enter your email..." border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-blue-500 w-full. Submit button: "Continue with email" in bg-blue-600 text-white w-full py-2.5 rounded-lg font-medium. Footer: "No account? Create one" in text-blue-600 text-sm text-center mt-4. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 9 — E-commerce product card, light theme
  `Build an e-commerce product card for "Nike Air Max 270" running shoes. Light bg-gray-50 background. Card: bg-white rounded-2xl shadow-sm overflow-hidden w-72. Image area: 200px tall bg-gray-100 with a centered simple SVG sneaker silhouette outline in text-gray-300. Product name "Nike Air Max 270" in text-gray-900 font-semibold text-base mt-3 px-4. Brand "Nike" in text-gray-400 text-sm px-4. Color swatches: 3 small circles (bg-gray-900, bg-gray-100 border border-gray-300, bg-red-500) inline in px-4. Price row: "$189.99" in text-gray-900 font-bold text-xl, "$230.00" line-through in text-gray-400 text-sm ml-2, "22% off" badge bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full ml-1. Rating: 4.5 stars SVG in text-amber-400 and "(2.4k reviews)" in text-gray-400 text-sm px-4 pb-2. Add to cart button: bg-gray-900 text-white w-full py-3 font-semibold rounded-b-2xl "Add to Cart". Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 10 — Mobile bottom nav, dark theme, violet
  `Build a mobile bottom navigation bar with 5 tabs. Show a mock phone screen: outer container bg-gray-950 rounded-3xl overflow-hidden shadow-2xl w-80 h-[580px] relative. Dark content area bg-gray-950 flex-1 with "Feed" heading in text-white font-bold text-xl p-5 and 3 placeholder content rows in bg-gray-800 rounded-xl h-20. Bottom nav: bg-gray-900 border-t border-gray-800 flex w-full px-1 py-2 absolute bottom-0. Five tabs: Home (house SVG, active — text-violet-400 bg-violet-500/10 rounded-xl px-3 py-1.5), Explore (compass SVG, text-gray-500), Create (plus-circle SVG larger, text-gray-500), Notifications (bell SVG with red dot badge "3", text-gray-500), Profile (user-circle SVG, text-gray-500). Each tab shows icon above label in text-xs font-medium centered, width flex-1. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 11 — Settings toggle list, light theme
  `Build a settings notification panel with 5 toggle rows. Light bg-gray-50 background. Panel: bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-md. Header section: "Notifications" in text-gray-900 font-semibold text-lg px-6 pt-5 pb-3. Five rows divided by divide-y divide-gray-100 each px-6 py-4 flex items-center justify-between: (1) "Email notifications" / "Receive updates about your account activity" — ON, bg-blue-600 toggle; (2) "Push notifications" / "Get alerts on your mobile device" — ON, bg-blue-600; (3) "Marketing emails" / "Promotions, tips, and product news" — OFF, bg-gray-200; (4) "Security alerts" / "Be notified of unusual account sign-ins" — ON, bg-blue-600; (5) "Weekly digest" / "A summary of your activity every Monday" — OFF, bg-gray-200. Each toggle: w-11 h-6 rounded-full transition with a white w-5 h-5 circle translated right when ON. Name in text-gray-900 font-medium text-sm, description in text-gray-400 text-xs. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 12 — File upload dropzone, dark theme, indigo
  `Build a file upload dropzone with a progress indicator and completed file. Dark bg-gray-950 background. Dropzone: bg-gray-900 border-2 border-dashed border-indigo-500/50 rounded-2xl p-10 w-96 text-center cursor-pointer. Upload cloud SVG icon in text-indigo-400 w-12 h-12 mx-auto. Heading "Drop files to upload" in text-white font-semibold text-lg mt-3. Sub-text "or click to browse — PNG, JPG, PDF up to 25 MB" in text-gray-400 text-sm. Button "Browse files" in border border-indigo-500 text-indigo-400 px-5 py-2 rounded-lg mt-4 inline-block. Below dropzone, two file items in bg-gray-900 rounded-xl p-4 mt-4: (1) In-progress — file icon text-indigo-400, "design-mockup-v3.fig" in text-white text-sm, "4.2 MB" in text-gray-400 text-xs, progress bar 67% in bg-indigo-600 on bg-gray-800 track, "67%" in text-gray-300 text-sm. (2) Completed — "brand-assets.zip", "12.8 MB", green checkmark SVG, "Complete" in text-emerald-400 text-sm. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 13 — Comment thread, light theme
  `Build a comment thread with nested replies for a design review tool. Light bg-white background. Thread max-w-xl. Top-level comment by "Sarah Chen" (avatar circle bg-blue-600 text-white font-bold "SC" w-9 h-9): name "Sarah Chen" in text-gray-900 font-semibold text-sm, "2 hours ago" in text-gray-400 text-xs, comment "I think the new onboarding flow is a huge improvement! The step indicators make it so much clearer where you are in the process." in text-gray-700 text-sm leading-relaxed, action row: heart SVG + "14" in text-gray-400 text-xs, reply button "Reply" in text-gray-400 text-xs. Nested reply (ml-8 pl-4 border-l-2 border-gray-100): "Marcus Webb" (bg-amber-600 "MW"): "Agreed! Though I noticed the mobile version has alignment issues on the last step — the CTA button overlaps with the keyboard." 3 likes. Another nested reply by "Sarah Chen": "Good catch, filing a bug now. @design-team can you take a look this sprint?" 1 like. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 14 — Pricing table 3 tiers, light theme, blue
  `Build a 3-tier pricing table for a project management tool called "TaskFlow". Light bg-gray-50 background. Three cards side by side (flex gap-4): Starter, Pro (highlighted), Business. Pro card: border-2 border-blue-600 bg-white shadow-xl rounded-2xl p-6 scale-105 relative with "Most Popular" badge bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2. Starter and Business: bg-white border border-gray-200 rounded-2xl p-6. Each card: tier name in font-bold text-gray-900 text-lg, price in text-4xl font-black text-gray-900, "/per user/month" in text-gray-400 text-sm, feature list 4 items (check SVG text-emerald-500 or x SVG text-gray-300), CTA button. Starter ($0): features "5 projects, 1 user, 1 GB storage, Email support". Pro ($29): "Unlimited projects, 15 users, 50 GB, Priority support". Business ($99): "Unlimited everything, SSO, 99.9% SLA, Dedicated CSM". CTAs: Starter=border border-gray-300 text-gray-700, Pro=bg-blue-600 text-white, Business=bg-gray-900 text-white. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 15 — Search bar with filters, dark theme
  `Build a search bar with filters button and an open recent-searches dropdown panel. Dark bg-gray-950 background. Search bar: relative w-full max-w-xl bg-gray-800 border border-gray-700 rounded-xl flex items-center. Magnifying glass SVG icon in text-gray-500 absolute left-3. Input: pl-10 pr-4 py-3 bg-transparent text-white placeholder-gray-500 text-sm w-full outline-none placeholder "Search components, templates, and more...". Filters button (right edge): bg-gray-700 text-gray-300 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1.5 with a sliders SVG icon m-1.5. Below: open dropdown panel bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 w-full mt-1. "Recent Searches" header in text-gray-400 text-xs uppercase tracking-wide mb-2. 4 recent items (clock SVG text-gray-500 + text-gray-300 text-sm + ✕ text-gray-600 ml-auto): "button component", "dark modal", "pricing card", "navigation bar". "Popular" section header + 3 chips (bg-gray-700 text-gray-300 rounded-full px-3 py-1 text-sm inline-block gap-2): "Tailwind components", "React templates", "Dashboard UI". Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 16 — Testimonial card, light theme, warm tones
  `Build a testimonial card with star rating, quote, and author. Light bg-amber-50 background. Card: bg-white rounded-2xl shadow-sm border border-amber-100 p-8 max-w-lg. Five filled star SVGs in text-amber-400 at top row. Open-quote SVG or large " in text-amber-200 text-7xl leading-none. Quote text: "Switching to your platform cut our deployment time from 3 days to 45 minutes. The team was skeptical at first, but now nobody wants to go back." in text-gray-800 text-lg leading-relaxed font-medium italic. Author row: avatar circle bg-amber-600 text-white font-bold text-sm "JM" w-11 h-11, name "Jordan Martinez" in text-gray-900 font-semibold text-sm, title "Head of DevOps at Stripe" in text-gray-400 text-xs, side by side with ml-3. Verified badge below name: shield-check SVG in text-emerald-500 + "Verified customer" in text-emerald-600 text-xs font-medium. A small "Stripe" text in text-gray-300 font-bold text-lg as logo placeholder aligned right. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 17 — Mobile onboarding card, dark theme, violet
  `Build a mobile app onboarding card showing step 3 of 4. Dark bg-slate-900 background. Card: bg-slate-800 rounded-3xl p-8 w-80 mx-auto. Illustration area: bg-slate-700 rounded-2xl h-48 flex items-center justify-center mb-6 with a rocket SVG icon in text-violet-400 w-16 h-16. Step counter "3 of 4" in text-slate-500 text-sm font-medium text-center. Heading "Launch with confidence" in text-white font-bold text-2xl text-center mt-2. Description "Deploy to production in one click. Automatic rollback kicks in if anything goes wrong." in text-slate-400 text-base leading-relaxed text-center mt-2. Pagination dots (4 total): first 2 = bg-slate-600 w-2 h-2 rounded-full, third = bg-violet-500 w-6 h-2 rounded-full, fourth = bg-slate-600 w-2 h-2 — inline-flex gap-2 justify-center mt-6. Two buttons side by side: "Skip" in text-slate-500 text-sm px-6 py-3 and "Next →" in bg-violet-600 text-white px-8 py-3 rounded-xl font-semibold. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 18 — Data table, light theme
  `Build a user management data table. Light bg-gray-50 background. Table container: bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-4xl. Table header: "Team Members" in text-gray-900 font-bold text-lg and "Invite member" button in bg-blue-600 text-white text-sm px-4 py-2 rounded-lg p-5 flex justify-between. Table: w-full. Header row bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-medium tracking-wide cols: checkbox, User, Role, Status, Last Active, Actions. 5 rows with hover:bg-gray-50: Alice Johnson / alice@designco.com (Admin, Active, "2 hours ago"); Ben Carter / ben@designco.com (Editor, Active, "Yesterday"); Carla Gomez / carla@designco.com (Viewer, Inactive, "3 days ago"); Derek Wu / derek@designco.com (Editor, Active, "1 hour ago"); Emma Clarke / emma@designco.com (Admin, Active, "Just now"). Avatar initials circle per row. Active badge: bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs. Inactive: bg-gray-100 text-gray-500. Actions: "Edit" text-blue-600 text-sm and "Remove" text-red-500 text-sm. Pagination footer: "Showing 1–5 of 38 users" text-gray-500 text-sm with Prev/Next buttons. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 19 — Cookie consent banner, dark theme, amber
  `Build a cookie consent banner. Show a dark mock page: bg-gray-950 min-h-screen with a simple fake navbar and hero text "Welcome to our site" in text-white. Banner: fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-amber-500/30 shadow-2xl px-6 py-5. Layout: flex items-center gap-6 flex-wrap. Left side: cookie SVG icon in text-amber-400 w-8 h-8 flex-shrink-0, then a text block — "We use cookies" in text-white font-semibold text-base, below "We use essential and optional cookies to improve your experience, personalize content, and analyze traffic." in text-gray-400 text-sm max-w-xl. Right side: three buttons flex gap-3 flex-shrink-0: "Reject All" border border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm; "Customize" border border-amber-500/50 text-amber-400 px-4 py-2 rounded-lg text-sm; "Accept All" bg-amber-500 text-gray-900 font-semibold px-5 py-2 rounded-lg text-sm. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,

  // 20 — Notification bell dropdown, light theme
  `Build a notification bell dropdown panel. Light bg-gray-100 background. Show a nav bar stub: bg-white border-b border-gray-200 px-6 py-3 flex justify-end items-center with an avatar circle and a notification bell button (bell SVG text-gray-600 w-6 h-6) with a red badge "7" bg-red-500 text-white text-xs rounded-full absolute -top-1 -right-1 in a relative container. Below (as if the dropdown is open): dropdown panel bg-white border border-gray-200 rounded-2xl shadow-xl w-80 float-right mr-6. Header px-4 pt-4 pb-2: "Notifications" in text-gray-900 font-semibold and "Mark all read" in text-blue-600 text-sm. Four notification rows px-4 py-3 border-b border-gray-100 flex gap-3: (1) unread bg-blue-50 rounded-xl — blue dot + "Priya Sharma commented on your design update." + "5 min ago" text-gray-400 text-xs; (2) unread — "Lucas Kim mentioned you in the Q3 review." + "1 hour ago"; (3) unread — download icon text-blue-500 + "Your export is ready — dashboard-may2026.csv (2.4 MB)" + "3 hours ago"; (4) read (no bg) — gray dot + "Scheduled maintenance Sunday 2–4 AM UTC." + "Yesterday". Footer text-center py-3: "View all notifications →" in text-blue-600 text-sm. Use only inline CSS in a <style> tag — no CDN, no external resources. Center the component with padding. Self-contained HTML document.`,
];

// Natural language rewrites of the first 5 prompts.
// Written the way a real non-designer user would ask — no Tailwind classes,
// no px values, no technical specifics. Just intent, content, and style direction.
// These are used when OUTPUT_SUFFIX is set (e.g. OUTPUT_SUFFIX=v2).
export const COMPONENT_PROMPTS_V2: string[] = [
  // 1 — CTA button, dark theme, blue accent
  `Show me a sign-up button for a SaaS app in three states side by side: normal, hovered, and disabled. Dark page background. Blue button with white text and rounded corners, label "Start Your Free Trial" with a small arrow icon. The hover state should look slightly lighter with a soft glow. The disabled state should be grayed out and clearly inactive. Add a small caption below each state. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 2 — Email signup form, light theme, green accent
  `Make an email newsletter signup form for a design blog called Craft Weekly. Light background. Show three states stacked vertically: (1) the default form with a headline "Get weekly design insights", a subtitle about joining 12,400 designers, an email input field, and a green Subscribe button; (2) an error state with a red message under the input saying the email is invalid; (3) a success state replacing the form with a green confirmation message and checkmark. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 3 — Pricing card Pro, dark theme, purple accent
  `Design a pricing card for the Pro plan of a startup app called Shipfast. Dark background with a subtle purple glow around the card. Show the price as $49/month. List 5 features with checkmarks: unlimited projects, priority support, custom domain, advanced analytics, team collaboration. Add a "Most Popular" badge at the top and a big purple "Get Pro Access" button at the bottom. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 4 — Responsive navbar, light theme
  `Make a top navigation bar for a SaaS product called Flowdesk. Logo on the left (small icon + brand name), nav links in the middle (Features, Pricing, Docs, Blog), and a "Sign in" text link plus a blue "Get Started" button on the right. On mobile it should collapse and show a hamburger menu icon instead of the links. Below the nav add a simple white page area with a bold headline as placeholder content. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 5 — User profile card, dark theme, teal/cyan accent
  `Create a developer profile card for Alex Rivera, a Senior Frontend Engineer based in San Francisco. Dark slate background. Show a circular avatar with their initials "AR" in a teal circle, their name and job title, location with a pin icon, and a row of three stats: Projects, Followers, Following. Below the stats add two side-by-side buttons: a filled teal "Follow" button and a ghost "Message" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Buttons & CTAs (7 more) ---

  // 6 — Destructive delete button (dark)
  `Show a destructive action button for a project management app called Linear. Dark background. Show two states side by side: first, a red "Delete Project" button with a trash icon in normal state; second, a confirmation state where the button shows "Are you sure?" in a deeper red with a warning icon beside it, and a "Cancel" text link next to it. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 7 — Loading spinner button (light)
  `Create a submit button in three states shown side by side for a contact form. Light background. Default state: "Send Message" in blue. Loading state: a spinning circle animation and "Sending..." text, grayed out. Success state: the button turns green and shows "Message Sent" with a checkmark icon. Label each state below it. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 8 — Social login buttons (light)
  `Design a set of three social login buttons for a sign-up page for an app called Relay. Light background. Stack the buttons vertically, each full width: "Continue with Google" with a colorful G logo, "Continue with GitHub" on a dark background with the GitHub mark, and "Continue with Apple" on a black background with the Apple logo. Each button has rounded corners and appropriate icon styling. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 9 — Icon-only toolbar (light)
  `Build a rich text editor toolbar for a writing tool. Light background. A horizontal row of icon-only action buttons: Bold (B), Italic (I), Underline (U), then a vertical divider, then Link, Image, and Code block icons. The Bold button appears active with a blue tint background. Include a small visible tooltip above the Link button showing its label. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 10 — Upgrade to Pro banner CTA (dark)
  `Create an upgrade prompt banner for a freemium writing app called Typefully. Dark background. A horizontal banner stretching across the page with an amber left accent stripe. Left side: a crown icon, bold text "You're on the Free plan", and a subtitle "Unlock unlimited posts, analytics, and team collaboration." Right side: a prominent amber "Upgrade to Pro" button and a small dismiss X icon. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 11 — Split button with dropdown (dark)
  `Make a split button component for a deployment tool similar to Vercel. Dark background. The main button says "Deploy to Production" in blue, separated by a vertical divider from a small chevron arrow button on the right. The dropdown menu is open below the chevron, showing three options: "Deploy to Staging", "Deploy Preview", and "Schedule Deploy". The dropdown has a subtle dark card style. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 12 — Floating action button with radial menu (dark)
  `Design a floating action button in its expanded state for a note-taking app. Dark background. Show the bottom-right corner of a mock screen with a main circular blue button (pencil icon). Three radial action options fanned out above it: "New Note" (document icon), "New Reminder" (bell icon), and "New Folder" (folder icon) — each as a smaller circle with a label beside it. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Forms (9 more) ---

  // 13 — Login form (dark)
  `Design a login form for a developer tool called Raycast. Dark background with a blue accent. A centered card with: the product logo at the top, "Welcome back" as the heading, an email input field, a password field with a show/hide eye icon toggle, a "Forgot password?" link, and a blue "Sign in" button. Below a divider, a "Don't have an account? Sign up" link. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 14 — User settings panel (light)
  `Create an account settings panel for a design tool. Light background. A form with: a circular avatar placeholder with an "Upload photo" button below, a display name field pre-filled with "Emma Clarke", an email field, a username field with an @ prefix inside the input. Below the fields, a blue "Save changes" button. Beneath a divider, a danger zone section with a red "Delete Account" button and a short warning note. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 15 — Credit card checkout form (light)
  `Build a credit card payment form for an e-commerce checkout for a floral brand called Petal Shop. Light background. On the left: form fields for full name, card number (with a card icon area on the right of the input), expiry date and CVV side by side, and billing address (street, city, zip, country). On the right: an order summary with item names and a bold total "$84.99" and a green "Pay Now" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 16 — Search with filters (light)
  `Make a search bar with advanced filters for a job listing site called Wellfound. Light background. A wide search input with a magnifying glass for "job title or keyword", a location input, and a job type dropdown (Full-time, Remote, Part-time) side by side. Below the search row, active filter chips: "Remote", "Engineering", "Series A+" each with a small x to remove them, and a "Clear all" text link. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 17 — Contact form (dark)
  `Create a contact form for a design agency called Strive Studio. Dark background with a green accent. Fields for: full name, email, a subject dropdown (General, Partnership, Press, Other), and a message textarea with a character counter showing "142/500 characters". A green "Send Message" button with an arrow icon below the textarea. A small "We typically reply within 1 business day." note in muted text. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 18 — Two-factor auth (dark)
  `Design a two-factor authentication screen for a banking app. Dark background. Centered card with: a lock icon at the top, "Enter your 6-digit code" as the heading, a subtitle "We sent a code to +44 •••• ••7823". Six separate square input boxes side by side for one digit each — first three are filled in, the fourth box is active with a blue border. A "Verify" button below and a "Resend code" link. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 19 — Password reset (light)
  `Build a new password form for account recovery for an app called Loom. Light background. A centered card with: "Create new password" as the heading, a new password field, a confirm password field, and a password strength bar below the first field showing "Strong" in green. A checklist of 4 requirements below the bar: minimum 8 characters (checked), uppercase letter (checked), number (checked), special character (unchecked). A blue "Reset Password" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 20 — Onboarding wizard step 2 of 4 (light)
  `Create step 2 of a 4-step onboarding wizard for a team productivity app. Light background. A progress indicator at the top shows step 2 of 4 highlighted. The step heading is "Tell us about your team". Show fields for: company name (text input), team size (dropdown: 1–5, 6–20, 21–100, 100+), and primary use case (checkboxes: Project management, Documentation, Team wiki, Meeting notes). A "Continue" button and a "Back" text link below. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 21 — File upload dropzone (dark)
  `Design a file upload area for a cloud storage app. Dark background. A dashed upload zone with a cloud icon and "Drop files here or click to browse" and a supported formats note below (PDF, DOCX, PNG, JPG — max 50MB). Below the zone, an upload progress list: one file at 78% progress with filename, file size, and a blue progress bar; and one completed file with a green checkmark and "Upload complete". Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Navigation (7 more) ---

  // 22 — Sidebar nav (dark)
  `Build a sidebar navigation for a project management app called Linear. Dark background. The sidebar shows: a workspace logo circle and name "Acme Corp" at the top, then nav items with icons and labels — Inbox (with a "3" badge), My Issues, Views, Projects (highlighted as the active item), Teams. At the bottom: Settings and a user avatar with name. Make it look compact and sleek. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 23 — Breadcrumb (light)
  `Create a breadcrumb trail for a document management system. Light background. Show 4 levels with right-pointing chevron separators: "Dashboard" → "Projects" → "Acme Corp" → "Q2 Design Audit". The middle segment "Acme Corp" is truncated with an ellipsis to show how long paths are handled. The last item "Q2 Design Audit" is current page (bold, not a link). The earlier items are blue clickable links. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 24 — Tab bar (light)
  `Design a horizontal tab bar for a developer dashboard. Light background. Four tabs in a row: "Overview", "Activity" (with a blue notification badge showing "12"), "Settings", and "Billing". The "Activity" tab is active — shown with a blue underline and blue text. Inactive tabs are gray. Below the tabs: a separator line and a simple content placeholder area indicating the active tab. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 25 — Pagination controls (light)
  `Build a pagination control for a search results page. Light background. Left side: "Showing 21–30 of 234 results" in gray. Right side: a "Previous" button (disabled and grayed out), page number buttons 1 through 5 with "..." and then 24, the current page "3" highlighted with a blue background and white text, and a "Next" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 26 — Command palette (dark)
  `Design a command palette / spotlight search overlay for a developer tool. Dark background with the palette centered. A search input at the top with "Search commands..." placeholder. Below: grouped results — a "Recent" group with 2 items (icon, label, keyboard shortcut on the right), a "Navigation" group with 3 items, and an "Actions" group with 2 items. The first item is highlighted as selected. At the bottom: "↑↓ navigate · ↵ select · Esc close" keyboard hint. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 27 — Mobile bottom nav (dark)
  `Create a mobile bottom navigation bar for a social media app. Show a full phone screen mockup with a dark background. At the bottom: 5 tabs with icons and labels — Home (house, active with a blue tint), Explore (compass), Create (large plus circle), Notifications (bell with a red "9+" badge), Profile (person). Above the nav, a simple dark content area with placeholder post cards. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 28 — Mega menu dropdown (light)
  `Design a mega menu that opens from a "Products" nav link for a cloud software company. Light background. The dropdown has 3 columns: "By Team" (Sales, Marketing, Support, HR — each with a small icon and description), "By Company Size" (Startup, SMB, Enterprise), and a "What's New" featured card with a colored image area, a product headline, and a "Learn more" link. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Cards (10 more) ---

  // 29 — Product card (light)
  `Design an e-commerce product card for wireless headphones called "Sony WH-1000XM5". Light background. Show a square image placeholder area, the product name, a 4.6-star rating with "2,148 reviews", the price "$329" with a "15% off" sale badge and the original price struck through. Below: an "Add to Cart" button and a heart wishlist icon. Clean and minimal with good spacing. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 30 — Blog post card (light)
  `Create a blog post preview card for a tech publication. Light background. Show: an orange "AI" category tag at the top, the article headline "OpenAI releases GPT-5 with real-time voice and vision" in bold, a 2-line excerpt below. At the bottom: a circular author avatar with initials "SP", the name "Sarah Perez", and "6 min read" with a clock icon. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 31 — Stat card row (dark)
  `Build a row of 3 metric stat cards for a SaaS analytics dashboard. Dark background. Each card shows a metric label, a large number, and a percentage change indicator (green up arrow or red down arrow). Cards: "Monthly Recurring Revenue / $127,450 / +8.3% this month", "Churn Rate / 2.1% / -0.3% vs last month", "Active Users / 8,847 / +512 this week". Subtle dark card backgrounds with thin borders. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 32 — Team member card (light)
  `Design a team member profile card for a company about page. Light background. A card with: a circular photo placeholder in gray, the name "Marcus Webb" in bold, job title "Head of Product Design", a short one-line bio, and 3 social link icon buttons (X/Twitter, LinkedIn, GitHub) below. Subtle shadow on the card. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 33 — Job listing card (light)
  `Create a job listing card for a tech job board. Light background. Show: a company logo as a colored initial circle for "Stripe", the job title "Senior Product Designer", location "San Francisco, CA (Remote OK)", salary "$160k–$200k", and tag chips for "Full-time", "Design Systems", "Figma". At the bottom: "Posted 2 days ago" and an "Apply Now" button in blue. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 34 — Video thumbnail card (dark)
  `Design a video thumbnail card for a tutorial platform. Dark background. A 16:9 image placeholder with a play button overlay in the center and a "12:47" duration badge in the corner. Below: the video title "Building a Design System from Scratch in Figma", channel name "DesignCraft" with a small verified checkmark, "84K views · 3 weeks ago" in muted text. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 35 — Notification card (dark)
  `Build a notification item card for a notification feed. Dark background. A card with: a blue mention icon on the left, the title "James Kim mentioned you in a comment" in bold, a preview of the comment in smaller muted text, timestamp "12 minutes ago", and a "Mark as read" button on the far right. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 36 — Feature comparison card (light)
  `Create a two-column feature comparison card showing Free vs Pro plans for a writing app called Hemingway Editor. Light background. Left column "Free": 4 features with checkmarks (Basic editing, 5 documents, Export to PDF, Dark mode), then 3 features with X marks (AI suggestions, Unlimited documents, Team sharing). Right column "Pro" in blue: all 7 features with checkmarks. An "Upgrade to Pro" button at the bottom of the Pro column. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 37 — App store listing card (light)
  `Design an app listing card as it would appear in a product directory like Product Hunt. Light background. Show: a rounded square app icon in purple, the app name "Raycast", tagline "Your shortcut to everything", star rating "4.9" with 5 stars, "50K+ downloads", a "Productivity" category tag, and an "Install" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 38 — Recipe card (light)
  `Create a recipe card for a cooking app. Light background. A wide image placeholder at the top, the recipe name "Lemon Garlic Pasta" in bold, then a metadata row: "20 min" prep time, "4 servings", and an "Easy" difficulty badge in green. Below: a short ingredients list with 6 items. A warm orange "Start Cooking" button at the bottom. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Modals & Overlays (8) ---

  // 39 — Delete confirmation dialog (dark)
  `Design a delete confirmation modal for a project management tool. Dark page background with the modal centered. The modal has: a red trash icon at the top, "Delete this project?" as the heading, a warning message that this is permanent and will delete all data for the project "Acme Rebrand 2026". Two buttons at the bottom: a gray "Cancel" button and a red "Delete Project" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 40 — Image lightbox (dark)
  `Create an image lightbox overlay for a photography portfolio. Dark dimmed full-screen background. A large centered image placeholder takes up most of the screen area. Left and right arrow buttons on the sides for navigation. A close "X" button in the top right. At the bottom: a caption "Golden Gate at Dawn — San Francisco, 2026" and an image counter "3 of 12". Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 41 — Side drawer filters (light)
  `Build a filter side drawer that slides in from the right for a shopping site. Light background with a semi-transparent overlay on the left. The right panel has: a "Filters" heading and close X button, a "Category" section with checkboxes (Electronics, Clothing, Home, Books), a "Price Range" section with min/max inputs, a "Rating" section with star options. At the bottom: a "Clear All" link and an "Apply Filters" blue button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 42 — Cookie consent banner (light)
  `Show a cookie consent banner at the bottom of a light website. The banner has a white background and subtle shadow, fixed to the bottom. Left: a cookie icon, "We use cookies" in bold, and a short description about personalization and analytics. Right: three buttons — "Reject All" (outline), "Customize" (outline), "Accept All" (filled green). The page behind the banner shows a simple hero section with a headline. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 43 — Welcome onboarding modal (dark)
  `Design an onboarding welcome modal for a project management app called Height. Dark background. The centered modal has: the product logo at the top, "Welcome to Height" as a large heading, a tagline, 3 feature highlights each with an icon and short description (AI task management, Real-time collaboration, Native apps), and a large "Get Started" blue button. A small X close button in the corner. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 44 — Edit profile modal (light)
  `Create an edit profile modal over a light page background. Centered white card modal with: "Edit Profile" as the heading, a circular avatar placeholder with an "Upload photo" button below, input fields for Display Name, Bio (textarea, 3 rows), Website URL, and a Twitter/X handle. At the bottom: a "Cancel" outline button and a blue "Save Changes" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 45 — Keyboard shortcuts modal (dark)
  `Build a keyboard shortcuts reference modal for a design tool. Dark background. The large centered modal is titled "Keyboard Shortcuts". Inside, shortcuts are organized in a two-column layout by category: Navigation (Cmd+K command palette, G then D for dashboard), Editing (Cmd+Z undo, Cmd+Shift+Z redo, Cmd+C copy, Cmd+V paste), View (Cmd+= zoom in, Cmd+- zoom out). Each row shows the action label and the key combination as styled keyboard badge chips. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 46 — Share dialog modal (light)
  `Design a share dialog modal for sharing a document. Light background with a dimmed overlay behind the modal. The modal shows: "Share this document" as the heading, a read-only URL input with a "Copy link" button next to it, a "Share with people" section with an email input and a "Viewer" / "Editor" permission dropdown, and a row of social share icons (Twitter/X, LinkedIn, Email). A toggle for "Anyone with the link can view". Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Feedback & Status (10) ---

  // 47 — Toast notification stack (dark)
  `Show a stack of 3 toast notifications in the top-right corner for a web app. Dark page background. Each toast is a compact card. First: green with a checkmark, "Payment processed successfully", and a subtitle "Invoice #4821 for $299 has been sent." Second: amber with a warning triangle, "Storage nearly full — you've used 94% of your 5GB." Third: red with an X icon, "Export failed — could not generate the PDF." Each toast has a close button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 48 — Alert banners (light)
  `Create three alert banner variants stacked on a light page. Info banner (blue): information icon, "System maintenance scheduled", "We'll be down Sunday, June 1 from 2–4 AM UTC." with a "Learn more" link and dismiss X. Warning banner (amber): "Free trial ends in 3 days — upgrade to keep access" with an "Upgrade now" link. Error banner (red): "Action required — your payment method has expired" with an "Update card" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 49 — Empty state (light)
  `Design an empty state screen for a task management app with no tasks created yet. Light background. Centered layout with: a large pale gray rounded rectangle as an illustration placeholder, the headline "No tasks yet", body text "Create your first task to get started. Tasks help you track work and stay organized.", and a blue "Create Task" button below. Keep it spacious and friendly. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 50 — Skeleton loader cards (dark)
  `Build a skeleton loading state for a card-based feed. Dark background. Show 3 vertically stacked loading placeholder cards. Each card mimics a blog post card: a wide rectangular image placeholder at the top with a shimmer/pulse animation, then a wide line for the title, two thinner shorter lines for body text, and a small circle plus a line for author info at the bottom. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 51 — Upload progress bar (light)
  `Create an upload progress component for a cloud storage app. Light background. Show two items: one file currently uploading — "brand-guidelines-2026.pdf", "8.4 MB", a blue progress bar at 63% with "63%" on the right and "Estimated time remaining: 12 seconds" below, plus a "Cancel" link. Above it, a completed file showing a green checkmark, the filename, and "Upload complete". Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 52 — Inline form validation (light)
  `Design a contact form with visible real-time validation states. Light background. Three fields: Name (valid state — green checkmark on the right), Email (invalid state — red border, red X icon, and error message "Please enter a valid email address" below the field), Phone (neutral/empty state). Each field has a label above. A "Submit" button at the bottom. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 53 — 404 error page (dark)
  `Create a 404 error page for a developer tools company. Dark background. A large "404" in a bold stylized font as the main visual. Below: "Page not found" as a heading, a friendly message "Looks like this page took a detour. The link might be broken or the page may have moved.", then two buttons: "Go back" (outline style) and "Back to Home" (filled blue). Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 54 — Order success page (light)
  `Build an order confirmation success page for an online shop. Light background. Centered layout with: a large green checkmark in a circle (animated pulse), "Order Confirmed!" as the heading, "Thank you, Emma! Your order has been placed." as a subtitle, the order number "Order #ORD-48291" in a muted badge, estimated delivery "Arrives by Friday, May 30", and two buttons: "Track Order" in blue and "Continue Shopping" in outline style. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 55 — Network offline banner (dark)
  `Design a network connectivity warning banner for a web app. Dark page background. A persistent amber/red banner pinned to the top of the screen: a wifi-off icon, "You're offline", "Changes you make won't be saved until you reconnect." and a "Retry connection" button on the right. The rest of the page content below appears slightly dimmed to show it's non-interactive. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 56 — Rating and review submission (light)
  `Create a rating and review submission form for a product or app. Light background. Show: "How would you rate your experience?" as the heading, 5 large star icons where 4 stars are selected/filled in gold and the 5th is empty, a text area below with placeholder "Tell us more about your experience...", a character counter "0/500", and a green "Submit Review" button. A small note "Your review helps others make better choices." Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Data Display (12) ---

  // 57 — Data table (light)
  `Build a customer data table for a CRM. Light background. Columns: Customer (name + email), Company, Status, Plan, MRR, Actions. Show 5 rows: Stripe (Enterprise, Active, $4,200/mo), Airbnb (Pro, Active, $890/mo), Shopify (Enterprise, Active, $3,100/mo), HubSpot (Starter, Churned, $0/mo), Figma (Pro, Active, $440/mo). Status badges in green for Active, red for Churned. A search bar above and "Showing 1–5 of 128 customers" with Prev/Next pagination below. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 58 — Activity timeline (dark)
  `Design a user activity timeline for a project collaboration tool. Dark background. A vertical timeline with 5 events, each with a colored circle icon connected by a vertical line: code commit (blue circle), pull request merged (purple circle), file uploaded (green circle), comment added (gray circle), deployment triggered (amber circle). Each event shows who did it (avatar initials), a short description, and a timestamp. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 59 — Kanban column (dark)
  `Create a single kanban board column for a project management app. Dark background. The column header says "In Progress" with a count badge "4". Inside: 3 task cards, each with a task title, an assignee avatar circle with initials, a colored priority dot (red for high, yellow for medium), and a due date. At the bottom of the column: an "+ Add task" button. Each card should have a subtle drag handle. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 60 — Bar chart card (dark)
  `Design a weekly revenue bar chart card for an analytics dashboard. Dark background. The card header shows "Weekly Revenue" and the total "$24,830" and the date range "May 13–19, 2026". Below: 7 vertical bars for Mon–Sun with varying heights simulating real revenue data (Wednesday and Thursday are taller as peak days). Each bar has the day label below and the value above. Use teal colored bars. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 61 — Calendar week view (light)
  `Build a week calendar view for a scheduling app. Light background. A 7-column grid for Monday through Sunday with the current week's dates. Vertical time slots on the left from 9 AM to 5 PM. Show 3 events as colored blocks: "Design review" from 10–11 AM on Tuesday (blue), "Team standup" from 10:30–11 AM on Tuesday (green, overlapping), and "Product demo" from 2–3 PM on Thursday (purple). Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 62 — Leaderboard (dark)
  `Create a leaderboard for a developer challenge or coding competition. Dark background. Top 5 entries in a list. Each row: rank number (1st/2nd/3rd get gold/silver/bronze styling), a circular avatar with initials, the participant's display name and @username, their score, and a position change indicator (green arrow up or red arrow down). Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 63 — File explorer list (light)
  `Design a file list view for a cloud storage app. Light background. A list with columns: Name (with file type icon), Type, Size, Date Modified, and a 3-dot actions menu. Show 6 items: 2 folders in amber, and 4 files — a PDF, PNG, DOCX, and XLSX with appropriate colored icons. The first row is selected with a light blue background. A search bar above the list. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 64 — Price history line chart (dark)
  `Build a price history sparkline card for a crypto tracking app. Dark background. The card shows "Bitcoin" and the current price "$67,420" large and bold. Below: the 24h change "+3.2% ($2,084)" in green. A simple line chart below showing 30 days of price data as a smooth SVG line on a dark grid. At the bottom: min price "$58,240" and max "$71,890" labels on either side. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 65 — Log viewer (dark)
  `Create a log viewer panel for a monitoring tool with a terminal style. Dark background, monospace font. A filter bar at the top with log level toggle buttons (INFO, WARN, ERROR) and a search input. Below: 8 log lines, each with a timestamp on the left, a log level badge (INFO in blue, WARN in amber, ERROR in red), and the log message. At least one ERROR line should be subtly highlighted in a red background tint. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 66 — Invoice table (light)
  `Build an invoice for a SaaS billing statement. Light background. Header: "Invoice #INV-2024-0847", the date, and billed to "Acme Corp / billing@acme.com". A line item table with columns: Description, Qty, Unit Price, Amount. Four items: Pro Plan (monthly) ×1 $49, Additional seats ×3 $45, Storage add-on ×1 $9, Support plan ×1 $29. Then a subtotal row, tax row (8.5% = $11.23), and a bold "Total Due: $143.17" row. A "Download PDF" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 67 — Activity heatmap (dark)
  `Design a GitHub-style activity heatmap for a productivity app. Dark background. A grid of small squares — 7 rows (days of the week) by about 24 columns (weeks). Squares have different shades of green for activity intensity: empty = dark gray, low = dim green, medium = medium green, high = bright green. Day labels on the left (Mon, Wed, Fri). Month labels across the top (Jan, Feb, Mar...). A small legend at the bottom right showing the intensity scale from Less to More. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 68 — Feature comparison table (light)
  `Create a feature comparison table for 3 product tiers: Basic, Standard (highlighted), and Premium. Light background. 8 feature rows: Storage (10GB / 100GB / Unlimited), Users (1 / 10 / Unlimited), API access (✗ / ✓ / ✓), Custom domain (✗ / ✓ / ✓), Analytics (Basic / Advanced / Advanced+), Support (Email / Priority / Dedicated), Uptime SLA (99% / 99.9% / 99.99%), White-label (✗ / ✗ / ✓). Green checkmarks and red X marks. The Standard column is highlighted with a blue header. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Marketing (10) ---

  // 69 — Testimonial carousel (light)
  `Design a single-visible testimonial card with navigation for a B2B SaaS marketing page. Light warm background. Show: a large open-quote mark, the testimonial text "Our deployment time went from 2 days to 20 minutes. The team is genuinely amazed by how smooth the transition was.", the reviewer's name "Rachel Torres", title "CTO at Notion", and a 5-star rating. Navigation dots below (5 dots, 2nd active). Prev/next arrow buttons on the sides. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 70 — Feature grid (light)
  `Build a 6-item feature highlights grid for a project management tool's marketing page. Light background. Section heading "Everything your team needs". Two rows of 3 feature cards. Each card: a colored icon square, a feature name in bold, and a 2-line description. Features: Real-time collaboration, AI-powered suggestions, Gantt view, Custom workflows, 100+ integrations, Analytics and reports. Muted card backgrounds with subtle borders. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 71 — Pricing table (dark)
  `Create a full 3-tier pricing table for a design tool called Framer. Dark background. Three columns: Free, Pro ($15/month, highlighted with blue border and "Most Popular" badge), Team ($25/user/month). Each column lists 6 features with checkmarks for available and dash for unavailable: Projects, Custom domains, CMS items, Page views, Collaboration, Analytics. CTA buttons: "Get started free", "Start Pro trial", "Contact sales". Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 72 — FAQ accordion (light)
  `Build a FAQ section for a SaaS product. Light background. 6 questions, the first expanded with the answer visible: "How does the free trial work?" answered with "Your 14-day free trial includes full access to all Pro features. No credit card required. At the end of the trial, you can choose a plan or continue on the free tier." The other 5 are collapsed: Can I cancel anytime?, Is my data secure?, How many team members can I add?, Discounts for nonprofits?, What payment methods are accepted? Each has a plus/chevron icon. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 73 — CTA section (dark)
  `Design a call-to-action section for a developer tool's marketing page. Dark background, centered layout. A small "Start for free" eyebrow label, a large bold headline "Ship your next project 10x faster", a subtitle "Join 50,000+ developers who use BuildKit to go from idea to production.", an email input and "Get Started" button side by side, and trust badges below (SOC 2 certified, GDPR compliant, 99.9% uptime). Blue accent color. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 74 — Social proof logo bar (light)
  `Create a "trusted by" logo bar section for a company homepage. Light background. A centered section with "Trusted by teams at" as a small label. Below: a horizontal row of 5 company names styled as monochrome text logos in muted gray: Stripe, Airbnb, Shopify, Figma, Notion. Subtle horizontal dividers above and below the row. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 75 — Newsletter popup (light)
  `Design a newsletter signup popup for a design publication. Light background with a dimmed overlay. The popup modal has two halves side by side: left panel in teal/green with a large bold "12,400" and "designers in the community" as decorative text; right panel with "Join Craft Weekly" heading, "Get weekly design inspiration, tools, and tutorials." subtitle, an email input, a teal "Subscribe" button, and a small "No spam, unsubscribe anytime" note. A close X button in the top right. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 76 — Launch countdown (dark)
  `Build a product launch countdown timer page. Dark background. The product name "Horizon" in large bold text at the top, a tagline "The future of collaborative design". A large countdown timer showing days, hours, minutes, and seconds as big numbers with labels below. An email input and "Notify me when it launches" button below. "Launching June 1, 2026" as a small label. Purple/violet accent color. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 77 — Press mentions section (light)
  `Design a press and awards section for a company's credibility page. Light background. Section heading "As seen in". A row of 5 publication names as monochrome text logos: TechCrunch, Forbes, Wired, The Verge, Product Hunt. Below: 2 pull-quote cards — one from TechCrunch "The tool we didn't know we needed." and one from Forbes "One of the top 10 productivity apps of 2026." — each with the publication name and a 5-star rating. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 78 — Referral program card (dark)
  `Create a referral program card for a fintech app called Monzo. Dark background. A card with: "Invite friends, earn rewards" as the heading. A referral code "MONZO-SCOTT8" in a monospace input box with a "Copy code" button. A shareable link section with URL and a copy icon. A progress tracker showing "3 of 5 friends invited" with a horizontal progress bar. "£15.00 earned" shown in green as the reward. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Mobile (8) ---

  // 79 — Mobile bottom sheet (dark)
  `Design a mobile bottom sheet action menu for a files app. Dark phone screen background. The bottom sheet slides up from the bottom, covering about half the screen, with a drag handle pill at the top. It's titled with the filename "project-exports.zip". Below: a list of actions — Share (share icon), Copy link, Move to folder, Rename, Download, and Delete (in red with a trash icon). Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 80 — Onboarding swipe card step 3 (light)
  `Create step 3 of 4 of a mobile onboarding flow for a fitness app called Nike Training Club. Light phone screen background. At the top: a progress bar showing 75% complete (3 of 4). An illustration placeholder area with a simple icon. Heading "Set your fitness goal", subtitle "We'll personalize your plan based on this". Three selectable option cards: "Lose weight", "Build muscle" (selected, highlighted in blue), "Improve endurance". Skip and "Next →" buttons at the bottom. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 81 — Pull to refresh (light)
  `Show a pull-to-refresh state for a mobile news feed app. Light phone screen background. At the top of the screen: a pull-to-refresh indicator with a spinning circle animation and "Refreshing..." text. Below: the beginning of a news feed with 2-3 article row stubs to fill the screen (headline and source in each row). The top area feels stretched down as if pulled. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 82 — Mobile menu full-screen (dark)
  `Create a full-screen mobile navigation overlay for a travel booking app. Dark background covers the full phone screen. Top: a close "X" button on the right and the brand logo on the left. Stacked large navigation links: Explore, Wishlists, Trips, Inbox, Profile. A horizontal divider, then smaller footer links: Help Center, Log out. At the very bottom, the user's name and email in small muted text. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 83 — Mobile search overlay (dark)
  `Design a full-screen search overlay for a mobile shopping app. Dark background. Top: a back arrow button and an active/focused search input field. Below: a "Recent searches" section with 3 items (clock icon + query text + X to remove each). A "Trending" section with 4 tag chips. At the very bottom, a dark gray rectangle representing the keyboard area. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 84 — Stories progress bar UI (dark)
  `Build a social story viewer UI similar to Instagram stories. Dark background, phone screen layout. At the very top: 4 thin horizontal progress bar segments — the 2nd segment is partially filled (the current story). Below: a row with a user avatar circle, username "priya.design", and "2 minutes ago". The story content area shows a gradient background with "Exploring Kyoto" as overlay text. At the bottom: a heart icon, a message icon, and a share icon side by side. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 85 — Transaction item rows (light)
  `Create a mobile transaction list as seen in a banking or budget app. Light phone screen background. Show 3 transaction rows: Blue Bottle Coffee (coffee cup icon, amber/brown circle, "$6.50", today), Amazon (shopping bag icon, dark circle, "$34.99", yesterday), Whole Foods (leaf icon, green circle, "$87.43", yesterday). Each row has the category icon on the left, merchant name and date in the middle, and the amount on the right (shown in red for purchases). Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 86 — Mobile notification drawer (dark)
  `Design a mobile notification list for a productivity app. Dark phone screen background. "Notifications" heading with a "Mark all read" link. Below: notifications grouped by time — a "Today" group with 2 notifications (a mention and a task assigned to you) and a "Yesterday" group with 3 (a comment, a payment received in green, and a reminder). Each notification has a colored indicator dot, the notification text, and a timestamp. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // --- Misc (14) ---

  // 87 — Theme toggle (dark)
  `Create a dark/light/system theme switcher component. Dark page background. A horizontal segmented control with 3 options: "Light" (sun icon), "Dark" (moon icon, currently selected with a blue pill highlight), "System" (computer icon). Below the toggle: a small preview card reflecting the dark theme — dark background, sample text and a button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 88 — Avatar stack (light)
  `Design an avatar stack component showing overlapping user avatars. Light background. Five circular avatars overlapping each other, each with a different colored background and initials: MK (blue), AR (purple), JL (green), SW (amber), PC (red). After the 5 avatars: a "+12" gray count badge circle. A small tooltip with the full name "Alex Rivera" is visible on hover over the second avatar. A label "18 members" to the right of the stack. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 89 — Tag input with autocomplete (light)
  `Build a tag input field as used in project or email apps. Light background. A text input area where added tags appear as chips inside the box: "Design", "Frontend", "Q2-2026" — each as a rounded chip with a small × remove button. An autocomplete dropdown is open below showing 4 suggestions: "Design Systems", "Design Tokens", "Figma", "Frontend Architecture". The first suggestion is highlighted as selected. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 90 — Code snippet with copy (dark)
  `Create a code snippet display block for a documentation site. Dark terminal-style background. A top bar with a "app.config.ts" filename badge and a "TypeScript" language label on the left, and a "Copy" button on the right showing the "Copied!" state with a checkmark. The code block below shows 10 lines of TypeScript config code with syntax highlighting — keywords in blue, strings in green, comments in gray. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 91 — User mention dropdown (dark)
  `Design an @mention dropdown that appears in a comment input box. Dark background. A text input shows "Nice work @" typed in it. Below: a dropdown list of 5 users with avatar circles, display names, and @handle. The first result "Alex Rivera @arivera" is highlighted as selected. At the bottom of the dropdown: "↑↓ navigate · Enter select" keyboard hint in small muted text. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 92 — Rich text editor toolbar (light)
  `Build a rich text editor toolbar for a CMS. Light background. A horizontal toolbar row with icon buttons in groups: Text formatting (Bold — active with blue tint, Italic, Underline, Strikethrough), Alignment (Left, Center, Right), Lists (Bullet, Numbered), then Insert (Link, Image, Table, Code block), then Undo/Redo. Group separators between sections. A tooltip visible above the "Link" button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 93 — Language selector dropdown (light)
  `Create a language/locale selector with an open dropdown. Light background. A button shows the current selection "English (US)" with a flag emoji and a chevron icon. The dropdown is open below showing 6 options: English (US) ✓ (currently selected, with a checkmark), Español, Français, Deutsch, 日本語, 中文 — each with a flag emoji and the language name. A small search field at the top of the dropdown. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 94 — Cookie settings panel (light)
  `Design a cookie preferences panel for privacy settings. Light background. Three cookie category rows, each with a toggle switch: "Essential cookies" (always on — toggle disabled and gray, description: required for the site to function), "Analytics cookies" (toggle ON in blue, description: help us understand how visitors use the site), "Marketing cookies" (toggle OFF in gray, description: used to show personalized ads). At the bottom: a "Save preferences" blue button and an "Accept all" outline button. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 95 — Emoji picker (dark)
  `Create an emoji picker panel for a messaging app. Dark background. The panel has: a "Search emoji..." input at the top, category icon tabs below (Smileys, People, Nature, Food, Travel, Objects, Symbols — icons or short labels), a dense grid of emoji characters in 8 columns (use actual emoji characters), and a "Recently used" row at the bottom. Make the panel compact and realistic. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 96 — Drag-and-drop sortable list (light)
  `Design a drag-and-drop sortable list for task prioritization. Light background. Four list items, each with a 6-dot grip handle icon on the left and the task text. The second item appears to be actively dragged — slightly elevated with a stronger shadow, and a dashed placeholder/ghost row shows where it will land between items 3 and 4. Items: "Redesign landing page", "Fix mobile nav bug" (being dragged), "Write Q2 blog post", "Update pricing page". Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 97 — Status page (dark)
  `Build a service status page for a cloud platform. Dark background. A page titled "System Status" with a green "All systems operational" banner at the top. Below: a grid of service health indicators for API (green, Operational), Web App (green, Operational), Database (yellow, Degraded Performance), CDN (green, Operational), Authentication (green, Operational), Email Service (red, Outage). Each item: a colored dot and a status label. A "Last updated 2 minutes ago" note at the top right. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 98 — Keyboard shortcut chips (light)
  `Create a keyboard shortcut display row for a design or productivity tool. Light background. A horizontal row of shortcut chips, each showing an action label and the key combination as styled key badge chips. Include: Undo (⌘Z), Redo (⌘⇧Z), Select All (⌘A), Copy (⌘C), Paste (⌘V), Save (⌘S). Each key badge looks like a physical keyboard key with a subtle border and shadow. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 99 — Data export modal (dark)
  `Design a data export dialog modal for an analytics dashboard. Dark background. Centered modal titled "Export Data". A format selector with 3 radio buttons (CSV selected, JSON, PDF). A date range section with "From" and "To" date inputs side by side. An "Include" section with checkboxes for: Transactions, Users, Analytics events, Audit log. At the bottom: a "Cancel" gray button and a blue "Download Export" button with a download icon. Use only inline CSS — no external libraries. Self-contained HTML document.`,

  // 100 — Theme customizer panel (dark)
  `Create a theme customizer side panel for a website builder. Dark background. Panel titled "Customize Theme". An "Accent color" section showing 6 color swatches (blue selected with a checkmark, purple, green, red, amber, pink). A "Font family" section with a dropdown showing "Inter". A "Border radius" section with 3 visual preview buttons showing Sharp, Rounded (selected), and Pill styles. At the bottom: a live preview mini-card showing how a button and card look in the current theme. Use only inline CSS — no external libraries. Self-contained HTML document.`,
];
