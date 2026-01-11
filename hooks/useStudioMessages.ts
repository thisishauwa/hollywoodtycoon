import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface StudioMessage {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  content: string;
  isPublic: boolean;
  isRead: boolean;
  createdAt: Date;
}

export interface OtherStudio {
  id: string;
  username: string;
  reputation: number;
  balance: number;
}

export const useStudioMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [otherStudios, setOtherStudios] = useState<OtherStudio[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache for usernames
  const [usernameCache, setUsernameCache] = useState<Record<string, string>>({});

  // Fetch username for a user ID
  const getUsername = useCallback(async (userId: string): Promise<string> => {
    if (usernameCache[userId]) return usernameCache[userId];

    try {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (data?.username) {
        setUsernameCache(prev => ({ ...prev, [userId]: data.username }));
        return data.username;
      }
    } catch {
      // Ignore errors
    }
    return "Unknown";
  }, [usernameCache]);

  // Fetch all messages for the current user
  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      // Simple query without joins
      const { data, error } = await supabase
        .from("studio_messages")
        .select("*")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (error) {
        // Table might not exist yet
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("Studio messages table not found. Run the schema SQL first.");
          setError("Messaging not configured - run supabase-global-clock-schema.sql");
          setLoading(false);
          return;
        }
        throw error;
      }

      // Fetch usernames for all unique user IDs
      const userIds = new Set<string>();
      (data || []).forEach((msg: any) => {
        userIds.add(msg.from_user_id);
        userIds.add(msg.to_user_id);
      });

      // Batch fetch usernames
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", Array.from(userIds));

      const usernameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        usernameMap[p.id] = p.username;
      });
      setUsernameCache(prev => ({ ...prev, ...usernameMap }));

      const formattedMessages: StudioMessage[] = (data || []).map((msg: any) => ({
        id: msg.id,
        fromUserId: msg.from_user_id,
        fromUsername: usernameMap[msg.from_user_id] || "Unknown",
        toUserId: msg.to_user_id,
        toUsername: usernameMap[msg.to_user_id] || "Unknown",
        content: msg.content,
        isPublic: msg.is_public,
        isRead: msg.is_read,
        createdAt: new Date(msg.created_at),
      }));

      setMessages(formattedMessages);
      setUnreadCount(
        formattedMessages.filter((m) => m.toUserId === user.id && !m.isRead).length
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch other studios (other players)
  const fetchOtherStudios = useCallback(async () => {
    if (!user) return;

    try {
      // Get all profiles with their game state (balance, reputation)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .neq("id", user.id);

      if (profilesError) throw profilesError;

      // Get game states for these users
      const { data: gameStates, error: statesError } = await supabase
        .from("game_state")
        .select("user_id, balance, reputation");

      if (statesError && statesError.code !== "42P01") {
        console.warn("Game state table issue:", statesError);
      }

      const studios: OtherStudio[] = (profiles || []).map((profile: any) => {
        const state = gameStates?.find((gs: any) => gs.user_id === profile.id);
        return {
          id: profile.id,
          username: profile.username,
          reputation: state?.reputation || 30,
          balance: state?.balance || 5000000,
        };
      });

      setOtherStudios(studios);
    } catch (err) {
      console.error("Error fetching other studios:", err);
    }
  }, [user]);

  // Send a message to another studio
  const sendMessage = async (
    toUserId: string,
    content: string,
    isPublic: boolean = false
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("studio_messages").insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        content,
        is_public: isPublic,
      });

      if (error) throw error;

      // Refresh messages
      await fetchMessages();
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      return false;
    }
  };

  // Mark a message as read
  const markAsRead = async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("studio_messages")
        .update({ is_read: true })
        .eq("id", messageId)
        .eq("to_user_id", user.id);

      if (error) throw error;

      // Update local state
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error("Error marking message as read:", err);
      return false;
    }
  };

  // Mark all messages from a user as read
  const markAllAsRead = async (fromUserId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("studio_messages")
        .update({ is_read: true })
        .eq("from_user_id", fromUserId)
        .eq("to_user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      // Update local state
      const markedCount = messages.filter(
        (m) => m.fromUserId === fromUserId && m.toUserId === user.id && !m.isRead
      ).length;

      setMessages((prev) =>
        prev.map((m) =>
          m.fromUserId === fromUserId && m.toUserId === user.id
            ? { ...m, isRead: true }
            : m
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - markedCount));
      return true;
    } catch (err) {
      console.error("Error marking all as read:", err);
      return false;
    }
  };

  // Get conversation with a specific studio
  const getConversation = (studioId: string): StudioMessage[] => {
    if (!user) return [];
    return messages.filter(
      (m) =>
        (m.fromUserId === studioId && m.toUserId === user.id) ||
        (m.fromUserId === user.id && m.toUserId === studioId)
    );
  };

  // Get all public messages (for Variety magazine)
  const getPublicMessages = (): StudioMessage[] => {
    return messages.filter((m) => m.isPublic);
  };

  // Transfer money to another player (atomic database transaction)
  const transferMoney = async (
    toUserId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
    if (!user) return { success: false, error: "Not logged in" };

    try {
      // Call the atomic transfer function
      const { data, error } = await supabase.rpc("transfer_money", {
        sender_id: user.id,
        recipient_id: toUserId,
        transfer_amount: amount,
      });

      if (error) {
        // Function might not exist yet
        if (error.message.includes("does not exist")) {
          return { success: false, error: "Transfer function not configured. Run the schema SQL." };
        }
        throw error;
      }

      const result = data?.[0];

      if (result?.success) {
        return {
          success: true,
          newBalance: result.sender_new_balance,
        };
      } else {
        return {
          success: false,
          error: result?.error_message || "Transfer failed",
        };
      }
    } catch (err: any) {
      console.error("Error transferring money:", err);
      return { success: false, error: err.message || "Transfer failed" };
    }
  };

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setOtherStudios([]);
      setLoading(false);
      return;
    }

    fetchMessages();
    fetchOtherStudios();

    // Subscribe to real-time message updates
    const subscription = supabase
      .channel("studio_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "studio_messages",
        },
        (payload) => {
          const newMsg = payload.new as any;
          // Only add if it's for us
          if (newMsg.from_user_id === user.id || newMsg.to_user_id === user.id) {
            fetchMessages(); // Refetch to get usernames
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "studio_messages",
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchMessages, fetchOtherStudios]);

  return {
    messages,
    otherStudios,
    unreadCount,
    loading,
    error,
    sendMessage,
    markAsRead,
    markAllAsRead,
    getConversation,
    getPublicMessages,
    transferMoney,
    refetch: fetchMessages,
  };
};
