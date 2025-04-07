'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { assignLanesToItems } from './assignLanes';
import { updateItemDates, updateItemName } from '../../actions/timelineActions';
import { TimelineItem } from '../../lib/timelineItems';

interface TimelineClientProps {
  initialItems: TimelineItem[];
}

export default function TimelineClient({ initialItems }: TimelineClientProps): React.ReactElement {
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [lanes, setLanes] = useState<TimelineItem[][]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [draggingItem, setDraggingItem] = useState<TimelineItem | null>(null);
  const [dragType, setDragType] = useState<'start' | 'end' | 'move' | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate min and max dates from items
  const minDate = new Date(Math.min(...items.map(item => new Date(item.start).getTime())));
  const maxDate = new Date(Math.max(...items.map(item => new Date(item.end).getTime())));
  
  // Add 7 days padding on both sides
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 7);
  
  // Date range for the timeline (in days)
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  // Assign lanes when items change
  useEffect(() => {
    const lanesArray = assignLanesToItems(items);
    setLanes(lanesArray);
  }, [items]);

  // Calculate position and width for an item
  const getItemStyle = (item: TimelineItem): React.CSSProperties => {
    const startDays = Math.floor((new Date(item.start).getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const endDays = Math.ceil((new Date(item.end).getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const itemWidth = Math.max((endDays - startDays) * 24 * zoomLevel, 80); // Min width for small items
    
    return {
      left: `${startDays * 24 * zoomLevel}px`,
      width: `${itemWidth}px`,
      backgroundColor: '#4287f5'
    };
  };

  // Handle zooming
  const handleZoom = (zoomIn: boolean): void => {
    setZoomLevel(prevZoom => {
      const newZoom = zoomIn ? prevZoom * 1.2 : prevZoom / 1.2;
      return Math.max(0.5, Math.min(5, newZoom)); // Limit zoom between 0.5x and 5x
    });
  };

  // Start dragging an item
  const startDrag = (e: React.MouseEvent, item: TimelineItem, type: 'start' | 'end' | 'move'): void => {
    setDraggingItem(item);
    setDragType(type);
    setDragStartX(e.clientX);
    e.stopPropagation();
  };

  // Handle drag movement
  const handleDrag = (e: MouseEvent): void => {
    if (!draggingItem || !dragType) return;

    const deltaX = e.clientX - dragStartX;
    const daysDelta = Math.round(deltaX / (24 * zoomLevel));
    
    if (daysDelta === 0) return;
    
    setDragStartX(e.clientX);
    
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id !== draggingItem.id) return item;
        
        const itemCopy = {...item};
        const startDate = new Date(item.start);
        const endDate = new Date(item.end);
        
        // Handle different drag types
        if (dragType === 'start') {
          startDate.setDate(startDate.getDate() + daysDelta);
          // Ensure start doesn't go past end
          if (startDate < endDate) {
            itemCopy.start = startDate.toISOString().split('T')[0];
          }
        } else if (dragType === 'end') {
          endDate.setDate(endDate.getDate() + daysDelta);
          // Ensure end doesn't go before start
          if (endDate > startDate) {
            itemCopy.end = endDate.toISOString().split('T')[0];
          }
        } else if (dragType === 'move') {
          startDate.setDate(startDate.getDate() + daysDelta);
          endDate.setDate(endDate.getDate() + daysDelta);
          itemCopy.start = startDate.toISOString().split('T')[0];
          itemCopy.end = endDate.toISOString().split('T')[0];
        }
        
        return itemCopy;
      });
    });
  };

  // End dragging
  const endDrag = (): void => {
    if (draggingItem) {
      // Find the updated item from the current state
      const updatedItem = items.find(item => item.id === draggingItem.id);
      if (updatedItem) {
        // Call server action to persist the changes
        startTransition(() => {
          updateItemDates(updatedItem.id, updatedItem.start, updatedItem.end)
            .then(updatedItems => {
              setItems(updatedItems);
            });
        });
      }
    }
    
    setDraggingItem(null);
    setDragType(null);
  };

  // Start editing an item name
  const startEdit = (item: TimelineItem, e: React.MouseEvent): void => {
    e.stopPropagation();
    setEditingItem(item.id);
    setEditingText(item.name);
  };

  // Save the edited name
  const saveEdit = (): void => {
    if (!editingItem) return;
    
    startTransition(() => {
      updateItemName(editingItem, editingText)
        .then(updatedItems => {
          setItems(updatedItems);
        });
    });
    
    setEditingItem(null);
    setEditingText('');
  };

  // Handle mouse events for drag operations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (draggingItem) {
        handleDrag(e);
      }
    };
    
    const handleMouseUp = (): void => {
      if (draggingItem) {
        endDrag();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingItem, dragStartX, dragType]);

  // Generate month labels for the timeline
  const renderMonthLabels = (): React.ReactNode[] => {
    const months: React.ReactNode[] = [];
    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      const monthStart = new Date(currentDate);
      const monthStartDays = Math.floor((monthStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      months.push(
        <div 
          key={monthName} 
          className="absolute border-l border-gray-300"
          style={{ left: `${monthStartDays * 24 * zoomLevel}px` }}
        >
          <div className="pl-1 text-xs text-gray-500">{monthName}</div>
        </div>
      );
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }
    
    return months;
  };

  return (
    <div className="flex flex-col p-4 w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-red-700">Project Timeline</h1>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 bg-blue-500 text-white rounded" 
            onClick={() => handleZoom(false)}
            disabled={isPending}
          >
            Zoom Out
          </button>
          <button 
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => handleZoom(true)}
            disabled={isPending}
          >
            Zoom In
          </button>
        </div>
      </div>
      
      {isPending && (
        <div className="mb-2 text-blue-500">Updating timeline...</div>
      )}
      
      <div className="relative overflow-x-auto border border-gray-200 rounded" ref={timelineRef}>
        {/* Timeline header with month labels */}
        <div className="sticky top-0 h-8 bg-gray-50 border-b border-gray-200 z-10">
          <div className="relative h-full" style={{ width: `${totalDays * 24 * zoomLevel}px` }}>
            {renderMonthLabels()}
          </div>
        </div>
        
        {/* Timeline content with lanes */}
        <div className="relative" style={{ width: `${totalDays * 24 * zoomLevel}px` }}>
          {lanes.map((lane, laneIndex) => (
            <div 
              key={`lane-${laneIndex}`} 
              className="relative h-12 border-b border-gray-100"
            >
              {lane.map(item => (
                <div
                  key={item.id}
                  className="absolute top-1 h-10 rounded cursor-pointer flex items-center px-2 shadow-sm"
                  style={getItemStyle(item)}
                  onClick={(e) => startDrag(e, item, 'move')}
                >
                  {/* Drag handle for start date */}
                  <div 
                    className="absolute top-0 left-0 w-1 h-full cursor-w-resize bg-white opacity-0 hover:opacity-50"
                    onMouseDown={(e) => startDrag(e, item, 'start')}
                  />
                  
                  {/* Item content */}
                  <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-white">
                    {editingItem === item.id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={saveEdit}
                        onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && saveEdit()}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent text-white outline-none"
                        autoFocus
                      />
                    ) : (
                      <span onDoubleClick={(e) => startEdit(item, e)}>
                        {item.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Drag handle for end date */}
                  <div 
                    className="absolute top-0 right-0 w-1 h-full cursor-e-resize bg-white opacity-0 hover:opacity-50"
                    onMouseDown={(e) => startDrag(e, item, 'end')}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Double-click an item to edit its name. Drag edges to resize or the center to move.</p>
      </div>
    </div>
  );
}