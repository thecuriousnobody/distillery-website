import CalendarPanel from "./CalendarPanel";
import ChatPanel from "./ChatPanel";

export default function TodayPanel() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Calendar — 57% */}
      <div className="w-[57%] border-r-2 border-brutal-accent overflow-hidden">
        <CalendarPanel />
      </div>

      {/* Chat — 43% */}
      <div className="w-[43%] overflow-hidden">
        <ChatPanel />
      </div>
    </div>
  );
}
