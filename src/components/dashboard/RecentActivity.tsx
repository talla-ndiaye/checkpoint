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

const activityLabels = {
  entry: 'Entrée',
  exit: 'Sortie',
  invitation: 'Invitation',
};

const activityColors = {
  entry: 'bg-success/10 text-success',
  exit: 'bg-warning/10 text-warning',
  invitation: 'bg-primary/10 text-primary',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Activité récente</h3>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucune activité récente
          </p>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-lg ${activityColors[activity.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {activityLabels[activity.type]} • {activity.siteName}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
