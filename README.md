# Timeline Component with Next and TypeScript

A Next component for visualizing items on a horizontal timeline with compact lane arrangement, utilizing TypeScript, server components, client components, and server actions.

## Features

- Written in TypeScript for better type safety and developer experience
- Items are arranged in horizontal lanes in a space-efficient way
- Server Components for data fetching and rendering
- Client Components for interactive elements
- Server Actions for data modification
- Zooming functionality to adjust the timeline view
- Drag and drop support for adjusting item dates
  - Drag center to move the entire item
  - Drag edges to adjust start/end dates
- Inline editing of item names (double-click)
- Month labels for easier date reference
- Minimum width enforcement for very short items to ensure readability
- Optimistic UI updates with React 19's useTransition

## Implementation Details

### Tech Stack

- **React 19**: For the UI components and rendering
- **TypeScript**: For type safety and better developer experience
- **Next.js**: For server components and server actions
- **Tailwind CSS**: For styling

### React 19 Features Used

- **Server Components**: Used for data fetching and initial rendering
- **Client Components**: Handle interactive elements like dragging and zooming
- **Server Actions**: Update data on the server
- **useTransition**: Provide a smooth UI experience during updates

### Component Structure

- `app/page.tsx`: Server component that fetches initial data
- `components/Timeline/TimelineClient.tsx`: Client component with interactive features
- `actions/timelineActions.ts`: Server actions for data modifications
- `components/Timeline/assignLanes.ts`: Utility function for lane allocation
- `lib/timelineItems.ts`: Type definitions and sample data

### Data Model

The timeline component uses a `TimelineItem` interface:

```typescript
interface TimelineItem {
  id: number;
  name: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  color: string;     // hex color
}
```

## What I Like About My Implementation

1. **Type Safety**: TypeScript provides better developer experience and catches errors at compile time.
2. **Modern React Architecture**: Uses React 19's latest features for a clean separation of concerns.
3. **Optimistic UI Updates**: Updates happen immediately in the UI with server validation.
4. **Space Efficiency**: The lane allocation algorithm ensures items are arranged compactly.
5. **Intuitive Interactions**: The component uses familiar interaction patterns - dragging to resize/move and double-clicking to edit.

## What I Would Change Given More Time

1. **Data Persistence**: Implement a real database instead of in-memory storage.
2. **Proper Error Handling**: Add comprehensive error handling for server actions.
3. **Suspense Boundaries**: Add Suspense for better loading state management.
4. **Performance Optimization**: For large datasets, implement virtualization.
5. **Accessibility Improvements**: Enhance keyboard navigation and screen reader support.
6. **State Management**: Add a more robust state management solution for complex applications.
7. **Unit and Integration Tests**: Add comprehensive test coverage with TypeScript.

## Design Decisions

1. **TypeScript Integration**: Added strong typing for better code quality and developer experience.
2. **Server vs. Client Split**: Kept interactive elements (drag, zoom) in client components and data fetching in server components.
3. **Optimistic Updates**: UI updates happen immediately while server validation happens in the background.
4. **Lane Algorithm**: Used the provided lane assignment algorithm but adapted it for TypeScript and the server component architecture.

## How I Would Test This

1. **Unit Tests**:
   - Test the lane assignment algorithm with TypeScript's type checking
   - Test server actions with mock data
   - Verify date calculations

2. **Integration Tests**:
   - Test client-server interactions
   - Verify optimistic updates with mock server delays

3. **Type Testing**:
   - Verify type safety across component boundaries
   - Test edge cases with TypeScript's strict mode

## Running the Project

1. Clone the repository
2. Install dependencies: `npm install` or `yarn`
3. Start the development server: `npm run dev` or `yarn dev`
4. Open your browser to the local development URL (typically http://localhost:3000)

The timeline will load with the sample data and allow you to interact with it.
