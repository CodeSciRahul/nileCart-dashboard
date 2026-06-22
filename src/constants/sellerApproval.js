import { CheckCircle2, Clock, XCircle } from "lucide-react";

export const SELLER_APPROVAL_STATUS_VARIANT = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
};

export const SELLER_APPLICATION_TABS = [
  { id: "Pending", icon: Clock, description: "Awaiting review" },
  { id: "Approved", icon: CheckCircle2, description: "Active on platform" },
  { id: "Rejected", icon: XCircle, description: "Declined applications" },
];
