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
          <p className="text-text-secondary">Choose your path to better health</p>
        </div>

        <div className="space-y-4">
          <Card
            hover
            onClick={() => onSelect('supplements')}
            className="text-center cursor-pointer"
          >
            <div className="text-5xl mb-4">💊</div>
            <h2 className="text-2xl font-semibold mb-2">Supplements</h2>
            <p className="text-text-secondary">
              Personalized supplement recommendations based on your goals and health profile
            </p>
          </Card>

          <Card
            hover
            onClick={() => onSelect('workouts')}
            className="text-center cursor-pointer"
          >
            <div className="text-5xl mb-4">🏋️</div>
            <h2 className="text-2xl font-semibold mb-2">Workouts</h2>
            <p className="text-text-secondary">
              Custom workout plans tailored to your fitness level and preferences
            </p>
          </Card>
        </div>
      </div>
    </Screen>
  );
}
