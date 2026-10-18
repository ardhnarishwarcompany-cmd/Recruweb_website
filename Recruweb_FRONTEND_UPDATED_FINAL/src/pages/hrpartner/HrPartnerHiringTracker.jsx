import { useCallback } from "react";
import LiveHiringTracker from "../../components/LiveHiringTracker";
import { api } from "../../utils/api";

export default function HrPartnerHiringTracker() {
  const load = useCallback(() => api.tracker.getHrPartner(), []);
  return (
    <LiveHiringTracker
      title="Candidate Hiring Tracker"
      subtitle="Live progress for candidates assigned to or submitted by this HR Partner account."
      load={load}
      emptyMessage="No candidate is assigned to or submitted by this HR Partner account yet."
    />
  );
}
