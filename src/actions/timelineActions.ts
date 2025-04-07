'use server';

import { TimelineItem, timelineItems } from '../lib/timelineItems';
import { revalidatePath } from 'next/cache';

// In a real app, these would interact with a database
// For this example, we'll use a server-side in-memory store
let items: TimelineItem[] = [...timelineItems];

export async function getTimelineItems(): Promise<TimelineItem[]> {
  return items;
}

export async function updateItemDates(id: number, startDate: string, endDate: string): Promise<TimelineItem[]> {
  items = items.map(item => {
    if (item.id === id) {
      return { ...item, startDate, endDate };
    }
    return item;
  });
  
  revalidatePath('/');
  return items;
}

export async function updateItemName(id: number, name: string): Promise<TimelineItem[]> {
  items = items.map(item => {
    if (item.id === id) {
      return { ...item, name };
    }
    return item;
  });
  
  revalidatePath('/');
  return items;
}