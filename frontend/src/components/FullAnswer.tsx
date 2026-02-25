import React from 'react';
import { FullAnswerResponse } from '../api/requests';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { renderMarkdown } from '../utils/markdown';

interface FullAnswerProps {
  answer: FullAnswerResponse;
  onTrainerReferral: () => void;
}

export function FullAnswer({ answer, onTrainerReferral }: FullAnswerProps) {
  const handleDownloadPDF = () => {
    if (answer.pdf_url) {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const fullUrl = answer.pdf_url.startsWith('http') 
        ? answer.pdf_url 
        : `${apiBaseUrl}${answer.pdf_url}`;
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <Card>
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Ваш полный план</h2>
          <p className="text-text-secondary">Ваши персонализированные рекомендации</p>
        </div>

        <div className="bg-surface rounded-lg p-4 mb-4">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(answer.full_answer) }}
          />
        </div>

        {answer.pdf_url && (
          <Button
            onClick={handleDownloadPDF}
            variant="secondary"
            className="w-full mb-4"
          >
            📄 Скачать PDF
            {answer.pdf_size_bytes && (
              <span className="ml-2 text-sm opacity-75">
                ({(answer.pdf_size_bytes / 1024).toFixed(1)} KB)
              </span>
            )}
          </Button>
        )}
      </Card>

      <Card className="bg-primary-light border-2 border-primary text-center">
        <div className="text-5xl mb-4">👨‍🏫</div>
        <h3 className="text-xl font-semibold mb-2">Нужна персональная поддержка?</h3>
        <p className="text-text-secondary mb-4">
          Свяжитесь с сертифицированным тренером, который может предоставить персональное руководство
          и помочь вам быстрее достичь ваших целей.
        </p>
        <Button onClick={onTrainerReferral} size="lg" className="w-full">
          Найти тренера
        </Button>
      </Card>
    </div>
  );
}
