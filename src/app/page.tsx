import { getTimelineItems } from '../actions/timelineActions';
import TimelineClient from '../components/Timeline/TimelineClient';

export default async function TimelinePage() {
  // Fetch timeline items from the server action
  const items = await getTimelineItems();
  
  return (
    <div className="container mx-auto py-8">
      <TimelineClient initialItems={items} />
    </div>
  );
}