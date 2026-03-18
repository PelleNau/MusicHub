import { BookOpen, GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TheoryInfoSection } from "./TheoryInfoSection";
import { TheoryChallenge } from "./TheoryChallenge";
import { XPDisplay } from "./XPDisplay";
import { useTheoryStats } from "@/hooks/useTheoryStats";

interface TheoryLearnPracticeProps {
  topicKey: string;
  moduleKey: string;
  activeNotes?: number[];
  onShowAnswer?: (notes: number[]) => void;
}

export function TheoryLearnPractice({ topicKey, moduleKey, activeNotes, onShowAnswer }: TheoryLearnPracticeProps) {
  const { xp, currentStreak } = useTheoryStats();

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Tabs defaultValue="study">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 h-9">
          <TabsTrigger value="study" className="gap-1.5 text-[10px] font-mono uppercase tracking-wider data-[state=active]:bg-background">
            <BookOpen className="h-3 w-3" />
            Study
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-1.5 text-[10px] font-mono uppercase tracking-wider data-[state=active]:bg-background">
            <GraduationCap className="h-3 w-3" />
            Practice
          </TabsTrigger>
          <div className="ml-auto flex items-center pr-2">
            <XPDisplay xp={xp} streak={currentStreak} compact />
          </div>
        </TabsList>
        <TabsContent value="study" className="mt-0 p-3">
          <TheoryInfoSection topicKey={topicKey} />
        </TabsContent>
        <TabsContent value="practice" className="mt-0 p-3">
          <TheoryChallenge moduleKey={moduleKey} activeNotes={activeNotes} onShowAnswer={onShowAnswer} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
