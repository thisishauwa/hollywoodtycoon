import React, { useState, useEffect, useRef } from "react";
import { GameState, Actor } from "../types";
import { WindowFrame, RetroButton } from "./RetroUI";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  state: GameState;
  onUpdateRelationship: (actorId: string, change: number) => void;
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  zIndex: number;
  onFocus: () => void;
}

interface ChatMessage {
  id: string;
  actorId: string;
  sender: "player" | "actor";
  text: string;
  timestamp: Date;
}

// Response templates based on actor personality and relationship
const RESPONSE_TEMPLATES = {
  greeting: {
    positive: [
      "Hey! Great to hear from you! How's the studio going?",
      "Oh hey! I was just thinking about our last project together. What's up?",
      "Hey there! Always happy to chat with you.",
      "Hi! You know, I've been meaning to reach out. Good timing!",
    ],
    neutral: [
      "Hi. What can I do for you?",
      "Oh, hello. Something on your mind?",
      "Hey. What's going on?",
      "Hi there. Need something?",
    ],
    negative: [
      "What do you want?",
      "Oh. It's you. Make it quick.",
      "...Hi. I'm kind of busy.",
      "*sigh* Yes?",
    ],
  },
  gossip: {
    positive: [
      "Okay, between you and me... {gossip}",
      "You didn't hear this from me, but... {gossip}",
      "I trust you, so I'll share this... {gossip}",
      "Promise you won't tell anyone? {gossip}",
    ],
    neutral: [
      "I heard something interesting... {gossip}",
      "Word on set is... {gossip}",
      "People are saying... {gossip}",
      "Here's what I know... {gossip}",
    ],
    negative: [
      "Why should I tell you anything? Fine... {gossip}",
      "I guess I can share... {gossip}",
      "Whatever... {gossip}",
      "I suppose you'd find out anyway... {gossip}",
    ],
  },
  career: {
    positive: [
      "I've been working on my craft! Feeling really good about where I'm heading.",
      "You know, working with {studioName} has been incredible for my career.",
      "I'm hoping we can do more projects together. I really enjoy our collaboration!",
      "Things are going well! I've got some exciting opportunities coming up.",
    ],
    neutral: [
      "Career's fine. Working on a few things.",
      "It's going okay. Always looking for the next big role.",
      "Can't complain. Staying busy.",
      "Things are... progressing. Slowly but surely.",
    ],
    negative: [
      "It would be better if I got better roles...",
      "Honestly? I've had better years.",
      "I'm not sure this contract is working out for me.",
      "Maybe I should be talking to other studios...",
    ],
  },
  compliment: {
    positive: [
      "Aww, you're too sweet! That really means a lot coming from you.",
      "Thank you! You always know how to make someone feel special.",
      "That's so kind! I appreciate you saying that.",
      "You're amazing too! We make a great team!",
    ],
    neutral: [
      "Oh, um, thanks. That's nice of you to say.",
      "Appreciate it. Really.",
      "Thanks, I guess?",
      "That's... unexpected, but thanks.",
    ],
    negative: [
      "Are you trying to butter me up?",
      "Hmph. Actions speak louder than words.",
      "I've heard that before...",
      "Save the flattery.",
    ],
  },
  project: {
    positive: [
      "I'd LOVE to work on something new with you! What do you have in mind?",
      "Yes! I've been hoping you'd ask! What's the project?",
      "Absolutely! Count me in. When do we start?",
      "I'm so there! This is exciting!",
    ],
    neutral: [
      "Depends on the project. What are we talking about?",
      "Maybe. Tell me more about it first.",
      "I could be interested. What's the role?",
      "Let me see the script first.",
    ],
    negative: [
      "I'll have to think about it...",
      "After how things went last time? I'm not sure.",
      "My agent would have to review any offers.",
      "We'll see. I have other offers to consider.",
    ],
  },
};

const QUICK_MESSAGES = [
  { label: "Say Hi", type: "greeting" },
  { label: "Ask for Gossip", type: "gossip" },
  { label: "Discuss Career", type: "career" },
  { label: "Give Compliment", type: "compliment" },
  { label: "Discuss New Project", type: "project" },
];

