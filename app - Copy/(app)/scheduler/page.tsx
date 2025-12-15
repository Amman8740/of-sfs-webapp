import { redirect } from 'next/navigation';

export default function SchedulerPage() {
    // Redirect to the default sub-option (Scheduled SFS)
    redirect('/scheduler/scheduled-sfs');
}