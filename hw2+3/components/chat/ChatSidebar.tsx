import { Chat } from '@/types/chat';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Llama 3 Chat',
    lastMessage: 'Hello! How can I help you?',
    lastMessageTime: new Date(),
  },
  {
    id: '2',
    name: 'Code Assistant',
    lastMessage: 'I can help you with coding questions!',
    lastMessageTime: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    name: 'Math Tutor',
    lastMessage: 'Let\'s solve some math problems!',
    lastMessageTime: new Date(Date.now() - 7200000),
  },
  {
    id: '4',
    name: 'Writing Helper',
    lastMessage: 'Need help with your essay?',
    lastMessageTime: new Date(Date.now() - 86400000),
  },
];

export function ChatSidebar({ selectedChat, onSelectChat }: ChatSidebarProps) {
  return (
    <Card className="w-80 border-r rounded-none">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        {mockChats.map((chat, index) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                selectedChat === chat.id ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${chat.id}`} />
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chat.name}</div>
                  {chat.lastMessage && (
                    <div className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </div>
                  )}
                </div>
              </div>
            </button>
            <Separator />
          </motion.div>
        ))}
      </ScrollArea>
    </Card>
  );
} 