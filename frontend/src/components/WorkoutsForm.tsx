import React, { useState } from 'react';
import { theme } from '../styles/theme';

interface WorkoutsFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
}

export function WorkoutsForm({ onSubmit }: WorkoutsFormProps) {
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

  const equipmentOptions = ['None', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 'Gym Access'];
  const activityOptions = ['Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Running', 'Cycling'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      time_per_week: parseInt(formData.time_per_week),
      age: formData.age ? parseInt(formData.age) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
    });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Tell Us About Your Fitness Goals</h2>
        
        <div style={styles.field}>
          <label style={styles.label}>What's your goal? *</label>
          <textarea
            style={styles.textarea}
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            placeholder="e.g., Build muscle, lose weight, improve endurance..."
            required
            rows={3}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Fitness Level *</label>
          <select
            style={styles.select}
            value={formData.fitness_level}
            onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Time per Week (hours) *</label>
          <input
            type="number"
            style={styles.input}
            value={formData.time_per_week}
            onChange={(e) => setFormData({ ...formData, time_per_week: e.target.value })}
            required
            min="1"
            max="14"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Available Equipment</label>
          <div style={styles.checkboxGroup}>
            {equipmentOptions.map((eq) => (
              <label key={eq} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.available_equipment.includes(eq)}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      available_equipment: toggleArrayItem(formData.available_equipment, eq),
                    })
                  }
                  style={styles.checkbox}
                />
                <span>{eq}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Preferred Activities</label>
          <div style={styles.checkboxGroup}>
            {activityOptions.map((act) => (
              <label key={act} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.preferred_activities.includes(act)}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      preferred_activities: toggleArrayItem(formData.preferred_activities, act),
                    })
                  }
                  style={styles.checkbox}
                />
                <span>{act}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Injuries or Limitations</label>
          <textarea
            style={styles.textarea}
            value={formData.injuries}
            onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
            placeholder="List any injuries or physical limitations..."
            rows={2}
          />
        </div>

        <button type="submit" style={styles.submitButton}>
          Get Workout Plan
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  form: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  field: {
    marginBottom: theme.spacing.md,
  },
  label: {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  input: {
    width: '100%',
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    boxSizing: 'border-box',
    transition: theme.transitions.fast,
  },
  textarea: {
    width: '100%',
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily,
    resize: 'vertical',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    boxSizing: 'border-box',
    transition: theme.transitions.fast,
  },
  select: {
    width: '100%',
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: theme.transitions.fast,
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    background: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    cursor: 'pointer',
    color: theme.colors.text,
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: theme.colors.primary,
  },
  submitButton: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    marginTop: theme.spacing.lg,
    transition: theme.transitions.normal,
    boxShadow: theme.shadows.sm,
  },
};