const getRandomGossip = (actor: Actor, state: GameState): string => {
  const gossipPool = [
    ...(actor.gossip || []),
    `Someone's been asking about ${state.actors[Math.floor(Math.random() * state.actors.length)]?.name || 'another actor'}...`,
    `I heard ${state.rivals[Math.floor(Math.random() * state.rivals.length)]?.name || 'a rival studio'} is struggling financially.`,
    `Word is there's a big script coming up that everyone wants.`,
    `Someone at the studio party was very drunk last weekend...`,
    `There's drama brewing between some A-listers, but I can't say who.`,
  ];
  return gossipPool[Math.floor(Math.random() * gossipPool.length)] || "I don't have any good gossip right now...";
};

const getResponseMood = (relationship: number): "positive" | "neutral" | "negative" => {
  if (relationship >= 30) return "positive";
  if (relationship <= -30) return "negative";
  return "neutral";
};

const generateResponse = (
  type: string,
  actor: Actor,
  state: GameState
): { text: string; relationshipChange: number } => {
  const mood = getResponseMood(actor.reputation);
  const templates = RESPONSE_TEMPLATES[type as keyof typeof RESPONSE_TEMPLATES]?.[mood] ||
    RESPONSE_TEMPLATES.greeting[mood];

  let text = templates[Math.floor(Math.random() * templates.length)];
  text = text.replace("{gossip}", getRandomGossip(actor, state));
  text = text.replace("{studioName}", state.studioName);

  // Relationship changes based on message type and current mood
  let relationshipChange = 0;
  if (type === "compliment") {
    relationshipChange = mood === "negative" ? 1 : mood === "neutral" ? 2 : 3;
  } else if (type === "gossip") {
    relationshipChange = mood === "positive" ? 1 : 0;
  } else if (type === "project") {
    relationshipChange = mood === "positive" ? 2 : mood === "negative" ? -1 : 0;
  } else {
    relationshipChange = mood === "positive" ? 1 : mood === "negative" ? -1 : 0;
  }

  return { text, relationshipChange };
};

