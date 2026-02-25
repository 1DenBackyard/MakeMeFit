import React from 'react';
import { RequestResponse } from '../api/requests';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface HistoryScreenProps {
  requests: RequestResponse[];
}

export function HistoryScreen({ requests }: HistoryScreenProps) {
  if (requests.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-secondary mb-4">Запросов пока нет</p>
        <Button onClick={() => window.location.reload()}>Создать новый запрос</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {requests.map((request) => (
        <Card key={request.id} hover>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg capitalize">{request.track}</h3>
              <p className="text-sm text-text-secondary">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={request.status === 'completed' ? 'success' : 'default'}>
              {request.status}
            </Badge>
          </div>
          {request.full_answer && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to full answer view
                  // This would require state management to show full answer
                }}
              >
                Просмотреть полный план
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
