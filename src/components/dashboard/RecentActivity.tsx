import { Clock, ArrowUpRight, ArrowDownLeft, UserPlus } from 'lucide-react';

interface Activity {
  id: string;
  type: 'entry' | 'exit' | 'invitation';
  userName: string;
  siteName: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons = {
  entry: ArrowUpRight,
  exit: ArrowDownLeft,
  invitation: UserPlus,
};

import { useTranslation } from 'react-i18next';

const activityColors = {
  entry: 'bg-success/10 text-success',
  exit: 'bg-warning/10 text-warning',
  invitation: 'bg-primary/10 text-primary',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  const { t } = useTranslation();

  const activityLabels = {
    entry: t('dashboard.entry'),
    exit: t('dashboard.exit'),
    invitation: t('dashboard.invitation'),
  };

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">{t('dashboard.recent_activity')}</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">Live</span>
      </div>

      <div className="space-y-3 flex-1">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-50">
            <Clock className="h-10 w-10 mb-2" />
            <p className="text-sm font-medium">
              {t('dashboard.no_activity')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              return (
                <div
                  key={activity.id}
                  className="group flex items-center gap-4 p-3.5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`p-2.5 rounded-xl ${activityColors[activity.type]} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activity.userName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-medium text-muted-foreground/80">
                        {activityLabels[activity.type]}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40">•</span>
                      <span className="text-xs text-muted-foreground/60 truncate">
                        {activity.siteName}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground/60 tabular-nums">
                    {activity.timestamp}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
