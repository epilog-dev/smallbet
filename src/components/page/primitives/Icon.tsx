import {
  BarChart3, Bell, Brain, Calendar, Camera, CheckCircle2, Clock, CreditCard, Database, FileText, Globe, Heart, Inbox,
  Layers, LineChart, Link, Lock, Mail, MapPin, MessageSquare, Mic, Package, PenLine, RefreshCw, Rocket, Search, Settings,
  ShieldCheck, Smartphone, Sparkles, Star, Target, Timer, TrendingUp, Upload, Users, Wallet, Wand2, Workflow, Zap,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/lib/page-schema";

const MAP: Record<IconName, React.ComponentType<LucideProps>> = {
  zap: Zap, "shield-check": ShieldCheck, clock: Clock, sparkles: Sparkles, rocket: Rocket, "bar-chart-3": BarChart3,
  "line-chart": LineChart, layers: Layers, lock: Lock, bell: Bell, calendar: Calendar, "check-circle-2": CheckCircle2,
  "credit-card": CreditCard, database: Database, "file-text": FileText, globe: Globe, heart: Heart, inbox: Inbox, link: Link,
  mail: Mail, "message-square": MessageSquare, mic: Mic, package: Package, "pen-line": PenLine, "refresh-cw": RefreshCw,
  search: Search, settings: Settings, smartphone: Smartphone, star: Star, target: Target, timer: Timer,
  "trending-up": TrendingUp, upload: Upload, users: Users, wallet: Wallet, "wand-2": Wand2, workflow: Workflow, brain: Brain,
  camera: Camera, "map-pin": MapPin,
};

export function Icon({ name, ...props }: LucideProps & { name: IconName }) {
  const C = MAP[name] ?? Sparkles;
  return <C aria-hidden {...props} />;
}
