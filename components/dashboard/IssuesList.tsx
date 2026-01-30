interface Issue {
  type: string;
  count: number;
}

const ISSUE_LABELS: Record<string, string> = {
  learning_phase: 'Фаза обучения',
  insufficient_data: 'Мало данных',
  cpa_increasing: 'CPA растёт',
  low_stop_rate: 'Низкий Stop Rate',
  not_meta_native: 'Не Meta-native',
};

export default function IssuesList({ issues }: { issues: Issue[] }) {
  if (!issues || issues.length === 0) {
    return <div className="text-gray-500">Проблем не обнаружено</div>;
  }

  return (
    <ul className="space-y-2">
      {issues.map((issue) => (
        <li key={issue.type} className="flex justify-between items-center">
          <span className="text-gray-700">
            {ISSUE_LABELS[issue.type] || issue.type}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {issue.count} кампаний
          </span>
        </li>
      ))}
    </ul>
  );
}
