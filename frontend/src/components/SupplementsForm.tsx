import React, { useState } from 'react';
import { theme } from '../styles/theme';

interface SupplementsFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
}

export function SupplementsForm({ onSubmit }: SupplementsFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
    });
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Tell Us About Yourself</h2>
        
        <div style={styles.field}>
          <label style={styles.label}>What's your goal? *</label>
          <textarea
            style={styles.textarea}
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            placeholder="e.g., Build muscle, improve energy, support recovery..."
            required
            rows={3}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Age *</label>
          <input
            type="number"
            style={styles.input}
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="25"
            required
            min="10"
            max="120"
          />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Weight (kg)</label>
            <input
              type="number"
              style={styles.input}
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="70"
              min="20"
              max="500"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Height (cm)</label>
            <input
              type="number"
              style={styles.input}
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="175"
              min="100"
              max="250"
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Activity Level</label>
          <select
            style={styles.select}
            value={formData.activity_level}
            onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Budget</label>
          <select
            style={styles.select}
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>

        <button type="submit" style={styles.submitButton}>
          Get Recommendations
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
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing.md,
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