export const ActorChat: React.FC<Props> = ({
  state,
  onUpdateRelationship,
  onClose,
  onMinimize,
  isActive,
  zIndex,
  onFocus,
}) => {
  const { user } = useAuth();
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Get contracted actors
  const [contractedActorIds, setContractedActorIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("actor_contracts")
        .select("actor_id")
        .eq("studio_id", user.id)
        .eq("status", "active");
      if (data) {
        setContractedActorIds(data.map((c) => c.actor_id));
      }
    };
    fetchContracts();
  }, [user]);

  const contractedActors = state.actors.filter((a) =>
    contractedActorIds.includes(a.id)
  );

  // Scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = (messageType: string, customText?: string) => {
    if (!selectedActor) return;

    const playerMessage: ChatMessage = {
      id: `msg-${Date.now()}-player`,
      actorId: selectedActor.id,
      sender: "player",
      text: customText || QUICK_MESSAGES.find((m) => m.type === messageType)?.label || "Hello",
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, playerMessage]);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const { text, relationshipChange } = generateResponse(
        messageType,
        selectedActor,
        state
      );

      const actorMessage: ChatMessage = {
        id: `msg-${Date.now()}-actor`,
        actorId: selectedActor.id,
        sender: "actor",
        text,
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, actorMessage]);
      setIsTyping(false);

      if (relationshipChange !== 0) {
        onUpdateRelationship(selectedActor.id, relationshipChange);
      }
    }, 1000 + Math.random() * 1500);
  };

  const handleCustomSend = () => {
    if (!customMessage.trim()) return;
    // Determine message type based on content
    let type = "greeting";
    const lowerMsg = customMessage.toLowerCase();
    if (lowerMsg.includes("gossip") || lowerMsg.includes("heard") || lowerMsg.includes("rumor")) {
      type = "gossip";
    } else if (lowerMsg.includes("career") || lowerMsg.includes("work") || lowerMsg.includes("role")) {
      type = "career";
    } else if (lowerMsg.includes("great") || lowerMsg.includes("amazing") || lowerMsg.includes("love")) {
      type = "compliment";
    } else if (lowerMsg.includes("project") || lowerMsg.includes("film") || lowerMsg.includes("movie")) {
      type = "project";
    }

    sendMessage(type, customMessage);
    setCustomMessage("");
  };

  const actorChat = chatHistory.filter((m) => m.actorId === selectedActor?.id);

  return (
    <WindowFrame
      title="Talent Chat - Hollywood Messenger"
      onClose={onClose}
      onMinimize={onMinimize}
      isActive={isActive}
      zIndex={zIndex}
      onFocus={onFocus}
      className="w-full max-w-3xl h-[550px]"
      initialPos={{ x: 120, y: 80 }}
    >
      <div className="flex h-full bg-[#ece9d8] overflow-hidden font-sans">
        {/* Actor List */}
        <div className="w-52 border-r-2 border-[#808080] flex flex-col bg-white">
          <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white p-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm shrink-0">
            <span className="text-sm">🎭</span> My Talent ({contractedActors.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {contractedActors.length === 0 ? (
              <div className="p-3 text-[10px] text-gray-500 text-center">
                <p className="italic">No actors under contract</p>
                <p className="mt-1">Sign actors in the Talent Pool to chat with them!</p>
              </div>
            ) : (
              contractedActors.map((actor) => (
                <div
                  key={actor.id}
                  onClick={() => setSelectedActor(actor)}
                  className={`p-2 cursor-pointer text-[11px] flex items-center gap-2 border-b border-gray-100 ${
                    selectedActor?.id === actor.id
                      ? "bg-purple-600 text-white shadow-inner"
                      : "hover:bg-purple-50 text-black"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={actor.img}
                      alt={actor.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-300"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                        actor.reputation >= 70
                          ? "bg-green-500"
                          : actor.reputation >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{actor.name}</div>
                    <div
                      className={`text-[9px] ${
                        selectedActor?.id === actor.id
                          ? "text-purple-200"
                          : "text-gray-400"
                      }`}
                    >
                      {actor.tier} • {actor.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedActor ? (
            <>
              {/* Actor Header */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-2 border-b border-gray-200 flex items-center gap-3">
                <img
                  src={selectedActor.img}
                  alt={selectedActor.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                />
                <div className="flex-1">
                  <div className="font-bold text-[12px]">{selectedActor.name}</div>
                  <div className="text-[9px] text-gray-500 flex gap-2">
                    <span>{selectedActor.tier}</span>
                    <span>•</span>
                    <span>Skill: {selectedActor.skill}%</span>
                    <span>•</span>
                    <span>Rep: {selectedActor.reputation}%</span>
                  </div>
                </div>
                <div className="text-right text-[9px] text-gray-400">
                  <div>{selectedActor.personality?.join(", ") || "Unknown personality"}</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3">
                {actorChat.length === 0 ? (
                  <div className="text-center text-gray-400 text-[11px] py-8">
                    <span className="text-2xl block mb-2">💬</span>
                    Start a conversation with {selectedActor.name}!
                  </div>
                ) : (
                  actorChat.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "player" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-2 rounded-lg text-[11px] ${
                          msg.sender === "player"
                            ? "bg-purple-500 text-white rounded-br-none"
                            : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-2 shadow-sm">
                      <span className="text-gray-400 text-[11px] italic">
                        {selectedActor.name} is typing...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="p-2 border-t border-gray-200 bg-gray-100">
                <div className="flex flex-wrap gap-1 mb-2">
                  {QUICK_MESSAGES.map((qm) => (
                    <button
                      key={qm.type}
                      onClick={() => sendMessage(qm.type)}
                      disabled={isTyping}
                      className="px-2 py-1 text-[9px] bg-white border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {qm.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomSend()}
                    placeholder="Type a message..."
                    disabled={isTyping}
                    className="flex-1 px-2 py-1 text-[11px] border border-gray-300 rounded focus:outline-none focus:border-purple-400"
                  />
                  <RetroButton
                    onClick={handleCustomSend}
                    disabled={isTyping || !customMessage.trim()}
                    className="px-3"
                  >
                    Send
                  </RetroButton>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <span className="text-5xl mb-3 opacity-50">🎭</span>
              <p className="text-[12px] font-bold">Select a talent to chat</p>
              <p className="text-[10px] mt-1">
                Build relationships and get insider gossip
              </p>
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
};
