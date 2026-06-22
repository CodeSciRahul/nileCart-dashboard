import {
  CalendarClock,
  Layers,
  Percent,
  RefreshCcw,
  Ticket,
  Users,
} from "lucide-react";

export const COUPON_FORM_SECTIONS = [
  { id: "basic", title: "Basic details", icon: Ticket, step: 1 },
  { id: "discount", title: "Discount rules", icon: Percent, step: 2 },
  { id: "limits", title: "Usage limits", icon: RefreshCcw, step: 3 },
  { id: "eligibility", title: "Eligibility", icon: Users, step: 4 },
  { id: "scope", title: "Scope", icon: Layers, step: 5 },
  { id: "schedule", title: "Schedule", icon: CalendarClock, step: 6 },
];

export const COUPON_ELIGIBILITY_OPTIONS = [
  {
    value: "all",
    label: "All users",
    description: "Anyone with an account can use this coupon.",
  },
  {
    value: "new",
    label: "New users",
    description: "Customers with no delivered orders yet.",
  },
  {
    value: "returning",
    label: "Returning users",
    description: "Customers who have completed at least one order.",
  },
];

export const COUPON_GUIDE_STEPS = [
  {
    icon: Ticket,
    title: "Coupon code & description",
    summary:
      "The code is what customers type at checkout. Keep it short, memorable, and easy to share.",
    details: [
      "Codes are automatically converted to UPPERCASE when saved.",
      "Once created, the code cannot be changed — choose carefully.",
      "Description is for your admin team only; customers do not see it.",
      "Avoid spaces and special characters that are hard to type on mobile.",
    ],
    example: "Code: WELCOME10 — Description: 10% off for first-time shoppers",
  },
  {
    icon: Percent,
    title: "Discount type & value",
    summary:
      "Percentage discounts reduce the order by a % of the total. Flat discounts subtract a fixed rupee amount.",
    details: [
      "Percentage: use for promotions like 15% off. Set a max discount cap to limit savings on large orders.",
      "Flat: use for fixed savings like ₹200 off. The discount cannot exceed the order total.",
      "Min order amount: require a minimum cart value before the coupon applies (0 = no minimum).",
      "Max discount only applies to percentage-type coupons.",
    ],
    example: "20% off, min ₹999, max discount ₹500 → saves up to ₹500 on qualifying orders",
  },
  {
    icon: Users,
    title: "Usage limits & eligibility",
    summary: "Control who can use the coupon and how many times it can be redeemed.",
    details: [
      "Global usage limit: total redemptions across all customers. Leave empty for unlimited.",
      "Max uses per user: how many times one account can apply this code (default: 1).",
      "Restore on cancel: if enabled, cancelling an order returns one use to that customer.",
      "All users: everyone. New users: no delivered orders yet. Returning: at least one delivered order.",
    ],
    example: "Global limit 1000, 1 per user, new users only → first-order welcome offer",
  },
  {
    icon: Layers,
    title: "Scope — categories & products",
    summary:
      "By default, a coupon applies store-wide. Narrow it to specific categories or products when needed.",
    details: [
      "Category picker: selecting a parent includes all its subcategories.",
      "Leave categories empty to include the entire catalog.",
      "Product search: add individual products for highly targeted deals.",
      "If both categories and products are set, the coupon applies to items matching either rule (per server logic).",
    ],
    example: "Select 'Women' department + add specific sale items for a flash deal",
  },
  {
    icon: CalendarClock,
    title: "Schedule",
    summary: "Optionally restrict when the coupon is valid using start and end dates.",
    details: [
      "Leave both dates empty for a coupon with no time restriction.",
      "Start date: coupon becomes valid from this moment.",
      "End date: must be after the start date or the form will reject the save.",
      "Higher priority coupons appear first when multiple are active.",
    ],
    example: "Starts Dec 1 00:00 → Ends Dec 31 23:59 for a month-end sale",
  },
];

export const COUPON_GUIDE_TIPS = [
  "Test with a high min order amount first, then lower it once you've verified checkout behavior.",
  "Use NEWUSER or WELCOME codes for acquisition; use LOYALTY codes for returning customers.",
  "Pair a max discount cap with percentage coupons to protect margins on large orders.",
  "After creating, use Deactivate on the list page to pause a coupon without deleting it.",
];
