import React from 'react';
import { TrackType } from '../api/requests';
import { Card } from './ui/Card';
import { Screen } from './ui/Screen';

interface TrackSelectionProps {
  onSelect: (track: TrackType) => void;
}

export function TrackSelection({ onSelect }: TrackSelectionProps) {
  return (
    <Screen>
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">MakeMeFit</h1>
          <p className="text-text-secondary">Выберите свой путь к здоровью</p>
        </div>

        <div className="space-y-4">
          <Card
            hover
            onClick={() => onSelect('supplements')}
            className="text-center cursor-pointer"
          >
            <div className="text-5xl mb-4">💊</div>
            <h2 className="text-2xl font-semibold mb-2">Добавки</h2>
            <p className="text-text-secondary">
              Персонализированные рекомендации по добавкам на основе ваших целей и профиля здоровья
            </p>
          </Card>

          <Card
            hover
            onClick={() => onSelect('workouts')}
            className="text-center cursor-pointer"
          >
            <div className="text-5xl mb-4">🏋️</div>
            <h2 className="text-2xl font-semibold mb-2">Тренировки</h2>
            <p className="text-text-secondary">
              Индивидуальные планы тренировок, адаптированные под ваш уровень подготовки и предпочтения
            </p>
          </Card>
        </div>
      </div>
    </Screen>
  );
}
