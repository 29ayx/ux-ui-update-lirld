import { useParams } from "@solidjs/router";
import ChatDetailPanel from "~/components/chats/ChatDetailPanel";

export default function ChatDetail() {
  const { chatId } = useParams();
  return <ChatDetailPanel chatId={chatId} fullScreen />;
}
