import React, { useState } from 'react';
import { Input } from './ui/Input';
import { TextArea } from './ui/TextArea';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';

interface WorkoutsFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
}

export function WorkoutsForm({ onSubmit }: WorkoutsFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goal: '',
    fitness_level: 'beginner',
    available_equipment: [] as string[],
    time_per_week: '3',
    preferred_activities: [] as string[],
    injuries: '',
    age: '',
    weight: '',
    height: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const equipmentOptions = ['None', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 'Gym Access'];
  const activityOptions = ['Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Running', 'Cycling'];

  const toggleArrayItem = (array: string[], item: string) => {
    if (item === 'None') {
      return [];
    }
    if (array.includes('None')) {
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
        newErrors.goal = 'Goal is required';
      }
      if (!formData.age || Number(formData.age) < 10 || Number(formData.age) > 120) {
        newErrors.age = 'Valid age (10-120) is required';
      }
    }

    if (stepNum === 2) {
      if (!formData.time_per_week || Number(formData.time_per_week) < 1 || Number(formData.time_per_week) > 14) {
        newErrors.time_per_week = 'Valid hours (1-14) is required';
      }
      if (formData.weight && (Number(formData.weight) < 20 || Number(formData.weight) > 500)) {
        newErrors.weight = 'Valid weight (20-500 kg)';
      }
      if (formData.height && (Number(formData.height) < 100 || Number(formData.height) > 250)) {
        newErrors.height = 'Valid height (100-250 cm)';
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
        time_per_week: parseInt(formData.time_per_week),
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
            <h2 className="text-2xl font-bold">Tell Us About Your Fitness Goals</h2>
            <span className="text-sm text-text-secondary">Step {step}/3</span>
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
                label="What's your goal? *"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="e.g., Build muscle, lose weight, improve endurance..."
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

              <Select
                label="Fitness Level *"
                value={formData.fitness_level}
                onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}
                options={fitnessLevels}
                required
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1" disabled>
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Time per Week (hours) *"
                type="number"
                value={formData.time_per_week}
                onChange={(e) => setFormData({ ...formData, time_per_week: e.target.value })}
                required
                min="1"
                max="14"
                error={errors.time_per_week}
              />

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
                  Available Equipment
                </label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((eq) => (
                    <Chip
                      key={eq}
                      selected={formData.available_equipment.includes(eq)}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          available_equipment: toggleArrayItem(formData.available_equipment, eq),
                        })
                      }
                    >
                      {eq}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Preferred Activities
                </label>
                <div className="flex flex-wrap gap-2">
                  {activityOptions.map((act) => (
                    <Chip
                      key={act}
                      selected={formData.preferred_activities.includes(act)}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          preferred_activities: toggleArrayItem(formData.preferred_activities, act),
                        })
                      }
                    >
                      {act}
                    </Chip>
                  ))}
                </div>
              </div>

              <TextArea
                label="Injuries or Limitations"
                value={formData.injuries}
                onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                placeholder="List any injuries or physical limitations..."
                rows={3}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Get Workout Plan
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
