import type { ActivityItem } from '@/types';

interface Props {
  activities: ActivityItem[];
}

export default function ActivityTable({ activities }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Activity
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {activities.map((item, i) => (
            <tr
              key={i}
              className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-4 py-2.5 text-sm text-gray-200">{item.activity}</td>
              <td className="px-4 py-2.5 text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : item.status === 'Detected'
                      ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                      : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
