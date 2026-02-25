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
        <h2 className="text-2xl font-bold mb-3">Trainer Matched!</h2>
        <p className="text-text-secondary mb-6">
          We've found a certified trainer who can help you achieve your goals.
          Click below to connect with them on Telegram.
        </p>
        
        <div className="bg-primary-light rounded-lg p-4 mb-6 text-sm text-text-secondary">
          <p className="font-semibold mb-2">Why use the referral link?</p>
          <p>
            This link helps us track that you came from MakeMeFit, so the trainer
            knows your goals and can provide personalized guidance.
          </p>
        </div>

        <Button onClick={handleOpenTrainer} size="lg" className="w-full">
          Connect with Trainer
        </Button>
      </Card>
    </div>
  );
}
