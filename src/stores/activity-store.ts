import { create } from "zustand";
import type { ActivityEvent, ActivityType, TimelineEvent } from "@/types";
import { generateId } from "@/lib/utils";
import { createAgentApiClient } from "@/api/agent-client";

interface ActivityState {
  events: ActivityEvent[];
  isLoading: boolean;
}

interface ActivityActions {
  fetchEvents: (token?: string) => Promise<void>;
  addEvent: (type: ActivityType, title: string, description: string, metadata?: Record<string, unknown>) => void;
  clearEvents: () => void;
}

type ActivityStore = ActivityState & ActivityActions;

export const useActivityStore = create<ActivityStore>((set, get) => ({
  // Initial state
  events: [],
  isLoading: false,

  // Actions
  fetchEvents: async (token?: string) => {
    set({ isLoading: true });

    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      const response = await apiClient.getTimeline();
      
      // Extract timeline events from response
      // API returns: { data: [], has_more: false, next_cursor: null }
      // getTimeline() returns response.data which is the API response object directly
      let timelineEvents: TimelineEvent[] = [];
      
      // Handle ApiResponse format: { data: { data: [], ... }, status, statusText }
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = (response as { data: unknown }).data;
        // Check if responseData is the timeline data structure { data: [], has_more, next_cursor }
        if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray((responseData as { data: unknown }).data)) {
          const timelineData = responseData as { data: TimelineEvent[]; has_more: boolean; next_cursor: string | null };
          timelineEvents = timelineData.data;
        } else if (Array.isArray(responseData)) {
          timelineEvents = responseData as TimelineEvent[];
        }
      } 
      // Handle direct timeline data structure: { data: [], has_more, next_cursor }
      else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: unknown }).data)) {
        const timelineData = response as { data: TimelineEvent[]; has_more: boolean; next_cursor: string | null };
        timelineEvents = timelineData.data;
      }
      // Handle direct array (fallback)
      else if (Array.isArray(response)) {
        timelineEvents = response as TimelineEvent[];
      }
      
      console.log("[ActivityStore] Timeline events extracted:", timelineEvents.length);
      
      // Convert TimelineEvent to ActivityEvent
      const events: ActivityEvent[] = timelineEvents.map((event) => {
        // Extract title and description from text
        // If text contains "Autonomous task exception", use it as title
        const isException = event.text.includes("Autonomous task exception");
        const title = isException 
          ? "Autonomous Task Exception" 
          : event.text.length > 50 
            ? event.text.substring(0, 50) + "..." 
            : event.text;
        const description = event.text;
        
        return {
          id: event.id,
          type: isException ? "tool_call" : "agent_updated" as ActivityType,
          title,
          description,
          agentId: event.agent_id,
          metadata: {
            images: event.images,
            video: event.video,
            post_id: event.post_id,
          },
          createdAt: event.created_at,
        };
      });

      console.log("[ActivityStore] Timeline events fetched");
      set({
        events: events.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        isLoading: false,
      });
    } catch (error) {
      console.error("[ActivityStore] Failed to fetch timeline:", error);
      // Don't use mock data, just set empty events
      set({
        events: [],
        isLoading: false,
      });
    }
  },

  addEvent: (type, title, description, metadata) => {
    const newEvent: ActivityEvent = {
      id: `evt_${generateId()}`,
      type,
      title,
      description,
      metadata,
      createdAt: new Date().toISOString(),
    };

    const { events } = get();
    set({
      events: [newEvent, ...events],
    });
  },

  clearEvents: () => {
    set({ events: [] });
  },
}));






