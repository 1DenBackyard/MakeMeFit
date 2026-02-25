import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface TrainerReferralProps {
  deepLink: string;
}

export function TrainerReferral({ deepLink }: TrainerReferralProps) {
  const handleOpenTrainer = () => {
    window.open(deepLink, '_blank');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card className="text-center">
        <div className="text-6xl mb-4">👨‍🏫</div>
        <h2 className="text-2xl font-bold mb-3">Тренер подобран!</h2>
        <p className="text-text-secondary mb-6">
          Мы нашли сертифицированного тренера, который может помочь вам достичь ваших целей.
          Нажмите ниже, чтобы связаться с ним в Telegram.
        </p>
        
        <div className="bg-primary-light rounded-lg p-4 mb-6 text-sm text-text-secondary">
          <p className="font-semibold mb-2">Зачем использовать реферальную ссылку?</p>
          <p>
            Эта ссылка помогает нам отследить, что вы пришли из MakeMeFit, поэтому тренер
            знает ваши цели и может предоставить персонализированное руководство.
          </p>
        </div>

        <Button onClick={handleOpenTrainer} size="lg" className="w-full">
          Связаться с тренером
        </Button>
      </Card>
    </div>
  );
}
