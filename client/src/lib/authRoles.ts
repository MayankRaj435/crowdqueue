export type PortalRole = "customer" | "staff" | "admin";

export type LoginRoleConfig = {
  role: PortalRole;
  title: string;
  subtitle: string;
  description: string;
  badges: string[];
  defaultRedirect: string;
  capabilities: string[];
  ctaLabel: string;
};

export const LOGIN_ROLE_CONFIG: Record<PortalRole, LoginRoleConfig> = {
  customer: {
    role: "customer",
    title: "Customer login",
    subtitle: "For citizens and customers waiting in line",
    description:
      "Use this portal to join queues, track your turn in real time, and manage your own tokens.",
    badges: ["Join queues", "Live tracking", "Cancel token"],
    defaultRedirect: "/discover",
    capabilities: [
      "Browse nearby queues and open active queue pages",
      "Join a queue from your phone and receive a token",
      "Track live position updates and estimated wait time",
      "Cancel your token or rate the service after being served",
    ],
    ctaLabel: "Continue as customer",
  },
  staff: {
    role: "staff",
    title: "Staff login",
    subtitle: "For counter operators and service staff",
    description:
      "Use this portal to manage queue flow at a counter and keep customers moving.",
    badges: ["Call next", "Pause queue", "Real-time room"],
    defaultRedirect: "/staff",
    capabilities: [
      "Call the next token when the counter is ready",
      "Pause or resume the queue when service capacity changes",
      "Watch live waiting counts and queue state updates",
      "Receive real-time notifications when customers join or are called",
    ],
    ctaLabel: "Continue as staff",
  },
  admin: {
    role: "admin",
    title: "Admin login",
    subtitle: "For organization admins and super admins",
    description:
      "Use this portal to create queues, manage staff, and view analytics for your organization.",
    badges: ["Create queues", "Manage staff", "Analytics"],
    defaultRedirect: "/org/dashboard",
    capabilities: [
      "Register and manage the organization profile",
      "Create, edit, pause, and close queues",
      "Add staff accounts and assign them to service counters",
      "Review operational analytics and queue performance",
    ],
    ctaLabel: "Continue as admin",
  },
};

export const LOGIN_ROLE_ORDER: PortalRole[] = ["customer", "staff", "admin"];

export const getLoginPath = (role: PortalRole) => `/login/${role}`;

export const getDefaultRedirectForRole = (role: PortalRole) => LOGIN_ROLE_CONFIG[role].defaultRedirect;

export const getLoginRoleFromPathname = (pathname: string): PortalRole => {
  if (pathname.startsWith("/staff")) return "staff";
  if (pathname.startsWith("/org")) return "admin";
  return "customer";
};
