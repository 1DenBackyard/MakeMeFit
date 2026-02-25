import React from 'react';
import { DemoResponse } from '../api/requests';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { renderMarkdown } from '../utils/markdown';

interface DemoAnswerProps {
  demo: DemoResponse;
  onUnlock: () => void;
  requiresPayment?: boolean;
}

export function DemoAnswer({ demo, onUnlock, requiresPayment = false }: DemoAnswerProps) {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <Card>
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Ваша демо-рекомендация</h2>
          <p className="text-text-secondary">Предпросмотр вашего персонализированного плана</p>
        </div>

        <div className="bg-surface rounded-lg p-4 mb-4">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(demo.demo_answer) }}
          />
        </div>

        {requiresPayment && (
          <div className="bg-warning/10 border-2 border-warning rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-warning mb-1">Достигнут лимит демо</p>
            <p className="text-sm text-text-secondary">
              Вы уже использовали бесплатный демо для этого направления. Разблокируйте полный план, чтобы продолжить.
            </p>
          </div>
        )}
      </Card>

      <Card className="bg-primary-light border-2 border-primary">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="font-semibold mb-2">{demo.message}</p>
          <Button onClick={onUnlock} size="lg" className="w-full">
            Разблокировать полный план + PDF + История
          </Button>
        </div>
      </Card>
    </div>
  );
}
