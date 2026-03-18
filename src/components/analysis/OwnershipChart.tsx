import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AnalysisData } from "./AnalysisDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface Props {
  analysis: AnalysisData;
}

const OWNED_COLOR = "hsl(166, 100%, 50%)";    // primary
const MISSING_COLOR = "hsl(340, 85%, 60%)";    // accent
const TYPE_COLORS = [
  "hsl(166, 100%, 50%)",
  "hsl(var(--warning))",
  "hsl(210, 90%, 60%)",
  "hsl(280, 70%, 60%)",
];

export function OwnershipChart({ analysis }: Props) {
  const ownershipData = [
    { name: "Owned", value: analysis.ownedDevices },
    { name: "Missing", value: analysis.totalDevices - analysis.ownedDevices },
  ];

  const hasMissing = analysis.missingDevices.length > 0;

  return (
    <Card className="border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-xs font-semibold tracking-wider uppercase text-foreground">
          Device Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ownershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill={OWNED_COLOR} />
                  <Cell fill={MISSING_COLOR} />
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 10%)",
                    border: "1px solid hsl(0 0% 16%)",
                    borderRadius: "6px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="font-mono text-[11px] text-foreground">
                {analysis.ownedDevices} owned
              </span>
            </div>
            {hasMissing && (
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="font-mono text-[11px] text-foreground">
                  {analysis.missingDevices.length} missing
                </span>
              </div>
            )}
            {/* Device type breakdown */}
            <div className="pt-1 border-t border-border/20 space-y-1">
              {analysis.deviceTypeCounts.map((dt, i) => (
                <div key={dt.name} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">{dt.name}</span>
                  <Badge variant="secondary" className="font-mono text-[9px] px-1.5 h-4">
                    {dt.value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Missing devices list */}
        {hasMissing && (
          <div className="mt-3 pt-3 border-t border-border/20">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">Not in inventory</p>
            <div className="flex flex-wrap gap-1">
              {analysis.missingDevices.slice(0, 8).map((name) => (
                <Badge key={name} variant="outline" className="font-mono text-[9px] px-1.5 py-0 h-5 border-accent/30 text-accent">
                  <X className="h-2.5 w-2.5 mr-0.5" />
                  {name}
                </Badge>
              ))}
              {analysis.missingDevices.length > 8 && (
                <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 h-5 text-muted-foreground">
                  +{analysis.missingDevices.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
