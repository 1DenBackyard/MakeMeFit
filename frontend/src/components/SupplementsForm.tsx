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
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'active', label: 'Active' },
    { value: 'very_active', label: 'Very Active' },
  ];

  const budgetOptions = [
    { value: 'low', label: 'Low' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
  ];

  const restrictionOptions = ['Gluten', 'Dairy', 'Soy', 'Nuts', 'Fish', 'Eggs', 'None'];
  const supplementOptions = ['Multivitamin', 'Protein Powder', 'Creatine', 'Omega-3', 'Vitamin D', 'None'];
  const conditionOptions = ['Diabetes', 'Hypertension', 'Heart Disease', 'Kidney Issues', 'Liver Issues', 'None'];

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
            <h2 className="text-2xl font-bold">Tell Us About Yourself</h2>
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
                placeholder="e.g., Build muscle, improve energy, support recovery..."
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
                label="Activity Level"
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
                  Dietary Restrictions
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
                  Current Supplements/Medications
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
                  Health Conditions
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
                label="Budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                options={budgetOptions}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Get Recommendations
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
