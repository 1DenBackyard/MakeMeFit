import React, { useState } from 'react';
import { Input } from './ui/Input';
import { TextArea } from './ui/TextArea';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { Divider } from './ui/Divider';

interface SupplementsFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
}

export function SupplementsForm({ onSubmit }: SupplementsFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    weight: '',
    height: '',
    activity_level: 'moderate',
    dietary_restrictions: [] as string[],
    current_supplements: [] as string[],
    health_conditions: [] as string[],
    budget: 'moderate',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const activityLevels = [
    { value: 'sedentary', label: 'Малоподвижный' },
    { value: 'light', label: 'Легкая активность' },
    { value: 'moderate', label: 'Умеренная активность' },
    { value: 'active', label: 'Активный' },
    { value: 'very_active', label: 'Очень активный' },
  ];

  const budgetOptions = [
    { value: 'low', label: 'Низкий' },
    { value: 'moderate', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
  ];

  const restrictionOptions = ['Глютен', 'Молочные продукты', 'Соя', 'Орехи', 'Рыба', 'Яйца', 'Нет'];
  const supplementOptions = ['Мультивитамины', 'Протеин', 'Креатин', 'Омега-3', 'Витамин D', 'Нет'];
  const conditionOptions = ['Диабет', 'Гипертония', 'Болезни сердца', 'Проблемы с почками', 'Проблемы с печенью', 'Нет'];

  const toggleArrayItem = (array: string[], item: string) => {
    if (item === 'Нет') {
      return [];
    }
    if (array.includes('Нет')) {
      return [item];
    }
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.goal.trim()) {
        newErrors.goal = 'Цель обязательна';
      }
      if (!formData.age || Number(formData.age) < 10 || Number(formData.age) > 120) {
        newErrors.age = 'Введите корректный возраст (10-120)';
      }
    }

    if (stepNum === 2) {
      if (formData.weight && (Number(formData.weight) < 20 || Number(formData.weight) > 500)) {
        newErrors.weight = 'Введите корректный вес (20-500 кг)';
      }
      if (formData.height && (Number(formData.height) < 100 || Number(formData.height) > 250)) {
        newErrors.height = 'Введите корректный рост (100-250 см)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      onSubmit({
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
      });
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Расскажите о себе</h2>
            <span className="text-sm text-text-secondary">Шаг {step}/3</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <TextArea
                label="Какая у вас цель? *"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="Например: набрать мышечную массу, повысить энергию, поддержать восстановление..."
                required
                rows={4}
                error={errors.goal}
              />

              <Input
                label="Age *"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25"
                required
                min="10"
                max="120"
                error={errors.age}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1" disabled>
                  Назад
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  Далее
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  min="20"
                  max="500"
                  error={errors.weight}
                />

                <Input
                  label="Height (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="175"
                  min="100"
                  max="250"
                  error={errors.height}
                />
              </div>

              <Select
                label="Уровень активности"
                value={formData.activity_level}
                onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                options={activityLevels}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                  Диетические ограничения
                </label>
                <div className="flex flex-wrap gap-2">
                  {restrictionOptions.map((option) => (
                    <Chip
                      key={option}
                      selected={formData.dietary_restrictions.includes(option)}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          dietary_restrictions: toggleArrayItem(formData.dietary_restrictions, option),
                        })
                      }
                    >
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                  Текущие добавки/лекарства
                </label>
                <div className="flex flex-wrap gap-2">
                  {supplementOptions.map((option) => (
                    <Chip
                      key={option}
                      selected={formData.current_supplements.includes(option)}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          current_supplements: toggleArrayItem(formData.current_supplements, option),
                        })
                      }
                    >
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                  Состояние здоровья
                </label>
                <div className="flex flex-wrap gap-2">
                  {conditionOptions.map((option) => (
                    <Chip
                      key={option}
                      selected={formData.health_conditions.includes(option)}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          health_conditions: toggleArrayItem(formData.health_conditions, option),
                        })
                      }
                    >
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>

              <Select
                label="Бюджет"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                options={budgetOptions}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                  <Button type="submit" className="flex-1">
                  Получить рекомендации
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
